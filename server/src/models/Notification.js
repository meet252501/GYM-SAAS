const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  type: {
    type: String,
    enum: [
      'membership_expiry', 'payment_success', 'payment_failed',
      'class_reminder', 'class_cancelled', 'birthday',
      'pr_achieved', 'badge_earned', 'streak_milestone',
      'challenge_completed', 'checkin_success', 'system'
    ]
  },
  title: String,
  message: String,
  data: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
