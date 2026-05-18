const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSessions,
  createSession,
  bookSession,
  cancelBooking,
  getMemberBookings,
  getClassAttendees
} = require('../controllers/classes.controller');

// Protect all routes by default
router.use(protect);

// GymClass Definition Routes
router.get('/', getClasses);
router.post('/', authorize('owner', 'trainer', 'staff'), createClass);
router.put('/:id', authorize('owner', 'trainer', 'staff'), updateClass);
router.delete('/:id', authorize('owner', 'trainer', 'staff'), deleteClass);
router.get('/:id/attendees', getClassAttendees);

// Scheduled Sessions Routes
router.get('/sessions', getSessions);
router.post('/sessions', authorize('owner', 'trainer', 'staff'), createSession);

// Bookings and Waitlist Routes
router.get('/bookings', getMemberBookings);
router.post('/sessions/:sessionId/book', bookSession);
router.post('/bookings/:bookingId/cancel', cancelBooking);

module.exports = router;
