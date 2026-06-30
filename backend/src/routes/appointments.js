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
const { processStripeRefund } = require('../services/paymentService');
const { validateAppointmentConflict } = require('../services/appointmentService');

// ── POST /api/appointments/validate ────────────────────────────
// Validates if an appointment slot has any scheduling conflicts.
router.post('/validate', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const validationResult = await validateAppointmentConflict(patientId, doctorId, date, time);

    if (!validationResult.success) {
      return res.status(409).json(validationResult);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ success: false, message: 'Server error during validation' });
  }
});

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
        SELECT v.*, d.price AS doctorPrice
        FROM vw_AppointmentDetails v
        JOIN Doctors d ON v.doctorId = d.id
        WHERE v.patientId = @userId AND v.status != 'admin_deleted'
        ORDER BY [date] DESC
      `;
    } else if (req.user.role === 'doctor') {
      request.input('userId', sql.Int, req.user.id);
      query = `
        SELECT v.*, d.price AS doctorPrice
        FROM vw_AppointmentDetails v
        JOIN Doctors d ON v.doctorId = d.id
        WHERE v.doctorId IN (SELECT id FROM Doctors WHERE user_id = @userId) AND v.status != 'admin_deleted'
        ORDER BY [date] DESC
      `;
    } else {
      // admin sees everything except admin_deleted
      query = "SELECT v.*, d.price AS doctorPrice FROM vw_AppointmentDetails v JOIN Doctors d ON v.doctorId = d.id WHERE v.status != 'admin_deleted' ORDER BY [date] DESC";
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

// ── POST /api/appointments/cancel ───────────────────────────────────────
router.post('/cancel', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const patientId = req.user.id;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    const pool = getPool();

    // 1. Validate Appointment exists and belongs to patient
    const apptCheck = await pool.request()
        .input('id', sql.Int, appointmentId)
        .query('SELECT * FROM Appointments WHERE id = @id');

    if (apptCheck.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appt = apptCheck.recordset[0];

    if (appt.patient_id !== patientId) {
        return res.status(403).json({ success: false, message: 'You can only cancel your own appointments' });
    }

    // 2. Idempotency & Status Check
    if (appt.status === 'cancelled') {
        return res.json({ success: true, message: 'Appointment is already cancelled', refunded: false });
    }
    if (appt.status === 'completed' || appt.status === 'rejected') {
        return res.status(400).json({ success: false, message: `Cannot cancel a ${appt.status} appointment` });
    }

    // 3. Check for Payment
    const paymentCheck = await pool.request()
        .input('appointmentId', sql.Int, appointmentId)
        .query('SELECT * FROM Payments WHERE appointment_id = @appointmentId');

    let isRefundEligible = false;
    let paymentRecord = null;
    
    if (paymentCheck.recordset.length > 0) {
        paymentRecord = paymentCheck.recordset[0];
        // 4. Refund Eligibility Check
        if (
            (paymentRecord.payment_status === 'paid' || paymentRecord.payment_status === 'succeeded') &&
            paymentRecord.refund_status !== 'refunded'
        ) {
            isRefundEligible = true;
        }
    }

    // 5. Begin SQL transaction & Update Appointment status successfully
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
        await transaction.request()
            .input('id', sql.Int, appointmentId)
            .query("UPDATE Appointments SET status = 'cancelled' WHERE id = @id");
        
        await transaction.commit();
        appt.status = 'cancelled';
    } catch (txnError) {
        await transaction.rollback();
        throw txnError; // Throw to be caught by the outer catch
    }

    let refunded = false;
    let refundResult = null;

    // 7. Execute Stripe refund & Save refund into Refunds table
    if (isRefundEligible) {
        try {
            refundResult = await processStripeRefund(paymentRecord, 'requested_by_customer', patientId);
            refunded = true;
            paymentRecord.payment_status = 'refunded';
            paymentRecord.refund_status = refundResult?.refundStatus || 'succeeded';
        } catch (refundError) {
            console.error('Stripe refund error after appointment cancelled:', refundError);
            return res.status(500).json({ 
                success: false, 
                message: 'Appointment cancelled, but refund failed. Please contact support.', 
                appointment: appt 
            });
        }
    }

    res.json({
        success: true,
        refunded: refunded,
        appointment: appt,
        payment: paymentRecord
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ success: false, message: 'Server error during cancellation' });
  }
});

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
      .query('SELECT id, patient_id, status FROM Appointments WHERE id = @id');

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

    // Admin Delete Flow
    if (req.user.role === 'admin') {
      let refunded = false;
      if (appt.status === 'confirmed') {
        const paymentCheck = await pool.request()
          .input('appointmentId', sql.Int, appointmentId)
          .query('SELECT * FROM Payments WHERE appointment_id = @appointmentId');

        if (paymentCheck.recordset.length > 0) {
          const paymentRecord = paymentCheck.recordset[0];
          if ((paymentRecord.payment_status === 'paid' || paymentRecord.payment_status === 'succeeded') && paymentRecord.refund_status !== 'refunded') {
            try {
              const refundResult = await processStripeRefund(paymentRecord, 'requested_by_customer', req.user.id);
              refunded = true;
            } catch (refundError) {
              console.error('Stripe refund error during admin delete:', refundError);
              return res.status(500).json({ success: false, message: 'Admin delete aborted: refund failed.' });
            }
          }
        }
      }

      await pool.request()
        .input('id', sql.Int, appointmentId)
        .query("UPDATE Appointments SET status = 'admin_deleted' WHERE id = @id");

      const msg = refunded 
        ? "Appointment deleted successfully. The patient's payment has been refunded." 
        : "Appointment deleted successfully.";
      
      return res.json({ success: true, message: msg });
    }

    // Patient and Doctor Hard Delete (Existing Behavior)
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
