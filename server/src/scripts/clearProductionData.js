/**
 * clearProductionData.js
 * Wipes all test data — members, payments, attendance, memberships, gyms, users
 * Run: MONGO_URI="<your-atlas-uri>" node clearProductionData.js
 */
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is required. Set it as an env variable.');
  process.exit(1);
}

const COLLECTIONS_TO_DROP = [
  'members',
  'payments',
  'attendances',
  'memberships',
  'membershipplans',
  'users',
  'gyms',
  'workoutlogs',
  'notifications',
  'badges',
  'userbadges',
];

async function clearAll() {
  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  const db = mongoose.connection.db;
  const existing = (await db.listCollections().toArray()).map(c => c.name);

  for (const col of COLLECTIONS_TO_DROP) {
    if (existing.includes(col)) {
      await db.collection(col).deleteMany({});
      console.log(`🗑️  Cleared: ${col}`);
    } else {
      console.log(`⏭️  Skipped (not found): ${col}`);
    }
  }

  console.log('\n✅ All test data wiped. Database is clean and ready for real gyms!');
  await mongoose.disconnect();
}

clearAll().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
