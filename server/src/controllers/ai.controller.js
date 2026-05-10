const Member = require('../models/Member');
const { Membership } = require('../models/Membership');
const { PLAN_LIMITS, DEFAULT_LIMIT } = require('../config/ai.config');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get current AI usage and limit for the logged-in member
 */
exports.getAIUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    let member = await Member.findOne({ userId }).populate('currentMembershipId');
    if (!member) {
      // If admin/trainer is calling this, they might not have a member record
      if (['owner', 'trainer'].includes(req.user.role)) {
        return successResponse(res, {
          dailyCount: 0,
          limit: PLAN_LIMITS['admin'],
          remaining: Infinity,
          resetDate: today
        });
      }
      return errorResponse(res, 'Member profile not found', 404);
    }

    // Reset daily count if it's a new day
    if (member.aiUsage.lastUsedDate !== today) {
      member.aiUsage.dailyCount = 0;
      member.aiUsage.lastUsedDate = today;
      await member.save();
    }

    // Determine limit based on membership plan
    let planName = 'Trial';
    if (member.currentMembershipId && member.currentMembershipId.planName) {
      planName = member.currentMembershipId.planName;
    } else if (req.user.role === 'member' && member.membershipStatus === 'trial') {
      planName = 'Trial';
    }

    const limit = PLAN_LIMITS[planName] || DEFAULT_LIMIT;
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - member.aiUsage.dailyCount);

    return successResponse(res, {
      dailyCount: member.aiUsage.dailyCount,
      limit: limit,
      remaining: remaining,
      resetDate: member.aiUsage.lastUsedDate,
      planName
    });
  } catch (error) {
    console.error('Error getting AI usage:', error);
    return errorResponse(res, 'Failed to fetch AI usage stats');
  }
};

/**
 * Increment AI usage count
 */
exports.trackAIUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // Admins and trainers have unlimited usage, no need to track
    if (['owner', 'trainer'].includes(req.user.role)) {
      return successResponse(res, { success: true, message: 'Unlimited usage for admin/trainer' });
    }

    let member = await Member.findOne({ userId }).populate('currentMembershipId');
    if (!member) {
      return errorResponse(res, 'Member profile not found', 404);
    }

    // Reset daily count if it's a new day
    if (member.aiUsage.lastUsedDate !== today) {
      member.aiUsage.dailyCount = 0;
      member.aiUsage.lastUsedDate = today;
    }

    // Determine limit
    let planName = 'Trial';
    if (member.currentMembershipId && member.currentMembershipId.planName) {
      planName = member.currentMembershipId.planName;
    }

    const limit = PLAN_LIMITS[planName] || DEFAULT_LIMIT;

    // Check if limit exceeded
    if (limit !== Infinity && member.aiUsage.dailyCount >= limit) {
      return errorResponse(res, `Daily AI limit reached for ${planName} plan.`, 403);
    }

    // Increment
    member.aiUsage.dailyCount += 1;
    await member.save();

    return successResponse(res, {
      dailyCount: member.aiUsage.dailyCount,
      limit: limit,
      remaining: limit === Infinity ? Infinity : limit - member.aiUsage.dailyCount
    });
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    return errorResponse(res, 'Failed to update AI usage stats');
  }
};
