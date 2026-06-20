import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const statusMap = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  confirmed: { label: 'Confirmed', cls: 'badge-success' },
  rejected: { label: 'Rejected', cls: 'badge-danger' },
  completed: { label: 'Completed', cls: 'badge-info' },
};

const Appointments = () => {
  const { appointments, fetchAppointments, loadingAppointments } = useApp();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  if (!user) return (
    <div className="page-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
      <h2>Please login to view appointments</h2>
      <Link to="/login" className="btn btn-primary" style={{ marginTop: 20 }}>Login</Link>
    </div>
  );

  const myAppointments = appointments.filter(a => a.patientId === String(user.id));
  const filtered = filter === 'all' ? myAppointments : myAppointments.filter(a => a.status === filter);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title">My Appointments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track and manage all your medical appointments</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">+ Book New Appointment</Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
            background: filter === s ? 'var(--primary)' : 'var(--white)',
            color: filter === s ? 'white' : 'var(--text-muted)',
            border: `2px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 50, textTransform: 'capitalize'
          }}>{s === 'all' ? `All (${myAppointments.length})` : `${s} (${myAppointments.filter(a => a.status === s).length})`}</button>
        ))}
      </div>

      {loadingAppointments ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
          <p>Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
          <h3 style={{ marginBottom: 8 }}>No appointments found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Start by booking an appointment with one of our specialists.</p>
          <Link to="/doctors" className="btn btn-primary">Find a Doctor</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(apt => (
            <div key={apt.id} className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 50, height: 50, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>👨‍⚕️</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{apt.doctorName}</div>
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>{apt.specialty}</div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>📅 {apt.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>🕐 {apt.time}</div>
                </div>
              </div>
              <span className={`badge ${statusMap[apt.status].cls}`}>{statusMap[apt.status].label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
