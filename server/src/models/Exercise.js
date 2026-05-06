const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'sport'],
    default: 'strength'
  },
  primaryMuscle: [String],
  secondaryMuscle: [String],
  equipment: [String],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  instructions: [String],
  tips: [String],
  videoUrl: String,
  imageUrl: String,
  isCustom: { type: Boolean, default: false },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }
}, { timestamps: true });

exerciseSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ name: 'text' });

module.exports = mongoose.model('Exercise', exerciseSchema);
