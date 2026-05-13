const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Gym = require('../../src/models/Gym');
const Member = require('../../src/models/Member');
const { Membership } = require('../../src/models/Membership');

let mongoServer;
let memberUser, adminUser, gym, memberProfile, adminToken, memberToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  process.env.JWT_SECRET = 'test-secret';
  process.env.GROQ_API_KEY = 'test-groq-key';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear DB
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }

  // Set up mock data
  adminUser = await User.create({ email: 'admin@gym.com', passwordHash: 'hash', role: 'owner' });
  memberUser = await User.create({ email: 'member@gym.com', passwordHash: 'hash', role: 'member' });

  gym = await Gym.create({ name: 'Test Gym', ownerId: adminUser._id });

  memberProfile = await Member.create({
    userId: memberUser._id,
    gymId: gym._id,
    firstName: 'Jane',
    lastName: 'Doe',
    membershipStatus: 'trial',
    aiUsage: { dailyCount: 0, lastUsedDate: new Date().toISOString().split('T')[0] }
  });

  adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
  memberToken = jwt.sign({ userId: memberUser._id }, process.env.JWT_SECRET);

  // Mock fetch for global
  global.fetch = jest.fn();
});

describe('AI Integration Tests (/api/v1/ai)', () => {

  describe('GET /api/v1/ai/usage', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/v1/ai/usage');
      expect(res.statusCode).toBe(401);
    });

    it('should return unlimited usage for owner', async () => {
      const res = await request(app)
        .get('/api/v1/ai/usage')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      // JSON cannot serialize Infinity so it comes back as null in the response body
      expect(res.body.data.limit).toBe(null);
      expect(res.body.data.remaining).toBe(null);
    });

    it('should return finite usage for a member on trial', async () => {
      const res = await request(app)
        .get('/api/v1/ai/usage')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.dailyCount).toBe(0);
      expect(res.body.data.planName).toBe('Trial');
    });
  });

  describe('POST /api/v1/ai/track', () => {
    it('should increment usage for a member', async () => {
      const res = await request(app)
        .post('/api/v1/ai/track')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.dailyCount).toBe(1);

      // Verify DB update
      const updatedMember = await Member.findById(memberProfile._id);
      expect(updatedMember.aiUsage.dailyCount).toBe(1);
    });

    it('should return 403 when daily limit is exceeded', async () => {
      // Setup member to have hit the default limit (e.g. 10 for Trial)
      memberProfile.aiUsage.dailyCount = 10;
      await memberProfile.save();

      const res = await request(app)
        .post('/api/v1/ai/track')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/limit reached/i);
    });
  });

  describe('POST /api/v1/ai/chat', () => {
    it('should proxy call to Groq and return reply', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello from Groq' } }]
        })
      });

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ messages: [{ role: 'user', content: 'Hi' }] });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.reply).toBe('Hello from Groq');
      expect(res.body.data.usage.remaining).toBeDefined();

      // Verify usage was tracked
      const updatedMember = await Member.findById(memberProfile._id);
      expect(updatedMember.aiUsage.dailyCount).toBe(1);
    });
  });

});
