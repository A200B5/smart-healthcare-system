// backend/src/middleware/auth.js
// JWT authentication middleware + role guard.

const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');

// Verifies the Bearer token and attaches decoded user to req.user
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    // Re-check that the account is still active on every request, so a deactivated
    // user loses access immediately rather than when the token expires.
    const pool  = getPool();
    const check = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT is_active FROM Users WHERE id = @id');

    if (!check.recordset[0] || check.recordset[0].is_active === false) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

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
