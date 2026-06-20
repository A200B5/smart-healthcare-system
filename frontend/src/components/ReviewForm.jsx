import React, { useState } from 'react';
import { reviewsAPI } from '../services/api';

const ReviewForm = ({ doctorId, onReviewSubmitted, userRole }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
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
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              resize: 'vertical',
              minHeight: 100,
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Submitting...' : success ? '✅ Submitted' : '📝 Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
