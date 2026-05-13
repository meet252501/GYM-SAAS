const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Badge } = require('../models/Badge');
const Exercise = require('../models/Exercise');
const { MembershipPlan } = require('../models/Membership');
const Gym = require('../models/Gym');
const User = require('../models/User');
const Member = require('../models/Member');
const WorkoutProgram = require('../models/WorkoutProgram');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB connected for seeding');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
};

// ─── DATA DEFINITIONS ────────────────────────────────────────

const badges = [
  { name: 'First Step', description: 'Completed your first workout', icon: '👟', category: 'milestone', criteriaType: 'workouts_completed', criteriaThreshold: 1, points: 10, rarity: 'common' },
  { name: 'Iron Will', description: '7-day check-in streak', icon: '🔩', category: 'attendance', criteriaType: 'streak_days', criteriaThreshold: 7, points: 25, rarity: 'common' },
  { name: 'Unstoppable', description: '30-day check-in streak', icon: '🔥', category: 'attendance', criteriaType: 'streak_days', criteriaThreshold: 30, points: 100, rarity: 'rare' },
  { name: 'PR Machine', description: 'Set 10 personal records', icon: '🏆', category: 'workout', criteriaType: 'prs_set', criteriaThreshold: 10, points: 50, rarity: 'rare' }
];

const exercises = [
  { 
    name: 'Neural Squat', category: 'strength', primaryMuscle: ['quads', 'glutes'], 
    equipment: ['barbell', 'squat rack'], difficulty: 'intermediate',
    animationUrl: 'https://lottie.host/83679808-01e4-4d89-9486-d2547a836894/l8j88P65G3.lottie'
  },
  { 
    name: 'Cyber Pushup', category: 'strength', primaryMuscle: ['chest', 'triceps'], 
    equipment: ['bodyweight'], difficulty: 'beginner',
    animationUrl: 'https://lottie.host/64703a4b-9e48-4395-9467-f417f7b2e666/p8Z78X65Gz.json'
  },
  { 
    name: 'Plasma Lunge', category: 'strength', primaryMuscle: ['legs'], 
    equipment: ['dumbbells'], difficulty: 'intermediate',
    animationUrl: 'https://lottie.host/6ef44b93-8395-468a-b844-3d6f8f8d8f8d/v8Y88A65Gz.json'
  },
  { 
    name: 'Barbell Bench Press', category: 'strength', primaryMuscle: ['chest'], 
    equipment: ['barbell', 'bench'], difficulty: 'intermediate',
    animationUrl: 'https://lottie.host/8040d19a-3242-4f3d-9f44-9f4f9f4f9f4f/8vNq3f0R1s.json'
  },
  { 
    name: 'Incline Dumbbell Press', category: 'strength', primaryMuscle: ['chest'], 
    equipment: ['dumbbells', 'bench'], difficulty: 'beginner',
    animationUrl: 'https://lottie.host/46481744-8025-4b3d-986c-497793d56784/eL6v1XpW5r.json'
  }
];

const runSeed = async () => {
  await connectDB();
  try {
    // 1. Clear existing data
    await Promise.all([
      Gym.deleteMany({}),
      User.deleteMany({}),
      Member.deleteMany({}),
      Badge.deleteMany({}),
      Exercise.deleteMany({}),
      WorkoutProgram.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // 2. Create Global Gym
    const gym = await Gym.create({
      name: 'GymFlow Elite HQ',
      address: { street: 'Main Tech Park', city: 'Metropolis', state: 'CA', pincode: '90001' },
      email: 'hq@gymflow.io',
      ownerId: new mongoose.Types.ObjectId() // Placeholder
    });
    console.log(`✅ Created Gym: ${gym.name}`);

    // 3. Create Admin Users
    const admin = await User.create({
      email: 'admin@gymflow.io',
      passwordHash: 'password123',
      role: 'owner',
      gymId: gym._id
    });

    // Add Developer Account
    await User.create({
      email: 'meetsutariya.2008@gmail.com',
      passwordHash: 'Dev@Pass2026!', // Temporary secure password for developer
      role: 'superadmin',
      gymId: gym._id
    });

    gym.ownerId = admin._id;
    await gym.save();
    console.log('✅ Created Admin (admin@gymflow.io) and Developer (meetsutariya.2008@gmail.com)');

    // 4. Create Member User & Profile
    const memberUser = await User.create({
      email: 'member@gymflow.io',
      passwordHash: 'password123',
      role: 'member',
      gymId: gym._id
    });
    const member = await Member.create({
      userId: memberUser._id,
      gymId: gym._id,
      firstName: 'Test',
      lastName: 'Member',
      phone: '9876543210',
      membershipStatus: 'active',
      streak: { current: 5, longest: 12 }
    });
    console.log('✅ Created Member User (member@gymflow.io / password123)');

    // 5. Seed Badges
    await Badge.insertMany(badges);
    console.log(`✅ Seeded ${badges.length} badges`);

    // 6. Seed Exercises (Linked to Gym)
    const exercisesWithMetadata = exercises.map(e => ({
      ...e,
      gymId: gym._id,
      isCustom: false,
      slug: e.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
    const seededExercises = await Exercise.insertMany(exercisesWithMetadata);
    console.log(`✅ Seeded ${seededExercises.length} exercises`);

    // 7. Seed Workout Program (Assigned to Member)
    const program = await WorkoutProgram.create({
      gymId: gym._id,
      createdBy: admin._id,
      name: 'Alpha Strength Protocol',
      description: 'Advanced 4-week strength development phase.',
      goal: 'muscle_gain',
      difficulty: 'intermediate',
      durationWeeks: 4,
      daysPerWeek: 3,
      assignedMembers: [member._id],
      isPublic: true,
      weeks: [{
        weekNumber: 1,
        days: [{
          dayNumber: 1,
          label: 'Power Session',
          exercises: seededExercises.map(ex => ({
            exerciseId: ex._id,
            exerciseName: ex.name,
            sets: 4,
            reps: '8',
            restSeconds: 120
          }))
        }]
      }]
    });
    console.log(`✅ Seeded & Assigned Program: ${program.name}`);

    console.log('\n🎉 Production Seed Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

runSeed();

