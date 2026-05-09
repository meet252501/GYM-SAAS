const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  name:     { type: String, required: true },
  brand:    { type: String, default: '' },
  barcode:  { type: String, default: '' },
  servingSize:  { type: Number, required: true },   // grams
  servingsEaten:{ type: Number, required: true, default: 1 },
  // per serving values:
  calories: { type: Number, required: true },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  fiber:    { type: Number, default: 0 },
  meal:     { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], default: 'snack' },
  loggedAt: { type: Date, default: Date.now },
});

const foodLogSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  gymId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Gym',    required: true, index: true },
  date:     { type: String, required: true, index: true }, // YYYY-MM-DD
  entries:  [foodEntrySchema],
  goal: {
    calories: { type: Number, default: 2000 },
    protein:  { type: Number, default: 150 },
    carbs:    { type: Number, default: 250 },
    fat:      { type: Number, default: 65 },
  },
}, { timestamps: true });

// Unique log per member per day
foodLogSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FoodLog', foodLogSchema);
