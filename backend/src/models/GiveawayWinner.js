import mongoose from 'mongoose';

/**
 * GiveawayWinner Schema (Requirement 31: Winner Integrity)
 * Stores immutable finalized winner records associated with the giveaway, prize, user, and selection metadata.
 * Compound unique index on (giveawayId, prizeId) prevents accidental duplicate winner records.
 */
const GiveawayWinnerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  giveawayId: { type: String, required: true, index: true },
  giveawayName: { type: String },
  giveawayTitle: { type: String },
  prizeId: { type: String, required: true, index: true },
  prizeTitle: { type: String },
  prizeType: { type: String, default: 'PHYSICAL', enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL_KEY', 'EXPERIENCE'] },
  prizeValue: { type: String, default: '₹0' },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  userAvatar: { type: String },
  userLocation: { type: String },
  ticketNumber: { type: String, required: true, index: true },
  winningTicketId: { type: String },
  selectionMethod: { type: String, default: 'PROVABLY_FAIR_SHA256', enum: ['PROVABLY_FAIR_SHA256', 'CRYPTOGRAPHIC_RNG', 'MANUAL_AUDIT'] },
  selectedAt: { type: String, default: () => new Date().toISOString() },
  wonAt: { type: String, default: () => new Date().toISOString() },
  status: { type: String, default: 'CONFIRMED', enum: ['CONFIRMED', 'PENDING_CLAIM', 'CLAIMED', 'PROCESSING', 'DELIVERED', 'REVOKED'] },
  claimed: { type: Boolean, default: false },
  claimStatus: { type: String, default: 'unclaimed' },
  trackingNumber: { type: String },
  isSpotlight: { type: Boolean, default: false },
  serverSeed: { type: String },
  serverSeedHash: { type: String },
  clientSeed: { type: String },
  resultHash: { type: String },
  winningIndex: { type: Number },
  proof: {
    serverSeedHashed: { type: String },
    serverSeedUnmasked: { type: String },
    clientSeed: { type: String },
    nonce: { type: Number, default: 1 },
    winningIndex: { type: Number },
    totalEligibleTickets: { type: Number },
    resultHash: { type: String }
  }
}, {
  timestamps: true
});

// Compound Unique Index: Strictly prevents duplicate winner records for the same giveaway prize
GiveawayWinnerSchema.index({ giveawayId: 1, prizeId: 1 }, { unique: true });
// Secondary Unique Index: Strictly prevents the same ticket winning multiple times
GiveawayWinnerSchema.index({ giveawayId: 1, ticketNumber: 1 }, { unique: true, sparse: true });

export const GiveawayWinner = mongoose.models.GiveawayWinner || mongoose.model('GiveawayWinner', GiveawayWinnerSchema);
