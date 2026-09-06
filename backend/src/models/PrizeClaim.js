import mongoose from 'mongoose';

const PrizeClaimSchema = new mongoose.Schema({
  giveawayId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  userFullName: { type: String, required: true },
  prize: { type: String, required: true },
  prizeType: { type: String, required: true, enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL_KEY', 'EXPERIENCE'] },
  ticket: { type: String, required: true },
  trackingNumber: { type: String, required: true, unique: true },
  status: { type: String, default: 'submitted', enum: ['submitted', 'processing', 'completed', 'expired'] },
  claimDetails: {
    fullName: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pin: { type: String },
    digitalEmail: { type: String },
    gamerTag: { type: String },
    notes: { type: String }
  },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const PrizeClaim = mongoose.models.PrizeClaim || mongoose.model('PrizeClaim', PrizeClaimSchema);
