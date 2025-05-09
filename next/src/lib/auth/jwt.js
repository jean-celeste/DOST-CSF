import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use env var in production!

export function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', ...options });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
