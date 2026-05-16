const express = require('express');
const rateLimit = require('express-rate-limit');
const request = require('supertest');

const testApp = express();

const aiLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { success: false, message: 'AI limit reached (Rate Limited). Please try again in 15 minutes.' } 
});

testApp.use('/api/v1/ai', aiLimiter);
testApp.get('/api/v1/ai/test', (req, res) => res.json({ success: true }));

async function runTest() {
  console.log('--- 🛡️ Testing AI Rate Limiter (Max 10) ---');
  for (let i = 1; i <= 12; i++) {
    const res = await request(testApp).get('/api/v1/ai/test');
    if (res.status === 429) {
      console.log(`Request ${i}: ❌ BLOCKED (429 Too Many Requests) - SUCCESS`);
    } else {
      console.log(`Request ${i}: ✅ PASSED (200 OK)`);
    }
  }
}

runTest();
