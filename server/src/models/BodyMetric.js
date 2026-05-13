const mongoose = require('mongoose');

const bodyMetricSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  
  weight: Number,
  height: Number,
  bmi: Number,
  bodyFatPercent: Number,
  
  // Measurements (cm)
  chest: Number,
  waist: Number,
  hips: Number,
  arms: Number,
  thighs: Number,
  
  photo: String,
  notes: String,
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

bodyMetricSchema.index({ memberId: 1, recordedAt: -1 });

module.exports = mongoose.model('BodyMetric', bodyMetricSchema);
