const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getPayments,
  recordPayment,
  getPaymentStats,
  downloadInvoice,
  createStripeCheckout
} = require('../controllers/payment.controller');

router.use(protect);

router.get('/', authorize('owner', 'trainer'), getPayments);
router.post('/record', authorize('owner', 'trainer'), recordPayment);
router.get('/stats', authorize('owner', 'trainer'), getPaymentStats);
router.post('/stripe/checkout', createStripeCheckout);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
