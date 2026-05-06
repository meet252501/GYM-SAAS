const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const memberRoutes = require('./routes/members.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/v1/auth', authLimiter);

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error handler ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
