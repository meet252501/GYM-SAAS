const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { qrCheckin, manualCheckin, getAttendance, getTodayAttendance } = require('../controllers/attendance.controller');

router.use(protect);
router.post('/qr-scan', authorize('owner', 'trainer'), qrCheckin);
router.post('/manual', authorize('owner', 'trainer'), manualCheckin);
router.get('/', authorize('owner', 'trainer'), getAttendance);
router.get('/today', authorize('owner', 'trainer'), getTodayAttendance);

module.exports = router;
