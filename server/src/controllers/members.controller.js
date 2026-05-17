const Member = require('../models/Member');
const User = require('../models/User');
const Gym = require('../models/Gym');
const { Membership, MembershipPlan } = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// ── Helpers ────────────────────────────────────────────────────
const generateTempPassword = () => {
  // e.g. Gym@4f2a — easy to type, meets most password rules
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const rand  = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `Gym@${rand}`;
};

const generateAccessPin = () =>
  String(Math.floor(100000 + Math.random() * 900000)); // 6-digit PIN

// @route   GET /api/v1/members
const getMembers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
    const gym = await Gym.findById(req.user.gymId);
    
    // Exclude the owner from the members list
    const query = { gymId: req.user.gymId, isActive: true, userId: { $ne: gym.ownerId } };

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
    const { firstName, lastName, email, phone, dateOfBirth, gender, goal, fitnessLevel, planId } = req.body;

    // ── Auto-generate credentials (admin-only account creation) ──
    let userId, tempPassword, accessPin;

    if (email) {
      const existing = await User.findOne({ email });
      if (existing) return errorResponse(res, 'Email already registered', 409);

      tempPassword = generateTempPassword();   // e.g. Gym@4f2a
      accessPin    = generateAccessPin();      // 6-digit PIN for kiosk

      const user = await User.create({
        email,
        passwordHash: tempPassword,
        role: 'member',
        gymId: req.user.gymId
      });
      userId = user._id;
    }

    const member = await Member.create({
      gymId: req.user.gymId,
      userId,
      firstName, lastName, phone, dateOfBirth, gender,
      goal:         goal         || 'general_fitness',
      fitnessLevel: fitnessLevel || 'beginner',
      accessPin,
      photo: req.file ? req.file.path : undefined
    });

    // ── Assign membership plan ────────────────────────────────────
    if (planId) {
      const plan = await MembershipPlan.findById(planId);
      if (plan) {
        const startDate = new Date();
        const endDate   = new Date();
        if      (plan.duration.unit === 'month') endDate.setMonth(endDate.getMonth() + plan.duration.value);
        else if (plan.duration.unit === 'year')  endDate.setFullYear(endDate.getFullYear() + plan.duration.value);
        else if (plan.duration.unit === 'day')   endDate.setDate(endDate.getDate() + plan.duration.value);

        const membership = await Membership.create({
          memberId: member._id, gymId: req.user.gymId,
          planId, planName: plan.name, startDate, endDate, status: 'active', amount: plan.price
        });

        await Payment.create({
          gymId:        req.user.gymId,
          memberId:     member._id,
          memberName:   `${member.firstName} ${member.lastName}`,
          amount:       plan.price,
          type:         'membership',
          status:       'completed',
          gateway:      'cash',
          membershipId: membership._id,
          paidAt:       new Date(),
          notes:        `Enrolled in ${plan.name} by ${req.user.role}`
        });

        member.currentMembershipId = membership._id;
        member.membershipStatus    = 'active';
        member.membershipExpiry    = endDate;
        await member.save();
      }
    }

    // ── Send welcome email with credentials ──────────────────────
    if (email && tempPassword) {
      try {
        await emailService.sendMemberWelcomeEmail({
          firstName,
          email,
          tempPassword,
          accessPin,
          appUrl: process.env.CLIENT_URL || 'https://gymflow-lilac-seven.vercel.app'
        });
      } catch (emailErr) {
        // Non-fatal — member is created, email failure is logged
        console.error('Welcome email failed:', emailErr.message);
      }
    }

    return successResponse(res, {
      ...member.toObject(),
      // Return plaintext credentials ONCE so admin can share them
      _credentials: email ? { email, tempPassword, accessPin } : undefined
    }, 201);
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
    
    if (req.file) {
      updates.photo = req.file.path;
    }

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
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return errorResponse(res, 'Member not found', 404);
    
    // Perform a HARD DELETE of all associated records
    await Member.deleteOne({ _id: member._id });
    if (member.userId) {
      await User.deleteOne({ _id: member.userId });
    }
    
    // Cleanup related collections
    const { Membership } = require('../models/Membership');
    const Payment = require('../models/Payment');
    const Attendance = require('../models/Attendance');
    
    await Membership.deleteMany({ memberId: member._id });
    await Payment.deleteMany({ memberId: member._id });
    await Attendance.deleteMany({ memberId: member._id });
    
    return successResponse(res, { message: 'Member and all associated data permanently deleted' });
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

// @route   GET /api/v1/members/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const members = await Member.find({ gymId: req.user.gymId, isActive: true })
      .sort({ totalPoints: -1, 'streak.current': -1 })
      .limit(100)
      .select('firstName lastName memberId totalPoints streak membershipStatus');

    // Add rank and dummy change for UI (in a real app, you'd store previous rank)
    const leaderboard = members.map((m, index) => ({
      id: m._id,
      name: `${m.firstName} ${m.lastName}`,
      points: m.totalPoints || 0,
      streak: m.streak?.current || 0,
      rank: index + 1,
      tier: (m.totalPoints || 0) > 1000 ? 'Legendary' : (m.totalPoints || 0) > 500 ? 'Epic' : (m.totalPoints || 0) > 200 ? 'Rare' : 'Common',
      change: 0
    }));

    return successResponse(res, leaderboard);
  } catch (error) { next(error); }
};

// @route   PATCH /api/v1/members/:id/protocol
const assignProtocol = async (req, res, next) => {
  try {
    const { source, programId } = req.body;
    if (!['ai', 'coach', 'custom'].includes(source)) {
      return errorResponse(res, 'Invalid protocol source', 400);
    }

    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { 
        assignedProtocol: { 
          source, 
          programId: programId || null, 
          lastUpdated: new Date() 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!member) return errorResponse(res, 'Member not found', 404);
    return successResponse(res, member, 200, { message: `Protocol updated to ${source}` });
  } catch (error) { next(error); }
};

module.exports = { getMembers, createMember, getMember, updateMember, deleteMember, getMemberQR, getExpiringSoon, getMemberStats, getLeaderboard, assignProtocol };
