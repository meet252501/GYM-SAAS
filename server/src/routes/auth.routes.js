const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe, updateMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', require('../controllers/auth.controller').forgotPassword);
router.post('/reset-password', require('../controllers/auth.controller').resetPassword);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
