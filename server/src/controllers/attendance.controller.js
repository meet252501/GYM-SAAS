const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const BadgeService = require('../services/badge.service');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Replay protection cache (10 min expiry)
const jtiCache = new NodeCache({ stdTTL: 600 });

// Kiosk PIN Cache (30s expiry)
const kioskPinCache = new NodeCache({ stdTTL: 30 });

// Helper: update streak on check-in
const updateStreak = async (member) => {
  const now = new Date();
  const lastCheckIn = member.streak?.lastCheckIn;
  const oneDayMs = 86400000;

  let isNewDay = false;
  if (!lastCheckIn) {
    member.streak = { current: 1, longest: 1, lastCheckIn: now };
    isNewDay = true;
  } else {
    const diffMs = now - new Date(lastCheckIn);
    const diffDays = Math.floor(diffMs / oneDayMs);

    if (diffDays === 0) {
      // Already checked in today
      isNewDay = false;
    } else if (diffDays === 1) {
      // Consecutive day
      member.streak.current = (member.streak.current || 0) + 1;
      member.streak.longest = Math.max(member.streak.longest || 0, member.streak.current);
      member.streak.lastCheckIn = now;
      isNewDay = true;
    } else {
      // Streak broken
      member.streak.current = 1;
      member.streak.lastCheckIn = now;
      isNewDay = true;
    }
  }

  if (isNewDay) {
    member.totalPoints = (member.totalPoints || 0) + 5;
    await member.save();
    
    // Trigger Badge Check
    await BadgeService.checkAndAward(member._id, 'attendance', member.streak.current);
  }
  
  return isNewDay;
};


// @desc    Member checks in via Terminal PIN
// @route   POST /api/v1/attendance/pin-checkin
// @access  Private (Owner/Trainer/Staff)
const pinCheckin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) return errorResponse(res, 'PIN required', 400);

    const member = await Member.findOne({ 
      $or: [{ accessPin: pin }, { memberId: pin.toUpperCase() }],
      gymId: req.user.gymId,
      isActive: true
    }).populate('currentMembershipId');

    if (!member) return errorResponse(res, 'Member not found or invalid PIN', 404);

    // Verify membership status
    if (member.membershipStatus !== 'active') {
      return errorResponse(res, `Membership ${member.membershipStatus}`, 403);
    }

    // Record attendance
    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: member.gymId,
      method: 'pin_kiosk',
      status: 'present'
    });

    // Update streak
    await updateStreak(member);

    // Emit live update
    if (global.io) {
      global.io.to(member.gymId.toString()).emit('attendance_update', {
        type: 'check_in',
        member: { id: member._id, firstName: member.firstName, lastName: member.lastName, photo: member.photo },
        time: new Date()
      });
    }

    return successResponse(res, {
      attendance,
      member: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        photo: member.photo,
        streak: member.streak,
        memberId: member.memberId
      }
    }, 'Attendance recorded');
  } catch (error) { next(error); }
};



// @desc    Manual check-in by staff
// @route   POST /api/v1/attendance/manual
const manualCheckin = async (req, res, next) => {
  try {
    const { memberId, notes } = req.body;
    const member = await Member.findOne({ 
      $or: [{ _id: memberId }, { memberId: memberId }],
      gymId: req.user.gymId 
    });

    if (!member) return errorResponse(res, 'Member not found', 404);

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: req.user.gymId,
      method: 'manual',
      staffId: req.user._id,
      notes
    });

    const isNewDay = await updateStreak(member);

    return successResponse(res, { attendance, member, isNewDay });
  } catch (error) { next(error); }
};

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

const getTodayAttendance = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const records = await Attendance.find({
      gymId: req.user.gymId, 
      checkedInAt: { $gte: startOfDay }
    })
      .populate('memberId', 'firstName lastName memberId photo streak membershipPlan membershipExpiry')
      .sort({ checkedInAt: -1 });
    return successResponse(res, records);
  } catch (error) { next(error); }
};


const selfCheckin = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });

    if (!member) return errorResponse(res, 'Member profile not found', 404);
    if (member.membershipStatus !== 'active' && member.membershipStatus !== 'trial') {
      return errorResponse(res, `Membership ${member.membershipStatus}`, 403);
    }

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: member.gymId,
      method: 'qr_scan_member',
      status: 'present'
    });

    await updateStreak(member);

    return successResponse(res, { attendance, member }, 'Attendance marked successfully');
  } catch (error) { next(error); }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const { limit = 20 } = req.query;
    const records = await Attendance.find({ memberId: member._id })
      .sort({ checkedInAt: -1 })
      .limit(Number(limit));

    return successResponse(res, records);
  } catch (error) { next(error); }
};

const getKioskPin = async (req, res, next) => {
  try {
    const gymIdStr = req.user.gymId.toString();
    let currentPin = kioskPinCache.get(gymIdStr);
    if (!currentPin) {
      currentPin = crypto.randomInt(100000, 1000000).toString(); // 6 digit PIN
      kioskPinCache.set(gymIdStr, currentPin, 30);
    }
    return successResponse(res, { pin: currentPin });
  } catch (error) { next(error); }
};

const dynamicPinCheckin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) return errorResponse(res, 'PIN is required', 400);

    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const activePin = kioskPinCache.get(member.gymId.toString());
    
    if (!activePin || activePin !== pin.toString()) {
      return errorResponse(res, 'Invalid or expired Kiosk PIN. Please check the screen.', 400);
    }

    if (member.membershipStatus !== 'active' && member.membershipStatus !== 'trial') {
      return errorResponse(res, `Membership ${member.membershipStatus}`, 403);
    }

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: member.gymId,
      method: 'dynamic_pin',
      status: 'present'
    });

    await updateStreak(member);

    return successResponse(res, { attendance, member }, 'Attendance marked successfully');
  } catch (error) { next(error); }
};

const exportAttendance = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = { gymId: req.user.gymId };
    
    if (from || to) {
      query.checkedInAt = {};
      if (from) query.checkedInAt.$gte = new Date(from);
      if (to) query.checkedInAt.$lte = new Date(to);
    }

    const records = await Attendance.find(query)
      .populate('memberId', 'firstName lastName memberId')
      .sort({ checkedInAt: -1 });

    let csv = 'Date,Time,Member ID,Name,Method,Status\n';
    records.forEach(r => {
      const date = r.checkedInAt.toISOString().split('T')[0];
      const time = r.checkedInAt.toTimeString().split(' ')[0];
      const memberId = r.memberId?.memberId || 'N/A';
      const name = r.memberId ? `${r.memberId.firstName} ${r.memberId.lastName}` : 'Deleted Member';
      csv += `${date},${time},${memberId},"${name}",${r.method},${r.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-export-${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csv);
  } catch (error) { next(error); }
};

module.exports = { 
  pinCheckin,
  manualCheckin, 
  getAttendance, 
  getTodayAttendance,
  selfCheckin,
  getMyAttendance,
  getKioskPin,
  dynamicPinCheckin,
  exportAttendance
};
