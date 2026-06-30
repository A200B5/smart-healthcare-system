// backend/src/middleware/validators.js
// Reusable validation helpers for input sanitization and data validation.
// Returns consistent error responses across all routes.

// ── Validation Helper: Format consistent error response ──────────
const validationError = (message, errors = []) => ({
  success: false,
  message,
  errors,
});

// ── Email Validation ──────────────────────────────────────────
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && typeof email === 'string' && emailRegex.test(email.trim());
};

// ── Trim and sanitize strings ─────────────────────────────────
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// ── Sanitize numeric input ────────────────────────────────────
const sanitizeNumber = (num) => {
  const parsed = parseInt(num, 10);
  return isNaN(parsed) ? null : parsed;
};

// ── Sanitize decimal input ────────────────────────────────────
const sanitizeDecimal = (num) => {
  const parsed = parseFloat(num);
  return isNaN(parsed) ? null : parsed;
};

// ── AUTH VALIDATORS ───────────────────────────────────────────

// Validate registration input
const validateRegistration = (name, email, password, role) => {
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  } else if (password.length > 100) {
    errors.push('Password must not exceed 100 characters');
  }

  if (!role || !['patient', 'doctor'].includes(role)) {
    errors.push('Role must be either "patient" or "doctor"');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: sanitizeString(name),
      email: sanitizeString(email).toLowerCase(),
      password,
      role,
    } : null,
  };
};

// Validate login input
const validateLogin = (email, password) => {
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: sanitizeString(email).toLowerCase(),
      password,
    } : null,
  };
};

// ── APPOINTMENT VALIDATORS ────────────────────────────────────

// Validate appointment booking input
const validateAppointmentBooking = (doctorId, date, time, notes) => {
  const errors = [];

  // Validate doctorId
  const sanitizedDoctorId = sanitizeNumber(doctorId);
  if (sanitizedDoctorId === null || sanitizedDoctorId <= 0) {
    errors.push('doctorId must be a valid positive integer');
  }

  // Validate date
  if (!date || typeof date !== 'string') {
    errors.push('Date is required and must be a valid date string');
  } else {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(appointmentDate.getTime())) {
      errors.push('Date must be a valid date format (YYYY-MM-DD)');
    } else if (appointmentDate < today) {
      errors.push('Appointment date cannot be in the past');
    }
  }

  // Validate time
  if (!time || typeof time !== 'string') {
    errors.push('Time is required and must be in HH:MM format');
  } else if (!/^\d{2}:\d{2}$/.test(time.trim())) {
    errors.push('Time must be in HH:MM format (e.g., 14:30)');
  }

  // Validate notes (optional, but limit length if provided)
  if (notes && typeof notes === 'string' && notes.length > 500) {
    errors.push('Notes must not exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      doctorId: sanitizedDoctorId,
      date,
      time: time.trim(),
      notes: notes ? sanitizeString(notes) : '',
    } : null,
  };
};

// Validate appointment status update
const validateAppointmentStatus = (status) => {
  const validStatuses = ['confirmed', 'completed', 'rejected', 'cancelled'];
  const errors = [];

  if (!status || typeof status !== 'string') {
    errors.push('Status is required and must be a string');
  } else if (!validStatuses.includes(status.toLowerCase())) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { status: status.toLowerCase() } : null,
  };
};

// ── REVIEW VALIDATORS ─────────────────────────────────────────

