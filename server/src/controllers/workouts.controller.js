const Exercise = require('../models/Exercise');
const WorkoutProgram = require('../models/WorkoutProgram');
const WorkoutLog = require('../models/WorkoutLog');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const BadgeService = require('../services/badge.service');

// ─── EXERCISES ───────────────────────────────────────────────

// GET /api/v1/workouts/exercises
const getExercises = async (req, res, next) => {
  try {
    const { q, category, difficulty, isCustom } = req.query;
    const filter = {};

    // Get member or user profile to determine gym boundary
    const member = await Member.findOne({ userId: req.user._id });
    const gymId = member ? member.gymId : req.user.gymId;

    // Filter by Gym boundaries or public exercises
    if (gymId) {
      filter.$or = [
        { isCustom: false },
        { gymId: gymId }
      ];
    } else {
      // If no gym association, only show public exercises
      filter.isCustom = false;
    }

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isCustom !== undefined) filter.isCustom = isCustom === 'true';

    if (q && q.trim().length > 0) {
      filter.name = { $regex: q, $options: 'i' };
    }

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    return successResponse(res, exercises);
  } catch (error) {
    console.error('getExercises Error:', error);
    return successResponse(res, []); // Return empty array on error to prevent crash
  }
};

// POST /api/v1/workouts/exercises
const createExercise = async (req, res, next) => {
  try {
    const { name, category, primaryMuscle, secondaryMuscle, equipment, difficulty, instructions, tips, videoUrl, imageUrl } = req.body;
    if (!name) return errorResponse(res, 'Exercise name is required', 400);

    const gymId = req.user.gymId;
    if (!gymId) return errorResponse(res, 'Gym association not found for user', 400);

    const exercise = await Exercise.create({
      name,
      category,
      primaryMuscle: primaryMuscle || [],
      secondaryMuscle: secondaryMuscle || [],
      equipment: equipment || [],
      difficulty,
      instructions: instructions || [],
      tips: tips || [],
      videoUrl,
      imageUrl,
      isCustom: true,
      gymId
    });

    return successResponse(res, exercise, 201);
  } catch (error) {
    next(error);
  }
};

// ─── WORKOUT PROGRAMS ────────────────────────────────────────

// GET /api/v1/workouts/programs
const getWorkoutPrograms = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    const gymId = member ? member.gymId : req.user.gymId;
    const filter = {};

    if (gymId) {
      filter.gymId = gymId;
    }

    if (member) {
      // Members only see programs assigned to them or public ones
      filter.$or = [
        { assignedMembers: member._id },
        { isPublic: true }
      ];
    } else if (req.user.role === 'member') {
      // If user is a member but profile is missing (should not happen normally)
      return successResponse(res, []);
    } else {
      // Owners/Trainers see all programs for their gym
      // No additional filter needed beyond gymId
    }

    const programs = await WorkoutProgram.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, programs || []);
  } catch (error) {
    console.error('getWorkoutPrograms Error:', error);
    return successResponse(res, []); // Defensive fallback
  }
};

// POST /api/v1/workouts/programs
const createWorkoutProgram = async (req, res, next) => {
  try {
    let { name, description, goal, durationWeeks, daysPerWeek, weeks, exercises, difficulty, isPublic } = req.body;
    if (!name) return errorResponse(res, 'Program name is required', 400);

    const gymId = req.user.gymId;
    if (!gymId) return errorResponse(res, 'Gym association not found', 400);

    // If flat exercises are provided but no weeks, create a default structure
    if (exercises && Array.isArray(exercises) && (!weeks || weeks.length === 0)) {
      weeks = [{
        weekNumber: 1,
        days: [{
          dayNumber: 1,
          label: 'Full Body / Main Session',
          exercises: exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            sets: ex.sets || 3,
            reps: String(ex.reps || '12'),
            restSeconds: ex.restSeconds || 90,
            notes: ex.notes || ''
          }))
        }]
      }];
    }

    const program = await WorkoutProgram.create({
      gymId,
      createdBy: req.user._id,
      name,
      description,
      goal,
      difficulty: difficulty || 'intermediate',
      durationWeeks: durationWeeks || 4,
      daysPerWeek: daysPerWeek || 3,
      weeks: weeks || [],
      isPublic: isPublic || false
    });

    return successResponse(res, program, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/workouts/programs/:programId/assign
const assignWorkoutProgram = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { memberIds } = req.body; // Array of Member IDs

    if (!Array.isArray(memberIds)) {
      return errorResponse(res, 'memberIds must be an array', 400);
    }

    const program = await WorkoutProgram.findByIdAndUpdate(
      programId,
      { $addToSet: { assignedMembers: { $each: memberIds } } },
      { new: true }
    );

    if (!program) return errorResponse(res, 'Workout program not found', 404);

    return successResponse(res, program);
  } catch (error) {
    next(error);
  }
};

