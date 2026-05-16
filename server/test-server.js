const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const startTestServer = async () => {
  console.log('🚀 Starting In-Memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  console.log(`✅ In-Memory MongoDB started at: ${uri}`);

  // Seed the database
  const runSeed = require('./src/seeds/seed');
  console.log('🌱 Seeding database...');
  await runSeed();
  console.log('✅ Database seeded.');

  // Start the actual server
  require('./server');
};

startTestServer().catch(err => {
  console.error('❌ Failed to start test server:', err);
  process.exit(1);
});
