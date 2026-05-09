const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getExercises,
  createExercise,
  getWorkoutPrograms,
  createWorkoutProgram,
  assignWorkoutProgram,
  createWorkoutLog,
  getWorkoutLogs
} = require('../controllers/workouts.controller');

// All routes are protected by default
router.use(protect);

// Exercises Routes
router.get('/exercises', getExercises);
router.post('/exercises', authorize('owner', 'trainer', 'staff'), createExercise);

// Workout Programs Routes
router.get('/programs', getWorkoutPrograms);
router.post('/programs', authorize('owner', 'trainer', 'staff'), createWorkoutProgram);
router.post('/programs/:programId/assign', authorize('owner', 'trainer', 'staff'), assignWorkoutProgram);

// Workout Logs Routes
router.get('/logs', getWorkoutLogs);
router.post('/logs', createWorkoutLog);

module.exports = router;
