/**
 * useGymAI — AI hook with backend tracking and per-plan rate limiting
 */
import { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../api';

const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * State manager for AI usage
 */
export function useAIUsage() {
  const [usage, setUsage] = useState({ dailyCount: 0, limit: 5, remaining: 5, planName: 'Trial' });
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await aiApi.getUsage();
      if (res.data?.success) {
        setUsage(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch AI usage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchUsage();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchUsage]);

  const refreshUsage = async () => {
    await fetchUsage();
  };

  return { ...usage, loading, refreshUsage };
}

// ─── Backend Tracking Helper ──────────────────────────────────
async function trackUsage() {
  try {
    const res = await aiApi.trackUsage();
    return res.data; // { success, data: { dailyCount, limit, remaining... } }
  } catch (e) {
    console.error('Failed to track AI usage on backend:', e);
    // If it's a 403, it means limit reached
    if (e.response?.status === 403) throw new Error("LIMIT_REACHED", { cause: e });
    return { success: false };
  }
}

async function checkQuota() {
  try {
    const res = await aiApi.getUsage();
    const { remaining, limit } = res.data.data;
    if (limit !== Infinity && remaining <= 0) return false;
    return true;
  } catch { return true; } // Fallback to allow if backend is down? Or block?
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

// ─── Windows AI (Local Browser AI) ────────────────────────────
async function callWindowsAI(messages) {
  try {
    // Check for Chrome/Edge window.ai API (Prompt API)
    const ai = window.ai || window.model;
    if (!ai) throw new Error("Local AI not available");

    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === 'no') throw new Error("Local AI model not downloaded");

    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');
    
    // Construct prompt from conversation history
    const prompt = userMessages.map(m => `${m.role === 'assistant' ? 'Coach' : 'User'}: ${m.content}`).join('\n') + '\nCoach:';

    const session = await ai.languageModel.create({
      systemPrompt: systemMsg,
      temperature: 0.7,
      topK: 3
    });

    const result = await session.prompt(prompt);
    session.destroy();
    return result;
  } catch (e) {
    console.warn("Windows AI Error:", e.message);
    throw e;
  }
}

// ─── Groq API call (Backup for Cloud) ──────────────────────────

// ─── Rule-based fallback engine ───────────────────────────────
const GYM_RULES = [
  { keys: ['chest', 'push', 'bench'], reply: '• **Protocol**: Chest Hypertrophy.\n• **Action**: Bench Press (4×8) | Incline DB Press (3×10).\n• **Command**: Focus on pectoral tension. Maximize eccentric control.' },
  { keys: ['leg', 'squat', 'glute'], reply: '• **Protocol**: Leg Power.\n• **Action**: Barbell Squats (4×8) | RDLs (3×10).\n• **Command**: Maintain parallel depth. Drive through heels.' },
  { keys: ['back', 'pull', 'deadlift', 'row'], reply: '• **Protocol**: Posterior Chain.\n• **Action**: Deadlifts (4×5) | Weighted Pull-ups (3×MAX).\n• **Command**: Retract scapula. Pull with intent.' },
  { keys: ['shoulder', 'delt', 'press'], reply: '• **Protocol**: Deltoid Expansion.\n• **Action**: Overhead Press (4×8) | Lateral Raises (4×15).\n• **Command**: Stabilize core. Control the descent.' },
  { keys: ['cardio', 'run', 'fat', 'weight loss', 'lose'], reply: '• **Protocol**: Metabolic Burn.\n• **Action**: 20m HIIT (45s Sprint/15s Rest).\n• **Command**: Maintain Zone 4 heart rate. Deficit is mandatory.' },
  { keys: ['protein', 'diet', 'nutrition', 'eat', 'food'], reply: '• **Protocol**: Macronutrient Fuel.\n• **Action**: 2.2g Protein/kg | 3L Water.\n• **Command**: Prioritize lean sources. Track every calorie.' },
  { keys: ['rest', 'recovery', 'sleep', 'sore'], reply: '• **Protocol**: Tissue Repair.\n• **Action**: 8h Sleep | 48h Group Rest.\n• **Command**: Growth occurs during recovery. Do not skip sleep.' },
  { keys: ['motivation', 'lazy', 'tired', 'give up', 'quit'], reply: '• **Protocol**: Discipline Override.\n• **Action**: Start immediate 15m segment.\n• **Command**: Discipline trumps motivation. Execute the set.' },
  { keys: ['streak', 'consistency'], reply: '• **Protocol**: Performance Metrics.\n• **Action**: Maintain 80% attendance.\n• **Command**: Consistency equals growth. No excuses.' },
  { keys: ['membership', 'plan', 'upgrade', 'elite', 'premium'], reply: '• **Protocol**: Tier Optimization.\n• **Action**: Upgrade to ELITE.\n• **Command**: Unlock unlimited AI coaching and PT sessions.' },
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
  // Check quota first
  const canProceed = await checkQuota();
  if (!canProceed) throw new Error("AI daily limit reached. Upgrade for more!");

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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemMsg }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
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
    const result = JSON.parse(cleaned);
    
    // Success: track usage on backend
    await trackUsage();
    
    return result;
  } catch (e) {
    console.error("Failed to parse Gemini vision response:", textResponse, e);
    throw new Error("Failed to parse food data from image.", { cause: e });
  }
}

