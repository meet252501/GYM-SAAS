const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  description: String,
  duration: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['day', 'week', 'month', 'year'], default: 'month' }
  },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  features: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const membershipSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
  planName: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'paused'],
    default: 'active'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  amount: Number,
  autoRenew: { type: Boolean, default: false },
  notes: String
}, { timestamps: true });

membershipSchema.index({ memberId: 1, status: 1 });
membershipSchema.index({ endDate: 1 });

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
const Membership = mongoose.model('Membership', membershipSchema);

module.exports = { MembershipPlan, Membership };
