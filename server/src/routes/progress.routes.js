const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('member'));

router.get('/overview', progressController.getOverview);
router.get('/weight', progressController.getWeightLog);
router.get('/records', progressController.getPersonalRecords);

module.exports = router;
