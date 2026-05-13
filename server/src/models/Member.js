const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },

  // Personal
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  photo: { type: String, default: '' },
  accessPin: { type: String, unique: true, sparse: true },

  // Emergency
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },

  // Fitness
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
    default: 'general_fitness'
  },
  fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },

  // Metrics snapshot
  currentMetrics: {
    weight: Number,
    height: Number,
    bmi: Number,
    bodyFatPercent: Number,
    updatedAt: Date
  },
  weightHistory: [{
    weight: Number,
    date: { type: Date, default: Date.now }
  }],

  // Member card
  memberId: { type: String, unique: true },

  // Membership
  currentMembershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
  membershipStatus: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'trial'],
    default: 'trial'
  },
  membershipExpiry: Date,

  // Gamification
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastCheckIn: Date
  },
  totalPoints: { type: Number, default: 0 },
  totalWorkouts: { type: Number, default: 0 },

  joinedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

  // Settings
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    healthSync: { type: Boolean, default: false }
  },

  // AI Usage Tracking
  aiUsage: {
    dailyCount: { type: Number, default: 0 },
    lastUsedDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },

  // Assigned Workouts / Programs
  assignedProtocol: {
    source: { type: String, enum: ['ai', 'coach', 'custom'], default: 'custom' },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    lastUpdated: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Virtual full name
memberSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Auto-generate member ID and PIN
memberSchema.pre('save', async function (next) {
  if (this.isNew) {
    if (!this.memberId) {
      const count = await mongoose.model('Member').countDocuments({ gymId: this.gymId });
      const year = new Date().getFullYear();
      this.memberId = `GF-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    
    if (!this.accessPin) {
      // Generate unique 4-digit PIN
      let pin;
      let exists = true;
      while (exists) {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        const found = await mongoose.model('Member').findOne({ accessPin: pin });
        if (!found) exists = false;
      }
      this.accessPin = pin;
    }
  }
  next();
});

memberSchema.index({ gymId: 1, membershipStatus: 1 });
memberSchema.index({ membershipExpiry: 1 });

module.exports = mongoose.model('Member', memberSchema);
