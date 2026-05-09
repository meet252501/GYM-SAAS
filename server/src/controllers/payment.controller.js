const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// @desc    Get all payments for a gym
// @route   GET /api/v1/payments
// @access  Private (Owner/Trainer)
const getPayments = async (req, res, next) => {
  try {
    const { from, to, status, memberId, page = 1, limit = 50 } = req.query;
    const query = { gymId: req.user.gymId };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('memberId', 'firstName lastName memberId photo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, payments, 200, { total, page: Number(page) });
  } catch (error) { next(error); }
};

// @desc    Record a manual cash/other payment
// @route   POST /api/v1/payments/record
// @access  Private (Owner/Trainer)
const recordPayment = async (req, res, next) => {
  try {
    const { memberId, amount, type, gateway, notes, paidAt } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return errorResponse(res, 'Member not found', 404);

    const payment = await Payment.create({
      gymId: req.user.gymId,
      memberId: member._id,
      memberName: `${member.firstName} ${member.lastName}`,
      amount,
      type: type || 'membership',
      status: 'completed',
      gateway: gateway || 'cash',
      notes,
      paidAt: paidAt || new Date()
    });

    logger.info(`Payment recorded: ${amount} for ${member.firstName} by staff ${req.user._id}`);

    return successResponse(res, payment, 201);
  } catch (error) { next(error); }
};

// @desc    Get payment stats/revenue for charts
// @route   GET /api/v1/payments/stats
// @access  Private (Owner/Trainer)
const getPaymentStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const stats = await Payment.aggregate([
      { 
        $match: { 
          gymId: req.user.gymId, 
          status: 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, stats);
  } catch (error) { next(error); }
};

module.exports = {
  getPayments,
  recordPayment,
  getPaymentStats
};