// ─── Prompt Builders ──────────────────────────────────────────
export function buildAdminPrompt(stats) {
  return `You are GymFlow Intelligence, a high-level administrative AI assistant for gym owners.
Context:
- Total Members: ${stats.totalMembers}
- Active: ${stats.activeMembers}
- Expiring Soon: ${stats.expiringSoon}
- Revenue This Month: $${stats.revenueThisMonth}
- Today's Checkins: ${stats.todayCheckins}
- Avg Daily Attendance: ${stats.avgAttendance}

Your goal is to help the gym owner make data-driven decisions to increase retention and revenue. 
Be professional, concise, and insightful. Focus on growth and optimization.`;
}

export function buildMemberPrompt(user) {
  return `You are GymCoach PRO, an elite fitness AI strategist. Your responses must be systematic, highly structured, and data-driven, similar to the reasoning style of Claude 3.5 Sonnet.

User Identity: ${user?.firstName || 'Warrior'}
Target Objective: ${user?.fitnessGoal || 'Peak Performance'}
Current Tier: ${user?.membershipPlan || 'ELITE'}

### MANDATORY RESPONSE ARCHITECTURE:
1. **Executive Summary**: A concise 2-sentence overview of the tactical strategy.
2. **Technical Protocol**: Use a Markdown table for workout sessions (Exercise | Sets | Reps | Intensity) or diet plans.
3. **Neural Insights**: 3-4 bullet points explaining the physiological mechanisms (e.g., myofibrillar hypertrophy, metabolic efficiency).
4. **Immediate Directive**: A single, bold action to execute within 15 minutes.

### STYLISTIC CONSTRAINTS:
- Use **Bold** for all quantities, durations, and key muscle groups.
- Use \`code snippets\` for technical terms or acronyms.
- Use emoji headers for sections (e.g., 🧬 PROTOCOL, ⚡ INSIGHTS, 🎯 DIRECTIVE).
- TONE: Precise, authoritative, and scientifically rigorous. 

NEVER provide unstructured prose. Every response must feel like a high-fidelity digital briefing.`;
}

// ─── Main AI call ─────────────────────────────────────────────
export async function sendAIMessage(messages) {
  // 1. ALWAYS TRY WINDOWS AI FIRST (FREE)
  try {
    const localReply = await callWindowsAI(messages);
    if (localReply) return localReply;
  } catch {
    console.warn("Local AI failed or not supported, falling back to Cloud API if quota allows.");
  }

  // 2. Check quota for Cloud API fallback
  const canProceed = await checkQuota();
  if (!canProceed) {
    const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    return ruleBasedReply(userMsg + " (LIMIT REACHED)");
  }

  try {
    // 3. Cloud Fallback (Groq)
    let reply = await callGroq(messages);
    
    // Track usage only for Cloud calls
    await trackUsage();
    return reply;
  } catch (e) {
    console.warn('All AI engines failed, using rule engine...', e.message);
    const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    return ruleBasedReply(userMsg);
  }
}

// ─── Legacy Compatibility (Refactor components to use useAIUsage instead!) ───
export const PLAN_LIMITS = { Trial: 3, Basic: 10, Premium: 30, Elite: Infinity, Admin: Infinity };
export const canSendMessage = () => true; // Temporary stub
export const incrementUsage = () => {};       // Temporary stub

