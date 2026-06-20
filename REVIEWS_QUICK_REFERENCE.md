# Doctor Reviews System - Quick Code Reference

## 🎯 All Code Changes at a Glance

This file shows exact code snippets for all modifications. Copy-paste ready!

---

## 1️⃣ Backend: server.js Changes

**Location:** `backend/src/server.js`

**Change #1: Add import (line ~13)**
```javascript
const reviewRoutes      = require('./routes/reviews');
```

**Full imports section should be:**
```javascript
const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes        = require('./routes/users');
const availabilityRoutes = require('./routes/availability');
const reviewRoutes      = require('./routes/reviews');
```

**Change #2: Add route registration (line ~28)**
```javascript
app.use('/api/reviews',      reviewRoutes);
```

**Full routes section should be:**
```javascript
// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews',      reviewRoutes);
```

---

## 2️⃣ Backend: New reviews.js Route File

**Create new file:** `backend/src/routes/reviews.js`

**Complete file content:**

```javascript
// backend/src/routes/reviews.js
// Doctor reviews management.
// Patients can add/view reviews. Admins can delete reviews.

const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ── POST /api/reviews  ──────────────────────────────────────────────
// Add a review for a doctor (patient only).
// Request body: { doctorId, rating (1-5), comment }
router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctorId, rating, comment } = req.body;
  const patientId = req.user.id;

  // Validate input
  if (!doctorId || rating === undefined) {
    return res.status(400).json({
      success: false,
      message: 'doctorId and rating are required',
    });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a number between 1 and 5',
    });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('patientId', sql.Int, patientId)
      .input('doctorId', sql.Int, doctorId)
      .input('rating', sql.Int, Math.round(rating))
      .input('comment', sql.NVarChar, comment || '')
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
  const { doctorId } = req.params;

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
  const { doctorId } = req.params;
  const patientId = req.user.id;

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
  const { reviewId } = req.params;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

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
```

---

## 3️⃣ Frontend: api.ts Changes

**Location:** `frontend/src/services/api.ts`

**Add this at the end of the file (after availabilityAPI):**

