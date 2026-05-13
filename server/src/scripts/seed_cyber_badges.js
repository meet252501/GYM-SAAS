const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const { Badge } = require('../models/Badge');

const cyberBadges = [
  { name: 'Neural Link Initiated', description: 'Complete your first synchronized workout session.', icon: '🔌', category: 'milestone', criteriaType: 'workout_count', criteriaThreshold: 1, points: 50, rarity: 'common' },
  { name: 'Data Master', description: 'Log 50 exercises in the evolution vault.', icon: '💾', category: 'workout', criteriaType: 'exercise_log_count', criteriaThreshold: 50, points: 200, rarity: 'rare' },
  { name: 'Matrix Breaker', description: 'Maintain a 30-day training streak.', icon: '🕶️', category: 'attendance', criteriaType: 'streak_days', criteriaThreshold: 30, points: 500, rarity: 'epic' },
  { name: 'Cyber Titan', description: 'Reach the top 1% of the gym leaderboard.', icon: '🤖', category: 'milestone', criteriaType: 'rank_percentile', criteriaThreshold: 1, points: 1000, rarity: 'legendary' },
  { name: 'Protocol Overload', description: 'Lift 10,000kg in total cumulative weight.', icon: '⚡', category: 'workout', criteriaType: 'total_weight', criteriaThreshold: 10000, points: 300, rarity: 'rare' }
];

const seedBadges = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gymflow';
    await mongoose.connect(mongoUri);
    console.log('🚀 Connected to MongoDB for Cyber Badge Seeding');

    for (const b of cyberBadges) {
      await Badge.findOneAndUpdate(
        { name: b.name },
        b,
        { upsert: true, new: true }
      );
    }

    console.log('✨ Cyber Badges Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedBadges();
