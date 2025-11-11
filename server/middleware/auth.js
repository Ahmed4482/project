import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

export function generateToken(userId, email, isAdmin = false) {
  return jwt.sign(
    { id: userId, email, is_admin: isAdmin },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    { expiresIn: '7d' }
  );
}
