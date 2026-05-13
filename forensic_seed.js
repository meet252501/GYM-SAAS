
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load ENV
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const Exercise = require('./server/src/models/Exercise');
const WorkoutProgram = require('./server/src/models/WorkoutProgram');
const Member = require('./server/src/models/Member');
const User = require('./server/src/models/User');

const seed = async () => {
  try {
    console.log('🚀 Starting Deep Forensic Seed...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Database');

    // 1. Create Default Exercises (Global)
    const exercises = [
      { name: 'Dumbbell Bench Press', category: 'strength', primaryMuscle: ['Chest'], difficulty: 'beginner', isCustom: false },
      { name: 'Barbell Back Squat', category: 'strength', primaryMuscle: ['Quads'], difficulty: 'intermediate', isCustom: false },
      { name: 'Lat Pulldown', category: 'strength', primaryMuscle: ['Back'], difficulty: 'beginner', isCustom: false },
      { name: 'Shoulder Press', category: 'strength', primaryMuscle: ['Shoulders'], difficulty: 'beginner', isCustom: false },
      { name: 'Plank', category: 'flexibility', primaryMuscle: ['Abs'], difficulty: 'beginner', isCustom: false }
    ];

    console.log('📦 Seeding Exercises...');
    const createdExercises = [];
    for (const ex of exercises) {
      const existing = await Exercise.findOne({ name: ex.name });
      if (!existing) {
        const newEx = await Exercise.create(ex);
        createdExercises.push(newEx);
      } else {
        createdExercises.push(existing);
      }
    }

    // 2. Create a Public Workout Program
    console.log('📦 Seeding Public Workout Program...');
    const programName = 'Cyber Strength Starter';
    const existingProg = await WorkoutProgram.findOne({ name: programName });
    
    if (!existingProg) {
      // Find a gym or user to assign as creator
      const adminUser = await User.findOne({ role: 'admin' });
      const gymId = adminUser ? adminUser.gymId : null;

      await WorkoutProgram.create({
        name: programName,
        description: 'A balanced full-body routine to kickstart your gym journey.',
        goal: 'build-muscle',
        durationWeeks: 4,
        daysPerWeek: 3,
        isPublic: true, // THIS IS THE KEY FIX
        gymId: gymId,
        createdBy: adminUser ? adminUser._id : null,
        exercises: createdExercises.map(ex => ({
          exercise: ex._id,
          sets: 3,
          reps: '12',
          weight: 0
        }))
      });
      console.log('✅ Public Program Created!');
    } else {
      console.log('ℹ️ Public Program already exists.');
    }

    console.log('✨ Seed Complete! Refresh your "Train" page.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Failed:', err);
    process.exit(1);
  }
};

seed();
