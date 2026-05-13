import { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../api';

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

// ─── Windows AI (Local Browser AI) ────────────────────────────
async function callWindowsAI(messages) {
  try {
    const ai = window.ai || window.model;
    if (!ai) throw new Error("Local AI not available");

    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === 'no') throw new Error("Local AI model not downloaded");

    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const prompt = userMessages.map(m => `${m.role === 'assistant' ? 'Coach' : 'User'}: ${m.content}`).join('\n') + '\nCoach:';

    const session = await ai.languageModel.create({ systemPrompt: systemMsg, temperature: 0.7, topK: 3 });
    const result = await session.prompt(prompt);
    session.destroy();
    return result;
  } catch (e) {
    console.warn("Windows AI Error:", e.message);
    throw e;
  }
}

// ─── Hyper-Detailed Neural Local Engine ───────────────────────────
const PROTOCOL_LIBRARY = [
  {
    keys: ['chest', 'push', 'bench'],
    reply: `🧬 **PROTOCOL: PECTORAL EXPANSION ALPHA**
    
Targeting the clavicular and sternal heads with maximum tension.

| Exercise | Sets | Reps | Intensity |
| :--- | :---: | :---: | :--- |
| **Incline DB Press** | 4 | 8-10 | 1s Peak Contraction |
| **Flat Bench Press** | 3 | 6-8 | Explosive Ascent |
| **Cable Flyes (Low-to-High)** | 3 | 12-15 | Constant Tension |
| **Weighted Dips** | 3 | AMRAP | Bodyweight + Load |

⚡ **NEURAL INSIGHT**: Myofibrillar hypertrophy is optimized at 80% 1RM. Maintain a 3030 tempo (3s down, 0s pause, 3s up).
🎯 **DIRECTIVE**: Execute 1 warm-up set now to calibrate mind-muscle link.`
  },
  {
    keys: ['leg', 'squat', 'glute', 'quad'],
    reply: `🧬 **PROTOCOL: LOWER BODY KINETIC CHAIN**
    
Foundation building through multi-joint force production.

| Exercise | Sets | Reps | Intensity |
| :--- | :---: | :---: | :--- |
| **Barbell Back Squats** | 4 | 5-8 | 85% 1RM |
| **Romanian Deadlifts** | 3 | 10 | Focus on Hamstring Stretch |
| **Leg Press (Wide Stance)** | 3 | 12 | Slow Eccentric |
| **Walking Lunges** | 3 | 20m | Controlled Balance |

⚡ **NEURAL INSIGHT**: Mechanical tension on the quads is maximized when the knee passes the toe. Ensure full ankle dorsiflexion.
🎯 **DIRECTIVE**: Hydrate with 500ml water and begin dynamic hip mobilization.`
  },
  {
    keys: ['shoulder', 'delt', 'press', 'side lateral'],
    reply: `🧬 **PROTOCOL: DELTOID DIMENSIONALITY**
    
Width and capped-look optimization via multi-planar abduction.

| Exercise | Sets | Reps | Intensity |
| :--- | :---: | :---: | :--- |
| **Overhead Press (OHP)** | 4 | 6-8 | Military Standard |
| **Lateral Raises (Cable)** | 4 | 15-20 | Behind the Back |
| **Reverse Pec Deck** | 3 | 12-15 | Rear Delt Bias |
| **Dumbbell Shrugs** | 3 | 10 | 2s Static Hold |

⚡ **NEURAL INSIGHT**: The lateral delt has a high percentage of Type I fibers. High repetition and "pump" training are effective for sarcoplasmic growth.
🎯 **DIRECTIVE**: Focus on "pushing the weights away" rather than lifting them up.`
  },
  {
    keys: ['cardio', 'hiit', 'burn', 'fat', 'lose weight', 'metabolic'],
    reply: `🔥 **PROTOCOL: METABOLIC OVERDRIVE (HIIT)**
    
Excess Post-exercise Oxygen Consumption (EPOC) maximization.

| Interval | Duration | Heart Rate | Type |
| :--- | :---: | :---: | :--- |
| **Sprint / Power** | 30s | 90-95% Max | Max Effort |
| **Active Recovery** | 90s | 60% Max | Walking/Slow Jog |
| **Volume Cycle** | 8-12x | N/A | Consistency |

⚡ **NEURAL INSIGHT**: HIIT increases mitochondrial density and insulin sensitivity. Catecholamine release triggers lipolysis (fat cell mobilization).
🎯 **DIRECTIVE**: Set a 20-minute timer. Begin Interval 01 immediately.`
  },
  {
    keys: ['mobility', 'flexibility', 'stretch', 'stiff', 'warmup'],
    reply: `🧘 **PROTOCOL: KINETIC FLUIDITY SYNC**
    
Decompressing joints and resetting muscle length-tension relationships.

1. **90/90 Hip Switch**: 2 mins (Unlocks pelvic floor and external rotators).
2. **Cat-Cow / Thoracic Bridge**: 10 reps (Spinal decompression).
3. **World's Greatest Stretch**: 5 reps/side (Full kinetic chain activation).
4. **Cossack Squats**: 10 reps (Adductor and ankle mobility).

⚡ **NEURAL INSIGHT**: Static stretching pre-workout can reduce power output. Focus on *Dynamic* mobility to prep the CNS.
🎯 **DIRECTIVE**: Execute the "World's Greatest Stretch" for 3 reps per side right now.`
  },
  {
    keys: ['protein', 'diet', 'nutrition', 'eat', 'calories', 'meal'],
    reply: `🥗 **PROTOCOL: ANABOLIC FUEL ARCHITECTURE**
    
Optimizing macronutrient ratios for muscle protein synthesis.

| Nutrient | Target (per kg) | Role |
| :--- | :---: | :--- |
| **Protein** | 2.2g | Tissue Repair (Leucine threshold) |
| **Carbs** | 3.5g - 5g | Glycogen replenishment |
| **Fats** | 0.8g - 1g | Hormonal health (Testosterone) |

⚡ **NEURAL INSIGHT**: The "Anabolic Window" is a myth; however, total daily protein intake and distribution (every 3-5h) is critical.
🎯 **DIRECTIVE**: Track your next meal in FuelHQ. Target 40g+ protein.`
  },
  {
    keys: ['back', 'pull', 'row', 'deadlift'],
    reply: `🧬 **PROTOCOL: POSTERIOR CHAIN DOMINATION**
    
Width and thickness optimization for the V-taper aesthetic.

| Exercise | Sets | Reps | Intensity |
| :--- | :---: | :---: | :--- |
| **Conventional Deadlift** | 3 | 5 | Heavy Power Load |
| **Weighted Pull-ups** | 4 | 6-8 | Full Range of Motion |
| **Seated Cable Rows** | 3 | 12 | Retract Scapula Hard |
| **Face Pulls** | 3 | 15 | Rear Delt Focus |

⚡ **NEURAL INSIGHT**: Latissimus dorsi activation is superior when hands are in a neutral or supinated grip.
🎯 **DIRECTIVE**: Hang from the pull-up bar for 30 seconds to decompress the spine.`
  },
  {
    keys: ['rest', 'recovery', 'sleep', 'sore'],
    reply: `💤 **PROTOCOL: NEURAL RECOVERY SYNC**
    
Muscle tissue does not grow in the gym; it grows during deep recovery.

- **SLEEP**: 7.5 - 9 Hours mandatory. Growth hormone peaks during REM cycles.
- **HYDRATION**: 3.5L+ per day to facilitate nutrient transport.
- **DELOAD**: If strength drops 10% over 2 sessions, execute a 50% volume week.
- **ACTIVE RECOVERY**: 20m low-intensity walking to clear lactic acid.

⚡ **NEURAL INSIGHT**: Chronic cortisol elevation (stress) inhibits recovery. Use Ashwagandha or Magnesium to downregulate the CNS.
🎯 **DIRECTIVE**: Set a strict sleep schedule tonight and disable blue-light devices 1h before bed.`
  }
];

