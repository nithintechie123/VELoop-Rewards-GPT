import mongoose from 'mongoose';

const GiveawayParticipationSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  giveawayId: { type: String, required: true, index: true },
  giveawayTitle: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  userFullName: { type: String, required: true },
  entryType: { type: String, default: 'free', enum: ['free', 'paid', 'booster', 'promo'] },
  ticketCount: { type: Number, default: 1 },
  feeCharged: { type: Number, default: 0 },
  feeUnit: { type: String, default: 'VEs' },
  ipAddress: { type: String },
  userAgent: { type: String },
  allocatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const GiveawayParticipation = mongoose.models.GiveawayParticipation || mongoose.model('GiveawayParticipation', GiveawayParticipationSchema);
