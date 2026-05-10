const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Exercise = require('../models/Exercise');

const exercises = [
  // STRENGTH - Chest
  { name: 'Barbell Bench Press', category: 'strength', primaryMuscle: ['Chest'], equipment: ['Barbell', 'Bench'], difficulty: 'intermediate' },
  { name: 'Dumbbell Flyes', category: 'strength', primaryMuscle: ['Chest'], equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Incline Dumbbell Press', category: 'strength', primaryMuscle: ['Chest'], equipment: ['Dumbbells', 'Incline Bench'], difficulty: 'intermediate' },
  
  // STRENGTH - Back
  { name: 'Deadlift', category: 'strength', primaryMuscle: ['Lower Back', 'Hamstrings'], equipment: ['Barbell'], difficulty: 'advanced' },
  { name: 'Lat Pulldown', category: 'strength', primaryMuscle: ['Lats'], equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Seated Cable Row', category: 'strength', primaryMuscle: ['Middle Back'], equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Pull Ups', category: 'strength', primaryMuscle: ['Lats'], equipment: ['Pull-up Bar'], difficulty: 'intermediate' },

  // STRENGTH - Legs
  { name: 'Barbell Squat', category: 'strength', primaryMuscle: ['Quads'], equipment: ['Barbell', 'Squat Rack'], difficulty: 'intermediate' },
  { name: 'Leg Press', category: 'strength', primaryMuscle: ['Quads'], equipment: ['Leg Press Machine'], difficulty: 'beginner' },
  { name: 'Leg Extension', category: 'strength', primaryMuscle: ['Quads'], equipment: ['Leg Extension Machine'], difficulty: 'beginner' },
  { name: 'Leg Curl', category: 'strength', primaryMuscle: ['Hamstrings'], equipment: ['Leg Curl Machine'], difficulty: 'beginner' },

  // STRENGTH - Shoulders
  { name: 'Overhead Press', category: 'strength', primaryMuscle: ['Shoulders'], equipment: ['Barbell'], difficulty: 'intermediate' },
  { name: 'Lateral Raise', category: 'strength', primaryMuscle: ['Shoulders'], equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Face Pulls', category: 'strength', primaryMuscle: ['Rear Delts'], equipment: ['Cable Machine'], difficulty: 'beginner' },

  // STRENGTH - Arms
  { name: 'Bicep Curls', category: 'strength', primaryMuscle: ['Biceps'], equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Hammer Curls', category: 'strength', primaryMuscle: ['Biceps', 'Forearms'], equipment: ['Dumbbells'], difficulty: 'beginner' },
  { name: 'Tricep Pushdown', category: 'strength', primaryMuscle: ['Triceps'], equipment: ['Cable Machine'], difficulty: 'beginner' },
  { name: 'Skull Crushers', category: 'strength', primaryMuscle: ['Triceps'], equipment: ['EZ Bar'], difficulty: 'intermediate' },

  // CARDIO
  { name: 'Treadmill Run', category: 'cardio', primaryMuscle: ['Full Body'], equipment: ['Treadmill'], difficulty: 'beginner' },
  { name: 'Elliptical Trainer', category: 'cardio', primaryMuscle: ['Full Body'], equipment: ['Elliptical'], difficulty: 'beginner' },
  { name: 'Rowing Machine', category: 'cardio', primaryMuscle: ['Back', 'Legs', 'Arms'], equipment: ['Rower'], difficulty: 'intermediate' },

  // FLEXIBILITY & CORE
  { name: 'Plank', category: 'flexibility', primaryMuscle: ['Abs'], equipment: ['Bodyweight'], difficulty: 'beginner' },
  { name: 'Hanging Leg Raise', category: 'strength', primaryMuscle: ['Abs'], equipment: ['Pull-up Bar'], difficulty: 'advanced' },
  { name: 'Russian Twist', category: 'strength', primaryMuscle: ['Abs'], equipment: ['Medicine Ball'], difficulty: 'beginner' },
  { name: 'Cobra Stretch', category: 'flexibility', primaryMuscle: ['Abs', 'Back'], equipment: ['Bodyweight'], difficulty: 'beginner' }
];

const seedExercises = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gymflow';
    await mongoose.connect(mongoUri);
    console.log('🚀 Connected to MongoDB for Exercise Seeding');

    // We don't deleteMany because we want to preserve custom exercises if any, 
    // but we update/upsert the core library.
    console.log(`📦 Upserting ${exercises.length} exercises...`);
    
    for (const ex of exercises) {
      await Exercise.findOneAndUpdate(
        { name: ex.name },
        { ...ex, isCustom: false },
        { upsert: true, new: true }
      );
    }

    console.log('✨ Exercise Library Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedExercises();
