# 🤖 AI Engine — GymFlow Pro
## AI Workout Suggestion & Nutrition Guidance System

---

## 1. Overview

GymFlow Pro includes a lightweight AI engine for:
1. **Workout Suggestions** — "What should I train next?"
2. **Progressive Overload Recommendations** — Weight/rep progression
3. **Recovery Detection** — Flag overtraining or missed sessions
4. **Nutrition Guidance** — Macro targets based on goals and metrics

> **v1.0 uses rule-based AI + optional OpenAI API integration**
> Future: Fine-tuned fitness model or Gemini Pro integration

---

## 2. Workout Suggestion Algorithm

### Inputs
```js
{
  member: {
    goal: 'muscle_gain',           // weight_loss | muscle_gain | endurance
    fitnessLevel: 'intermediate',
    currentMetrics: { weight: 75, bodyFatPercent: 18 },
    streak: { current: 12 }
  },
  recentLogs: [
    // Last 14 days of workout_logs
    { date, exercises: [...], totalVolume, duration }
  ],
  currentProgram: {
    // Assigned program if any
  },
  attendance: {
    lastCheckin: '2026-05-05',
    daysThisWeek: 3
  }
}
```

### Decision Logic
```
1. IF member has assigned program
   → Return next incomplete day in program

2. ELSE IF last workout < 24h ago
   → Suggest RECOVERY / REST day with stretching

3. ELSE
   → Analyze muscle group frequency from last 7 days
   → Find least-trained muscle group
   → Pick exercises from library for that muscle group
   → Adjust volume based on fitnessLevel

4. Progressive Overload:
   → For each exercise in last log,
     IF member completed all sets at target reps
     → Suggest +2.5kg or +1 rep next session
   → Return as "AI Notes" on the exercise
```

### Progressive Overload Rules
```js
const progressionRules = {
  strength: {
    // Increase weight when 3 sets completed at top rep range
    condition: (sets) => sets.every(s => s.reps >= s.targetRepsMax),
    increment: { small: 2.5, large: 5 },  // kg
    deload: { triggerWeeks: 4, reductionPercent: 10 }
  },
  endurance: {
    // Increase reps or duration
    condition: (sets) => sets.every(s => s.rpe <= 7),
    repIncrement: 2
  }
}
```

---

## 3. Nutrition Guidance Engine

### Calorie & Macro Calculator
```js
function calculateNutrition(member) {
  const { weight, height, age, gender, goal, fitnessLevel } = member;

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multiplier
  const activityMap = {
    beginner: 1.375,      // lightly active
    intermediate: 1.55,   // moderately active
    advanced: 1.725       // very active
  };
  const tdee = bmr * activityMap[fitnessLevel];

  // Goal adjustment
  const calorieAdjust = {
    weight_loss: -500,
    muscle_gain: +300,
    endurance: +100,
    general_fitness: 0
  };
  const targetCalories = Math.round(tdee + calorieAdjust[goal]);

  // Macro split
  const macros = {
    weight_loss: { protein: 0.35, carbs: 0.35, fat: 0.30 },
    muscle_gain: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    endurance:   { protein: 0.20, carbs: 0.55, fat: 0.25 },
    general_fitness: { protein: 0.25, carbs: 0.45, fat: 0.30 }
  };
  const split = macros[goal];

  return {
    calories: targetCalories,
    protein: Math.round((targetCalories * split.protein) / 4),  // g
    carbs: Math.round((targetCalories * split.carbs) / 4),      // g
    fat: Math.round((targetCalories * split.fat) / 9),          // g
    water: Math.round(weight * 0.033 * 10) / 10                 // liters
  };
}
```

---

## 4. OpenAI Integration (Optional Enhancement)

### System Prompt Template
```
You are FitBot, a certified personal trainer AI assistant for GymFlow Pro gym management platform.

Member Profile:
- Name: {firstName}
- Goal: {goal}
- Fitness Level: {fitnessLevel}
- Current Streak: {streak} days
- Last Workout: {lastWorkoutDate} ({lastWorkoutLabel})
- Missed Sessions This Week: {missedSessions}

Recent Performance:
{recentWorkoutSummary}

Your task: Suggest today's workout in a motivating, coach-like tone.
- Be specific about exercises, sets, and reps
- Reference their recent performance
- Keep it under 200 words
- End with a motivational tagline
```

### API Call Pattern
```js
// services/ai.service.js
async function getAIWorkoutSuggestion(memberId) {
  const member = await getMemberContext(memberId);
  
  // Rule-based first (no cost)
  const ruleBasedSuggestion = await getRuleBasedSuggestion(member);
  
  if (!process.env.OPENAI_API_KEY) {
    return ruleBasedSuggestion;
  }

  // Enhance with OpenAI if available
  const prompt = buildWorkoutPrompt(member, ruleBasedSuggestion);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: FITBOT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.7
  });

  return {
    ...ruleBasedSuggestion,
    aiMessage: response.choices[0].message.content,
    model: 'gpt-4o-mini'
  };
}
```

---

## 5. AI Response Schema
```json
{
  "type": "workout_suggestion",
  "muscleGroupFocus": "chest",
  "rationale": "You trained back & legs yesterday. Time for push muscles.",
  "workout": {
    "label": "Push Day — Chest & Shoulders",
    "estimatedDuration": 55,
    "exercises": [
      {
        "exerciseId": "...",
        "name": "Bench Press",
        "sets": 4,
        "reps": "8-10",
        "suggestedWeight": 80,
        "previousBest": "75kg × 10",
        "progressionNote": "Try 80kg — you completed 75kg × 10 last session!"
      }
    ]
  },
  "aiMessage": "💪 You've been crushing it with a 12-day streak! Let's keep that fire going...",
  "recoveryScore": 8.5,
  "warningFlags": []
}
```

---

## 6. Recovery & Overtraining Detection
```js
function assessRecoveryScore(recentLogs, attendance) {
  const flags = [];
  
  // Check consecutive high-intensity days
  const last3Days = recentLogs.slice(0, 3);
  const avgIntensity = last3Days.reduce((sum, log) => {
    return sum + (log.totalVolume / log.duration);
  }, 0) / last3Days.length;

  if (avgIntensity > 500) flags.push('HIGH_INTENSITY_STREAK');

  // Check sleep/rest gap
  const hoursSinceLastWorkout = 
    (Date.now() - new Date(attendance.lastCheckin)) / 3600000;
  
  if (hoursSinceLastWorkout < 16) {
    flags.push('INSUFFICIENT_REST');
  }

  // Recovery score: 10 = fully recovered, 1 = needs rest
  const score = Math.max(1, 10 - flags.length * 3);
  return { score, flags };
}
```
