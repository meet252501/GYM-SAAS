const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const WorkoutLog = require('../models/WorkoutLog');
const { GymClass, ClassSession } = require('../models/GymClass');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route   GET /api/v1/analytics/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const gymId = req.user.gymId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalMembers, activeMembers, newThisMonth, expiringSoon,
      revenueThisMonth, revenueLastMonth, pendingPayments,
      todayAttendance, weekAttendance,
      todayClasses
    ] = await Promise.all([
      Member.countDocuments({ gymId, isActive: true }),
      Member.countDocuments({ gymId, membershipStatus: 'active', isActive: true }),
      Member.countDocuments({ gymId, createdAt: { $gte: startOfMonth }, isActive: true }),
      Member.countDocuments({
        gymId, membershipStatus: 'active',
        membershipExpiry: { $lte: new Date(Date.now() + 7 * 86400000), $gte: new Date() }
      }),
      Payment.aggregate([
        { $match: { gymId, status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { gymId, status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { gymId, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Attendance.countDocuments({ gymId, checkedInAt: { $gte: startOfDay } }),
      Attendance.countDocuments({ gymId, checkedInAt: { $gte: startOfWeek } }),
      ClassSession.countDocuments({ gymId, startsAt: { $gte: startOfDay }, status: 'scheduled' })
    ]);

    const mrr = revenueThisMonth[0]?.total || 0;
    const lastMrr = revenueLastMonth[0]?.total || 0;
    const revenueGrowth = lastMrr > 0 ? (((mrr - lastMrr) / lastMrr) * 100).toFixed(1) : 0;

    return successResponse(res, {
      members: { total: totalMembers, active: activeMembers, newThisMonth, expiringSoon },
      revenue: {
        thisMonth: mrr, lastMonth: lastMrr,
        growth: Number(revenueGrowth),
        pending: pendingPayments[0]?.total || 0
      },
      attendance: { today: todayAttendance, thisWeek: weekAttendance },
      classes: { scheduledToday: todayClasses }
    });
  } catch (error) { next(error); }
};

// @route   GET /api/v1/analytics/revenue
const getRevenueChart = async (req, res, next) => {
  try {
    const gymId = req.user.gymId;
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Payment.aggregate([
      { $match: { gymId, status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, data);
  } catch (error) { next(error); }
};

// @route   GET /api/v1/analytics/attendance
const getAttendanceChart = async (req, res, next) => {
  try {
    const gymId = req.user.gymId;
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Attendance.aggregate([
      { $match: { gymId, checkedInAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkedInAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, data);
  } catch (error) { next(error); }
};

module.exports = { getDashboard, getRevenueChart, getAttendanceChart };
