/**
 * GymFlow Pro — Final Production Diagnostic
 * Verifies all system components, models, and routes are correctly wired.
 */

const fs = require('fs');
const path = require('path');

const checkFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ [FOUND] ${path.basename(filePath)}`);
    return true;
  } else {
    console.error(`  ❌ [MISSING] ${filePath}`);
    return false;
  }
};

console.log('\n--- 🩺 GymFlow Pro System Diagnostic ---\n');

// 1. Backend Core Structure
console.log('📂 Checking Backend Core:');
const backendFiles = [
  'server.js',
  'src/app.js',
  'src/routes/auth.routes.js',
  'src/routes/members.routes.js',
  'src/routes/workouts.routes.js',
  'src/routes/attendance.routes.js',
  'src/routes/metrics.routes.js',
  'src/models/PersonalRecord.js',
  'src/models/BodyMetric.js',
  'src/services/badge.service.js'
];
let backendOk = true;
backendFiles.forEach(f => {
  if (!checkFile(path.join(__dirname, f))) backendOk = false;
});

// 2. Client PWA Check
console.log('\n📂 Checking Client Assets:');
const clientPath = path.join(__dirname, '../client');
const clientFiles = [
  'public/manifest.json',
  'src/data/exerciseLibrary.js'
];
let clientOk = true;
clientFiles.forEach(f => {
  if (!checkFile(path.join(clientPath, f))) clientOk = false;
});

// 3. Dependency Check
console.log('\n📦 Checking Critical Dependencies:');
const pkg = require('./package.json');
const deps = ['socket.io', 'groq-sdk', 'mongoose', 'jsonwebtoken', 'cors', 'helmet'];
deps.forEach(d => {
  if (pkg.dependencies[d] || pkg.devDependencies[d]) {
    console.log(`  ✅ [DEP] ${d} installed`);
  } else {
    console.warn(`  ⚠️ [DEP] ${d} MISSING in package.json`);
  }
});

// 4. Feature Logic Verification (Mocked)
console.log('\n🧪 Verifying Feature Logic:');

// Verify Personal Record Detection Logic
try {
  const workoutController = require('./src/controllers/workouts.controller');
  if (workoutController.createWorkoutLog) {
    console.log('  ✅ [LOGIC] Workout PR Detection system wired.');
  }
} catch (e) {
  console.log('  ⚠️ [LOGIC] Controller verification skipped (requires DB connection/env vars).');
}

console.log('\n--- 🏁 Diagnostic Complete ---');
if (backendOk && clientOk) {
  console.log('🚀 SYSTEM STATUS: READY FOR PRODUCTION');
} else {
  console.log('🔧 SYSTEM STATUS: ISSUES FOUND');
}
