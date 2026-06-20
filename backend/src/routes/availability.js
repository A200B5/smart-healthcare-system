// backend/src/routes/availability.js
// Doctor availability management & available slots lookup.
// Allows patients to find available time slots and doctors to manage their schedule.

const express  = require('express');
const router   = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ── GET /api/availability/doctors/:doctorId/slots ────────────────────────────────────
// Returns available time slots for a specific doctor on a given date (public route).
// Query params: date (YYYY-MM-DD)
// Used by: Patients booking appointments
router.get('/doctors/:doctorId/slots', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'date query parameter is required (format: YYYY-MM-DD)',
    });
  }

  try {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Prevent booking for dates in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates',
      });
    }

    const pool   = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, req.params.doctorId)
      .input('date',     sql.Date, date)
      .execute('sp_GetDoctorAvailableSlots');

    res.json({
      success: true,
      doctorId: req.params.doctorId,
      date: date,
      availableSlots: result.recordset.map(slot => ({
        time: slot.availableSlot,
        isBooked: slot.isBooked === 1,
      })),
    });
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/availability/doctors/:doctorId/schedule ────────────────────────────────
// Returns full schedule (availability) for a doctor (public route).
// Shows which days and times the doctor is available.
// Used by: Public doctor profiles
router.get('/doctors/:doctorId/schedule', async (req, res) => {
  try {
    const pool   = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, req.params.doctorId)
      .query(`
        SELECT * FROM vw_DoctorAvailabilityDetails
        WHERE doctor_id = @doctorId
        ORDER BY day_of_week, startTime
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or has no availability set',
      });
    }

    res.json({
      success: true,
      doctorId: req.params.doctorId,
      doctorName: result.recordset[0].doctorName,
      specialty: result.recordset[0].specialty,
      schedule: result.recordset.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        dayName: row.dayName,
        startTime: row.startTime,
        endTime: row.endTime,
        isAvailable: row.is_available === 1,
        slotDuration: row.slot_duration_minutes,
      })),
    });
  } catch (err) {
    console.error('Get doctor schedule error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/availability/doctors/:doctorId/schedule ────────────────────────────────
// Updates doctor's availability for a specific day (doctor only).
// Request body: { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true, slotDuration: 30 }
// Used by: Doctors setting their working hours
router.put(
  '/doctors/:doctorId/schedule',
  authMiddleware,
  requireRole('doctor'),
  async (req, res) => {
    const { dayOfWeek, startTime, endTime, isAvailable, slotDuration } = req.body;

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      isAvailable === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'dayOfWeek, startTime, endTime, and isAvailable are required',
      });
    }

    try {
      const pool = getPool();

      // Verify the doctor exists and belongs to the authenticated user
      const doctorCheck = await pool.request()
        .input('doctorId', sql.Int, req.params.doctorId)
        .input('userId', sql.Int, req.user.id)
        .query('SELECT id FROM Doctors WHERE id = @doctorId AND user_id = @userId');

      if (doctorCheck.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own availability',
        });
      }

      // Call the stored procedure to set/update availability
      const result = await pool.request()
        .input('doctorId', sql.Int, req.params.doctorId)
        .input('dayOfWeek', sql.Int, dayOfWeek)
        .input('startTime', sql.NVarChar, startTime)
        .input('endTime', sql.NVarChar, endTime)
        .input('isAvailable', sql.Bit, isAvailable ? 1 : 0)
        .input('slotDurationMinutes', sql.Int, slotDuration || 30)
        .execute('sp_SetDoctorAvailability');

      const row = result.recordset[0];

      if (row.success === 0) {
        return res.status(400).json({
          success: false,
          message: row.message,
        });
      }

      res.json({
        success: true,
        message: row.message,
        data: {
          doctorId: req.params.doctorId,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable,
          slotDuration: slotDuration || 30,
        },
      });
    } catch (err) {
      console.error('Update doctor availability error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── GET /api/availability/my-schedule ────────────────────────────────────────────────
// Returns authenticated doctor's full schedule (doctor only).
// Used by: Doctor dashboard to view/manage their own schedule
router.get('/my-schedule', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const pool = getPool();

    // Get doctor's ID from their user account
    const doctorQuery = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('SELECT id FROM Doctors WHERE user_id = @userId');

    if (doctorQuery.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const doctorId = doctorQuery.recordset[0].id;

    // Get full schedule
    const result = await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .query(`
        SELECT * FROM vw_DoctorAvailabilityDetails
        WHERE doctor_id = @doctorId
        ORDER BY day_of_week, startTime
      `);

    res.json({
      success: true,
      doctorId,
      doctorName: req.user.name,
      schedule: result.recordset.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        dayName: row.dayName,
        startTime: row.startTime,
        endTime: row.endTime,
        isAvailable: row.is_available === 1,
        slotDuration: row.slot_duration_minutes,
      })),
    });
  } catch (err) {
    console.error('Get my schedule error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
