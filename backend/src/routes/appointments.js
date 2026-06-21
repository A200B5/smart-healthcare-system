// backend/src/routes/appointments.js
// Role-aware appointment management.
//   patient → see & book their own appointments
//   doctor  → see & update status of their own appointments
//   admin   → full access to all appointments

const express  = require('express');
const router   = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateAppointmentBooking, validateAppointmentStatus, validationError, sanitizeNumber } = require('../middleware/validators');

// ── GET /api/appointments  ─────────────────────────────────────
// Returns appointments filtered by the caller's role.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool    = getPool();
    const request = pool.request();
    let query     = '';

    if (req.user.role === 'patient') {
      request.input('userId', sql.Int, req.user.id);
      query = `
        SELECT * FROM vw_AppointmentDetails
        WHERE patientId = @userId
        ORDER BY [date] DESC
      `;
    } else if (req.user.role === 'doctor') {
      request.input('userId', sql.Int, req.user.id);
      query = `
        SELECT * FROM vw_AppointmentDetails
        WHERE doctorId IN (SELECT id FROM Doctors WHERE user_id = @userId)
        ORDER BY [date] DESC
      `;
    } else {
      // admin sees everything
      query = 'SELECT * FROM vw_AppointmentDetails ORDER BY [date] DESC';
    }

    const result = await request.query(query);
    res.json({ success: true, appointments: result.recordset });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/appointments  ────────────────────────────────────
// Books a new appointment (patient only).
// Uses the sp_BookAppointment procedure which checks availability & conflicts.
router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctorId, date, time, notes } = req.body;

  // Validate appointment booking input
  const validation = validateAppointmentBooking(doctorId, date, time, notes);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Appointment booking validation failed', validation.errors));
  }

  const validatedData = validation.data;

  try {
    const pool   = getPool();
    const result = await pool.request()
      .input('doctorId',  sql.Int,      validatedData.doctorId)
      .input('patientId', sql.Int,      req.user.id)
      .input('date',      sql.Date,     validatedData.date)
      .input('time',      sql.NVarChar, validatedData.time)
      .input('notes',     sql.NVarChar, validatedData.notes)
      .execute('sp_BookAppointment');

    const row = result.recordset[0];

    // Negative result codes indicate business-logic errors from the procedure
    if (row.result < 0) {
      const statusMap = { '-1': 404, '-2': 403, '-3': 409 };
      return res.status(statusMap[row.result] || 400).json({
        success: false,
        message: row.message,
      });
    }

    res.status(201).json({
      success: true,
      message: row.message,
      appointmentId: row.result,
    });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/appointments/:id/status  ───────────────────────
// Updates the status of an appointment (doctor or admin only).
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('doctor', 'admin'),
  async (req, res) => {
    const { status } = req.body;
    // Validate status input
    const validation = validateAppointmentStatus(status);
    if (!validation.isValid) {
      return res.status(400).json(validationError('Status validation failed', validation.errors));
    }

    const validatedStatus = validation.data.status;
    try {
      const pool   = getPool();
      const appointmentId = sanitizeNumber(req.params.id);
      
      if (appointmentId === null) {
        return res.status(400).json(validationError('Invalid appointment ID', ['Appointment ID must be a valid integer']));
      }

      // Doctors may only update the status of their own appointments.
      if (req.user.role === 'doctor') {
        const owned = await pool.request()
          .input('appointmentId', sql.Int, appointmentId)
          .input('userId', sql.Int, req.user.id)
          .query(`
            SELECT a.id FROM Appointments a
            JOIN Doctors d ON a.doctor_id = d.id
            WHERE a.id = @appointmentId AND d.user_id = @userId
          `);
        if (owned.recordset.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'You can only update your own appointments',
          });
        }
      }

      const result = await pool.request()
        .input('appointmentId', sql.Int,      appointmentId)
        .input('newStatus',     sql.NVarChar, validatedStatus)
        .execute('sp_UpdateAppointmentStatus');

      const row = result.recordset[0];

      if (!row.success) {
        return res.status(400).json({ success: false, message: row.message });
      }

      res.json({ success: true, message: row.message });
    } catch (err) {
      console.error('Update status error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── DELETE /api/appointments/:id  ─────────────────────────────
// Cancels (deletes) an appointment. Patient can cancel their own; admin can cancel any.
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointmentId = sanitizeNumber(req.params.id);
    if (appointmentId === null) {
      return res.status(400).json(validationError('Invalid appointment ID', ['Appointment ID must be a valid integer']));
    }

    const pool = getPool();

    // Verify the appointment exists and belongs to the caller (if patient)
    const check = await pool.request()
      .input('id', sql.Int, appointmentId)
      .query('SELECT id, patient_id FROM Appointments WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appt = check.recordset[0];

    if (req.user.role === 'patient' && appt.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments',
      });
    }

    // Doctors may only cancel appointments in their own schedule.
    if (req.user.role === 'doctor') {
      const doctorOwns = await pool.request()
        .input('appointmentId', sql.Int, appointmentId)
        .input('userId', sql.Int, req.user.id)
        .query(`
          SELECT a.id FROM Appointments a
          JOIN Doctors d ON a.doctor_id = d.id
          WHERE a.id = @appointmentId AND d.user_id = @userId
        `);
      if (doctorOwns.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel appointments in your own schedule',
        });
      }
    }

    await pool.request()
      .input('id', sql.Int, appointmentId)
      .query('DELETE FROM Appointments WHERE id = @id');

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
