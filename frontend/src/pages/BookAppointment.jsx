import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { availabilityAPI } from '../services/api';

const BookAppointment = () => {
  const { id } = useParams();
  const { doctors, addAppointment } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const doc = doctors.find(d => d.id === id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Load available slots when date changes
  useEffect(() => {
    if (!date || !doc) {
      setAvailableSlots([]);
      setSlotsError('');
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError('');
      try {
        const response = await availabilityAPI.getAvailableSlots(doc.id, date);
        if (response.success) {
          const slots = response.availableSlots
            .filter((slot) => !slot.isBooked)
            .map((slot) => {
              // Convert 24-hour format (HH:MM) to 12-hour format (HH:MM AM/PM)
              const [hours, minutes] = slot.time.split(':');
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour % 12 || 12;
              return `${displayHour}:${minutes} ${ampm}`;
            });
          setAvailableSlots(slots);
          setTime(''); // Reset time selection
        } else {
          setSlotsError('No available slots for this date');
        }
      } catch (err) {
        setSlotsError('Failed to load available slots');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [date, doc]);

  if (!doc) return <div className="page-container"><h2>Doctor not found</h2></div>;
  if (!user)
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
        <h2>Please login to book</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 20 }}>
          Login
        </Link>
      </div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return;
    setSubmitting(true);
    setError('');
    const ok = await addAppointment(doc.id, date, time, notes);
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('/appointments'), 2000);
    } else {
      setError('Failed to book appointment. The time slot may have been taken. Please try again.');
    }
  };

  if (success)
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="fade-in">
          <div
            style={{
              width: 80,
              height: 80,
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 24px',
            }}
          >
            ✅
          </div>
          <h2 style={{ color: 'var(--success)', marginBottom: 8 }}>Appointment Booked!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to your appointments...</p>
        </div>
      </div>
    );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <Link
        to={`/doctors/${doc.id}`}
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
        ← Back to Profile
      </Link>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ marginBottom: 6 }}>Book Appointment</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>with {doc.name}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Date</label>
              <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Select Time</label>
              {loadingSlots ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>⏳ Loading available slots...</div>
              ) : slotsError ? (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem' }}>
                  {slotsError}
                </div>
              ) : availableSlots.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {availableSlots.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: `2px solid ${time === t ? 'var(--primary)' : 'var(--border)'}`,
                        background: time === t ? 'var(--primary)' : 'var(--white)',
                        color: time === t ? 'white' : 'var(--text)',
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : date ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No available slots for this date
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  Please select a date first
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Describe your symptoms or reason for visit..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            {error && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '1rem',
              }}
              disabled={!date || !time || submitting || loadingSlots}
            >
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>

        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <h3 style={{ marginBottom: 20 }}>Appointment Summary</h3>
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: '1px solid var(--border)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: 'var(--surface2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              {doc.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{doc.name}</div>
              <div style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{doc.specialty}</div>
            </div>
          </div>
          {[
            { icon: '📍', label: 'Location', value: doc.location },
            { icon: '📅', label: 'Date', value: date || 'Not selected' },
            { icon: '🕐', label: 'Time', value: time || 'Not selected' },
            { icon: '👤', label: 'Patient', value: user.name },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                {row.icon} {row.label}
              </span>
              <span style={{ fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: 4 }}>
            <span style={{ fontWeight: 600 }}>Total Fee</span>
            <span
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              ${doc.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
