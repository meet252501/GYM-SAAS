const mongoose = require('mongoose');

const workoutProgramSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  goal: String,
  durationWeeks: Number,
  daysPerWeek: Number,
  weeks: [{
    weekNumber: Number,
    days: [{
      dayNumber: Number,
      label: String,
      isRest: { type: Boolean, default: false },
      exercises: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        exerciseName: String,
        sets: Number,
        reps: String,
        restSeconds: { type: Number, default: 90 },
        notes: String
      }]
    }]
  }],
  assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutProgram', workoutProgramSchema);
