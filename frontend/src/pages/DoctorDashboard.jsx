import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const statusMap = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  confirmed: { label: 'Confirmed', cls: 'badge-success' },
  rejected: { label: 'Rejected', cls: 'badge-danger' },
  completed: { label: 'Completed', cls: 'badge-info' },
};

const DoctorDashboard = () => {
  const { appointments, fetchAppointments, updateAppointmentStatus, loadingAppointments } = useApp();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const docApts = appointments;
  const filtered = filter === 'all' ? docApts : docApts.filter(a => a.status === filter);
  const pending = docApts.filter(a => a.status === 'pending').length;
  const confirmed = docApts.filter(a => a.status === 'confirmed').length;
  const completed = docApts.filter(a => a.status === 'completed').length;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Doctor Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { icon: '📋', label: 'Total Appointments', value: docApts.length, color: 'var(--primary)' },
          { icon: '⏳', label: 'Pending', value: pending, color: 'var(--warning)' },
          { icon: '✅', label: 'Confirmed', value: confirmed, color: 'var(--success)' },
          { icon: '🏁', label: 'Completed', value: completed, color: 'var(--text-muted)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: '1.3rem' }}>Appointment Requests</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
                background: filter === s ? 'var(--primary)' : 'var(--surface)',
                color: filter === s ? 'white' : 'var(--text-muted)',
                border: `2px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 50, textTransform: 'capitalize'
              }}>{s}</button>
            ))}
          </div>
        </div>

        {loadingAppointments ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>⏳ Loading...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => (
                  <tr key={apt.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👤</div>
                      <span style={{ fontWeight: 600 }}>{apt.patientName}</span>
                    </div></td>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 500 }}>{apt.specialty}</span></td>
                    <td>{apt.date}</td>
                    <td>{apt.time}</td>
                    <td><span className={`badge ${statusMap[apt.status].cls}`}>{statusMap[apt.status].label}</span></td>
                    <td>
                      {apt.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-success btn-sm" onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}>Accept</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateAppointmentStatus(apt.id, 'rejected')}>Reject</button>
                        </div>
                      )}
                      {apt.status === 'confirmed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateAppointmentStatus(apt.id, 'completed')}>Mark Done</button>
                      )}
                      {(apt.status === 'completed' || apt.status === 'rejected') && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No appointments found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
