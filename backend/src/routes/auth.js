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
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ── POST /api/auth/register ────────────────────────────────────
// Creates a new patient or doctor account.
// Admin accounts can only be created directly in the database.
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

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

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const result = await pool.request()
      .input('name',     sql.NVarChar, validatedData.name)
      .input('email',    sql.NVarChar, validatedData.email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role',     sql.NVarChar, validatedData.role)
      .query(`
        INSERT INTO Users (name, email, password, role)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
        VALUES (@name, @email, @password, @role)
      `);

    const newUser = result.recordset[0];
    const token   = signToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser,
    });
  } catch (err) {
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
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user    = result.recordset[0];
    const isMatch = await bcrypt.compare(validatedData.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
      .query('SELECT id, name, email, role, created_at FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
