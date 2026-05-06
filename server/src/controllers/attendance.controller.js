const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');

// Helper: update streak on check-in
const updateStreak = async (member) => {
  const now = new Date();
  const lastCheckIn = member.streak?.lastCheckIn;
  const oneDayMs = 86400000;

  if (!lastCheckIn) {
    member.streak = { current: 1, longest: 1, lastCheckIn: now };
  } else {
    const diffMs = now - new Date(lastCheckIn);
    const diffDays = Math.floor(diffMs / oneDayMs);

    if (diffDays === 0) {
      // Already checked in today
      return false;
    } else if (diffDays === 1) {
      // Consecutive day
      member.streak.current = (member.streak.current || 0) + 1;
      member.streak.longest = Math.max(member.streak.longest || 0, member.streak.current);
      member.streak.lastCheckIn = now;
    } else {
      // Streak broken
      member.streak.current = 1;
      member.streak.lastCheckIn = now;
    }
  }
  member.totalPoints = (member.totalPoints || 0) + 5;
  await member.save();
  return true;
};

// @route   POST /api/v1/attendance/qr-scan
const qrCheckin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return errorResponse(res, 'QR token required', 400);

    const decoded = jwt.verify(token, process.env.QR_SECRET || process.env.JWT_SECRET);
    if (decoded.purpose !== 'checkin') return errorResponse(res, 'Invalid QR code', 400);

    const member = await Member.findById(decoded.memberId);
    if (!member) return errorResponse(res, 'Member not found', 404);
    if (member.gymId.toString() !== req.user.gymId.toString()) {
      return errorResponse(res, 'Member not from this gym', 403);
    }
    if (member.membershipStatus === 'expired') {
      return errorResponse(res, 'Membership expired. Please renew.', 403);
    }
    if (member.membershipStatus === 'suspended') {
      return errorResponse(res, 'Membership suspended. Contact staff.', 403);
    }

    const attendance = await Attendance.create({
      memberId: member._id, gymId: req.user.gymId,
      method: 'qr_scan', staffId: req.user._id
    });

    const isNewCheckin = await updateStreak(member);

    return successResponse(res, {
      member: { name: `${member.firstName} ${member.lastName}`, memberId: member.memberId, photo: member.photo },
      attendance,
      streak: member.streak,
      isNewDayCheckin: isNewCheckin
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') return errorResponse(res, 'QR code expired. Member must refresh.', 400);
    next(error);
  }
};

// @route   POST /api/v1/attendance/manual
const manualCheckin = async (req, res, next) => {
  try {
    const { memberId, notes } = req.body;
    const member = await Member.findOne({ _id: memberId, gymId: req.user.gymId });
    if (!member) return errorResponse(res, 'Member not found', 404);

    const attendance = await Attendance.create({
      memberId: member._id, gymId: req.user.gymId,
      method: 'manual', staffId: req.user._id, notes
    });
    await updateStreak(member);

    return successResponse(res, { attendance, member });
  } catch (error) { next(error); }
};

// @route   GET /api/v1/attendance
const getAttendance = async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 50 } = req.query;
    const query = { gymId: req.user.gymId };
    if (from || to) {
      query.checkedInAt = {};
      if (from) query.checkedInAt.$gte = new Date(from);
      if (to) query.checkedInAt.$lte = new Date(to);
    }
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('memberId', 'firstName lastName memberId photo membershipStatus')
      .sort({ checkedInAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, records, 200, { total, page: Number(page) });
  } catch (error) { next(error); }
};

// @route   GET /api/v1/attendance/today
const getTodayAttendance = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const records = await Attendance.find({
      gymId: req.user.gymId, checkedInAt: { $gte: startOfDay }
    })
      .populate('memberId', 'firstName lastName memberId photo streak')
      .sort({ checkedInAt: -1 });
    return successResponse(res, records);
  } catch (error) { next(error); }
};

module.exports = { qrCheckin, manualCheckin, getAttendance, getTodayAttendance };
