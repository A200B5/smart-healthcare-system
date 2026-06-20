import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { doctorsAPI } from '../services/api';

const AdminDoctors = () => {
  const { doctors, fetchDoctors } = useApp();
  const [search, setSearch] = useState('');

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Remove this doctor from the platform?')) return;
    try {
      await doctorsAPI.delete(id);
      await fetchDoctors();
    } catch {
      alert('Failed to remove doctor.');
    }
  };

  const handleToggleAvailable = async (id, doc) => {
    try {
      await doctorsAPI.update(id, {
        specialty: doc.specialty,
        experience: doc.experience,
        available: !doc.available,
        avatar: doc.avatar,
        price: doc.price,
        location: doc.location,
        bio: doc.bio,
        schedule: Array.isArray(doc.schedule) ? doc.schedule.join(',') : doc.schedule,
      });
      await fetchDoctors();
    } catch {
      alert('Failed to update doctor.');
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title">Manage Doctors</h1>
          <p style={{ color: 'var(--text-muted)' }}>{doctors.length} doctors registered on the platform</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <input type="text" placeholder="Search doctors by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Rating</th>
                <th>Experience</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{doc.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.location}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ color: 'var(--primary)', fontWeight: 500 }}>{doc.specialty}</span></td>
                  <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>⭐ {doc.rating}</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({doc.reviews})</span></td>
                  <td>{doc.experience} years</td>
                  <td style={{ fontWeight: 600 }}>${doc.price}</td>
                  <td>
                    <span className={`badge ${doc.available ? 'badge-success' : 'badge-muted'}`}>
                      {doc.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggleAvailable(doc.id, doc)}>
                        {doc.available ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
