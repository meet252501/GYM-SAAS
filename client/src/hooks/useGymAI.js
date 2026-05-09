/**
 * useGymAI — Dual-key AI hook with per-plan rate limiting
 * Primary:  Groq (Llama 3.1 8B – fast, free)
 * Backup:   Google Gemini 1.5 Flash (free)
 * Fallback: Rule-based gym expert engine (offline)
 */

const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ─── Per-plan daily message limits ────────────────────────────
export const PLAN_LIMITS = {
  Trial:   3,
  Basic:   10,
  Premium: 30,
  Elite:   Infinity,
  admin:   Infinity,
};

// ─── Rate limit helpers (localStorage, resets daily) ──────────
function getLimitKey(userId) { return `gymflow_ai_usage_${userId}`; }

export function getUsage(userId) {
  try {
    const raw  = localStorage.getItem(getLimitKey(userId));
    if (!raw) return { count: 0, date: today() };
    const data = JSON.parse(raw);
    if (data.date !== today()) return { count: 0, date: today() };
    return data;
  } catch { return { count: 0, date: today() }; }
}

export function incrementUsage(userId) {
  const usage = getUsage(userId);
  localStorage.setItem(getLimitKey(userId), JSON.stringify({ count: usage.count + 1, date: today() }));
}

export function canSendMessage(userId, plan, role) {
  if (role === 'admin') return true;
  const limit = PLAN_LIMITS[plan] ?? 10;
  if (limit === Infinity) return true;
  return getUsage(userId).count < limit;
}

export function getRemainingMessages(userId, plan, role) {
  if (role === 'admin') return Infinity;
  const limit = PLAN_LIMITS[plan] ?? 10;
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - getUsage(userId).count);
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ─── System prompts ───────────────────────────────────────────
export function buildAdminPrompt(stats) {
  return `You are GymFlow Intelligence, an expert AI assistant for gym managers and administrators.
You have deep knowledge of gym operations, member retention, revenue optimization, fitness programming, and business analytics.

Current gym stats:
- Total members: ${stats?.totalMembers || 12}
- Active members: ${stats?.activeMembers || 9}
- Members expiring in 7 days: ${stats?.expiringSoon || 2}
- Revenue this month: ₹${stats?.revenueThisMonth?.toLocaleString('en-IN') || '48,750'}
- Today's check-ins: ${stats?.todayCheckins || 14}
- Average daily attendance: ${stats?.avgAttendance || 18}

Respond concisely and professionally. Use Indian Rupee (₹) for currency. Focus on actionable gym management advice.
Keep responses under 150 words unless a detailed plan is requested.`;
}

export function buildMemberPrompt(member) {
  return `You are GymCoach, a friendly and motivating personal fitness AI coach built into the GymFlow app.
You help gym members with workout advice, nutrition basics, motivation, and fitness goals.

Member profile:
- Name: ${member?.firstName || 'Member'}
- Goal: ${member?.goal || 'General Fitness'}
- Current streak: ${member?.streak || 0} days
- Total workouts: ${member?.totalWorkouts || 0}
- Membership plan: ${member?.membershipPlan || 'Basic'}
- Weight: ${member?.weight || '—'}kg | Height: ${member?.height || '—'}cm

Be encouraging, specific to their goal, and keep responses under 120 words.
Use emojis sparingly to keep it energetic. Never give medical advice.`;
}

