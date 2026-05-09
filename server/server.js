require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Initialize cron jobs for membership expiry alerting & status updates
  const { initCronJobs } = require('./src/jobs/cron');
  initCronJobs();

  app.listen(PORT, () => {
    console.log(`🚀 GymFlow Pro API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
