import mongoose from 'mongoose';

/**
 * GiveawayEntryTransaction Schema
 *
 * Requirement 66: Balance Integrity
 * The user's authoritative wallet balance is read from the database at transaction time.
 * The `balanceBefore` and `balanceAfter` fields store immutable snapshots of the
 * backend-determined balance — never the frontend localStorage value.
 *
 * Requirement 67: Transaction History
 * Every entry fee deduction appears in transaction history with giveawayTitle,
 * amount, currency, and timestamp for full audit transparency.
 *
 * Requirement 68: Refund/Reversal Architecture
 * Reversals are recorded as compensating transactions (type = 'REVERSAL').
 * Original transactions are NEVER deleted — instead, a separate REVERSED record is created.
 * The reversalReason field explains why the reversal was issued (e.g., 'GIVEAWAY_CANCELLED').
 * The compensatingTransactionId links back to the original GIVEAWAY_ENTRY transaction.
 */
export const TransactionStatus = Object.freeze({
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED'
});

const GiveawayEntryTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  giveawayId: { type: String, required: true, index: true },

  // Requirement 67: Transaction history display fields
  giveawayTitle: { type: String, default: '' },  // e.g., "Summer iPhone Giveaway"
  description: { type: String, default: '' },    // e.g., "Giveaway Entry - Summer iPhone Giveaway"

  prizeId: { type: String, index: true },
  currency: { type: String, required: true, enum: ['VEs', 'SVEs', 'Tokens'] },
  currencyUnit: { type: String, enum: ['VEs', 'SVEs', 'Tokens'] },
  amount: { type: Number, required: true },

  // Requirement 67 & 68: Transaction type — GIVEAWAY_ENTRY or REVERSAL
  type: { type: String, default: 'GIVEAWAY_ENTRY', enum: ['GIVEAWAY_ENTRY', 'REVERSAL', 'REFUND', 'ADJUSTMENT'] },
  status: { 
    type: String, 
    default: TransactionStatus.SUCCESS, 
    enum: [TransactionStatus.PENDING, TransactionStatus.SUCCESS, TransactionStatus.FAILED, TransactionStatus.REVERSED, 'COMPLETED'] 
  },

  // Requirement 66: Backend-authoritative balance snapshots (never client-supplied)
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },

  ticketId: { type: String },
  idempotencyKey: { type: String, index: true },
  deviceHash: { type: String, index: true },

  // Requirement 68: Reversal audit trail
  // When a transaction is reversed, do NOT delete the original.
  // Instead, create a new transaction with type = 'REVERSAL' and link it here.
  reversalReason: { type: String },
  reversedAt: { type: Date },
  reversedBy: { type: String },  // admin userId who authorized the reversal
  compensatingTransactionId: { type: String },  // ID of the REVERSAL transaction (forward link)

  failureReason: { type: String }
}, {
  timestamps: true
});

export const GiveawayEntryTransaction = mongoose.models.GiveawayEntryTransaction || mongoose.model('GiveawayEntryTransaction', GiveawayEntryTransactionSchema);
