import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Ophthalmology', 'Gynecology', 'Psychiatry'];

const Doctors = () => {
  const { doctors } = useApp();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const filtered = doctors
    .filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
      const matchSpec = specialty === 'All' || d.specialty === specialty;
      const matchAvail = !availableOnly || d.available;
      return matchSearch && matchSpec && matchAvail;
    })
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'price' ? a.price - b.price : b.experience - a.experience);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Find Your Doctor</h1>
        <p className="section-subtitle">Browse our network of {doctors.length} verified specialists</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label>Search</label>
          <input type="text" placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label>Specialty</label>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
            {specialties.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label>Sort By</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="rating">Top Rated</option>
            <option value="price">Lowest Price</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
          <input type="checkbox" id="avail" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} style={{ width: 'auto' }} />
          <label htmlFor="avail" style={{ margin: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}>Available Only</label>
        </div>
        {(search || specialty !== 'All' || availableOnly) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSpecialty('All'); setAvailableOnly(false); }}>Clear Filters</button>
        )}
      </div>

      <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Showing <strong>{filtered.length}</strong> doctors
      </div>

      <div className="grid-3">
        {filtered.map(doc => (
          <div key={doc.id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                {doc.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{doc.name}</h3>
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>{doc.specialty}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {doc.location}</div>
              </div>
              <span className={`badge ${doc.available ? 'badge-success' : 'badge-muted'}`}>
                {doc.available ? '● Available' : '○ Busy'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>⭐ {doc.rating}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.reviews} reviews</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{doc.experience}y</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>${doc.price}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per visit</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <Link to={`/doctors/${doc.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>View Profile</Link>
              {doc.available && (
                <Link to={`/book/${doc.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Book Now</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Doctors;
