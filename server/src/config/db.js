const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  try {
    if (process.env.USE_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Memory Server Connected: ${conn.connection.host}`);
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (retryCount > 0) {
      console.log(`⚠️ MongoDB Connection failed. Retrying in 5s... (${retryCount} retries left)`);
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.error(`❌ MongoDB Error: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
