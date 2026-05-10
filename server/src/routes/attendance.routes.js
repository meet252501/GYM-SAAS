const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  manualCheckin, 
  getAttendance, 
  getTodayAttendance,
  pinCheckin,
  selfCheckin,
  getMyAttendance,
  getKioskPin,
  dynamicPinCheckin
} = require('../controllers/attendance.controller');

router.use(protect);

// Member routes
router.post('/self-checkin', selfCheckin);
router.post('/dynamic-checkin', dynamicPinCheckin);
router.get('/my', getMyAttendance);

// Admin/Staff routes
router.get('/kiosk-pin', authorize('owner', 'trainer'), getKioskPin);
router.post('/pin-checkin', authorize('owner', 'trainer'), pinCheckin);
router.post('/manual', authorize('owner', 'trainer'), manualCheckin);
router.get('/', authorize('owner', 'trainer'), getAttendance);
router.get('/today', authorize('owner', 'trainer'), getTodayAttendance);

module.exports = router;
