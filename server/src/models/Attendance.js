const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  method: { type: String, enum: ['qr_scan', 'manual', 'class_booking'], default: 'manual' },
  checkedInAt: { type: Date, required: true, default: Date.now },
  checkedOutAt: Date,
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

attendanceSchema.index({ gymId: 1, checkedInAt: -1 });
attendanceSchema.index({ memberId: 1, checkedInAt: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
