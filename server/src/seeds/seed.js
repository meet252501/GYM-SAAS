const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Badge } = require('../models/Badge');
const Exercise = require('../models/Exercise');
const { MembershipPlan, Membership } = require('../models/Membership');
const Gym = require('../models/Gym');
const User = require('../models/User');
const Member = require('../models/Member');
const WorkoutProgram = require('../models/WorkoutProgram');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
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

const fs = require('fs');

const getExercisesData = () => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'exercises_data.json'), 'utf8'));
    return data.map(ex => ({
      name: ex.name,
      category: ex.muscle === 'waist' ? 'strength' : (ex.muscle === 'cardio' ? 'cardio' : 'strength'),
      primaryMuscle: [ex.muscle],
      equipment: [ex.equipment],
      difficulty: 'beginner',
      animationUrl: ex.localGif
    }));
  } catch (err) {
    console.warn('⚠️ Could not load exercises_data.json, using fallback');
    return [
      { name: 'Neural Squat', category: 'strength', primaryMuscle: ['quads'], equipment: ['bodyweight'], difficulty: 'beginner', animationUrl: '/exercises/0001.gif' }
    ];
  }
};

const exercises = getExercisesData();

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
      WorkoutProgram.deleteMany({}),
      MembershipPlan.deleteMany({}),
      Membership.deleteMany({}),
      Payment.deleteMany({}),
      Attendance.deleteMany({})
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

    // 3. Create Membership Plans
    const plans = await MembershipPlan.insertMany([
      { gymId: gym._id, name: 'Elite', price: 4999, duration: { value: 1, unit: 'month' }, features: ['AI Coach', 'Nutrition Scan', 'Unlimited Access'] },
      { gymId: gym._id, name: 'Premium', price: 2999, duration: { value: 1, unit: 'month' }, features: ['Group Classes', 'Standard Access'] },
      { gymId: gym._id, name: 'Basic', price: 1499, duration: { value: 1, unit: 'month' }, features: ['Standard Access'] }
    ]);
    console.log(`✅ Created ${plans.length} Membership Plans`);

    // 4. Create Admin Users
    const admin = await User.create({
      email: 'admin@gymflow.io',
      passwordHash: 'password123',
      role: 'owner',
      gymId: gym._id
    });

    // Add Developer Account
    await User.create({
      email: 'meetsutariya.2008@gmail.com',
      passwordHash: 'Dev@Pass2026!', 
      role: 'superadmin',
      gymId: gym._id
    });

    gym.ownerId = admin._id;
    await gym.save();
    console.log('✅ Created Admin (admin@gymflow.io) and Developer (meetsutariya.2008@gmail.com)');

    // 5. Create Member User & Profile
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
      streak: { current: 5, longest: 12 },
      goal: 'muscle_gain'
    });
    console.log('✅ Created Member User (member@gymflow.io / password123)');

    // 6. Assign Membership
    const membership = await Membership.create({
      memberId: member._id,
      gymId: gym._id,
      planId: plans[0]._id,
      planName: plans[0].name,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      status: 'active',
      amount: plans[0].price
    });
    member.currentMembershipId = membership._id;
    await member.save();
    console.log('✅ Assigned Elite Membership to Member');

    // 7. Seed Payments (Last 30 days)
    const payments = [];
    for (let i = 0; i < 30; i++) {
      if (Math.random() > 0.4) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        payments.push({
          gymId: gym._id,
          memberId: member._id,
          amount: Math.random() > 0.5 ? 2999 : 4999,
          status: 'completed',
          method: 'upi',
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          createdAt: date
        });
      }
    }
    await Payment.insertMany(payments);
    console.log(`✅ Seeded ${payments.length} Payments`);

    // 8. Seed Attendance (Last 14 days)
    const attendance = [];
    for (let i = 0; i < 14; i++) {
      if (Math.random() > 0.2) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(Math.floor(Math.random() * 12) + 6, 0, 0, 0);
        attendance.push({
          gymId: gym._id,
          memberId: member._id,
          checkedInAt: date,
          status: 'present'
        });
      }
    }
    await Attendance.insertMany(attendance);
    console.log(`✅ Seeded ${attendance.length} Attendance Records`);

    // 9. Seed Badges
    await Badge.insertMany(badges);
    console.log(`✅ Seeded ${badges.length} badges`);

    // 10. Seed Exercises (Linked to Gym)
    const exercisesWithMetadata = exercises.map(e => ({
      ...e,
      gymId: gym._id,
      isCustom: false,
      slug: e.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
    const seededExercises = await Exercise.insertMany(exercisesWithMetadata);
    console.log(`✅ Seeded ${seededExercises.length} exercises`);

    // 11. Seed Workout Program (Assigned to Member)
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
  } catch (err) {
    console.error('❌ Seed error:', err);
    throw err;
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;

