const crypto = require('crypto');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SECRET = process.env.SESSION_SECRET || process.env.MONGO_URI || 'dev-session-secret';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  if (!salt || !expectedHash) return false;
  const { hash } = hashPassword(password, salt);
  if (hash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

function createToken(user) {
  const payload = base64Url({
    sub: user._id.toString(),
    name: user.name,
    email: user.email,
    exp: Date.now() + TOKEN_TTL_MS
  });
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;

  const [payload, signature] = token.split('.');
  if (signature !== sign(payload)) return null;

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!data.exp || data.exp < Date.now()) return null;

  return data;
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken };
