const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Badge } = require('../models/Badge');
const Exercise = require('../models/Exercise');
const { MembershipPlan } = require('../models/Membership');
const Gym = require('../models/Gym');
const User = require('../models/User');
const Member = require('../models/Member');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ DB connected for seeding');
};

// ─── BADGES ──────────────────────────────────────────────────
const badges = [
  { name: 'First Step', description: 'Completed your first workout', icon: '👟', category: 'milestone', criteriaType: 'workouts_completed', criteriaThreshold: 1, points: 10, rarity: 'common' },
  { name: 'Iron Will', description: '7-day check-in streak', icon: '🔩', category: 'attendance', criteriaType: 'streak_days', criteriaThreshold: 7, points: 25, rarity: 'common' },
  { name: 'Unstoppable', description: '30-day check-in streak', icon: '🔥', category: 'attendance', criteriaType: 'streak_days', criteriaThreshold: 30, points: 100, rarity: 'rare' },
  { name: 'Legend', description: '100-day streak', icon: '👑', category: 'attendance', criteriaType: 'streak_days', criteriaThreshold: 100, points: 500, rarity: 'legendary' },
  { name: 'PR Machine', description: 'Set 10 personal records', icon: '🏆', category: 'workout', criteriaType: 'prs_set', criteriaThreshold: 10, points: 50, rarity: 'rare' },
  { name: 'Century Club', description: '100 workouts logged', icon: '💯', category: 'milestone', criteriaType: 'workouts_completed', criteriaThreshold: 100, points: 200, rarity: 'epic' },
  { name: 'Early Bird', description: 'Check in before 7 AM, 5 times', icon: '🌅', category: 'attendance', criteriaType: 'early_checkins', criteriaThreshold: 5, points: 30, rarity: 'rare' },
  { name: 'Class Act', description: 'Attend 10 classes', icon: '🎓', category: 'milestone', criteriaType: 'classes_attended', criteriaThreshold: 10, points: 40, rarity: 'common' },
  { name: 'Comeback Kid', description: 'Return after a 14+ day gap', icon: '🔄', category: 'milestone', criteriaType: 'comeback', criteriaThreshold: 1, points: 20, rarity: 'common' },
  { name: 'Volume King', description: 'Lift 100,000 kg total', icon: '📊', category: 'workout', criteriaType: 'total_volume', criteriaThreshold: 100000, points: 150, rarity: 'epic' },
  { name: 'Founding Member', description: 'Joined in the first 30 days', icon: '🏅', category: 'milestone', criteriaType: 'founding_member', criteriaThreshold: 1, points: 100, rarity: 'legendary' },
  { name: 'Goal Crusher', description: 'Achieved your fitness goal', icon: '🎯', category: 'milestone', criteriaType: 'goal_achieved', criteriaThreshold: 1, points: 200, rarity: 'epic' }
];

