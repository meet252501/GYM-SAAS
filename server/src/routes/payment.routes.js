const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getPayments,
  recordPayment,
  getPaymentStats
} = require('../controllers/payment.controller');

router.use(protect);
router.use(authorize('owner', 'trainer'));

router.get('/', getPayments);
router.post('/record', recordPayment);
router.get('/stats', getPaymentStats);

module.exports = router;
