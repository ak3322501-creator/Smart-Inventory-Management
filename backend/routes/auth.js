const express = require('express');
const User = require('../models/User');
const { hashPassword, verifyPassword, createToken, verifyToken } = require('../auth-utils');
const router = express.Router();

function safeUser(user, token) {
  return {
    id: user._id.toString(),
    name: user.name,
    company: user.company || '',
    email: user.email,
    token
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, company = '', email = '', password } = req.body;
    if (!name || !company || !email || !password) {
      return res.status(400).json({ error: 'Name, company, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const { salt, hash } = hashPassword(password);
    const user = new User({ name, company, email: normalizedEmail, passwordSalt: salt, passwordHash: hash });
    await user.save();

    res.json(safeUser(user, createToken(user)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email = '', password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    res.json(safeUser(user, createToken(user)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const session = verifyToken(token);

    if (!session) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(session.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    res.json(safeUser(user, token));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
