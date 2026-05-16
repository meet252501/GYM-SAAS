const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  logo: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'IN' }
  },
  phone: String,
  email: String,
  website: String,
  tagline: String,
  accentColor: { type: String, default: '#F59E0B' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ─── SaaS Plan ────────────────────────────────────────────────
  plan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
  memberLimit: { type: Number, default: 100 },
  trainerLimit: { type: Number, default: 2 },

  // ─── Trial ────────────────────────────────────────────────────
  isTrialing: { type: Boolean, default: true },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
  },

  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    workingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' }
    }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);
