import React, { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';

const roleColors = {
  patient: 'badge-info',
  doctor: 'badge-success',
  admin: 'badge-warning',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAll();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const patients = users.filter(u => u.role === 'patient').length;
  const doctors = users.filter(u => u.role === 'doctor').length;
  const admins = users.filter(u => u.role === 'admin').length;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Manage Users</h1>
        <p style={{ color: 'var(--text-muted)' }}>{users.length} users registered on the platform</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { icon: '👥', label: 'Total Users', value: users.length },
          { icon: '🤒', label: 'Patients', value: patients },
          { icon: '👨‍⚕️', label: 'Doctors', value: doctors },
          { icon: '🛡️', label: 'Admins', value: admins },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>⏳ Loading users...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Appointments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td><span className={`badge ${roleColors[u.role]}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td>{u.joined}</td>
                    <td style={{ fontWeight: 600 }}>{u.appointments}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {u.role !== 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                        )}
                        {u.role === 'admin' && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
