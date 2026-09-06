import mongoose from 'mongoose';

const GiveawayWinnerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  giveawayId: { type: String, index: true },
  giveawayName: { type: String, required: true },
  userId: { type: String, index: true },
  user: { type: String, required: true }, // Masked handle e.g. VE****82
  prize: { type: String, required: true },
  prizeType: { type: String, default: 'PHYSICAL', enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL_KEY', 'EXPERIENCE'] },
  val: { type: String, default: '₹0' },
  ticket: { type: String, required: true, index: true },
  date: { type: String, default: '' },
  category: { type: String, default: 'Tech' },
  status: { type: String, default: 'Delivered & Verified' },
  tracking: { type: String },
  drawProof: {
    serverSeedHash: { type: String },
    serverSeedUnmasked: { type: String },
    clientSeed: { type: String },
    nonce: { type: Number, default: 1 },
    resultHash: { type: String },
    winningIndex: { type: Number }
  }
}, {
  timestamps: true
});

export const GiveawayWinner = mongoose.models.GiveawayWinner || mongoose.model('GiveawayWinner', GiveawayWinnerSchema);
