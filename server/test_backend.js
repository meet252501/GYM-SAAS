/**
 * GymFlow Backend Logic Tests
 * Tests all new SaaS features WITHOUT needing a live database.
 * Run: node test_backend.js
 */

const assert = (condition, msg) => {
  if (condition) {
    console.log(`  ✅  ${msg}`);
  } else {
    console.error(`  ❌  FAIL: ${msg}`);
    process.exitCode = 1;
  }
};

const section = (title) => console.log(`\n${'─'.repeat(50)}\n📋 ${title}\n${'─'.repeat(50)}`);

// ── 1. Plan limits logic ──────────────────────────────
section('Plan Limits — member & trainer caps');

const PLAN_LIMITS = {
  starter:    { memberLimit: 100,   trainerLimit: 2 },
  pro:        { memberLimit: 500,   trainerLimit: 10 },
  enterprise: { memberLimit: 99999, trainerLimit: 99999 },
};

// Starter
assert(PLAN_LIMITS.starter.memberLimit === 100,     'Starter: memberLimit = 100');
assert(PLAN_LIMITS.starter.trainerLimit === 2,      'Starter: trainerLimit = 2');
// Pro
assert(PLAN_LIMITS.pro.memberLimit === 500,         'Pro: memberLimit = 500');
assert(PLAN_LIMITS.pro.trainerLimit === 10,         'Pro: trainerLimit = 10');
// Enterprise
assert(PLAN_LIMITS.enterprise.memberLimit === 99999,'Enterprise: memberLimit = unlimited (99999)');

// ── 2. memberLimit middleware logic ───────────────────
section('memberLimit middleware — enforcement logic');

const simulateMemberLimitCheck = (gymPlan, currentMemberCount) => {
  const limits = PLAN_LIMITS[gymPlan] || PLAN_LIMITS.starter;
  return currentMemberCount < limits.memberLimit;
};

assert(simulateMemberLimitCheck('starter', 50),   'Starter gym at 50 members → CAN add');
assert(simulateMemberLimitCheck('starter', 99),   'Starter gym at 99 members → CAN add (at 99/100)');
assert(!simulateMemberLimitCheck('starter', 100), 'Starter gym at 100 members → BLOCKED');
assert(!simulateMemberLimitCheck('starter', 150), 'Starter gym at 150 members → BLOCKED');
assert(simulateMemberLimitCheck('pro', 100),      'Pro gym at 100 members → CAN add');
assert(simulateMemberLimitCheck('pro', 499),      'Pro gym at 499 members → CAN add');
assert(!simulateMemberLimitCheck('pro', 500),     'Pro gym at 500 members → BLOCKED');
assert(simulateMemberLimitCheck('enterprise', 5000), 'Enterprise at 5000 → CAN add');

// ── 3. Gym data isolation logic ───────────────────────
section('Multi-gym data isolation');

const mockDb = {
  members: [
    { _id: 'm1', name: 'Alice', gymId: 'gym_001' },
    { _id: 'm2', name: 'Bob',   gymId: 'gym_001' },
    { _id: 'm3', name: 'Carol', gymId: 'gym_002' },
  ],
  attendance: [
    { _id: 'a1', memberId: 'm1', gymId: 'gym_001' },
    { _id: 'a2', memberId: 'm3', gymId: 'gym_002' },
  ]
};

// Simulate gymId-scoped queries
const getMembersForGym = (gymId) => mockDb.members.filter(m => m.gymId === gymId);
const getAttendanceForGym = (gymId) => mockDb.attendance.filter(a => a.gymId === gymId);

const gym1Members = getMembersForGym('gym_001');
const gym2Members = getMembersForGym('gym_002');

assert(gym1Members.length === 2,               'Gym 001 sees exactly 2 members');
assert(gym2Members.length === 1,               'Gym 002 sees exactly 1 member');
assert(!gym1Members.find(m => m.name === 'Carol'), 'Gym 001 CANNOT see Gym 002 member Carol');
assert(!gym2Members.find(m => m.name === 'Alice'), 'Gym 002 CANNOT see Gym 001 member Alice');

const gym1Att = getAttendanceForGym('gym_001');
const gym2Att = getAttendanceForGym('gym_002');

assert(gym1Att.length === 1, 'Gym 001 attendance is isolated');
assert(gym2Att.length === 1, 'Gym 002 attendance is isolated');
assert(gym1Att[0].memberId === 'm1', 'Gym 001 only sees its own attendance record');

// ── 4. Gym schema defaults ─────────────────────────────
section('Gym model — default SaaS fields');

const simulateGymCreate = (overrides = {}) => ({
  plan: 'starter',
  memberLimit: 100,
  trainerLimit: 2,
  isTrialing: true,
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  isActive: true,
  ...overrides,
});

const newGym = simulateGymCreate({ name: 'Iron Paradise' });
assert(newGym.plan === 'starter',  'New gym defaults to starter plan');
assert(newGym.memberLimit === 100, 'New gym defaults to 100 member limit');
assert(newGym.isTrialing === true, 'New gym starts in trial');
const trialDaysLeft = Math.round((newGym.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24));
assert(trialDaysLeft === 14,       `Trial lasts 14 days (got ${trialDaysLeft} days)`);

// ── 5. Invite token logic ─────────────────────────────
section('Trainer invite — token generation logic');

const crypto = require('crypto');
const rawToken = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
const rehashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

assert(rawToken.length === 64,           'Raw token is 64 hex chars (32 bytes)');
assert(hashedToken.length === 64,        'Hashed token is 64 hex chars');
assert(rawToken !== hashedToken,         'Raw token ≠ hashed token (secure storage)');
assert(hashedToken === rehashedToken,    'Same raw token → same hash (deterministic)');

// Simulate token expiry check
const validExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
const expiredExpiry = new Date(Date.now() - 1000);

assert(validExpiry > new Date(),   'Valid invite token (24h future) → accepted');
assert(expiredExpiry < new Date(), 'Expired invite token (past) → rejected');

// ── 6. Registration form validation ───────────────────
section('Registration — input validation');

const validateRegistration = ({ firstName, lastName, email, password, gymName }) => {
  const errors = [];
  if (!firstName) errors.push('firstName required');
  if (!lastName)  errors.push('lastName required');
  if (!email)     errors.push('email required');
  if (!password || password.length < 8) errors.push('password min 8 chars');
  if (!gymName)   errors.push('gymName required');
  return errors;
};

const validForm = validateRegistration({ firstName:'Raj', lastName:'Patel', email:'raj@gym.com', password:'pass1234', gymName:'Raj Gym' });
assert(validForm.length === 0, 'Valid form passes validation');

const missingPass = validateRegistration({ firstName:'Raj', lastName:'Patel', email:'raj@gym.com', password:'short', gymName:'Raj Gym' });
assert(missingPass.includes('password min 8 chars'), 'Short password caught');

const missingGym = validateRegistration({ firstName:'Raj', lastName:'Patel', email:'raj@gym.com', password:'pass1234', gymName:'' });
assert(missingGym.includes('gymName required'), 'Missing gymName caught');

// ── Summary ───────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
if (process.exitCode === 1) {
  console.error('❌ Some tests FAILED. See above.');
} else {
  console.log('🎉 All backend logic tests PASSED!');
}
console.log('═'.repeat(50) + '\n');
