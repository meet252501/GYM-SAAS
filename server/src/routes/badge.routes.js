const express = require('express');
const router = express.Router();
const { 
  getAllBadges, 
  getMemberBadges, 
  getBadgeNotifications, 
  markBadgeNotified 
} = require('../controllers/badge.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getAllBadges);
router.get('/member', authorize('member'), getMemberBadges);
router.get('/notifications', authorize('member'), getBadgeNotifications);
router.patch('/notifications/:id', authorize('member'), markBadgeNotified);

module.exports = router;
