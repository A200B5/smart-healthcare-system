// backend/src/server.js
// Express application entry point.
// Connects to SQL Server, registers all routes, then starts listening.

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');

// Validate required environment variables at startup and exit early if any are
// missing, instead of failing later at runtime.
const REQUIRED_ENV = ['JWT_SECRET', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('❌  Missing required environment variables:', missingEnv.join(', '));
  console.error('    Create a .env file from .env.example and fill in all required values.');
  process.exit(1);
}

const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes        = require('./routes/users');
const availabilityRoutes = require('./routes/availability');
const reviewRoutes      = require('./routes/reviews');
const adminRoutes       = require('./routes/admin');
const paymentRoutes     = require('./routes/payment');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ──────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for authentication endpoints to throttle repeated login and
// registration attempts from the same IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,             // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// Registration: prevent account-creation spam
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many accounts created from this IP. Try again later.' },
});

app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', registerLimiter);

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/payments',     paymentRoutes);

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
    console.log('  GET    /api/admin/doctors/pending        [admin]');
    console.log('  PUT    /api/admin/doctors/:id/approve    [admin]');
    console.log('  PUT    /api/admin/doctors/:id/reject     [admin]');
    console.log('');
  });
};

startServer();
