const { MembershipPlan, Membership } = require('../models/Membership');
const Member = require('../models/Member');
const catchAsync = require('../utils/catchAsync');
const { successResponse, errorResponse } = require('../utils/apiResponse'); // ← fixed: was wrongly 'new ApiResponse'

// @desc    Get all membership plans for a gym
// @route   GET /api/v1/memberships/plans
// @access  Private
exports.getPlans = catchAsync(async (req, res) => {
  const plans = await MembershipPlan.find({ gymId: req.user.gymId, isActive: true });
  return successResponse(res, plans);
});

// @desc    Create a new membership plan
// @route   POST /api/v1/memberships/plans
// @access  Private (Owner/Trainer)
exports.createPlan = catchAsync(async (req, res) => {
  req.body.gymId = req.user.gymId;
  const plan = await MembershipPlan.create(req.body);
  return res.status(201).json({ success: true, message: 'Plan created', data: plan });
});

// @desc    Assign a membership plan to a member
// @route   POST /api/v1/memberships/assign
// @access  Private
exports.assignMembership = catchAsync(async (req, res) => {
  const { memberId, planId, startDate } = req.body;

  const plan = await MembershipPlan.findById(planId);
  if (!plan) return errorResponse(res, 'Plan not found', 404);

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);

  if (plan.duration.unit === 'month') end.setMonth(end.getMonth() + plan.duration.value);
  else if (plan.duration.unit === 'day') end.setDate(end.getDate() + plan.duration.value);
  else if (plan.duration.unit === 'week') end.setDate(end.getDate() + (plan.duration.value * 7));
  else if (plan.duration.unit === 'year') end.setFullYear(end.getFullYear() + plan.duration.value);

  const membership = await Membership.create({
    memberId,
    gymId: req.user.gymId,
    planId,
    planName: plan.name,
    startDate: start,
    endDate: end,
    amount: plan.price,
    status: 'active'
  });

  await Member.findByIdAndUpdate(memberId, {
    membershipStatus: 'active',
    currentMembershipId: membership._id,
    membershipExpiry: end
  });

  return successResponse(res, membership);
});
// @desc    Delete a membership plan
// @route   DELETE /api/v1/memberships/plans/:id
// @access  Private (Owner/Trainer)
exports.deletePlan = catchAsync(async (req, res) => {
  const plan = await MembershipPlan.findOneAndDelete({ _id: req.params.id, gymId: req.user.gymId });
  if (!plan) return errorResponse(res, 'Plan not found', 404);
  return res.status(200).json({ success: true, message: 'Plan deleted' });
});
