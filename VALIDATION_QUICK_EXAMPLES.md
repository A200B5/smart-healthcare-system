// VALIDATION LAYER - QUICK REFERENCE & CODE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * QUICK REFERENCE
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * All validators are imported from:
 *   const { ... } = require('../middleware/validators');
 * 
 * All validation errors return consistent JSON:
 *   {
 *     success: false,
 *     message: "Error category",
 *     errors: ["specific error 1", "specific error 2"]
 *   }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATORS QUICK LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════

const validators = {
  // Authentication
  validateRegistration: "(name, email, password, role) → { isValid, errors, data }",
  validateLogin: "(email, password) → { isValid, errors, data }",

  // Appointments
  validateAppointmentBooking: "(doctorId, date, time, notes) → { isValid, errors, data }",
  validateAppointmentStatus: "(status) → { isValid, errors, data }",

  // Reviews
  validateReviewSubmission: "(doctorId, rating, comment) → { isValid, errors, data }",

  // Doctors
  validateDoctorCreation: "(user_id, specialty, experience, price, location, avatar, bio, schedule) → { isValid, errors, data }",
  validateDoctorUpdate: "(specialty, experience, available, avatar, price, location, bio, schedule) → { isValid, errors, data }",

  // Users
  validateUserId: "(userId) → { isValid, errors, data }",
};

const sanitizers = {
  sanitizeString: "(str) → trimmed & HTML-escaped string",
  sanitizeNumber: "(num) → integer or null",
  sanitizeDecimal: "(num) → float or null",
  isValidEmail: "(email) → boolean",
};

// ═══════════════════════════════════════════════════════════════════════════════
// CODE EXAMPLES - COPY & PASTE READY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * EXAMPLE 1: Validating Authentication (Registration)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Before (no validation):
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  // ... rest of code
});

// After (with validation):
const { validateRegistration, validationError } = require('../middleware/validators');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  const validation = validateRegistration(name, email, password, role);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Registration validation failed', validation.errors));
  }

  const validatedData = validation.data;
  // Now use validatedData instead of raw req.body
  // validatedData.name, validatedData.email, etc.
});

