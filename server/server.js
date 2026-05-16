require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  if (process.env.USE_MEMORY_DB === 'true') {
    try {
      const runSeed = require('./src/seeds/seed');
      await runSeed();
      console.log('✅ Memory DB seeded successfully');
    } catch (seedErr) {
      console.error('❌ Memory DB seeding failed:', seedErr);
    }
  }
  
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' }
  });
  global.io = io;

  io.on('connection', (socket) => {
    socket.on('join_gym', (gymId) => socket.join(gymId.toString()));
  });

  // Initialize cron jobs
  const { initCronJobs } = require('./src/jobs/cron');
  initCronJobs();

  server.listen(PORT, () => {
    console.log(`🚀 GymFlow Pro Server + Socket running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
