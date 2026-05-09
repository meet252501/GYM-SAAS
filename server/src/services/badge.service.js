const { Badge, MemberBadge } = require('../models/Badge');
const Member = require('../models/Member');
const Notification = require('../models/Notification');

/**
 * BadgeService - Handles gamification logic
 */
class BadgeService {
  /**
   * Check and award badges based on a trigger
   * @param {string} memberId 
   * @param {string} criteriaType - e.g. 'attendance', 'workout', 'social', 'milestone'
   * @param {number} currentValue 
   */
  static async checkAndAward(memberId, criteriaType, currentValue) {
    try {
      // 1. Fetch member to get their userId for notifications
      const member = await Member.findById(memberId);
      if (!member) return [];

      // 2. Find all badges of this type that the user doesn't have yet
      const earnedBadgeIds = await MemberBadge.find({ memberId }).distinct('badgeId');
      
      const potentialBadges = await Badge.find({
        category: criteriaType,
        criteriaThreshold: { $lte: currentValue },
        _id: { $nin: earnedBadgeIds }
      });

      if (potentialBadges.length === 0) return [];

      const newAwards = [];
      for (const badge of potentialBadges) {
        // Double check to prevent race conditions
        const existing = await MemberBadge.findOne({ memberId, badgeId: badge._id });
        if (existing) continue;

        await MemberBadge.create({
          memberId,
          badgeId: badge._id
        });

        // 3. Create notification for the User
        if (member.userId) {
          await Notification.create({
            recipientId: member.userId,
            gymId: member.gymId,
            title: 'New Badge Unlocked! 🏆',
            message: `Congratulations! You've earned the "${badge.name}" badge.`,
            type: 'badge_earned',
            data: { badgeId: badge._id, icon: badge.icon, points: badge.points }
          });
        }

        newAwards.push(badge);
      }

      return newAwards;
    } catch (error) {
      console.error('BadgeService Error:', error);
      return [];
    }
  }
}

module.exports = BadgeService;