/**
 * EXAMPLE 2: Validating Appointment Booking
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validateAppointmentBooking, validationError } = require('../middleware/validators');

router.post('/appointments', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctorId, date, time, notes } = req.body;

  // Validate appointment data
  const validation = validateAppointmentBooking(doctorId, date, time, notes);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Appointment booking validation failed', validation.errors));
  }

  const validatedData = validation.data;
  // validatedData.doctorId (sanitized integer)
  // validatedData.date (validated date string)
  // validatedData.time (validated HH:MM format)
  // validatedData.notes (sanitized string, max 500 chars)

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, validatedData.doctorId)
      .input('patientId', sql.Int, req.user.id)
      .input('date', sql.Date, validatedData.date)
      .input('time', sql.NVarChar, validatedData.time)
      .input('notes', sql.NVarChar, validatedData.notes)
      .execute('sp_BookAppointment');

    // ... rest of logic
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * EXAMPLE 3: Validating Review Submission
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validateReviewSubmission, validationError } = require('../middleware/validators');

router.post('/reviews', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctorId, rating, comment } = req.body;
  const patientId = req.user.id;

  // Validate review data
  const validation = validateReviewSubmission(doctorId, rating, comment);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Review submission validation failed', validation.errors));
  }

  const validatedData = validation.data;
  // validatedData.doctorId (sanitized integer)
  // validatedData.rating (integer 1-5)
  // validatedData.comment (sanitized string, max 1000 chars)

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('patientId', sql.Int, patientId)
      .input('doctorId', sql.Int, validatedData.doctorId)
      .input('rating', sql.Int, validatedData.rating)
      .input('comment', sql.NVarChar, validatedData.comment)
      .execute('sp_AddReview');

    // ... rest of logic
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * EXAMPLE 4: Validating Doctor Creation
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validateDoctorCreation, validationError } = require('../middleware/validators');

router.post('/doctors', authMiddleware, requireRole('admin'), async (req, res) => {
  const { user_id, specialty, experience, avatar, price, location, bio, schedule } = req.body;

  // Validate doctor creation data
  const validation = validateDoctorCreation(
    user_id, specialty, experience, price, location, avatar, bio, schedule
  );
  if (!validation.isValid) {
    return res.status(400).json(validationError('Doctor creation validation failed', validation.errors));
  }

  const validatedData = validation.data;
  // All fields now validated and sanitized

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, validatedData.user_id)
      .input('specialty', sql.NVarChar, validatedData.specialty)
      .input('experience', sql.Int, validatedData.experience)
      .input('available', sql.Bit, 1)
      .input('avatar', sql.NVarChar, validatedData.avatar)
      .input('price', sql.Decimal(10, 2), validatedData.price)
      .input('location', sql.NVarChar, validatedData.location)
      .input('bio', sql.NVarChar, validatedData.bio)
      .input('schedule', sql.NVarChar, validatedData.schedule)
      .query(`...`);

    // ... rest of logic
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * EXAMPLE 5: Validating Doctor Update (Partial)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validateDoctorUpdate, validationError, sanitizeNumber } = require('../middleware/validators');

router.put('/doctors/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { specialty, experience, available, avatar, price, location, bio, schedule } = req.body;

  // Validate ID from URL
  const doctorId = sanitizeNumber(req.params.id);
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  // Validate update data (all fields optional)
  const validation = validateDoctorUpdate(specialty, experience, available, avatar, price, location, bio, schedule);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Doctor update validation failed', validation.errors));
  }

  try {
    const pool = getPool();

    const check = await pool.request()
      .input('id', sql.Int, doctorId)
      .query('SELECT id FROM Doctors WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await pool.request()
      .input('id', sql.Int, doctorId)
      .input('specialty', sql.NVarChar, specialty)
      .input('experience', sql.Int, experience)
      .input('available', sql.Bit, available ? 1 : 0)
      .input('avatar', sql.NVarChar, avatar)
      .input('price', sql.Decimal(10, 2), price)
      .input('location', sql.NVarChar, location)
      .input('bio', sql.NVarChar, bio)
      .input('schedule', sql.NVarChar, schedule)
      .query(`...`);

    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (err) {
    console.error('Update doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * EXAMPLE 6: Handling URL Parameters (GET by ID)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { sanitizeNumber, validationError } = require('../middleware/validators');

router.get('/doctors/:id', async (req, res) => {
  // Sanitize ID from URL parameter
  const doctorId = sanitizeNumber(req.params.id);

  // Validate sanitization result
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  try {
    const pool = getPool();
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

/**
 * EXAMPLE 7: Validating Status Update
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validateAppointmentStatus, validationError, sanitizeNumber } = require('../middleware/validators');

router.patch('/appointments/:id/status', authMiddleware, requireRole('doctor', 'admin'), async (req, res) => {
  const { status } = req.body;

  // Validate status
  const validation = validateAppointmentStatus(status);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Status validation failed', validation.errors));
  }

  // Sanitize appointment ID
  const appointmentId = sanitizeNumber(req.params.id);
  if (appointmentId === null) {
    return res.status(400).json(validationError('Invalid appointment ID', ['Appointment ID must be a valid integer']));
  }

  const validatedStatus = validation.data.status;

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('appointmentId', sql.Int, appointmentId)
      .input('newStatus', sql.NVarChar, validatedStatus)
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
});

/**
 * EXAMPLE 8: Custom Error Handling Pattern
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validationError } = require('../middleware/validators');

// Pattern for handling validation + business logic errors
router.post('/endpoint', async (req, res) => {
  try {
    // Validation layer
    const validation = someValidator(...);
    if (!validation.isValid) {
      return res.status(400).json(validationError('Validation failed', validation.errors));
    }

    // Business logic layer
    const businessCheck = await checkBusinessRule(...);
    if (!businessCheck.isValid) {
      return res.status(businessCheck.statusCode).json({
        success: false,
        message: businessCheck.message
      });
    }

    // Database layer
    const result = await pool.request()...

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION FAILURE SCENARIOS - TESTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test Case 1: Invalid Registration Email
 * ───────────────────────────────────────
 * 
 * Request:
 * POST /api/auth/register
 * {
 *   "name": "John Doe",
 *   "email": "invalid-email",
 *   "password": "securePassword123",
 *   "role": "patient"
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "Registration validation failed",
 *   "errors": ["Valid email is required"]
 * }
 */

