const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BadgeService = require('../../src/services/badge.service');
const { Badge, MemberBadge } = require('../../src/models/Badge');
const Member = require('../../src/models/Member');
const Gym = require('../../src/models/Gym');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('BadgeService Integration Tests', () => {
  let gym, user, member, workoutBadge;

  beforeEach(async () => {
    // 1. Create a User (Gym Owner or Member User)
    user = await User.create({
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      role: 'member'
    });

    // 2. Create a Gym
    gym = await Gym.create({
      name: 'Integration Test Gym',
      ownerId: user._id
    });

    // 3. Create a Member
    member = await Member.create({
      userId: user._id,
      gymId: gym._id,
      firstName: 'John',
      lastName: 'Doe'
    });

    // 4. Create a potential Badge
    workoutBadge = await Badge.create({
      name: '10 Workouts',
      category: 'workout',
      criteriaThreshold: 10,
      points: 50
    });
  });

  it('should successfully award a badge to a member in the database', async () => {
    // Member just completed 10 workouts
    const criteriaType = 'workout';
    const currentValue = 10;

    // Check and award
    const newAwards = await BadgeService.checkAndAward(member._id, criteriaType, currentValue);

    expect(newAwards.length).toBe(1);
    expect(newAwards[0].name).toBe('10 Workouts');

    // Verify MemberBadge is saved to real database
    const memberBadges = await MemberBadge.find({ memberId: member._id });
    expect(memberBadges.length).toBe(1);
    expect(memberBadges[0].badgeId.toString()).toBe(workoutBadge._id.toString());
  });

  it('should not award duplicate badges if criteria met multiple times', async () => {
    const criteriaType = 'workout';
    
    // First time
    await BadgeService.checkAndAward(member._id, criteriaType, 10);
    
    // Member does 11th workout
    const duplicateAwards = await BadgeService.checkAndAward(member._id, criteriaType, 11);

    expect(duplicateAwards.length).toBe(0); // Should return empty

    // Verify still only 1 MemberBadge in DB
    const memberBadges = await MemberBadge.find({ memberId: member._id });
    expect(memberBadges.length).toBe(1);
  });
});
