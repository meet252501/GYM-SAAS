const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

async function setupIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Building indexes...');
    
    // Member Indexes
    await Member.collection.createIndex({ gymId: 1, membershipStatus: 1 });
    await Member.collection.createIndex({ membershipExpiry: 1 });
    await Member.collection.createIndex({ memberId: 1 }, { unique: true, sparse: true });
    
    // Attendance Indexes
    if (mongoose.models.Attendance) {
       await Attendance.collection.createIndex({ gymId: 1, checkedInAt: -1 });
       await Attendance.collection.createIndex({ memberId: 1, checkedInAt: -1 });
    }
    
    // Payment Indexes
    if (mongoose.models.Payment) {
       await Payment.collection.createIndex({ gymId: 1, createdAt: -1 });
       await Payment.collection.createIndex({ memberId: 1, status: 1 });
    }
    
    console.log('✅ All high-performance indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Index creation failed:', error);
    process.exit(1);
  }
}
setupIndexes();