/**
 * Test Case 2: Appointment in Past
 * ────────────────────────────────
 * 
 * Request:
 * POST /api/appointments
 * {
 *   "doctorId": 1,
 *   "date": "2024-01-01",
 *   "time": "14:30",
 *   "notes": "Follow-up visit"
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "Appointment booking validation failed",
 *   "errors": ["Appointment date cannot be in the past"]
 * }
 */

/**
 * Test Case 3: Invalid Review Rating
 * ──────────────────────────────────
 * 
 * Request:
 * POST /api/reviews
 * {
 *   "doctorId": 1,
 *   "rating": 6,
 *   "comment": "Great doctor!"
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "Review submission validation failed",
 *   "errors": ["Rating must be an integer between 1 and 5"]
 * }
 */

/**
 * Test Case 4: Negative Price
 * ──────────────────────────
 * 
 * Request:
 * POST /api/doctors
 * {
 *   "user_id": 10,
 *   "specialty": "Cardiology",
 *   "experience": 5,
 *   "price": -50,
 *   "location": "Hospital A"
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "Doctor creation validation failed",
 *   "errors": ["Price must be a positive value"]
 * }
 */

/**
 * Test Case 5: Multiple Validation Errors
 * ───────────────────────────────────────
 * 
 * Request:
 * POST /api/auth/register
 * {
 *   "name": "J",
 *   "email": "not-an-email",
 *   "password": "123",
 *   "role": "superuser"
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "Registration validation failed",
 *   "errors": [
 *     "Name must be at least 2 characters",
 *     "Valid email is required",
 *     "Password must be at least 6 characters",
 *     "Role must be either 'patient' or 'doctor'"
 *   ]
 * }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SANITIZATION EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sanitization in Action:
 * ──────────────────────
 * 
 * Input Sanitization:
 *   sanitizeString("<script>alert('xss')</script>")
 *   → "&lt;script&gt;alert('xss')&lt;/script&gt;"
 * 
 *   sanitizeString("  hello world  ")
 *   → "hello world"
 * 
 *   sanitizeNumber("123")
 *   → 123
 * 
 *   sanitizeNumber("not-a-number")
 *   → null
 * 
 *   sanitizeDecimal("99.99")
 *   → 99.99
 * 
 *   isValidEmail("user@example.com")
 *   → true
 * 
 *   isValidEmail("invalid.email")
 *   → false
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION IMPORTS REFERENCE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * For Authentication Routes (auth.js):
 * const { validateRegistration, validateLogin, validationError } = require('../middleware/validators');
 * 
 * For Appointment Routes (appointments.js):
 * const { validateAppointmentBooking, validateAppointmentStatus, validationError, sanitizeNumber } = require('../middleware/validators');
 * 
 * For Review Routes (reviews.js):
 * const { validateReviewSubmission, validationError, sanitizeNumber } = require('../middleware/validators');
 * 
 * For Doctor Routes (doctors.js):
 * const { validateDoctorCreation, validateDoctorUpdate, validationError, sanitizeNumber } = require('../middleware/validators');
 * 
 * For User Routes (users.js):
 * const { sanitizeNumber, validationError } = require('../middleware/validators');
 */

module.exports = {
  documentation: "See this file for complete code examples and copy-paste ready patterns"
};
