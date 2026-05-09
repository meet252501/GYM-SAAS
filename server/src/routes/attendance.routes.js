const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  getRotatingToken, 
  memberCheckin, 
  qrCheckin, 
  manualCheckin, 
  getAttendance, 
  getTodayAttendance,
  getMemberSignedQR
} = require('../controllers/attendance.controller');

router.use(protect);

// Admin/Staff routes
router.get('/qr-token', authorize('owner', 'trainer'), getRotatingToken);
router.post('/qr-scan', authorize('owner', 'trainer'), qrCheckin);
router.post('/manual', authorize('owner', 'trainer'), manualCheckin);
router.get('/', authorize('owner', 'trainer'), getAttendance);
router.get('/today', authorize('owner', 'trainer'), getTodayAttendance);

// Member routes
router.post('/checkin', authorize('member', 'owner', 'trainer'), memberCheckin);
router.get('/member-qr', authorize('member', 'owner', 'trainer'), getMemberSignedQR);

module.exports = router;
