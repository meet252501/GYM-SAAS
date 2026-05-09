const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { 
    type: String, 
    enum: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Keto', 'Vegan', 'Custom'], 
    default: 'Maintenance' 
  },
  calories: { type: Number, required: true },
  macros: {
    protein: { type: Number, default: 0 }, // in grams
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  meals: [{
    name: { type: String, required: true },
    time: String,
    items: [String],
    calories: Number
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
