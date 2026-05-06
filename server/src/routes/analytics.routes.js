const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getRevenueChart, getAttendanceChart } = require('../controllers/analytics.controller');

router.use(protect, authorize('owner', 'trainer'));
router.get('/dashboard', getDashboard);
router.get('/revenue', getRevenueChart);
router.get('/attendance', getAttendanceChart);

module.exports = router;
