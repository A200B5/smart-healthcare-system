// backend/src/middleware/auth.js
// JWT authentication middleware + role guard.

const jwt = require('jsonwebtoken');

// Verifies the Bearer token and attaches decoded user to req.user
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role guard – use after authMiddleware
// Example: router.delete('/:id', authMiddleware, requireRole('admin'), handler)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission for this action.',
      });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
