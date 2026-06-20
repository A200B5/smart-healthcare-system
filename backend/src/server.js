// backend/src/server.js
// Express application entry point.
// Connects to SQL Server, registers all routes, then starts listening.

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { connectDB } = require('./config/db');

const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes        = require('./routes/users');
const availabilityRoutes = require('./routes/availability');
const reviewRoutes      = require('./routes/reviews');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ──────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews',      reviewRoutes);

// Health check – useful for Docker / CI environments
app.get('/api/health', (_req, res) => {
  res.json({
    success:   true,
    message:   'DEPI Smart Healthcare API is running',
    database:  process.env.DB_NAME || 'depi',
    timestamp: new Date().toISOString(),
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀  DEPI Smart Healthcare API');
    console.log(`📡  http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  POST   /api/auth/register');
    console.log('  POST   /api/auth/login');
    console.log('  GET    /api/auth/me');
    console.log('  GET    /api/doctors');
    console.log('  GET    /api/doctors/:id');
    console.log('  POST   /api/doctors          [admin]');
    console.log('  PUT    /api/doctors/:id       [admin]');
    console.log('  DELETE /api/doctors/:id       [admin]');
    console.log('  GET    /api/appointments       [auth]');
    console.log('  POST   /api/appointments       [patient]');
    console.log('  PATCH  /api/appointments/:id/status  [doctor|admin]');
    console.log('  DELETE /api/appointments/:id  [patient|admin]');
    console.log('  GET    /api/users              [admin]');
    console.log('  GET    /api/users/stats        [admin]');
    console.log('  DELETE /api/users/:id          [admin]');
    console.log('');
  });
};

startServer();
