const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  getAIUsage, 
  trackAIUsage, 
  chatWithAI, 
  analyzeFood,
  suggestNextWorkout 
} = require('../controllers/ai.controller');

// All AI routes are protected
router.use(protect);

router.get('/usage', getAIUsage);
router.post('/track', trackAIUsage);
router.post('/chat', chatWithAI);
router.post('/analyze-food', analyzeFood);
router.get('/suggest-workout', suggestNextWorkout);

module.exports = router;
