const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getDashboard,
  getRevenueChart,
  getAttendanceChart,
  getMemberAnalytics,
  getMuscleGroupFocus
} = require('../controllers/analytics.controller');

router.use(protect);

router.get('/dashboard', authorize('owner', 'trainer'), getDashboard);
router.get('/revenue', authorize('owner', 'trainer'), getRevenueChart);
router.get('/attendance', authorize('owner', 'trainer'), getAttendanceChart);
router.get('/muscle-focus', authorize('owner', 'trainer'), getMuscleGroupFocus);
router.get('/member/:id', getMemberAnalytics);

module.exports = router;
