const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const BadgeService = require('../services/badge.service');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');

// Replay protection cache (10 min expiry)
const jtiCache = new NodeCache({ stdTTL: 600 });

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

// @desc    Generate rotating QR token for Gym Display
// @route   GET /api/v1/attendance/qr-token
// @access  Private (Owner/Trainer)
const getRotatingToken = async (req, res, next) => {
  try {
    const code = uuidv4().substring(0, 6).toUpperCase();
    const token = jwt.sign(
      { 
        gymId: req.user.gymId, 
        purpose: 'gym_checkin',
        code,
        jti: uuidv4() 
      },
      process.env.QR_SECRET || process.env.JWT_SECRET,
      { expiresIn: '35s' }
    );

    // Cache code mapping to gymId for manual check-ins
    jtiCache.set(`code_${code}`, req.user.gymId, 40); // 40s expiry

    return successResponse(res, { token, code, expiresIn: 30 });
  } catch (error) { next(error); }
};

// @desc    Member scans Gym QR
// @route   POST /api/v1/attendance/checkin
// @access  Private (Member)
const memberCheckin = async (req, res, next) => {
  try {
    const { token, code } = req.body;
    if (!token && !code) return errorResponse(res, 'Token or Code required', 400);

    let gymId;
    if (token) {
      const decoded = jwt.verify(token, process.env.QR_SECRET || process.env.JWT_SECRET);
      if (decoded.purpose !== 'gym_checkin') return errorResponse(res, 'Invalid token purpose', 400);

      // Replay protection
      if (jtiCache.has(decoded.jti)) {
        logger.warn(`Replay attack detected: ${decoded.jti} from user ${req.user._id}`);
        return errorResponse(res, 'Token already used', 403);
      }
      jtiCache.set(decoded.jti, true);
      gymId = decoded.gymId;
    } else {
      // Validate short code
      const cachedGymId = jtiCache.get(`code_${code.toUpperCase()}`);
      if (!cachedGymId) return errorResponse(res, 'Invalid or expired manual code', 400);
      gymId = cachedGymId;
    }

    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    if (member.gymId.toString() !== gymId.toString()) {
      return errorResponse(res, 'Unauthorized gym check-in', 403);
    }

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: member.gymId,
      method: 'qr_scan_member',
    });

    const isNewDay = await updateStreak(member);

    logger.info(`Member check-in: ${member.fullName} at ${member.gymId}`);

    return successResponse(res, { 
      attendance, 
      isNewDay, 
      streak: member.streak 
    }, 201);
  } catch (error) {
    if (error.name === 'TokenExpiredError') return errorResponse(res, 'QR code expired', 400);
    next(error);
  }
};

// @desc    Staff scans Member QR
// @route   POST /api/v1/attendance/qr-scan
// @access  Private (Owner/Trainer)
const qrCheckin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return errorResponse(res, 'QR token required', 400);

    // For now, let's assume the member's QR token is their memberId signed by the server
    // or just their raw memberId if we want to keep it simple but less secure.
    // Given the task, we should make it secure.
    const decoded = jwt.verify(token, process.env.QR_SECRET || process.env.JWT_SECRET);
    
    // Replay protection
    if (decoded.jti && jtiCache.has(decoded.jti)) {
      return errorResponse(res, 'QR code already scanned', 403);
    }
    if (decoded.jti) jtiCache.set(decoded.jti, true);

    const member = await Member.findById(decoded.memberId || decoded.id);
    if (!member) return errorResponse(res, 'Member not found', 404);

    if (member.gymId.toString() !== req.user.gymId.toString()) {
      return errorResponse(res, 'Member not from this gym', 403);
    }

    if (member.membershipStatus === 'expired') {
      return errorResponse(res, 'Membership expired', 403);
    }

    const attendance = await Attendance.create({
      memberId: member._id,
      gymId: req.user.gymId,
      method: 'qr_scan_staff',
      staffId: req.user._id
    });

    const isNewDay = await updateStreak(member);

    logger.info(`Staff ${req.user._id} scanned member ${member._id}`);

    return successResponse(res, {
      attendance,
      member,
      isNewDay
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') return errorResponse(res, 'Member QR expired', 400);
    next(error);
  }
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

// @desc    Get member's own signed QR token (for staff to scan)
// @route   GET /api/v1/attendance/member-qr
// @access  Private (Member)
const getMemberSignedQR = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const token = jwt.sign(
      { 
        memberId: member._id,
        purpose: 'member_id',
        jti: uuidv4() 
      },
      process.env.QR_SECRET || process.env.JWT_SECRET,
      { expiresIn: '10m' } // Member's own QR lasts longer
    );

    return successResponse(res, { token, expiresIn: 600 });
  } catch (error) { next(error); }
};

module.exports = { 
  getRotatingToken, 
  memberCheckin, 
  qrCheckin, 
  manualCheckin, 
  getAttendance, 
  getTodayAttendance,
  getMemberSignedQR
};
