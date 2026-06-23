// backend/src/routes/reviews.js
// Doctor reviews management.
// Patients can add/view reviews. Admins can delete reviews.

const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateReviewSubmission, validationError, sanitizeNumber } = require('../middleware/validators');

// ── POST /api/reviews  ──────────────────────────────────────────────
// Add a review for a doctor (patient only).
// Request body: { doctorId, rating (1-5), comment }
router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctorId, rating, comment } = req.body;
  const patientId = req.user.id;

  // Validate review submission input
  const validation = validateReviewSubmission(doctorId, rating, comment);
  if (!validation.isValid) {
    return res.status(400).json(validationError('Review submission validation failed', validation.errors));
  }

  const validatedData = validation.data;

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('patientId', sql.Int, patientId)
      .input('doctorId', sql.Int, validatedData.doctorId)
      .input('rating', sql.Int, validatedData.rating)
      .input('comment', sql.NVarChar, validatedData.comment)
      .execute('sp_AddReview');

    const row = result.recordset[0];

    // Check for errors
    if (row.success < 1) {
      if (row.success === -1) {
        return res.status(403).json({ success: false, message: row.message });
      }
      if (row.success === -2) {
        return res.status(404).json({ success: false, message: row.message });
      }
      if (row.success === -3) {
        return res.status(409).json({ success: false, message: row.message });
      }
      if (row.success === -4) {
        return res.status(403).json({ success: false, message: row.message });
      }
      return res.status(400).json({ success: false, message: row.message });
    }

    res.status(201).json({
      success: true,
      message: row.message,
      reviewId: row.success,
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/doctors/:doctorId/reviews  ────────────────────────────
// Get all reviews for a doctor (public route).
router.get('/doctors/:doctorId/reviews', async (req, res) => {
  const doctorId = sanitizeNumber(req.params.doctorId);
  
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .execute('sp_GetDoctorReviews');

    res.json({
      success: true,
      doctorId,
      reviews: result.recordset.map(row => ({
        id: row.id,
        patientId: row.patient_id,
        patientName: row.patientName,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt,
        daysAgo: row.daysAgo,
      })),
      totalReviews: result.recordset.length,
    });
  } catch (err) {
    console.error('Get doctor reviews error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/reviews/check/:doctorId  ───────────────────────────────
// Check if authenticated patient has already reviewed this doctor.
// Used to show/hide the review form on doctor profile.
router.get('/check/:doctorId', authMiddleware, async (req, res) => {
  const doctorId = sanitizeNumber(req.params.doctorId);
  const patientId = req.user.id;

  // Validate doctorId
  if (doctorId === null) {
    return res.status(400).json(validationError('Invalid doctor ID', ['Doctor ID must be a valid integer']));
  }

  // Only patients can check
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      hasReviewed: false,
      message: 'Only patients can check reviews',
    });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('patientId', sql.Int, patientId)
      .input('doctorId', sql.Int, doctorId)
      .execute('sp_CheckPatientReview');

    const hasReviewed = result.recordset.length > 0;

    res.json({
      success: true,
      hasReviewed,
      review: hasReviewed ? {
        id: result.recordset[0].id,
        rating: result.recordset[0].rating,
        comment: result.recordset[0].comment,
        createdAt: result.recordset[0].createdAt,
      } : null,
    });
  } catch (err) {
    console.error('Check patient review error:', err);
    res.status(500).json({ success: false, message: 'Server error', hasReviewed: false });
  }
});

// ── DELETE /api/reviews/:reviewId  ──────────────────────────────────
// Delete a review (admin only, or the patient who wrote it).
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  const reviewId = sanitizeNumber(req.params.reviewId);
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  // Validate review ID
  if (reviewId === null) {
    return res.status(400).json(validationError('Invalid review ID', ['Review ID must be a valid integer']));
  }

  // Only admin or the patient who wrote it can delete
  if (requesterRole !== 'admin' && requesterRole !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this review',
    });
  }

  try {
    const pool = getPool();
    
    // If patient, verify they wrote this review
    if (requesterRole === 'patient') {
      const checkReview = await pool.request()
        .input('reviewId', sql.Int, reviewId)
        .query('SELECT patient_id FROM Reviews WHERE id = @reviewId');

      if (checkReview.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      if (checkReview.recordset[0].patient_id !== requesterId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own reviews',
        });
      }
    }

    // Delete the review
    const result = await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .input('requesterRole', sql.NVarChar, requesterRole)
      .input('requesterId', sql.Int, requesterRole === 'admin' ? null : requesterId)
      .execute('sp_DeleteReview');

    const row = result.recordset[0];

    if (row.success !== 1) {
      return res.status(400).json({ success: false, message: row.message });
    }

    res.json({
      success: true,
      message: row.message,
    });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
