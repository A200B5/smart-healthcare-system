import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { usersAPI } from '../services/api';

const monthlyData = [
  { month: 'Jan', appointments: 42, patients: 38, revenue: 6300 },
  { month: 'Feb', appointments: 58, patients: 51, revenue: 8700 },
  { month: 'Mar', appointments: 71, patients: 65, revenue: 10650 },
  { month: 'Apr', appointments: 64, patients: 59, revenue: 9600 },
  { month: 'May', appointments: 89, patients: 78, revenue: 13350 },
  { month: 'Jun', appointments: 95, patients: 87, revenue: 14250 },
  { month: 'Jul', appointments: 112, patients: 98, revenue: 16800 },
];

const COLORS = ['#0a5c6b', '#f0a500', '#22c55e', '#ef4444'];

const AdminDashboard = () => {
  const { doctors, appointments, fetchAppointments } = useApp();
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAppointments();
    usersAPI.getStats().then(data => {
      if (data.success) setStats(data.stats);
    }).catch(() => {});
  }, []);

  const totalDoctors = stats.doctors?.total ?? doctors.length;
  const availableDoctors = stats.doctors?.available ?? doctors.filter(d => d.available).length;
  const totalAppointments = stats.appointments?.total ?? appointments.length;
  const pendingAppointments = stats.appointments?.pending ?? appointments.filter(a => a.status === 'pending').length;
  const confirmedAppointments = stats.appointments?.confirmed ?? appointments.filter(a => a.status === 'confirmed').length;
  const completedAppointments = stats.appointments?.completed ?? appointments.filter(a => a.status === 'completed').length;
  const rejectedAppointments = stats.appointments?.rejected ?? appointments.filter(a => a.status === 'rejected').length;

  const statusData = [
    { name: 'Confirmed', value: confirmedAppointments },
    { name: 'Pending', value: pendingAppointments },
    { name: 'Completed', value: completedAppointments },
    { name: 'Rejected', value: rejectedAppointments },
  ];

  const specialtyData = ['Cardiology','Neurology','Pediatrics','Dermatology','Orthopedics'].map(s => ({
    specialty: s,
    doctors: doctors.filter(d => d.specialty === s).length,
    appointments: appointments.filter(a => a.specialty === s).length,
  }));

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Platform overview and analytics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { icon: '👨‍⚕️', label: 'Total Doctors', value: totalDoctors, sub: `${availableDoctors} available`, color: 'var(--primary)' },
          { icon: '📅', label: 'Total Appointments', value: totalAppointments, sub: `${pendingAppointments} pending`, color: 'var(--warning)' },
          { icon: '✅', label: 'Confirmed', value: confirmedAppointments, sub: 'appointments', color: 'var(--success)' },
          { icon: '👥', label: 'Total Users', value: stats.users?.totalUsers ?? '—', sub: `${stats.users?.totalPatients ?? '—'} patients`, color: 'var(--accent)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Monthly Appointments & Patients</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a5c6b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0a5c6b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0a500" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f0a500" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5a7a82' }} />
              <YAxis tick={{ fontSize: 12, fill: '#5a7a82' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="appointments" stroke="#0a5c6b" fill="url(#colorApt)" strokeWidth={2} />
              <Area type="monotone" dataKey="patients" stroke="#f0a500" fill="url(#colorPat)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Appointment Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Revenue Trend (Monthly)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5a7a82' }} />
              <YAxis tick={{ fontSize: 12, fill: '#5a7a82' }} />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#0a5c6b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Appointments by Specialty</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={specialtyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eef4f6" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#5a7a82' }} />
              <YAxis dataKey="specialty" type="category" tick={{ fontSize: 11, fill: '#5a7a82' }} width={90} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#f0a500" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Recent Appointments</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => (
                <tr key={apt.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
                  <td>{apt.patientName}</td>
                  <td style={{ fontWeight: 600 }}>{apt.doctorName}</td>
                  <td><span style={{ color: 'var(--primary)', fontWeight: 500 }}>{apt.specialty}</span></td>
                  <td>{apt.date}</td>
                  <td>{apt.time}</td>
                  <td>
                    <span className={`badge ${apt.status === 'confirmed' ? 'badge-success' : apt.status === 'pending' ? 'badge-warning' : apt.status === 'rejected' ? 'badge-danger' : 'badge-info'}`}>
                      {apt.status}
                    </span>
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

export default AdminDashboard;
