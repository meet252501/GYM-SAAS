const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getSettings, updateSettings } = require('../controllers/gym.controller');

router.use(protect);

router.get('/settings', authorize('owner', 'trainer'), getSettings);
router.put('/settings', authorize('owner'), updateSettings);

module.exports = router;
