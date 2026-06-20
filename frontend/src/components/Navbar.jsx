import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = user?.role === 'admin'
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/doctors', label: 'Doctors' }, { to: '/admin/users', label: 'Users' }]
    : user?.role === 'doctor'
    ? [{ to: '/doctor', label: 'My Appointments' }]
    : [{ to: '/doctors', label: 'Find Doctors' }, { to: '/appointments', label: 'My Appointments' }];

  return (
    <nav style={{
      background: 'var(--white)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(10,92,107,0.08)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏥</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>MediCare <span style={{ color: 'var(--accent)' }}>Pro</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user && navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '8px 16px', borderRadius: 50, textDecoration: 'none',
              color: location.pathname === l.to ? 'var(--white)' : 'var(--text-muted)',
              background: location.pathname === l.to ? 'var(--primary)' : 'transparent',
              fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s'
            }}>{l.label}</Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', padding: '6px 14px', borderRadius: 50 }}>
                <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user.name.split(' ')[0]}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>· {user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
