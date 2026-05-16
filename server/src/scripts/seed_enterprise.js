const mongoose = require('mongoose');
const Member = require('../models/Member');
const User = require('../models/User');
const { MembershipPlan } = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Gym = require('../models/Gym');
require('dotenv').config();

const seedProduction = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gymflow');
    console.log('🌱 Starting Enterprise Seed...');

    // 1. Find or create default gym
    let gym = await Gym.findOne();
    if (!gym) {
      gym = await Gym.create({
        name: 'GymCore Elite HQ',
        address: '123 Cyber Street, Mumbai',
        contactEmail: 'admin@gymflow.pro',
        subscriptionPlan: 'enterprise'
      });
    }

    const gymId = gym._id;

    // 2. Seed Membership Plans
    await MembershipPlan.deleteMany({ gymId });
    const plans = await MembershipPlan.insertMany([
      { name: 'Basic Protocol', price: 1999, duration: { value: 1, unit: 'month' }, gymId, description: 'Access to gym floor & locker rooms.' },
      { name: 'Elite Performance', price: 4999, duration: { value: 1, unit: 'month' }, gymId, description: 'Gym + Pool + All Classes + Steam.' },
      { name: 'Alpha Annual', price: 39999, duration: { value: 1, unit: 'year' }, gymId, description: 'VIP All-access yearly protocol.' }
    ]);

    // 3. Seed Realistic Members
    const firstNames = ['Arjun', 'Siddharth', 'Ishaan', 'Kabir', 'Rohan', 'Aavya', 'Ananya', 'Diya', 'Myra', 'Saanvi'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Sutariya', 'Patel', 'Joshi', 'Reddy', 'Nair', 'Singh'];

    console.log('👥 Creating 30 Members...');
    for (let i = 0; i < 30; i++) {
      const fName = firstNames[i % 10];
      const lName = lastNames[Math.floor(i / 3)];
      const member = await Member.create({
        gymId,
        firstName: fName,
        lastName: lName,
        phone: `+91 98765${i.toString().padStart(5, '0')}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        goal: ['weight_loss', 'muscle_gain', 'general_fitness'][i % 3],
        membershipStatus: 'active',
        membershipExpiry: new Date(Date.now() + (30 * 86400000)),
        accessPin: (1000 + i).toString(), // Consistent PINs for testing (1000, 1001...)
        totalPoints: Math.floor(Math.random() * 1000),
        streak: { current: Math.floor(Math.random() * 15), longest: 20 }
      });

      // 4. Seed Random Attendance for the last 7 days
      for (let d = 0; d < 7; d++) {
        if (Math.random() > 0.4) {
          const date = new Date();
          date.setDate(date.getDate() - d);
          await Attendance.create({
            memberId: member._id,
            gymId,
            checkedInAt: date,
            method: 'qr_scan_member'
          });
        }
      }
    }

    console.log('✅ Enterprise Seed Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Failed:', err);
    process.exit(1);
  }
};

seedProduction();