// Validate review submission
const validateReviewSubmission = (doctorId, rating, comment) => {
  const errors = [];

  // Validate doctorId
  const sanitizedDoctorId = sanitizeNumber(doctorId);
  if (sanitizedDoctorId === null || sanitizedDoctorId <= 0) {
    errors.push('doctorId must be a valid positive integer');
  }

  // Validate rating
  const sanitizedRating = sanitizeNumber(rating);
  if (sanitizedRating === null || sanitizedRating < 1 || sanitizedRating > 5) {
    errors.push('Rating must be an integer between 1 and 5');
  }

  // Validate comment (optional, but if provided, must meet requirements)
  if (comment && typeof comment === 'string') {
    if (comment.trim().length > 1000) {
      errors.push('Comment must not exceed 1000 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      doctorId: sanitizedDoctorId,
      rating: sanitizedRating,
      comment: comment ? sanitizeString(comment) : '',
    } : null,
  };
};

// ── DOCTOR VALIDATORS ─────────────────────────────────────────

// Validate doctor creation
const validateDoctorCreation = (user_id, specialty, experience, price, location, avatar, bio, schedule) => {
  const errors = [];

  // Validate user_id
  const sanitizedUserId = sanitizeNumber(user_id);
  if (sanitizedUserId === null || sanitizedUserId <= 0) {
    errors.push('user_id must be a valid positive integer');
  }

  // Validate specialty
  if (!specialty || typeof specialty !== 'string') {
    errors.push('Specialty is required and must be a string');
  } else if (specialty.trim().length === 0) {
    errors.push('Specialty cannot be empty');
  } else if (specialty.trim().length > 100) {
    errors.push('Specialty must not exceed 100 characters');
  }

  // Validate experience
  const sanitizedExperience = sanitizeNumber(experience);
  if (sanitizedExperience === null) {
    errors.push('Experience must be a valid integer');
  } else if (sanitizedExperience < 0) {
    errors.push('Experience cannot be negative');
  } else if (sanitizedExperience > 70) {
    errors.push('Experience seems unrealistic (max 70 years)');
  }

  // Validate price
  const sanitizedPrice = sanitizeDecimal(price);
  if (sanitizedPrice === null) {
    errors.push('Price must be a valid number');
  } else if (sanitizedPrice <= 0) {
    errors.push('Price must be a positive value');
  } else if (sanitizedPrice > 10000) {
    errors.push('Price seems unrealistic (max 10000)');
  }

  // Validate location
  if (!location || typeof location !== 'string') {
    errors.push('Location is required and must be a string');
  } else if (location.trim().length === 0) {
    errors.push('Location cannot be empty');
  } else if (location.trim().length > 200) {
    errors.push('Location must not exceed 200 characters');
  }

  // Validate avatar (optional)
  if (avatar && typeof avatar === 'string' && avatar.trim().length > 50) {
    errors.push('Avatar must not exceed 50 characters');
  }

  // Validate bio (optional)
  if (bio && typeof bio === 'string' && bio.trim().length > 500) {
    errors.push('Bio must not exceed 500 characters');
  }

  // Validate schedule (optional)
  if (schedule && typeof schedule === 'string' && schedule.trim().length > 500) {
    errors.push('Schedule must not exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      user_id: sanitizedUserId,
      specialty: sanitizeString(specialty),
      experience: sanitizedExperience,
      price: sanitizedPrice,
      location: sanitizeString(location),
      avatar: avatar ? sanitizeString(avatar) : '👨‍⚕️',
      bio: bio ? sanitizeString(bio) : '',
      schedule: schedule ? sanitizeString(schedule) : '',
    } : null,
  };
};

// Validate doctor update
const validateDoctorUpdate = (specialty, experience, available, avatar, price, location, bio, schedule) => {
  const errors = [];

  // Validate specialty (if provided)
  if (specialty !== undefined && specialty !== null) {
    if (typeof specialty !== 'string') {
      errors.push('Specialty must be a string');
    } else if (specialty.trim().length === 0) {
      errors.push('Specialty cannot be empty');
    } else if (specialty.trim().length > 100) {
      errors.push('Specialty must not exceed 100 characters');
    }
  }

  // Validate experience (if provided)
  if (experience !== undefined && experience !== null) {
    const sanitizedExperience = sanitizeNumber(experience);
    if (sanitizedExperience === null) {
      errors.push('Experience must be a valid integer');
    } else if (sanitizedExperience < 0) {
      errors.push('Experience cannot be negative');
    } else if (sanitizedExperience > 70) {
      errors.push('Experience seems unrealistic (max 70 years)');
    }
  }

  // Validate available (if provided)
  if (available !== undefined && available !== null && typeof available !== 'boolean') {
    errors.push('Available must be a boolean');
  }

  // Validate price (if provided)
  if (price !== undefined && price !== null) {
    const sanitizedPrice = sanitizeDecimal(price);
    if (sanitizedPrice === null) {
      errors.push('Price must be a valid number');
    } else if (sanitizedPrice <= 0) {
      errors.push('Price must be a positive value');
    } else if (sanitizedPrice > 10000) {
      errors.push('Price seems unrealistic (max 10000)');
    }
  }

  // Validate location (if provided)
  if (location !== undefined && location !== null) {
    if (typeof location !== 'string') {
      errors.push('Location must be a string');
    } else if (location.trim().length === 0) {
      errors.push('Location cannot be empty');
    } else if (location.trim().length > 200) {
      errors.push('Location must not exceed 200 characters');
    }
  }

  // Validate avatar (if provided)
  if (avatar !== undefined && avatar !== null) {
    if (typeof avatar !== 'string') {
      errors.push('Avatar must be a string');
    } else if (avatar.trim().length > 50) {
      errors.push('Avatar must not exceed 50 characters');
    }
  }

  // Validate bio (if provided)
  if (bio !== undefined && bio !== null) {
    if (typeof bio !== 'string') {
      errors.push('Bio must be a string');
    } else if (bio.trim().length > 500) {
      errors.push('Bio must not exceed 500 characters');
    }
  }

  // Validate schedule (if provided)
  if (schedule !== undefined && schedule !== null) {
    if (typeof schedule !== 'string') {
      errors.push('Schedule must be a string');
    } else if (schedule.trim().length > 500) {
      errors.push('Schedule must not exceed 500 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ── USER VALIDATORS ───────────────────────────────────────────

// Validate role
const validateRole = (role) => {
  const validRoles = ['patient', 'doctor', 'admin'];
  const errors = [];

  if (!role || typeof role !== 'string') {
    errors.push('Role is required and must be a string');
  } else if (!validRoles.includes(role.toLowerCase())) {
    errors.push(`Role must be one of: ${validRoles.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { role: role.toLowerCase() } : null,
  };
};

// Validate user ID
const validateUserId = (userId) => {
  const sanitizedId = sanitizeNumber(userId);
  const errors = [];

  if (sanitizedId === null || sanitizedId <= 0) {
    errors.push('User ID must be a valid positive integer');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { userId: sanitizedId } : null,
  };
};

// ── MIDDLEWARE WRAPPER ────────────────────────────────────────
// Middleware to validate and handle errors with consistent format
const createValidator = (validationFn) => {
  return (req, res, next) => {
    req.validated = false;
    req.validationResult = null;

    // Call the validation function with all required params
    const result = validationFn(req);

    if (!result.isValid) {
      return res.status(400).json(validationError(
        'Validation failed',
        result.errors
      ));
    }

    req.validated = true;
    req.validationResult = result.data;
    next();
  };
};

module.exports = {
  // Helpers
  validationError,
  sanitizeString,
  sanitizeNumber,
  sanitizeDecimal,
  isValidEmail,

  // Validators
  validateRegistration,
  validateLogin,
  validateAppointmentBooking,
  validateAppointmentStatus,
  validateReviewSubmission,
  validateDoctorCreation,
  validateDoctorUpdate,
  validateRole,
  validateUserId,

  // Middleware wrapper
  createValidator,
};
