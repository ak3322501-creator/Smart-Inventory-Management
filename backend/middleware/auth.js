const { verifyToken } = require('../auth-utils');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const session = verifyToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  req.user = session;
  next();
}

module.exports = { requireAuth };
