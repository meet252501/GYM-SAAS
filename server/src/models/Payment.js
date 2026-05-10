const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: String,
  type: { type: String, enum: ['membership', 'class', 'product', 'refund', 'other'], default: 'membership' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  gateway: { type: String, enum: ['stripe', 'razorpay', 'cash', 'upi', 'card'], default: 'cash' },
  gatewayTransactionId: String,
  receipt: String,
  membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
  discountAmount: { type: Number, default: 0 },
  notes: String,
  paidAt: Date
}, { timestamps: true });

paymentSchema.index({ gymId: 1, createdAt: -1 });
paymentSchema.index({ memberId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
