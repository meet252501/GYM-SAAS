const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const memberRoutes = require('./routes/members.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const nutritionRoutes  = require('./routes/nutrition.routes');
const workoutsRoutes   = require('./routes/workouts.routes');
const classesRoutes    = require('./routes/classes.routes');
const paymentRoutes    = require('./routes/payment.routes');
const badgeRoutes      = require('./routes/badge.routes');
const progressRoutes   = require('./routes/progress.routes');
const gymRoutes        = require('./routes/gym.routes');
const dietPlanRoutes   = require('./routes/dietPlan.routes');
const notificationRoutes = require('./routes/notification.routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

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
app.use('/api/v1/nutrition',  nutritionRoutes);
app.use('/api/v1/workouts',   workoutsRoutes);
app.use('/api/v1/classes',    classesRoutes);
app.use('/api/v1/payments',   paymentRoutes);
app.use('/api/v1/badges',     badgeRoutes);
app.use('/api/v1/progress',   progressRoutes);
app.use('/api/v1/gym',        gymRoutes);
app.use('/api/v1/diet-plans', dietPlanRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error handler ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
