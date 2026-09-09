import mongoose from 'mongoose';

/**
 * Requirement 29: AuditLog Collection
 * Immutable audit log for all critical financial, reward, lifecycle, and security actions.
 */
const AuditLogSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  action: { 
    type: String, 
    required: true, 
    index: true,
    enum: [
      'JOIN_GIVEAWAY',
      'ENTRY_FEE_DEDUCTED',
      'JOIN_REJECTED',
      'DUPLICATE_ATTEMPT',
      'FRAUD_FLAGGED',
      'CLAIM_SUBMITTED',
      'WINNER_SELECTED',
      'BALANCE_REFUNDED',
      'PARTICIPATION_CONFIRMED',
      'FRAUD_ALERT',
      'TRANSACTION_REVERSED'
    ]
  },
  giveawayId: { type: String, index: true },
  giveawayTitle: { type: String },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'VEs' },
  result: { 
    type: String, 
    required: true,
    enum: ['SUCCESS', 'REJECTED', 'FLAGGED', 'BLOCKED', 'CONFIRMED', 'COMPLETED', 'FAILED']
  },
  requestId: { type: String, index: true },
  transactionId: { type: String, index: true },
  idempotencyKey: { type: String, index: true },
  securityInfo: {
    ipAddress: { type: String },
    deviceHash: { type: String, index: true },
    userAgent: { type: String },
    riskScore: { type: Number },
    riskLevel: { type: String },
    reason: { type: String }
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

AuditLogSchema.index({ userId: 1, action: 1 });
AuditLogSchema.index({ giveawayId: 1, action: 1 });
AuditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
