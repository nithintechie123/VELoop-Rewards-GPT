import mongoose from 'mongoose';

/**
 * GiveawayParticipation Schema
 *
 * Requirement 62: Participation Model Fields
 * - userId: authenticated user (from JWT, never from client body)
 * - giveawayId: the specific giveaway event this entry belongs to
 * - prizeId: the specific prize tier the user is entering for
 * - entryCurrency: the currency type used (VEs, SVEs, Tokens)
 * - entryAmount: the authoritative fee amount from the backend (never client-supplied)
 * - deviceHash: device fingerprint for same-device abuse detection
 * - status: confirmed, flagged_review, rejected, revoked
 * - joinedAt: timestamp of entry
 * - transactionId: reference to the corresponding GiveawayEntryTransaction
 *
 * Requirement 63: One User = One Participation Per Giveaway Event
 * The compound unique index on (userId, giveawayId) enforces this at the database level.
 * Once a giveaway ends, participationLockedAt is set on the Giveaway document.
 * New giveaway events create new Giveaway documents with new giveawayIds,
 * allowing fresh participation records without conflicting with prior events.
 */
const GiveawayParticipationSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  giveawayId: { type: String, required: true, index: true },
  giveawayTitle: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  userFullName: { type: String, required: true },

  // Requirement 62: Prize association
  prizeId: { type: String, index: true },

  // Requirement 62: Entry currency and authoritative amount (backend-determined, never client-supplied)
  entryCurrency: { type: String, default: 'VEs', enum: ['VEs', 'SVEs', 'Tokens'] },
  entryAmount: { type: Number, default: 0 },

  entryType: { type: String, default: 'free', enum: ['free', 'paid', 'booster', 'promo'] },
  ticketCount: { type: Number, default: 1 },
  feeCharged: { type: Number, default: 0 },
  feeUnit: { type: String, default: 'VEs' },

  // Requirement 62: Transaction ID reference
  transactionId: { type: String, index: true },

  idempotencyKey: { type: String, index: true },
  deviceHash: { type: String, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, default: 'confirmed', enum: ['confirmed', 'flagged_review', 'rejected', 'revoked'] },

  // Requirement 62: joinedAt timestamp
  joinedAt: { type: Date, default: Date.now },
  allocatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Requirement 62 & 63: Database-Level Compound Unique Index
// Guarantees at the database engine level that a user cannot have multiple participation
// records for the same giveaway event. This is the primary enforcement of the
// "one user = one participation per giveaway" business rule.
GiveawayParticipationSchema.index({ userId: 1, giveawayId: 1 }, { unique: true });

// Requirement 23: Device-Level Index for Same-Device Abuse Detection
GiveawayParticipationSchema.index({ deviceHash: 1, giveawayId: 1 });

export const GiveawayParticipation = mongoose.models.GiveawayParticipation || mongoose.model('GiveawayParticipation', GiveawayParticipationSchema);
