const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'IN' }
  },
  phone: String,
  email: String,
  website: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    workingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' }
    }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);
