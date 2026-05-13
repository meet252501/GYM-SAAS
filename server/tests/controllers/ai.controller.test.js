const aiController = require('../../src/controllers/ai.controller');
const Member = require('../../src/models/Member');
const WorkoutLog = require('../../src/models/WorkoutLog');
const { PLAN_LIMITS, DEFAULT_LIMIT } = require('../../src/config/ai.config');
const { successResponse, errorResponse } = require('../../src/utils/apiResponse');

// Mock dependencies
jest.mock('../../src/models/Member');
jest.mock('../../src/models/WorkoutLog');
jest.mock('../../src/utils/apiResponse', () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn()
}));

// Mock global fetch
global.fetch = jest.fn();

describe('AI Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    req = {
      user: { _id: 'user123', role: 'member' },
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAIUsage', () => {
    it('should return unlimited usage for owner or trainer', async () => {
      req.user.role = 'owner';

      const mockMemberFindOne = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      Member.findOne = mockMemberFindOne;

      await aiController.getAIUsage(req, res);

      expect(successResponse).toHaveBeenCalledWith(res, expect.objectContaining({
        dailyCount: 0,
        limit: PLAN_LIMITS['admin'],
        remaining: Infinity
      }));
    });

    it('should reset daily count on a new day', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const mockMember = {
        aiUsage: { dailyCount: 5, lastUsedDate: yesterday },
        save: jest.fn().mockResolvedValue(true)
      };

      Member.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockMember) });

      await aiController.getAIUsage(req, res);

      expect(mockMember.aiUsage.dailyCount).toBe(0);
      expect(mockMember.aiUsage.lastUsedDate).toBe(today);
      expect(mockMember.save).toHaveBeenCalled();

      expect(successResponse).toHaveBeenCalledWith(res, expect.objectContaining({
        dailyCount: 0,
        resetDate: today
      }));
    });
  });

  describe('trackAIUsage', () => {
    it('should return unlimited usage for admin/trainer', async () => {
      req.user.role = 'trainer';

      await aiController.trackAIUsage(req, res);

      expect(successResponse).toHaveBeenCalledWith(res, { success: true, message: 'Unlimited usage for admin/trainer' });
    });

    it('should return 404 if member is not found', async () => {
      Member.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await aiController.trackAIUsage(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Member profile not found', 404);
    });

    it('should return 403 if limit is exceeded', async () => {
      const today = new Date().toISOString().split('T')[0];

      const mockMember = {
        aiUsage: { dailyCount: 100, lastUsedDate: today },
        currentMembershipId: { planName: 'Trial' },
        save: jest.fn()
      };

      // Override limit for test
      PLAN_LIMITS['Trial'] = 5;

      Member.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockMember) });

      await aiController.trackAIUsage(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Daily AI limit reached for Trial plan.', 403);
    });

    it('should increment daily count and save', async () => {
      const today = new Date().toISOString().split('T')[0];

      const mockMember = {
        aiUsage: { dailyCount: 2, lastUsedDate: today },
        currentMembershipId: { planName: 'Trial' },
        save: jest.fn().mockResolvedValue(true)
      };

      PLAN_LIMITS['Trial'] = 5;

      Member.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockMember) });

      await aiController.trackAIUsage(req, res);

      expect(mockMember.aiUsage.dailyCount).toBe(3);
      expect(mockMember.save).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(res, expect.objectContaining({
        dailyCount: 3,
        limit: 5,
        remaining: 2
      }));
    });
  });

  describe('chatWithAI', () => {
    it('should return 500 if API key is not configured', async () => {
      delete process.env.GROQ_API_KEY;

      await aiController.chatWithAI(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'AI Service Key not configured', 500);
    });

    it('should successfully proxy to Groq and return response', async () => {
      req.body.messages = [{ role: 'user', content: 'Hello' }];

      // Mock internalTrackUsage directly for this test
      const originalInternalTrackUsage = aiController.internalTrackUsage;
      aiController.internalTrackUsage = jest.fn().mockResolvedValue({ success: true, data: { remaining: 5 } });

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hi there!' } }]
        })
      });

      await aiController.chatWithAI(req, res);

      expect(global.fetch).toHaveBeenCalledWith('https://api.groq.com/openai/v1/chat/completions', expect.any(Object));
      expect(successResponse).toHaveBeenCalledWith(res, {
        reply: 'Hi there!',
        usage: { remaining: 5 }
      });

      // Restore
      aiController.internalTrackUsage = originalInternalTrackUsage;
    });
  });

  describe('analyzeFood', () => {
    it('should return 500 if Gemini API key is missing', async () => {
      delete process.env.GEMINI_API_KEY;

      await aiController.analyzeFood(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Vision Service Key not configured', 500);
    });

    it('should successfully analyze food image and parse JSON', async () => {
      req.body = { image: 'base64...', mimeType: 'image/jpeg' };

      const originalInternalTrackUsage = aiController.internalTrackUsage;
      aiController.internalTrackUsage = jest.fn().mockResolvedValue({ success: true, data: { remaining: 5 } });

      const mockGeminiResponse = {
        candidates: [{
          content: {
            parts: [{
              text: '```json\n{"name": "Apple", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "serving_size_g": 182}\n```'
            }]
          }
        }]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGeminiResponse)
      });

      await aiController.analyzeFood(req, res);

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('generativelanguage.googleapis.com'), expect.any(Object));
      expect(successResponse).toHaveBeenCalledWith(res, {
        analysis: {
          name: 'Apple',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          serving_size_g: 182
        },
        usage: { remaining: 5 }
      });

      aiController.internalTrackUsage = originalInternalTrackUsage;
    });
  });

  describe('suggestNextWorkout', () => {
    it('should return 404 if member is not found', async () => {
      Member.findOne.mockResolvedValue(null);

      await aiController.suggestNextWorkout(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Member profile not found', 404);
    });

    it('should get context from WorkoutLog and return suggestion', async () => {
      const mockMember = { _id: 'member123', firstName: 'John', fitnessGoal: 'muscle_gain' };
      Member.findOne.mockResolvedValue(mockMember);

      const mockLogs = [
        {
          createdAt: new Date(),
          label: 'Chest Day',
          exercises: [{ exerciseName: 'Bench Press' }]
        }
      ];

      const mockFind = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue(mockLogs);

      WorkoutLog.find = mockFind;
      WorkoutLog.sort = mockSort;
      WorkoutLog.limit = mockLimit;
      WorkoutLog.populate = mockPopulate;

      WorkoutLog.find.mockReturnValue({
          sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue(mockLogs)
              })
          })
      });

      const originalInternalTrackUsage = aiController.internalTrackUsage;
      aiController.internalTrackUsage = jest.fn().mockResolvedValue({ success: true, data: { remaining: 5 } });

      const mockSuggestion = {
        workoutName: 'Leg Day',
        focus: 'Legs',
        rationale: 'You hit chest yesterday.',
        exercises: [{ name: 'Squats', sets: 3, reps: '10' }]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(mockSuggestion) } }]
        })
      });

      await aiController.suggestNextWorkout(req, res);

      expect(WorkoutLog.find).toHaveBeenCalledWith({ memberId: 'member123' });
      expect(global.fetch).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(res, {
        suggestion: mockSuggestion,
        usage: { remaining: 5 }
      });

      aiController.internalTrackUsage = originalInternalTrackUsage;
    });
  });
});
