const Member = require('../models/Member');
const { Membership } = require('../models/Membership');
const { PLAN_LIMITS, DEFAULT_LIMIT } = require('../config/ai.config');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get current AI usage and limit for the logged-in member
 */
exports.getAIUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    let member = await Member.findOne({ userId }).populate('currentMembershipId');
    if (!member) {
      // If admin/trainer is calling this, they might not have a member record
      if (['owner', 'trainer'].includes(req.user.role)) {
        return successResponse(res, {
          dailyCount: 0,
          limit: PLAN_LIMITS['admin'],
          remaining: Infinity,
          resetDate: today
        });
      }
      return errorResponse(res, 'Member profile not found', 404);
    }

    // Reset daily count if it's a new day
    if (member.aiUsage.lastUsedDate !== today) {
      member.aiUsage.dailyCount = 0;
      member.aiUsage.lastUsedDate = today;
      await member.save();
    }

    // Determine limit based on membership plan
    let planName = 'Trial';
    if (member.currentMembershipId && member.currentMembershipId.planName) {
      planName = member.currentMembershipId.planName;
    } else if (req.user.role === 'member' && member.membershipStatus === 'trial') {
      planName = 'Trial';
    }

    const limit = PLAN_LIMITS[planName] || DEFAULT_LIMIT;
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - member.aiUsage.dailyCount);

    return successResponse(res, {
      dailyCount: member.aiUsage.dailyCount,
      limit: limit,
      remaining: remaining,
      resetDate: member.aiUsage.lastUsedDate,
      planName
    });
  } catch (error) {
    console.error('Error getting AI usage:', error);
    return errorResponse(res, 'Failed to fetch AI usage stats');
  }
};

/**
 * Increment AI usage count
 */
exports.trackAIUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // Admins and trainers have unlimited usage, no need to track
    if (['owner', 'trainer'].includes(req.user.role)) {
      return successResponse(res, { success: true, message: 'Unlimited usage for admin/trainer' });
    }

    let member = await Member.findOne({ userId }).populate('currentMembershipId');
    if (!member) {
      return errorResponse(res, 'Member profile not found', 404);
    }

    // Reset daily count if it's a new day
    if (member.aiUsage.lastUsedDate !== today) {
      member.aiUsage.dailyCount = 0;
      member.aiUsage.lastUsedDate = today;
    }

    // Determine limit
    let planName = 'Trial';
    if (member.currentMembershipId && member.currentMembershipId.planName) {
      planName = member.currentMembershipId.planName;
    }

    const limit = PLAN_LIMITS[planName] || DEFAULT_LIMIT;

    // Check if limit exceeded
    if (limit !== Infinity && member.aiUsage.dailyCount >= limit) {
      return errorResponse(res, `Daily AI limit reached for ${planName} plan.`, 403);
    }

    // Increment
    member.aiUsage.dailyCount += 1;
    await member.save();

    return successResponse(res, {
      dailyCount: member.aiUsage.dailyCount,
      limit: limit,
      remaining: limit === Infinity ? Infinity : limit - member.aiUsage.dailyCount
    });
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    return errorResponse(res, 'Failed to update AI usage stats');
  }
};

/**
 * AI Chat Proxy (Groq)
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) return errorResponse(res, 'AI Service Key not configured', 500);

    // Track usage first (throws 403 if over limit)
    const usageResult = await exports.internalTrackUsage(req.user);
    if (!usageResult.success) return errorResponse(res, usageResult.message, 403);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, max_tokens: 512, temperature: 0.7 }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    
    return successResponse(res, { 
      reply: data.choices[0].message.content,
      usage: usageResult.data
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return errorResponse(res, 'AI Coach is temporarily unavailable');
  }
};

/**
 * AI Vision Proxy (Gemini)
 */