// ─── Groq API call ────────────────────────────────────────────
async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, max_tokens: 256, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Gemini API call (backup) ─────────────────────────────────
async function callGemini(messages) {
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemMsg }] },
        contents,
        generationConfig: { maxOutputTokens: 256, temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ─── Rule-based fallback engine ───────────────────────────────
const GYM_RULES = [
  { keys: ['chest', 'push', 'bench'], reply: '💪 Great chest day! Try: Bench Press 4×8, Incline DB Press 3×10, Cable Flyes 3×12, Push-ups 2×max. Rest 90s between sets. Progressive overload is key for growth!' },
  { keys: ['leg', 'squat', 'glute'], reply: "🦵 Leg day! Squats 4×8, Romanian Deadlifts 3×10, Leg Press 3×12, Walking Lunges 2×12 each. Don't skip legs — they boost total testosterone!" },
  { keys: ['back', 'pull', 'deadlift', 'row'], reply: '🔥 Back workout: Deadlifts 4×5, Pull-ups 3×max, Seated Rows 3×10, Lat Pulldowns 3×12. Focus on scapular retraction for maximum activation.' },
  { keys: ['shoulder', 'delt', 'press'], reply: '💫 Shoulders: OHP 4×8, Lateral Raises 4×12, Face Pulls 3×15, Arnold Press 3×10. Train all 3 heads for balanced delts!' },
  { keys: ['cardio', 'run', 'fat', 'weight loss', 'lose'], reply: '🏃 For fat loss: 20-30 min HIIT (40s on/20s off) burns more than steady-state cardio. Pair with a 200-300 calorie deficit. Consistency beats intensity!' },
  { keys: ['protein', 'diet', 'nutrition', 'eat', 'food'], reply: '🥩 Aim for 1.6-2.2g protein per kg bodyweight. Prioritize chicken, eggs, paneer, dal, fish. Time meals around workouts. Hydration (3L/day) is equally important!' },
  { keys: ['rest', 'recovery', 'sleep', 'sore'], reply: '😴 Recovery is where gains happen! 7-9 hours sleep, 48h rest per muscle group. Active recovery (walks, stretching) beats complete rest. Soreness ≠ growth.' },
  { keys: ['motivation', 'lazy', 'tired', 'give up', 'quit'], reply: "🔥 Remember why you started! Even a 20-min workout beats zero. Progress isn't linear — bad days are part of the journey. Your future self will thank you!" },
  { keys: ['streak', 'consistency'], reply: '⚡ Consistency is the #1 predictor of fitness success. Even 3 days/week beats 7 days for 1 week then nothing. Build the habit first, then increase intensity!' },
  { keys: ['membership', 'plan', 'upgrade', 'elite', 'premium'], reply: '⭐ Premium & Elite plans unlock unlimited PT sessions, nutrition planning, and priority class booking. Upgrade in your profile settings or speak to our staff!' },
  { keys: ['class', 'yoga', 'zumba', 'hiit', 'crossfit'], reply: '🎯 Group classes are great for motivation! Check the Classes tab for the full schedule. HIIT and CrossFit for intensity, Yoga and Pilates for recovery and flexibility.' },
  { keys: ['member', 'expire', 'retention', 'churn'], reply: '📊 Members expiring soon are your highest churn risk. Send personalized renewal reminders 7 days before expiry. A discount offer increases renewal rate by ~40%.' },
  { keys: ['revenue', 'income', 'profit', 'money'], reply: '💰 Revenue optimization: Push Elite plans (3.7x revenue vs Basic), add PT session packages, run referral programs. Your top 20% of members generate 80% of revenue.' },
  { keys: ['attendance', 'check-in', 'busy', 'peak'], reply: '📈 Peak hours are typically 6-9AM and 5-8PM. Consider off-peak discounts to spread load. Low attendance members are 3x more likely to churn — send engagement prompts!' },
  { keys: ['bmi', 'body', 'composition', 'fat percentage'], reply: '📏 BMI is a rough guide. More useful: body fat % (ideal 10-20% men, 18-28% women), waist-to-hip ratio, and strength metrics. Book a body composition analysis!' },
];

export function ruleBasedReply(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const rule of GYM_RULES) {
    if (rule.keys.some(k => msg.includes(k))) return rule.reply;
  }
  return "I'm your GymFlow AI Coach! Ask me about workouts, nutrition, recovery, or your membership. I'm here to help you crush your fitness goals! 💪";
}

// ─── Gemini Vision call for Food Analysis ───────────────────
export async function analyzeFoodImage(base64Data, mimeType) {
  const systemMsg = `You are an expert nutritionist AI. Analyze the image of food provided. 
Identify the food and estimate its macronutrients and calories for the portion shown.
You MUST return ONLY a raw JSON object with the following structure (no markdown, no backticks, no explanations):
{
  "name": "Food Name",
  "calories": 250,
  "protein": 15,
  "carbs": 30,
  "fat": 10,
  "serving_size_g": 100
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemMsg }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              { text: "Analyze this food." }
            ]
          }
        ],
        generationConfig: { maxOutputTokens: 256, temperature: 0.4 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini Vision ${res.status}`);
  const data = await res.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  
  try {
    const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini vision response:", textResponse, e);
    throw new Error("Failed to parse food data from image.", { cause: e });
  }
}

// ─── Window.ai (Local Chrome AI) ──────────────────────────────
async function callWindowAI(messages) {
  const aiObj = window.ai?.languageModel || window.ai?.assistant;
  if (!aiObj) throw new Error("window.ai not available");
  
  const capabilities = await aiObj.capabilities();
  if (capabilities.available === 'no') throw new Error("window.ai model not downloaded or unavailable");

  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  
  const session = await aiObj.create({ systemPrompt: systemMsg });
  const result = await session.prompt(userMsg);
  
  if (session.destroy) session.destroy();
  return result;
}

// ─── Main AI call (Local → Groq → Gemini → Rules) ─────────────
export async function sendAIMessage(messages) {
  // Try local Chrome AI first (completely free, zero latency)
  try {
    const reply = await callWindowAI(messages);
    return reply;
  } catch (e) {
    console.warn('Local window.ai failed/unavailable, trying Groq...', e.message);
  }

  // Try Groq (fast)
  try {
    const reply = await callGroq(messages);
    return reply;
  } catch (e) {
    console.warn('Groq failed, trying Gemini...', e.message);
  }

  // Try Gemini backup
  try {
    const reply = await callGemini(messages);
    return reply;
  } catch (e) {
    console.warn('Gemini failed, using rule engine...', e.message);
  }

  // Offline rule fallback
  const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  return ruleBasedReply(userMsg);
}
