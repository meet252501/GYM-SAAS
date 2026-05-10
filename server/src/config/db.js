const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  try {
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
