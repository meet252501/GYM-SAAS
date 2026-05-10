const User = require('../models/User');
const Member = require('../models/Member');
const Gym = require('../models/Gym');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const PLAN_LIMITS = {
  starter:    { memberLimit: 100, trainerLimit: 2 },
  pro:        { memberLimit: 500, trainerLimit: 10 },
  enterprise: { memberLimit: 99999, trainerLimit: 99999 },
};

// @desc    Get all trainers in this gym
// @route   GET /api/v1/team
// @access  Private (owner/trainer)
const getTeam = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.user.gymId);
    const trainers = await User.find({
      gymId: req.user.gymId,
      role: 'trainer',
    }).select('-passwordHash -refreshToken -inviteToken');

    // Attach pending invite status
    const team = trainers.map(t => ({
      ...t.toJSON(),
      isPending: t.isInvitePending,
    }));

    return successResponse(res, { team, gym });
  } catch (err) { next(err); }
};

// @desc    Invite a trainer (creates account + invite token)
// @route   POST /api/v1/team/invite
// @access  Private (owner only)
const inviteTrainer = async (req, res, next) => {
  try {
    const { email, firstName, lastName } = req.body;
    if (!email) return errorResponse(res, 'Email is required', 400);

    // Check trainer limit for this gym
    const gym = await Gym.findById(req.user.gymId);
    const limits = PLAN_LIMITS[gym.plan] || PLAN_LIMITS.starter;
    const trainerCount = await User.countDocuments({
      gymId: req.user.gymId,
      role: 'trainer',
      isActive: true,
    });

    if (trainerCount >= limits.trainerLimit) {
      return errorResponse(
        res,
        `Trainer limit reached (${limits.trainerLimit} on ${gym.plan} plan)`,
        403
      );
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return errorResponse(res, 'This email is already registered', 409);

    // Generate a secure invite token (raw = send in link, stored = hashed)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Create the trainer user (inactive until they accept invite)
    const trainer = await User.create({
      email: email.toLowerCase(),
      passwordHash: rawToken, // temp — they'll set their own password via invite link
      role: 'trainer',
      gymId: req.user.gymId,
      isActive: false,
      isInvitePending: true,
      inviteToken: hashedToken,
      inviteTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Create member profile stub for the trainer
    await Member.create({
      gymId: req.user.gymId,
      userId: trainer._id,
      firstName: firstName || 'New',
      lastName: lastName || 'Trainer',
      membershipStatus: 'active',
      isActive: true,
    });

    logger.info(`Trainer invite sent to ${email} for gym ${req.user.gymId}`);

    // In production: send email with invite link containing rawToken
    // For now: return the token so the owner can share it manually
    return successResponse(res, {
      message: `Invite created for ${email}`,
      inviteLink: `/accept-invite?token=${rawToken}`,
      trainer: trainer.toJSON(),
    }, 201);
  } catch (err) { next(err); }
};

// @desc    Accept trainer invite (set password, activate account)
// @route   POST /api/v1/team/accept-invite
// @access  Public
const acceptInvite = async (req, res, next) => {
  try {
    const { token, password, firstName, lastName } = req.body;
    if (!token || !password) return errorResponse(res, 'Token and password are required', 400);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const trainer = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiry: { $gt: new Date() },
      isInvitePending: true,
    });

    if (!trainer) return errorResponse(res, 'Invalid or expired invite link', 400);

    // Activate the account
    trainer.passwordHash = password; // pre-save hook will hash it
    trainer.isActive = true;
    trainer.isInvitePending = false;
    trainer.inviteToken = undefined;
    trainer.inviteTokenExpiry = undefined;
    await trainer.save();

    // Update member profile name if provided
    if (firstName || lastName) {
      await Member.findOneAndUpdate(
        { userId: trainer._id },
        { ...(firstName && { firstName }), ...(lastName && { lastName }) }
      );
    }

    return successResponse(res, { message: 'Invite accepted. You can now log in.' });
  } catch (err) { next(err); }
};

// @desc    Remove a trainer from the gym
// @route   DELETE /api/v1/team/:id
// @access  Private (owner only)
const removeTrainer = async (req, res, next) => {
  try {
    const trainer = await User.findOne({
      _id: req.params.id,
      gymId: req.user.gymId,
      role: 'trainer',
    });

    if (!trainer) return errorResponse(res, 'Trainer not found in your gym', 404);

    trainer.isActive = false;
    await trainer.save({ validateBeforeSave: false });

    logger.info(`Trainer ${trainer.email} deactivated from gym ${req.user.gymId}`);
    return successResponse(res, { message: 'Trainer removed successfully' });
  } catch (err) { next(err); }
};

// @desc    Resend invite link for a pending trainer
// @route   POST /api/v1/team/:id/resend
// @access  Private (owner only)
const resendInvite = async (req, res, next) => {
  try {
    const trainer = await User.findOne({
      _id: req.params.id,
      gymId: req.user.gymId,
      role: 'trainer',
      isInvitePending: true,
    });

    if (!trainer) return errorResponse(res, 'Pending trainer not found', 404);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    trainer.inviteToken = hashedToken;
    trainer.inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await trainer.save({ validateBeforeSave: false });

    return successResponse(res, {
      message: 'Invite link refreshed',
      inviteLink: `/accept-invite?token=${rawToken}`,
    });
  } catch (err) { next(err); }
};

module.exports = { getTeam, inviteTrainer, acceptInvite, removeTrainer, resendInvite };
