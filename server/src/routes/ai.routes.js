const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getAIUsage, trackAIUsage } = require('../controllers/ai.controller');

// All AI routes are protected
router.use(protect);

router.get('/usage', getAIUsage);
router.post('/track', trackAIUsage);

module.exports = router;
