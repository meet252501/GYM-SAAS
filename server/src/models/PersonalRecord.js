const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: String,
  
  value: { type: Number, required: true }, // weight in kg or time in seconds
  reps: { type: Number, default: 1 },
  type: { type: String, enum: ['1rm', 'max_reps', 'timed'], default: '1rm' },
  
  logId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutLog' },
  achievedAt: { type: Date, default: Date.now }
}, { timestamps: true });

personalRecordSchema.index({ memberId: 1, exerciseId: 1 });

module.exports = mongoose.model('PersonalRecord', personalRecordSchema);
