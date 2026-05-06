const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutProgram' },
  date: { type: Date, required: true, default: Date.now },
  label: String,
  duration: Number,
  notes: String,
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    exerciseName: String,
    sets: [{
      setNumber: Number,
      reps: Number,
      weight: Number,
      rpe: Number,
      isWarmup: { type: Boolean, default: false },
      isPR: { type: Boolean, default: false },
      completedAt: Date
    }]
  }],
  totalVolume: { type: Number, default: 0 },
  caloriesBurned: Number,
  mood: { type: String, enum: ['terrible', 'bad', 'okay', 'good', 'great'] }
}, { timestamps: true });

workoutLogSchema.index({ memberId: 1, date: -1 });
workoutLogSchema.index({ gymId: 1, date: -1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
