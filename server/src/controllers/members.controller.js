const Member = require('../models/Member');
const User = require('../models/User');
const { Membership, MembershipPlan } = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');

// @route   GET /api/v1/members
const getMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, sortBy = 'joinedAt', order = 'desc' } = req.query;
    const query = { gymId: req.user.gymId, isActive: true };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.membershipStatus = status;

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('currentMembershipId', 'startDate endDate planName status');

    return successResponse(res, members, 200, {
      total, page: Number(page), limit: Number(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) { next(error); }
};

// @route   POST /api/v1/members
const createMember = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth, gender, goal, fitnessLevel, planId } = req.body;

    // Create user account if email + password provided
    let userId;
    if (email && password) {
      const existing = await User.findOne({ email });
      if (existing) return errorResponse(res, 'Email already registered', 409);
      const user = await User.create({
        email, passwordHash: password, role: 'member', gymId: req.user.gymId
      });
      userId = user._id;
    }

    const member = await Member.create({
      gymId: req.user.gymId,
      userId,
      firstName, lastName, phone, dateOfBirth, gender,
      goal: goal || 'general_fitness',
      fitnessLevel: fitnessLevel || 'beginner'
    });

    // Assign membership if plan provided
    if (planId) {
      const plan = await MembershipPlan.findById(planId);
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        if (plan.duration.unit === 'month') endDate.setMonth(endDate.getMonth() + plan.duration.value);
        else if (plan.duration.unit === 'year') endDate.setFullYear(endDate.getFullYear() + plan.duration.value);
        else if (plan.duration.unit === 'day') endDate.setDate(endDate.getDate() + plan.duration.value);

        const membership = await Membership.create({
          memberId: member._id, gymId: req.user.gymId,
          planId, planName: plan.name, startDate, endDate, status: 'active', amount: plan.price
        });
        member.currentMembershipId = membership._id;
        member.membershipStatus = 'active';
        member.membershipExpiry = endDate;
        await member.save();
      }
    }

    return successResponse(res, member, 201);
  } catch (error) { next(error); }
};

// @route   GET /api/v1/members/:id
const getMember = async (req, res, next) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId })
      .populate('currentMembershipId');
    if (!member) return errorResponse(res, 'Member not found', 404);
    return successResponse(res, member);
  } catch (error) { next(error); }
};

// @route   PATCH /api/v1/members/:id
const updateMember = async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'goal', 'fitnessLevel', 'photo', 'emergencyContact', 'currentMetrics'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      updates, { new: true, runValidators: true }
    );
    if (!member) return errorResponse(res, 'Member not found', 404);
    return successResponse(res, member);
  } catch (error) { next(error); }
};

// @route   DELETE /api/v1/members/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { isActive: false }, { new: true }
    );
    if (!member) return errorResponse(res, 'Member not found', 404);
    return successResponse(res, { message: 'Member deactivated' });
  } catch (error) { next(error); }
};

// @route   GET /api/v1/members/:id/qr
const getMemberQR = async (req, res, next) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return errorResponse(res, 'Member not found', 404);
    const token = jwt.sign(
      { memberId: member._id, gymId: member.gymId, purpose: 'checkin' },
      process.env.QR_SECRET || process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    return successResponse(res, { token, memberId: member.memberId, memberName: `${member.firstName} ${member.lastName}` });
  } catch (error) { next(error); }
};

// @route   GET /api/v1/members/expiring-soon
const getExpiringSoon = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const members = await Member.find({
      gymId: req.user.gymId,
      membershipStatus: 'active',
      membershipExpiry: { $lte: targetDate, $gte: new Date() }
    });
    return successResponse(res, members);
  } catch (error) { next(error); }
};

// @route   GET /api/v1/members/stats
const getMemberStats = async (req, res, next) => {
  try {
    const gymId = req.user.gymId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, trial, newThisMonth, expiringSoon] = await Promise.all([
      Member.countDocuments({ gymId, isActive: true }),
      Member.countDocuments({ gymId, membershipStatus: 'active', isActive: true }),
      Member.countDocuments({ gymId, membershipStatus: 'trial', isActive: true }),
      Member.countDocuments({ gymId, createdAt: { $gte: startOfMonth }, isActive: true }),
      Member.countDocuments({
        gymId, membershipStatus: 'active',
        membershipExpiry: { $lte: new Date(Date.now() + 7 * 86400000), $gte: now }
      })
    ]);

    return successResponse(res, { total, active, trial, newThisMonth, expiringSoon });
  } catch (error) { next(error); }
};

module.exports = { getMembers, createMember, getMember, updateMember, deleteMember, getMemberQR, getExpiringSoon, getMemberStats };
