const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  category: { type: String, enum: ['attendance', 'workout', 'social', 'milestone'] },
  criteriaType: String,
  criteriaThreshold: Number,
  points: { type: Number, default: 10 },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
}, { timestamps: true });

const memberBadgeSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
const MemberBadge = mongoose.model('MemberBadge', memberBadgeSchema);

module.exports = { Badge, MemberBadge };