// ─── EXERCISES (sample) ───────────────────────────────────────
const exercises = [
  // Chest
  { name: 'Bench Press', category: 'strength', primaryMuscle: ['chest'], secondaryMuscle: ['triceps', 'shoulders'], equipment: ['barbell', 'bench'], difficulty: 'intermediate', instructions: ['Lie flat on bench', 'Grip bar shoulder-width', 'Lower to chest', 'Press up powerfully'] },
  { name: 'Push-Up', category: 'strength', primaryMuscle: ['chest'], secondaryMuscle: ['triceps', 'shoulders'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: ['Start in plank', 'Lower chest to ground', 'Push back up'] },
  { name: 'Incline Dumbbell Press', category: 'strength', primaryMuscle: ['chest'], secondaryMuscle: ['triceps'], equipment: ['dumbbells', 'bench'], difficulty: 'intermediate' },
  { name: 'Cable Fly', category: 'strength', primaryMuscle: ['chest'], equipment: ['cable machine'], difficulty: 'intermediate' },
  // Back
  { name: 'Deadlift', category: 'strength', primaryMuscle: ['back', 'glutes'], secondaryMuscle: ['hamstrings'], equipment: ['barbell'], difficulty: 'advanced', instructions: ['Stand over bar', 'Hinge at hips', 'Keep back flat', 'Drive through heels'] },
  { name: 'Pull-Up', category: 'strength', primaryMuscle: ['back'], secondaryMuscle: ['biceps'], equipment: ['pull-up bar'], difficulty: 'intermediate' },
  { name: 'Barbell Row', category: 'strength', primaryMuscle: ['back'], secondaryMuscle: ['biceps'], equipment: ['barbell'], difficulty: 'intermediate' },
  { name: 'Lat Pulldown', category: 'strength', primaryMuscle: ['back'], equipment: ['cable machine'], difficulty: 'beginner' },
  // Legs
  { name: 'Squat', category: 'strength', primaryMuscle: ['quads', 'glutes'], secondaryMuscle: ['hamstrings', 'calves'], equipment: ['barbell', 'squat rack'], difficulty: 'intermediate', instructions: ['Bar on traps', 'Feet shoulder-width', 'Squat deep', 'Drive up'] },
  { name: 'Leg Press', category: 'strength', primaryMuscle: ['quads'], secondaryMuscle: ['glutes'], equipment: ['leg press machine'], difficulty: 'beginner' },
  { name: 'Romanian Deadlift', category: 'strength', primaryMuscle: ['hamstrings'], equipment: ['barbell'], difficulty: 'intermediate' },
  { name: 'Leg Curl', category: 'strength', primaryMuscle: ['hamstrings'], equipment: ['leg curl machine'], difficulty: 'beginner' },
  // Shoulders
  { name: 'Overhead Press', category: 'strength', primaryMuscle: ['shoulders'], secondaryMuscle: ['triceps'], equipment: ['barbell'], difficulty: 'intermediate' },
  { name: 'Lateral Raise', category: 'strength', primaryMuscle: ['shoulders'], equipment: ['dumbbells'], difficulty: 'beginner' },
  { name: 'Face Pull', category: 'strength', primaryMuscle: ['shoulders'], equipment: ['cable machine'], difficulty: 'beginner' },
  // Arms
  { name: 'Barbell Curl', category: 'strength', primaryMuscle: ['biceps'], equipment: ['barbell'], difficulty: 'beginner' },
  { name: 'Tricep Pushdown', category: 'strength', primaryMuscle: ['triceps'], equipment: ['cable machine'], difficulty: 'beginner' },
  { name: 'Hammer Curl', category: 'strength', primaryMuscle: ['biceps'], equipment: ['dumbbells'], difficulty: 'beginner' },
  // Cardio
  { name: 'Treadmill Run', category: 'cardio', primaryMuscle: ['legs'], equipment: ['treadmill'], difficulty: 'beginner' },
  { name: 'Rowing Machine', category: 'cardio', primaryMuscle: ['back', 'legs'], equipment: ['rowing machine'], difficulty: 'beginner' },
  { name: 'Jump Rope', category: 'cardio', primaryMuscle: ['calves'], equipment: ['jump rope'], difficulty: 'beginner' },
  { name: 'Cycling', category: 'cardio', primaryMuscle: ['legs'], equipment: ['stationary bike'], difficulty: 'beginner' },
  // Core
  { name: 'Plank', category: 'strength', primaryMuscle: ['core'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { name: 'Crunches', category: 'strength', primaryMuscle: ['core'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { name: 'Leg Raise', category: 'strength', primaryMuscle: ['core'], equipment: ['bodyweight'], difficulty: 'intermediate' },
  { name: 'Cable Crunch', category: 'strength', primaryMuscle: ['core'], equipment: ['cable machine'], difficulty: 'intermediate' },
];

const runSeed = async () => {
  await connectDB();
  try {
    // Clear and re-seed badges
    await Badge.deleteMany({});
    await Badge.insertMany(badges);
    console.log(`✅ Seeded ${badges.length} badges`);

    // Clear and re-seed exercises
    await Exercise.deleteMany({});
    const exercisesWithSlug = exercises.map(e => ({
      ...e,
      slug: e.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
    await Exercise.insertMany(exercisesWithSlug);
    console.log(`✅ Seeded ${exercises.length} exercises`);

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

runSeed();
