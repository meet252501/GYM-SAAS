const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const BodyMetric = require('../models/BodyMetric');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get metrics history for a member
// @route   GET /api/v1/metrics/:memberId
router.get('/:memberId', protect, async (req, res) => {
  try {
    const metrics = await BodyMetric.find({ memberId: req.params.memberId })
      .sort({ recordedAt: -1 });
    return successResponse(res, metrics);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch metrics');
  }
});

// @desc    Add a new metrics snapshot
// @route   POST /api/v1/metrics
router.post('/', protect, async (req, res) => {
  try {
    const { memberId, weight, height, bodyFatPercent, chest, waist, hips, arms, thighs, notes } = req.body;
    
    const member = await Member.findById(memberId);
    if (!member) return errorResponse(res, 'Member not found', 404);

    const metric = await BodyMetric.create({
      memberId,
      gymId: member.gymId,
      weight, height, bodyFatPercent,
      chest, waist, hips, arms, thighs,
      notes,
      recordedAt: new Date()
    });

    // Update member's latest snapshot
    member.currentMetrics = {
      weight, height, bodyFatPercent,
      bmi: weight && height ? (weight / ((height/100) * (height/100))).toFixed(2) : undefined,
      updatedAt: new Date()
    };
    if (weight) member.weightHistory.push({ weight, date: new Date() });
    await member.save();

    return successResponse(res, metric, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to save metrics');
  }
});

module.exports = router;