exports.analyzeFood = async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return errorResponse(res, 'Vision Service Key not configured', 500);

    // Track usage
    const usageResult = await exports.internalTrackUsage(req.user);
    if (!usageResult.success) return errorResponse(res, usageResult.message, 403);

    const systemMsg = `You are an expert nutritionist AI. Analyze the image of food provided. 
Identify the food and estimate its macronutrients and calories for the portion shown.
You MUST return ONLY a raw JSON object with the following structure:
{
  "name": "Food Name",
  "calories": 250,
  "protein": 15,
  "carbs": 30,
  "fat": 10,
  "serving_size_g": 100
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemMsg }] },
          contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mimeType, data: image } }, { text: "Analyze this food." }] }],
          generationConfig: { maxOutputTokens: 256, temperature: 0.4 },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    return successResponse(res, { 
      analysis: result,
      usage: usageResult.data
    });
  } catch (error) {
    console.error('Vision Analysis Error:', error);
    return errorResponse(res, 'Food analysis is temporarily unavailable');
  }
};

/**
 * AI Workout Suggester
 * Generates a personalized next workout based on member's recent history
 */
exports.suggestNextWorkout = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    // 1. Get recent workout logs to understand context
    const recentLogs = await require('../models/WorkoutLog').find({ memberId: member._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('exercises.exerciseId');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return errorResponse(res, 'AI Service Key not configured', 500);

    // Track usage
    const usageResult = await exports.internalTrackUsage(req.user);
    if (!usageResult.success) return errorResponse(res, usageResult.message, 403);

    // 2. Prepare context for AI
    const historySummary = recentLogs.map(log => ({
      date: log.createdAt.toISOString().split('T')[0],
      label: log.label,
      exercises: log.exercises.map(ex => ex.exerciseName)
    }));

    const systemMsg = `You are an elite fitness coach. Based on the member's training history, suggest a logical "next step" workout.
Focus on muscle group rotation (don't repeat the same muscles from yesterday) and progression.
You MUST return ONLY a raw JSON object with this structure:
{
  "workoutName": "Short Catchy Name",
  "focus": "Muscle Group Focus",
  "rationale": "One sentence explaining why this is next",
  "exercises": [
    { "name": "Exercise Name", "sets": 3, "reps": "10-12", "notes": "Form tip" }
  ]
}`;

    const userMsg = `Member: ${member.firstName}
Goal: ${member.fitnessGoal || 'General Fitness'}
Recent History: ${JSON.stringify(historySummary)}
Suggest the next workout.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ 
        model: 'llama-3.1-8b-instant', 
        messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
        max_tokens: 1024,
        temperature: 0.6
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    
    let suggestion;
    try {
      const text = data.choices[0].message.content;
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      suggestion = JSON.parse(cleaned);
    } catch (e) {
      suggestion = { error: 'Failed to parse AI response', raw: data.choices[0].message.content };
    }
    
    return successResponse(res, { 
      suggestion,
      usage: usageResult.data
    });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return errorResponse(res, 'AI Coach is busy calculating your evolution. Try again shortly.');
  }
};

/**
 * Internal helper to track usage without sending HTTP response
 */
exports.internalTrackUsage = async (user) => {
  try {
    if (['owner', 'trainer'].includes(user.role)) return { success: true, data: { remaining: Infinity } };

    const today = new Date().toISOString().split('T')[0];
    let member = await Member.findOne({ userId: user._id }).populate('currentMembershipId');
    if (!member) return { success: false, message: 'Member profile not found' };

    if (member.aiUsage.lastUsedDate !== today) {
      member.aiUsage.dailyCount = 0;
      member.aiUsage.lastUsedDate = today;
    }

    let planName = 'Trial';
    if (member.currentMembershipId && member.currentMembershipId.planName) planName = member.currentMembershipId.planName;
    const limit = PLAN_LIMITS[planName] || DEFAULT_LIMIT;

    if (limit !== Infinity && member.aiUsage.dailyCount >= limit) {
      return { success: false, message: `Daily AI limit reached for ${planName} plan.` };
    }

    member.aiUsage.dailyCount += 1;
    await member.save();

    return { 
      success: true, 
      data: { 
        dailyCount: member.aiUsage.dailyCount, 
        limit, 
        remaining: limit === Infinity ? Infinity : limit - member.aiUsage.dailyCount 
      } 
    };
  } catch (error) {
    return { success: false, message: 'Internal tracking error' };
  }
};