export function ruleBasedReply(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const protocol of PROTOCOL_LIBRARY) {
    if (protocol.keys.some(k => msg.includes(k))) return protocol.reply;
  }
  return `🤖 **GYMFLOW INTELLIGENCE: STANDBY MODE**
  
I am your localized training strategist. I can provide hyper-detailed protocols for:
- **Strength**: Chest, Back, Legs, Shoulders
- **Fuel**: Protein targets, Diet ratios, Calories
- **Metabolic**: HIIT, Fat Loss, Cardio
- **Recovery**: Sleep, Mobility, Warmups

Try asking: *"Give me a detailed shoulder workout"* or *"How to lose fat?"*`;
}

// ─── Backend Food Analysis ──────────────────────────────────
export async function analyzeFoodImage(base64Data, mimeType) {
  try {
    const { data } = await aiApi.analyzeFood(base64Data, mimeType);
    return data.data.analysis;
  } catch (e) {
    console.error("Backend food analysis failed:", e);
    if (e.response?.status === 403) throw new Error("LIMIT_REACHED", { cause: e });
    throw new Error("Failed to parse food data from image.", { cause: e });
  }
}

// ─── Main AI call ─────────────────────────────────────────────
export async function sendAIMessage(messages) {
  // 1. ALWAYS TRY BROWSER AI FIRST (FREE - Saves your API limits!)
  try {
    const localReply = await callWindowsAI(messages);
    if (localReply) return localReply;
  } catch {
    console.warn("Local AI unavailable, falling back to Backend API...");
  }

  // 2. BACKEND PROXY (Paid Fallback - used only if local AI fails)
  try {
    const { data } = await aiApi.chat(messages);
    return data.data.reply;
  } catch (e) {
    console.warn('Backend AI failed, using rule engine...', e.message);
    const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    
    // Check if it's a limit error
    if (e.response?.status === 403) return ruleBasedReply(userMsg + " (LIMIT REACHED)");
    
    return ruleBasedReply(userMsg);
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

export const PLAN_LIMITS = { Trial: 3, Basic: 10, Premium: 30, Elite: Infinity, Admin: Infinity };
export const canSendMessage = () => true;
export const incrementUsage = () => {};
