const cron = require('node-cron');
const Member = require('../models/Member');
const User = require('../models/User');
const NotificationService = require('../services/notification.service');
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
        await NotificationService.send({
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
        await NotificationService.send({
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
        await NotificationService.send({
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
        await NotificationService.send({
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

const cronParser = require('cron-parser');
const { GymClass, ClassSession } = require('../models/GymClass');

/**
 * Automatically generate class sessions for the next 7 days based on recurring rules.
 */
const generateRecurringSessions = async () => {
  logger.info('📅 Starting recurring class session generation...');
  try {
    const classes = await GymClass.find({ 'schedule.type': 'recurring', isActive: true });
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    for (const cls of classes) {
      // Use cron format or simple day-of-week logic
      // Assuming cls.schedule.recurrence.days = [1, 3, 5] (Mon, Wed, Fri)
      // and cls.schedule.recurrence.time = "08:00"
      
      const [hour, minute] = cls.schedule.recurrence.time.split(':');
      const days = cls.schedule.recurrence.days.join(',');
      const expression = `${minute} ${hour} * * ${days}`;
      
      const interval = cronParser.parseExpression(expression, {
        currentDate: now,
        endDate: nextWeek,
        tz: 'UTC' // In a real app, use gym's timezone
      });

      while (interval.hasNext()) {
        const nextDate = interval.next().toDate();
        
        // Check if session already exists
        const exists = await ClassSession.findOne({ 
          classId: cls._id, 
          startsAt: nextDate 
        });

        if (!exists) {
          await ClassSession.create({
            classId: cls._id,
            gymId: cls.gymId,
            trainerId: cls.trainerId,
            startsAt: nextDate,
            endsAt: new Date(nextDate.getTime() + cls.duration * 60000),
            capacity: cls.capacity,
            status: 'scheduled'
          });
          logger.info(`Generated session for ${cls.name} on ${nextDate}`);
        }
      }
    }
    logger.info('✅ Recurring session generation complete.');
  } catch (error) {
    logger.error('❌ Error generating recurring sessions:', error);
  }
};

/**
 * Initialize all cron jobs for GymFlow Pro
 */
const initCronJobs = () => {
  // Expiration check: Daily 9 AM
  cron.schedule('0 9 * * *', () => runMembershipSweep());

  // Class generation: Every Sunday midnight
  cron.schedule('0 0 * * 0', () => generateRecurringSessions());

  // Leaderboard rewards: Weekly Monday 10 AM
  cron.schedule('0 10 * * 1', () => runLeaderboardDigest());

  logger.info('📅 Cron scheduler fully active: Expirations, Class Generation, and Rewards configured.');

  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      generateRecurringSessions();
      runMembershipSweep();
    }, 2000);
  }
};

/**
 * Weekly leaderboard highlight and rewards
 */
const runLeaderboardDigest = async () => {
  logger.info('🏆 Starting weekly leaderboard digest...');
  try {
    const gyms = await User.distinct('gymId');
    
    for (const gymId of gyms) {
      const topMembers = await Member.find({ gymId, isActive: true })
        .sort({ totalPoints: -1 })
        .limit(3);

      if (topMembers.length === 0) continue;

      // Notify the top 3
      const medals = ['🥇 Gold', '🥈 Silver', '🥉 Bronze'];
      for (let i = 0; i < topMembers.length; i++) {
        const member = topMembers[i];
        if (member.userId) {
          await NotificationService.send({
            recipientId: member.userId,
            gymId: gymId,
            type: 'leaderboard_reward',
            title: `Weekly Champion! ${medals[i]}`,
            message: `Amazing work! You finished in #${i+1} place this week. Keep crushing it!`,
            data: { rank: i+1 }
          });
        }
      }
      
      logger.info(`Weekly rewards sent for Gym: ${gymId}`);
    }
    logger.info('✅ Weekly leaderboard digest completed.');
  } catch (error) {
    logger.error('❌ Error during weekly leaderboard digest:', error);
  }
};

module.exports = {
  initCronJobs,
  runMembershipSweep,
  runLeaderboardDigest
};
