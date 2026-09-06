import mongoose from 'mongoose';

const PrizeSchema = new mongoose.Schema({
  prizeId: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  tier: { type: String, default: '1st Prize' },
  position: { type: Number, default: 1 },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  model: { type: String, default: '' },
  winnerCount: { type: Number, default: 1 },
  type: { type: String, default: 'physical', enum: ['physical', 'digital', 'experience'] },
  prizeType: { type: String, default: 'PHYSICAL', enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL_KEY', 'EXPERIENCE'] },
  claimType: { type: String, default: 'shipping_address' },
  value: { type: String, default: '₹0' },
  valueUSD: { type: Number, default: 0 },
  entryFee: { type: Number, default: 250 },
  entryFeeUnit: { type: String, default: 'VEs', enum: ['VEs', 'SVEs', 'Tokens'] },
  isGiftCard: { type: Boolean, default: false },
  isInstantWin: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Prize = mongoose.models.Prize || mongoose.model('Prize', PrizeSchema);
