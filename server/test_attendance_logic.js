const NodeCache = require('node-cache');
const crypto = require('crypto');

// Create a mock cache just like the backend
const kioskPinCache = new NodeCache({ stdTTL: 30 }); // 30 seconds TTL

// Mock Gym ID
const gymId = 'gym_123';

console.log('--- 🏋️‍♂️ GymFlow Attendance Terminal Logic Test ---');

// 1. Generate PIN (simulating getKioskPin)
const generatePin = () => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  kioskPinCache.set(gymId, pin);
  return pin;
};

const activePin = generatePin();
console.log(`[KIOSK] Generated New 30-Second PIN: ${activePin}`);

// 2. Simulate User entering the WRONG PIN
const wrongPin = '000000';
console.log(`\n[USER] Attempting Check-in with PIN: ${wrongPin}`);
if (kioskPinCache.get(gymId) !== wrongPin) {
  console.log(`❌ FAILED: Invalid or Expired PIN.`);
}

// 3. Simulate User entering the CORRECT PIN
console.log(`\n[USER] Attempting Check-in with PIN: ${activePin}`);
if (kioskPinCache.get(gymId) === activePin) {
  console.log(`✅ SUCCESS: PIN Verified! Proceeding to log attendance...`);
  // Clear pin so it can't be reused immediately by someone else? 
  // Actually, wait, does the backend clear the PIN upon successful checkin?
  // Let's assume it allows multiple checkins in that 30 seconds for different users.
  console.log(`[SYSTEM] Attendance record would be created for User in Gym: ${gymId}`);
}

// 4. Simulate Expiration (Waiting 32 seconds normally, we'll just flush it here)
console.log(`\n[SYSTEM] Simulating 30 seconds passing... PIN expires.`);
kioskPinCache.flushAll();

console.log(`\n[USER] Attempting Check-in with expired PIN: ${activePin}`);
if (kioskPinCache.get(gymId) !== activePin) {
  console.log(`❌ FAILED: Invalid or Expired PIN (Timeout).`);
}

console.log('\n--- Test Complete ---');
