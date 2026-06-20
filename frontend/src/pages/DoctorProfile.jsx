import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reviewsAPI, authAPI } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';

const DoctorProfile = () => {
  const { id } = useParams();
  const { doctors } = useApp();
  const doc = doctors.find(d => d.id === id);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user and reviews
  useEffect(() => {
    const loadUserAndReviews = async () => {
      try {
        // Get current user
        const userData = await authAPI.getMe();
        if (userData.user) {
          setCurrentUser({
            id: userData.user.id,
            role: userData.user.role,
            name: userData.user.name,
          });
        }
      } catch (err) {
        // User not logged in, that's ok
        console.log('User not logged in');
      }

      // Load reviews for this doctor
      if (id) {
        await loadReviews();
      }
    };

    loadUserAndReviews();
  }, [id]);

  const loadReviews = async () => {
    if (!id) return;

    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const data = await reviewsAPI.getDoctorReviews(id);
      setReviews(data.reviews || []);
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews list after submission
    loadReviews();
  };

  const handleReviewDeleted = () => {
    // Refresh reviews list after deletion
    loadReviews();
  };

  if (!doc)
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <h2>Doctor not found</h2>
        <Link to="/doctors" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Doctors
        </Link>
      </div>
    );

  return (
    <div className="page-container">
      <Link
        to="/doctors"
        style={{
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 24,
        }}
      >
        ← Back to Doctors
      </Link>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  background: 'var(--surface2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3.5rem',
                }}
              >
                {doc.avatar}
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>{doc.name}</h1>
                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>
                  {doc.specialty}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>📍 {doc.location}</div>
                <div style={{ marginTop: 10 }}>
                  <span className={`badge ${doc.available ? 'badge-success' : 'badge-muted'}`}>
                    {doc.available ? '● Available for booking' : '○ Currently unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 16,
                padding: '20px 0',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                marginBottom: 20,
              }}
            >
              {[
                { label: 'Rating', value: `⭐ ${doc.rating}` },
                { label: 'Reviews', value: doc.reviews },
                { label: 'Experience', value: `${doc.experience} years` },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: 10 }}>About</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{doc.bio}</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Working Days</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    background: doc.schedule.includes(day) ? 'var(--primary)' : 'var(--surface2)',
                    color: doc.schedule.includes(day) ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: 80, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 20 }}>Quick Actions</h3>
            <Link to={`/book/${doc.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
              📅 Book Appointment
            </Link>
            <Link to="/doctors" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              ← Back to List
            </Link>
          </div>

          {/* Reviews Section */}
          <div>
            <h3 style={{ marginBottom: 20 }}>Reviews ({reviews.length})</h3>
            
            <ReviewForm 
              doctorId={doc.id}
              onReviewSubmitted={handleReviewSubmitted}
              userRole={currentUser?.role}
            />
            
            <ReviewsList 
              doctorId={doc.id}
              reviews={reviews}
              loading={reviewsLoading}
              error={reviewsError}
              userRole={currentUser?.role}
              userId={currentUser?.id}
              onReviewDeleted={handleReviewDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
