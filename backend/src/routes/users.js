// backend/src/routes/users.js
// Admin-only routes for user management and dashboard statistics.

const express  = require('express');
const router   = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateUserId, validationError, sanitizeNumber } = require('../middleware/validators');

// Note: /stats must be registered BEFORE /:id so Express doesn't
// treat "stats" as an ID parameter.

// ── GET /api/users/stats  ──────────────────────────────────────
// Returns aggregated statistics for the admin dashboard.
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pool   = getPool();
    const result = await pool.request().query('SELECT * FROM vw_AdminStats');

    const stats = result.recordset[0];

    // Reshape into the structure the frontend expects
    res.json({
      success: true,
      stats: {
        users: {
          totalUsers:    stats.totalUsers,
          totalPatients: stats.totalPatients,
          totalDoctors:  stats.totalDoctors,
        },
        doctors: {
          total:     stats.totalDoctorProfiles,
          available: stats.availableDoctors,
        },
        appointments: {
          total:     stats.totalAppointments,
          confirmed: stats.confirmedAppointments,
          completed: stats.completedAppointments,
          cancelled: stats.cancelledAppointments,
          today:     stats.todayAppointments,
        },
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/users  ────────────────────────────────────────────
// Returns all users with their appointment count. Admin only.
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pool   = getPool();
    const result = await pool.request()
      .query('SELECT * FROM vw_UserList ORDER BY joined DESC');

    res.json({ success: true, users: result.recordset });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/users/:id  ─────────────────────────────────────
// Safely deletes a user via sp_DeleteUser (handles FK cleanup, blocks admin deletion).
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {  const userId = sanitizeNumber(req.params.id);
  
  if (userId === null) {
    return res.status(400).json(validationError('Invalid user ID', ['User ID must be a valid integer']));
  }
  
  if (req.user && req.user.id === userId) {
    return res.status(403).json({ success: false, message: 'Admins cannot delete their own account' });
  }

  try {
    const pool   = getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .execute('sp_DeleteUser');

    const row = result.recordset[0];

    if (!row.success) {
      return res.status(row.message === 'User not found' ? 404 : 403).json({
        success: false,
        message: row.message,
      });
    }

    res.json({ success: true, message: row.message });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
