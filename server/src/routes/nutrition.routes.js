const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getDayLog, addEntry, deleteEntry,
  updateGoal, searchFood, barcodeSearch, getWeeklyStats,
} = require('../controllers/nutrition.controller');

router.use(protect);

router.get('/search',             searchFood);
router.get('/weekly',             getWeeklyStats);
router.get('/barcode/:code',      barcodeSearch);
router.patch('/goal',             updateGoal);
router.get('/:date',              getDayLog);
router.post('/:date/entries',     addEntry);
router.delete('/:date/entries/:entryId', deleteEntry);

module.exports = router;