// ─── WORKOUT LOGGING ─────────────────────────────────────────

// POST /api/v1/workouts/logs
const createWorkoutLog = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const { programId, label, duration, notes, exercises, mood, caloriesBurned } = req.body;
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return errorResponse(res, 'At least one exercise is required in log', 400);
    }

    // 1. Pre-fetch all existing Personal Records for these exercises in ONE query
    const PersonalRecord = require('../models/PersonalRecord');
    const exerciseIds = exercises.map(ex => ex.exerciseId || ex.exercise).filter(Boolean);
    const existingPRs = await PersonalRecord.find({
      memberId: member._id,
      exerciseId: { $in: exerciseIds }
    });
    
    const prMap = {};
    existingPRs.forEach(pr => {
      prMap[pr.exerciseId.toString()] = pr.value;
    });

    let calculatedVolume = 0;
    const enrichedExercises = [];

    for (const loggedExercise of exercises) {
      const exerciseId = loggedExercise.exerciseId || loggedExercise.exercise;
      if (!exerciseId) continue;

      const setsWithPR = [];
      let setCounter = 1;
      let historicalMaxWeight = prMap[exerciseId.toString()] || 0;

      for (const set of loggedExercise.sets) {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        calculatedVolume += weight * reps;

        // Auto PR detection logic
        const isPR = weight > 0 && weight > historicalMaxWeight;
        if (isPR) {
          historicalMaxWeight = weight;
          
          await PersonalRecord.findOneAndUpdate(
            { memberId: member._id, exerciseId: exerciseId },
            { 
              value: weight, 
              reps, 
              exerciseName: loggedExercise.exerciseName,
              achievedAt: new Date() 
            },
            { upsert: true, new: true }
          );
        }

        setsWithPR.push({
          setNumber: set.setNumber || setCounter++,
          reps,
          weight,
          rpe: set.rpe,
          isWarmup: set.isWarmup || false,
          isPR,
          completedAt: new Date()
        });
      }

      enrichedExercises.push({
        exerciseId,
        exerciseName: loggedExercise.exerciseName,
        sets: setsWithPR
      });
    }

    const log = await WorkoutLog.create({
      memberId: member._id,
      gymId: member.gymId,
      programId,
      label: label || 'Free Workout',
      duration: duration || 60,
      notes,
      exercises: enrichedExercises,
      totalVolume: calculatedVolume,
      caloriesBurned: caloriesBurned || Math.round((duration || 60) * 7.5),
      mood: mood || 'okay'
    });

    // 4. Check for workout milestones (Gamification)
    const totalWorkouts = await WorkoutLog.countDocuments({ memberId: member._id });
    await BadgeService.checkAndAward(member._id, 'workout', totalWorkouts);

    return successResponse(res, log, 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/workouts/logs
const getWorkoutLogs = async (req, res, next) => {
  try {
    let memberId = req.query.memberId;

    if (!memberId) {
      const member = await Member.findOne({ userId: req.user._id });
      if (member) memberId = member._id;
    }

    if (!memberId) {
      return errorResponse(res, 'Member identification is required', 400);
    }

    const logs = await WorkoutLog.find({ memberId })
      .populate('exercises.exerciseId')
      .sort({ date: -1 });

    return successResponse(res, logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  createExercise,
  getWorkoutPrograms,
  createWorkoutProgram,
  assignWorkoutProgram,
  createWorkoutLog,
  getWorkoutLogs
};
