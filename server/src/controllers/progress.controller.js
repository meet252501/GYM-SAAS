const Member = require('../models/Member');
const WorkoutLog = require('../models/WorkoutLog');
const Attendance = require('../models/Attendance');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get member progress overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    // 1. Streak & Total Workouts (directly from Member model)
    const { streak, totalWorkouts } = member;

    // 2. Monthly Sessions (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlySessionsCount = await Attendance.countDocuments({
      memberId: member._id,
      checkedInAt: { $gte: startOfMonth }
    });

    // 3. Workouts per week (Last 8 weeks)
    const workoutsPerWeek = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const count = await Attendance.countDocuments({
        memberId: member._id,
        checkedInAt: { $gte: start, $lte: end }
      });
      workoutsPerWeek.push(count);
    }

    return successResponse(res, {
      streak: streak.current,
      totalWorkouts,
      monthlySessions: `${monthlySessionsCount} sessions`,
      workoutsPerWeek,
      goal: 20 // Mock goal for now
    });
  } catch (error) { next(error); }
};

/**
 * Get weight history
 */
exports.getWeightLog = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    return successResponse(res, member.weightHistory || []);
  } catch (error) { next(error); }
};

/**
 * Get personal records
 */
exports.getPersonalRecords = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const logs = await WorkoutLog.find({
      memberId: member._id,
      'exercises.sets.isPR': true
    }).sort({ date: -1 });

    const prs = [];
    logs.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.isPR) {
            prs.push({
              exercise: ex.exerciseName,
              weight: `${set.weight} kg`,
              reps: `${set.reps} reps`,
              date: log.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              icon: '🏋️' 
            });
          }
        });
      });
    });

    // Deduplicate PRs (keep only the latest for each exercise)
    const uniquePRs = [];
    const seenExercises = new Set();
    prs.forEach(pr => {
      if (!seenExercises.has(pr.exercise)) {
        uniquePRs.push(pr);
        seenExercises.add(pr.exercise);
      }
    });

    return successResponse(res, uniquePRs);
  } catch (error) { next(error); }
};
