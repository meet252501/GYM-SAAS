const mongoose = require('mongoose');

const gymClassSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['yoga', 'hiit', 'zumba', 'spinning', 'boxing', 'pilates', 'strength', 'other'],
    default: 'other'
  },
  duration: Number,
  capacity: { type: Number, required: true, default: 20 },
  location: String,
  color: { type: String, default: '#F59E0B' },
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const classSessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'GymClass', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startsAt: { type: Date, required: true },
  endsAt: Date,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  bookedCount: { type: Number, default: 0 },
  capacity: Number,
  cancelReason: String
}, { timestamps: true });

classSessionSchema.index({ gymId: 1, startsAt: 1 });

const classBookingSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  status: {
    type: String,
    enum: ['booked', 'waitlisted', 'cancelled', 'attended', 'no_show'],
    default: 'booked'
  },
  bookedAt: { type: Date, default: Date.now },
  cancelledAt: Date
}, { timestamps: true });

const GymClass = mongoose.model('GymClass', gymClassSchema);
const ClassSession = mongoose.model('ClassSession', classSessionSchema);
const ClassBooking = mongoose.model('ClassBooking', classBookingSchema);

module.exports = { GymClass, ClassSession, ClassBooking };
