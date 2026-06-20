import React, { useState } from 'react';
import { reviewsAPI } from '../services/api';

const ReviewsList = ({
  doctorId,
  reviews,
  loading,
  error,
  userRole,
  userId,
  onReviewDeleted,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(reviewId);
    setDeleteError('');

    try {
      await reviewsAPI.deleteReview(reviewId);
      onReviewDeleted();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete review');
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
