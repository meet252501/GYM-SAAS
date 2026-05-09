const cron = require('node-cron');
const Member = require('../models/Member');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Perform membership expiration checks and trigger notifications/status updates.
 */
const runMembershipSweep = async () => {
  logger.info('⏰ Starting daily membership expiration sweep...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get dates for 7 days left, 1 day left, and yesterday
    const date7Days = new Date(today);
    date7Days.setDate(today.getDate() + 7);
    const date1Day = new Date(today);
    date1Day.setDate(today.getDate() + 1);
    
    const startOf7Days = new Date(date7Days);
    const endOf7Days = new Date(date7Days);
    endOf7Days.setHours(23, 59, 59, 999);

    const startOf1Day = new Date(date1Day);
    const endOf1Day = new Date(date1Day);
    endOf1Day.setHours(23, 59, 59, 999);

    // ─── Query 1: Members with 7 days left ───────────────────
    const members7Days = await Member.find({
      membershipExpiry: { $gte: startOf7Days, $lte: endOf7Days },
      membershipStatus: { $in: ['active', 'trial'] }
    });

    for (const member of members7Days) {
      if (member.userId) {
        await Notification.create({
          recipientId: member.userId,
          gymId: member.gymId,
          type: 'membership_expiry',
          title: 'Membership expiring soon ⏳',
          message: `Your membership expires in 7 days (on ${new Date(member.membershipExpiry).toDateString()}). Renew now to stay active!`,
          data: { daysLeft: 7 }
        });
        logger.info(`Notification sent to ${member.firstName} for 7 days expiry left.`);
      }
    }

    // ─── Query 2: Members with 1 day left ────────────────────
    const members1Day = await Member.find({
      membershipExpiry: { $gte: startOf1Day, $lte: endOf1Day },
      membershipStatus: { $in: ['active', 'trial'] }
    });

    for (const member of members1Day) {
      if (member.userId) {
        await Notification.create({
          recipientId: member.userId,
          gymId: member.gymId,
          type: 'membership_expiry',
          title: 'Last Day Alert! 🚨',
          message: 'Your membership expires tomorrow! Renew today to prevent any disruption to your gym access.',
          data: { daysLeft: 1 }
        });
        logger.info(`Notification sent to ${member.firstName} for 1 day expiry left.`);
      }
    }

    // ─── Query 3: Expired yesterday ──────────────────────────
    const yesterdayEnd = new Date(today);
    yesterdayEnd.setMilliseconds(-1); // Anything before today is expired

    const expiredMembers = await Member.find({
      membershipExpiry: { $lt: today },
      membershipStatus: { $in: ['active', 'trial'] }
    });

    for (const member of expiredMembers) {
      member.membershipStatus = 'expired';
      await member.save();

      // Notify the member
      if (member.userId) {
        await Notification.create({
          recipientId: member.userId,
          gymId: member.gymId,
          type: 'membership_expiry',
          title: 'Membership Expired ❌',
          message: 'Your membership has officially expired. Please renew your plan or contact the front desk to re-activate.',
          data: { expired: true }
        });
      }

      // Notify owner(s) or staff at the gym
      const owners = await User.find({ gymId: member.gymId, role: { $in: ['owner', 'staff'] } });
      for (const owner of owners) {
        await Notification.create({
          recipientId: owner._id,
          gymId: member.gymId,
          type: 'membership_expiry',
          title: 'Member Membership Expired',
          message: `Membership for ${member.firstName} ${member.lastName} (${member.memberId}) has expired.`,
          data: { memberId: member._id }
        });
      }
      logger.info(`Marked member ${member.firstName} ${member.lastName} (${member.memberId}) as expired.`);
    }

    logger.info(`✅ Daily membership sweep completed. Processes completed: 7d: ${members7Days.length}, 1d: ${members1Day.length}, expired: ${expiredMembers.length}.`);
  } catch (error) {
    logger.error('❌ Error during daily membership sweep:', error);
  }
};

/**
 * Initialize all cron jobs for GymFlow Pro
 */
const initCronJobs = () => {
  // Runs daily at 9:00 AM (0 9 * * *)
  cron.schedule('0 9 * * *', () => {
    runMembershipSweep();
  });

  logger.info('📅 Cron scheduler initialized: Expiration alerts configured for daily 9:00 AM sweep.');

  // Run once on server boot in development environment to make sure database updates are instantly verified
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      logger.info('🔄 Running initial boot sweep in development...');
      runMembershipSweep();
    }, 5000);
  }
};

module.exports = {
  initCronJobs,
  runMembershipSweep
};