```typescript
// ── Reviews ────────────────────────────────────────────────────
export const reviewsAPI = {
  // Add a review for a doctor (patient only)
  addReview: (doctorId: string | number, rating: number, comment: string) =>
    fetch(`${BASE_URL}/reviews`, {
      method:  'POST',
      headers: getHeaders(),
      body:    JSON.stringify({ doctorId, rating, comment }),
    }).then(handleResponse),

  // Get all reviews for a doctor (public)
  getDoctorReviews: (doctorId: string | number) =>
    fetch(`${BASE_URL}/reviews/doctors/${doctorId}/reviews`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Check if current patient has already reviewed a doctor (patient only)
  checkIfReviewed: (doctorId: string | number) =>
    fetch(`${BASE_URL}/reviews/check/${doctorId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Delete a review (admin or the patient who wrote it)
  deleteReview: (reviewId: string | number) =>
    fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method:  'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};
```

---

## 4️⃣ Frontend: ReviewForm Component

**Create new file:** `frontend/src/components/ReviewForm.tsx`

**Complete file:**

```typescript
import React, { useState } from 'react';
import { reviewsAPI } from '../services/api';

interface ReviewFormProps {
  doctorId: string | number;
  onReviewSubmitted: () => void;
  userRole?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ doctorId, onReviewSubmitted, userRole }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      await reviewsAPI.addReview(doctorId, rating, comment.trim());
      setSuccess(true);
      setRating(5);
      setComment('');
      
      // Call parent callback to refresh reviews
      setTimeout(() => {
        onReviewSubmitted();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Only show form for authenticated patients
  if (!userRole || userRole !== 'patient') {
    return (
      <div className="card" style={{ marginBottom: 24, padding: 24, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          🔒 Sign in as a patient to leave a review
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 20 }}>Write a Review</h3>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: '0.9rem',
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#efe',
          border: '1px solid #cfc',
          color: '#3c3',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: '0.9rem',
        }}>
          ✅ Review submitted successfully! Thank you.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: 'var(--text)' }}>
            Rating *
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2.5rem',
                  cursor: 'pointer',
                  opacity: star <= rating ? 1 : 0.3,
                  transition: 'opacity 0.2s',
                  padding: 0,
                }}
              >
                ⭐
              </button>
            ))}
            <span style={{ marginLeft: 10, fontWeight: 600, color: 'var(--primary)' }}>
              {rating}/5
            </span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="comment" style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
            color: 'var(--text)',
          }}>
            Comment *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this doctor (minimum 10 characters)..."
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              resize: 'vertical',
              minHeight: 100,
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: 4,
          }}>
            {comment.length} characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="btn btn-primary"
          style={{
            width: '100%',
            opacity: loading || success ? 0.6 : 1,
            cursor: loading || success ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Submitting...' : success ? '✓ Submitted' : '📝 Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
```

---

## 5️⃣ Frontend: ReviewsList Component

**Create new file:** `frontend/src/components/ReviewsList.tsx`

**Complete file:**

```typescript
import React from 'react';
import { reviewsAPI } from '../services/api';

interface Review {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
  daysAgo: number;
}

interface ReviewsListProps {
  doctorId: string | number;
  reviews: Review[];
  loading: boolean;
  error: string | null;
  userRole?: string;
  userId?: number;
  onReviewDeleted: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  doctorId,
  reviews,
  loading,
  error,
  userRole,
  userId,
  onReviewDeleted,
}) => {
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [deleteError, setDeleteError] = React.useState<string>('');

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(reviewId);
    setDeleteError('');

    try {
      await reviewsAPI.deleteReview(reviewId);
      onReviewDeleted();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete review');
      }
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{
        background: '#fee',
        border: '1px solid #fcc',
        color: '#c33',
        padding: 16,
      }}>
        <p style={{ margin: 0 }}>❌ {error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: '2rem', marginBottom: 10 }}>📝</div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div>
      {deleteError && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: '0.9rem',
        }}>
          ❌ {deleteError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            className="card"
            style={{
              padding: 16,
              border: '1px solid var(--border)',
              position: 'relative',
            }}
          >
            {/* Delete Button (only for admin or review author) */}
            {(userRole === 'admin' || (userRole === 'patient' && userId === review.id)) && (
              <button
                onClick={() => handleDeleteReview(review.id)}
                disabled={deletingId === review.id}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  opacity: deletingId === review.id ? 0.5 : 1,
                }}
                title="Delete review"
              >
                ✕
              </button>
            )}

            {/* Patient Name & Rating */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {review.patientName}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {review.daysAgo === 0 ? 'Today' : `${review.daysAgo} days ago`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{ fontSize: '1rem', opacity: i < review.rating ? 1 : 0.3 }}>
                    ⭐
                  </span>
                ))}
                <span style={{ fontWeight: 600, color: 'var(--primary)', marginLeft: 6 }}>
                  {review.rating}/5
                </span>
              </div>
            </div>

            {/* Comment */}
            <p style={{
              color: 'var(--text)',
              lineHeight: 1.6,
              margin: 0,
              fontSize: '0.95rem',
            }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
```

---

## 6️⃣ Frontend: DoctorProfile.tsx Update

**Replace entire file:** `frontend/src/pages/DoctorProfile.tsx`

**[See REVIEWS_IMPLEMENTATION.md for full updated DoctorProfile component]**

**Or use the complete file in the project repository**

---

## 🗄️ SQL Migration

**Create new file:** `database/migration_add_reviews.sql`

**[See REVIEWS_IMPLEMENTATION.md for complete SQL migration code]**

**Or use the complete file in the project repository**

---

## ✅ Deployment Checklist

- [ ] Run SQL migration: `database/migration_add_reviews.sql`
- [ ] Add imports to `backend/src/server.js`
- [ ] Add route registration to `backend/src/server.js`
- [ ] Create `backend/src/routes/reviews.js`
- [ ] Add `reviewsAPI` to `frontend/src/services/api.ts`
- [ ] Create `frontend/src/components/ReviewForm.tsx`
- [ ] Create `frontend/src/components/ReviewsList.tsx`
- [ ] Update `frontend/src/pages/DoctorProfile.tsx`
- [ ] Restart backend: `npm run dev`
- [ ] Restart frontend: `npm run dev`
- [ ] Test in browser: http://localhost:5173

---

## 🧪 Quick Test

1. **SQL Migration:**
   ```sql
   EXEC sp_AddReview 1, 1, 5, 'Test review';
   SELECT * FROM Reviews;
   ```

2. **Backend API:**
   ```bash
   curl -X POST http://localhost:5000/api/reviews \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"doctorId":1,"rating":5,"comment":"Great doctor!"}'
   ```

3. **Frontend:**
   - Navigate to doctor profile
   - Should see ReviewForm component
   - Should see ReviewsList below
   - Submit a review
   - Should auto-refresh

---

**Copy-paste friendly code reference complete!**

All code is ready to integrate into your project.
