const { Badge, MemberBadge } = require('../models/Badge');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get all available badges
// @route   GET /api/v1/badges
// @access  Private
const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ points: 1 });
    return successResponse(res, badges);
  } catch (error) {
    next(error);
  }
};

// @desc    Get member earned badges
// @route   GET /api/v1/badges/member
// @access  Private (Member)
const getMemberBadges = async (req, res, next) => {
  try {
    const memberId = req.user.memberId;
    const earnedBadges = await MemberBadge.find({ memberId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });
    
    return successResponse(res, earnedBadges);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread badge notifications
// @route   GET /api/v1/badges/notifications
// @access  Private (Member)
const getBadgeNotifications = async (req, res, next) => {
  try {
    const memberId = req.user.memberId;
    const notifications = await MemberBadge.find({ memberId, notified: false })
      .populate('badgeId');
    
    return successResponse(res, notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark badge notification as read
// @route   PATCH /api/v1/badges/notifications/:id
// @access  Private (Member)
const markBadgeNotified = async (req, res, next) => {
  try {
    const memberId = req.user.memberId;
    const badge = await MemberBadge.findOneAndUpdate(
      { _id: req.params.id, memberId },
      { notified: true },
      { new: true }
    );
    
    return successResponse(res, badge);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBadges,
  getMemberBadges,
  getBadgeNotifications,
  markBadgeNotified
};
