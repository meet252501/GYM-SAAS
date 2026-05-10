const Member = require('../models/Member');
const Gym = require('../models/Gym');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware — enforces per-gym member limits based on their SaaS plan.
 * Must run AFTER auth middleware (req.user must exist).
 */
const enforceMemberLimit = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.user.gymId);
    if (!gym) return errorResponse(res, 'Gym not found', 404);

    const count = await Member.countDocuments({ gymId: gym._id, isActive: true });

    if (count >= gym.memberLimit) {
      return res.status(403).json({
        success: false,
        message: `Member limit reached (${gym.memberLimit} on ${gym.plan} plan). You cannot add more members.`,
        code: 'MEMBER_LIMIT_REACHED',
        current: count,
        limit: gym.memberLimit,
        plan: gym.plan,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { enforceMemberLimit };
