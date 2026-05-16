const { MembershipPlan, Membership } = require('../models/Membership');
const Member = require('../models/Member');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all membership plans for a gym
// @route   GET /api/v1/memberships/plans
// @access  Private
exports.getPlans = catchAsync(async (req, res) => {
  let plans = await MembershipPlan.find({ gymId: req.user.gymId, isActive: true });

  // ─── Auto-Seed Logic ──────────────────────────────────────────
  // If no plans exist, create default ones for a better UX
  if (plans.length === 0) {
    const defaults = [
      { gymId: req.user.gymId, name: 'Monthly',   price: 999,  duration: { value: 1,  unit: 'month' }, isActive: true, features: ['Gym Access', 'Locker Room'] },
      { gymId: req.user.gymId, name: 'Quarterly', price: 2499, duration: { value: 3,  unit: 'month' }, isActive: true, features: ['Gym Access', 'Locker Room', 'Trainer Check-in'] },
      { gymId: req.user.gymId, name: 'Annual',    price: 7999, duration: { value: 12, unit: 'month' }, isActive: true, features: ['Gym Access', 'Personal Trainer', 'Nutrition Plan'] },
    ];
    plans = await MembershipPlan.insertMany(defaults);
  }

  res.status(200).json(new ApiResponse(true, 'Plans retrieved', plans));
});

// @desc    Create a new membership plan
// @route   POST /api/v1/memberships/plans
// @access  Private (Owner/Trainer)
exports.createPlan = catchAsync(async (req, res) => {
  req.body.gymId = req.user.gymId;
  const plan = await MembershipPlan.create(req.body);
  res.status(201).json(new ApiResponse(true, 'Plan created', plan));
});

// @desc    Assign a membership plan to a member
// @route   POST /api/v1/memberships/assign
// @access  Private
exports.assignMembership = catchAsync(async (req, res) => {
  const { memberId, planId, startDate } = req.body;

  const plan = await MembershipPlan.findById(planId);
  if (!plan) return res.status(404).json(new ApiResponse(false, 'Plan not found'));

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

  // Update member's current membership status
  await Member.findByIdAndUpdate(memberId, {
    membershipStatus: 'active',
    currentMembershipId: membership._id,
    membershipExpiry: end
  });

  res.status(200).json(new ApiResponse(true, 'Membership assigned', membership));
});
