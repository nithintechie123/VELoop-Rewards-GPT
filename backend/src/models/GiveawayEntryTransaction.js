import mongoose from 'mongoose';

const GiveawayEntryTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  giveawayId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currencyUnit: { type: String, required: true, enum: ['VEs', 'SVEs', 'Tokens'] },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  ticketId: { type: String, required: true },
  idempotencyKey: { type: String, index: true },
  status: { type: String, default: 'COMPLETED', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'] }
}, {
  timestamps: true
});

export const GiveawayEntryTransaction = mongoose.models.GiveawayEntryTransaction || mongoose.model('GiveawayEntryTransaction', GiveawayEntryTransactionSchema);
