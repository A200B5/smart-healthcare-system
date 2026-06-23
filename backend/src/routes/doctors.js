// backend/src/routes/doctors.js
// CRUD operations for doctor profiles.
// GET endpoints are public. POST / PUT / DELETE require admin role.

const express  = require('express');
const router   = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateDoctorCreation, validateDoctorUpdate, validationError, sanitizeNumber } = require('../middleware/validators');

// ── GET /api/doctors  ──────────────────────────────────────────
// Returns all active doctors sorted by rating (public route).
router.get('/', async (req, res) => {
  try {
    const pool   = getPool();
    const result = await pool.request()
      .query('SELECT * FROM vw_DoctorList ORDER BY rating DESC');

    res.json({ success: true, doctors: result.recordset });
  } catch (err) {
    console.error('Get doctors error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/doctors/me  ───────────────────────────────────────
// Returns the currently authenticated doctor's profile.
router.get('/me', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query(`
        SELECT d.*, u.name, u.email 
        FROM Doctors d
        JOIN Users u ON d.user_id = u.id
        WHERE d.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.json({ success: true, doctor: result.recordset[0] });
  } catch (err) {
    console.error('Get doctor profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/doctors/:id  ──────────────────────────────────────
// Returns a single doctor profile (public route).
router.get('/:id', async (req, res) => {
  const doctorId = sanitizeNumber(req.params.id);
  
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  try {
    const pool   = getPool();
    const result = await pool.request()
      .input('id', sql.Int, doctorId)
      .execute('sp_GetDoctorById');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, doctor: result.recordset[0] });
  } catch (err) {
    console.error('Get doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/doctors  ─────────────────────────────────────────
// Adds a new doctor profile. Requires an existing user_id with role='doctor'.
// Admin only.
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { user_id, specialty, experience, avatar, price, location, bio, schedule } = req.body;

  // Validate doctor creation input
  const validation = validateDoctorCreation(user_id, specialty, experience, price, location, avatar, bio, schedule);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Doctor creation validation failed', validation.errors));
  }

  const validatedData = validation.data;

  try {
    const pool   = getPool();

    // The target user must exist, be active, and have the 'doctor' role before a
    // doctor profile can be created for them.
    const userCheck = await pool.request()
      .input('user_id', sql.Int, validatedData.user_id)
      .query("SELECT id, role FROM Users WHERE id = @user_id AND is_active = 1");

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found or inactive' });
    }
    if (userCheck.recordset[0].role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'User must have role "doctor" to create a doctor profile',
      });
    }

    // Prevent creating a duplicate doctor profile for the same user.
    const dupCheck = await pool.request()
      .input('user_id', sql.Int, validatedData.user_id)
      .query('SELECT id FROM Doctors WHERE user_id = @user_id');
    if (dupCheck.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Doctor profile already exists for this user' });
    }

    const result = await pool.request()
      .input('user_id',    sql.Int,           validatedData.user_id)
      .input('specialty',  sql.NVarChar,      validatedData.specialty)
      .input('experience', sql.Int,           validatedData.experience)
      .input('available',  sql.Bit,           1)
      .input('avatar',     sql.NVarChar,      validatedData.avatar)
      .input('price',      sql.Decimal(10,2), validatedData.price)
      .input('location',   sql.NVarChar,      validatedData.location)
      .input('bio',        sql.NVarChar,      validatedData.bio)
      .input('schedule',   sql.NVarChar,      validatedData.schedule)
      .query(`
        INSERT INTO Doctors
          (user_id, specialty, rating, reviews, experience, available, avatar, price, location, bio, schedule)
        OUTPUT INSERTED.*
        VALUES
          (@user_id, @specialty, 0.0, 0, @experience, @available, @avatar, @price, @location, @bio, @schedule)
      `);

    res.status(201).json({ success: true, doctor: result.recordset[0] });
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/doctors/:id  ──────────────────────────────────────
// Updates an existing doctor profile. Admin or the doctor themselves.
router.put('/:id', authMiddleware, async (req, res) => {
  const { specialty, experience, available, avatar, price, location, bio, schedule } = req.body;  
  const doctorId = sanitizeNumber(req.params.id);
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  // Validate doctor update input
  const validation = validateDoctorUpdate(specialty, experience, available, avatar, price, location, bio, schedule);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Doctor update validation failed', validation.errors));
  }
  try {
    const pool = getPool();

    const check = await pool.request()
      .input('id', sql.Int, doctorId)
      .query('SELECT user_id FROM Doctors WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctorUserId = check.recordset[0].user_id;

    if (req.user.role !== 'admin' && req.user.id !== doctorUserId) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not have permission for this action.' });
    }

    // Build update query with validated data
    await pool.request()
      .input('id',         sql.Int,           doctorId)
      .input('specialty',  sql.NVarChar,      specialty)
      .input('experience', sql.Int,           experience)
      .input('available',  sql.Bit,           available ? 1 : 0)
      .input('avatar',     sql.NVarChar,      avatar)
      .input('price',      sql.Decimal(10,2), price)
      .input('location',   sql.NVarChar,      location)
      .input('bio',        sql.NVarChar,      bio)
      .input('schedule',   sql.NVarChar,      schedule)
      .query(`
        UPDATE Doctors
        SET specialty  = @specialty,
            experience = @experience,
            available  = @available,
            avatar     = @avatar,
            price      = @price,
            location   = @location,
            bio        = @bio,
            schedule   = @schedule
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (err) {
    console.error('Update doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/doctors/:id  ───────────────────────────────────
// Removes a doctor profile (cascade deletes their appointments). Admin only.
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const doctorId = sanitizeNumber(req.params.id);
  
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  try {
    const pool = getPool();

    const check = await pool.request()
      .input('id', sql.Int, doctorId)
      .query('SELECT id FROM Doctors WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Reviews are not cascade-deleted on the doctor relationship, so remove the
    // doctor's reviews explicitly before deleting the doctor.
    await pool.request()
      .input('id', sql.Int, doctorId)
      .query('DELETE FROM Reviews WHERE doctor_id = @id');

    await pool.request()
      .input('id', sql.Int, doctorId)
      .query('DELETE FROM Doctors WHERE id = @id');

    res.json({ success: true, message: 'Doctor removed successfully' });
  } catch (err) {
    console.error('Delete doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
