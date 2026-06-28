// backend/src/routes/auth.js
// Handles user registration, login, and current-user lookup.

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { validateRegistration, validateLogin, validationError } = require('../middleware/validators');

// ── Helper: sign a JWT for a user object ───────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

// Dummy bcrypt hash compared against when an email is not found, so a login
// attempt takes the same time whether or not the account exists.
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// ── POST /api/auth/register ────────────────────────────────────
// Creates a new patient or doctor account.
// Admin accounts can only be created directly in the database.
router.post('/register', async (req, res) => {
  const { 
    name, email, password, role,
    phone, gender, dateOfBirth,
    specialty, experience, location, price, licenseNumber
  } = req.body;

  // Validate input with comprehensive error checking
  const validation = validateRegistration(name, email, password, role);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Registration validation failed', validation.errors));
  }

  const validatedData = validation.data;

  try {
    const pool = getPool();

    // Reject duplicate emails
    const existing = await pool.request()
      .input('email', sql.NVarChar, validatedData.email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Validate and check license number for doctors
    if (validatedData.role === 'doctor') {
      if (!licenseNumber || String(licenseNumber).trim() === '') {
        return res.status(400).json({ success: false, message: 'License number is required for doctors' });
      }

      const existingLicense = await pool.request()
        .input('license_number', sql.NVarChar, licenseNumber)
        .query('SELECT id FROM Doctors WHERE license_number = @license_number');

      if (existingLicense.recordset.length > 0) {
        return res.status(409).json({ success: false, message: 'License number already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const result = await pool.request()
      .input('name',          sql.NVarChar, validatedData.name)
      .input('email',         sql.NVarChar, validatedData.email)
      .input('password',      sql.NVarChar, hashedPassword)
      .input('role',          sql.NVarChar, validatedData.role)
      .input('phone',         sql.NVarChar, phone || null)
      .input('gender',        sql.NVarChar, gender || null)
      .input('date_of_birth', sql.Date,     dateOfBirth || null)
      .query(`
        INSERT INTO Users (name, email, password, role, phone, gender, date_of_birth)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
        VALUES (@name, @email, @password, @role, @phone, @gender, @date_of_birth)
      `);

    const newUser = result.recordset[0];

    // If role is doctor, create a matching record in the Doctors table
    if (validatedData.role === 'doctor') {
      await pool.request()
        .input('user_id',        sql.Int,           newUser.id)
        .input('specialty',      sql.NVarChar,      specialty || '')
        .input('experience',     sql.Int,           experience ? parseInt(experience, 10) : 0)
        .input('location',       sql.NVarChar,      location || '')
        .input('price',          sql.Decimal(10,2), price ? parseFloat(price) : 0)
        .input('license_number', sql.NVarChar,      licenseNumber)
        .query(`
          INSERT INTO Doctors (
            user_id, specialty, experience, location, price, license_number,
            rating, reviews, available, avatar, bio, schedule,
            verification_status, rejection_reason, verified_at, verified_by
          )
          VALUES (
            @user_id, @specialty, @experience, @location, @price, @license_number,
            0.0, 0, 1, '', '', '',
            'pending', NULL, NULL, NULL
          )
        `);
    }

    const token   = signToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser,
    });
  } catch (err) {
    // Handle the unique-constraint violation when two concurrent registrations use
    // the same email. SQL Server unique-violation error numbers: 2627 and 2601.
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────
// Returns JWT + user object on valid credentials.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  const validation = validateLogin(email, password);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Login validation failed', validation.errors));
  }

  const validatedData = validation.data;

  try {
    const pool = getPool();

    const result = await pool.request()
      .input('email', sql.NVarChar, validatedData.email)
      .query(`
        SELECT id, name, email, password, role
        FROM   Users
        WHERE  email = @email AND is_active = 1
      `);

    if (result.recordset.length === 0) {
      // Compare against a dummy hash so an unknown email takes the same time as a wrong password.
      await bcrypt.compare(validatedData.password, DUMMY_HASH);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user    = result.recordset[0];
    const isMatch = await bcrypt.compare(validatedData.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role === 'doctor') {
      const docResult = await pool.request()
        .input('user_id', sql.Int, user.id)
        .query('SELECT verification_status, rejection_reason FROM Doctors WHERE user_id = @user_id');

      if (docResult.recordset.length === 0) {
        return res.status(500).json({ success: false, message: 'Doctor profile not found' });
      }

      const doctorProfile = docResult.recordset[0];

      if (doctorProfile.verification_status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is waiting for admin approval.'
        });
      }

      if (doctorProfile.verification_status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your application was rejected.',
          reason: doctorProfile.rejection_reason
        });
      }
    }

    const token = signToken(user);
    const { password: _removed, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────
// Returns the profile of the currently authenticated user.
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, name, email, role, phone, gender, CONVERT(VARCHAR(10), date_of_birth, 23) AS dateOfBirth, created_at FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/auth/me ───────────────────────────────────────────
// Updates the profile of the currently authenticated user.
router.put('/me', authMiddleware, async (req, res) => {
  const { name, phone, gender, dateOfBirth } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    const pool = getPool();

    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('name', sql.NVarChar, name)
      .input('phone', sql.NVarChar, phone || null)
      .input('gender', sql.NVarChar, gender || null)
      .input('date_of_birth', sql.Date, dateOfBirth || null)
      .query(`
        UPDATE Users 
        SET name = @name, 
            phone = @phone, 
            gender = @gender, 
            date_of_birth = @date_of_birth 
        WHERE id = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, name, email, role, phone, gender, CONVERT(VARCHAR(10), date_of_birth, 23) AS dateOfBirth, created_at FROM Users WHERE id = @id');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: result.recordset[0] 
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
