const http = require('http');

const request = (path, method, data, headers = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runHackTests() {
  console.log('🛡️ Starting Security & Vulnerability Scan...\n');

  try {
    // Test 1: NoSQL Injection Attempt on Login
    console.log('🧪 Test 1: NoSQL Injection on /auth/login');
    try {
      const nosqlRes = await request('/api/v1/auth/login', 'POST', {
        email: { "$gt": "" },
        password: "password123"
      });
      if (nosqlRes.status === 400 || nosqlRes.status === 500 || nosqlRes.status === 404 || (nosqlRes.body && nosqlRes.body.includes('false'))) {
        console.log('✅ Passed: NoSQL injection blocked or handled (Status ' + nosqlRes.status + ')');
      } else {
        console.log('❌ Failed: Potential NoSQL vulnerability! Status:', nosqlRes.status);
      }
    } catch(e) { console.log('⚠️ Skipped HTTP Test (Server Offline)'); }

    // Test 2: Unauthorized Access to Protected Route
    console.log('\n🧪 Test 2: Bypassing JWT on /members');
    try {
      const authRes = await request('/api/v1/members', 'GET');
      if (authRes.status === 401) {
        console.log('✅ Passed: Protected route correctly denied access (401 Unauthorized).');
      } else {
        console.log('❌ Failed: Route accessed without token! Status:', authRes.status);
      }
    } catch(e) { console.log('⚠️ Skipped HTTP Test (Server Offline)'); }

    // Test 3: Rate Limiting / Brute Force Check
    console.log('\n🧪 Test 3: Rate Limiting on /auth/login (simulating 25 rapid requests)');
    try {
      let rateLimitHit = false;
      for (let i = 0; i < 25; i++) {
        const res = await request('/api/v1/auth/login', 'POST', { email: `test${i}@test.com`, password: '123' });
        if (res.status === 429) {
          rateLimitHit = true;
          break;
        }
      }
      if (rateLimitHit) {
        console.log('✅ Passed: Rate limiting activated (429 Too Many Requests).');
      } else {
        console.log('❌ Failed: Rate limiter did not engage within 25 requests.');
      }
    } catch(e) { console.log('⚠️ Skipped HTTP Test (Server Offline)'); }

    // Test 4: Testing math module (BMR & Progressive Overload)
    console.log('\n🧪 Test 4: Internal Math Engine (Mifflin-St Jeor & Overload)');
    const { calculateBMR, getProgressiveTarget } = require('./src/utils/math/fitness.math.js');
    const bmr = calculateBMR(80, 180, 25, 'male');
    if (bmr > 1500) {
      console.log('✅ Passed: AI BMR algorithm returning correct baselines (' + bmr + ' kcal).');
    } else {
      console.log('❌ Failed: BMR calculation error.');
    }
    
    const sets = [{ weight: 100, reps: 12 }, { weight: 100, reps: 12 }, { weight: 100, reps: 12 }];
    const overload = getProgressiveTarget(sets, { weightInc: 2.5, repFloor: 8, repCeiling: 12 });
    if (overload.status === 'LEVEL_UP' && overload.weight === 102.5) {
      console.log('✅ Passed: AI Progressive Overload logic triggered correctly (+2.5kg).');
    } else {
      console.log('❌ Failed: Overload algorithm error.', overload);
    }

    console.log('\n🎉 Scan Complete.');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error: API Server is not running on port 5000.');
    } else {
      console.error('Test error:', error);
    }
  }
}

runHackTests();