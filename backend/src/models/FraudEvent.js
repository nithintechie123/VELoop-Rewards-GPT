import mongoose from 'mongoose';

/**
 * Requirement 27: FraudEvent Collection
 * Stores immutable forensic fraud event records for audit, risk scoring, and abuse analysis.
 */
const FraudEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  giveawayId: { type: String, index: true },
  deviceHash: { type: String, index: true },
  deviceId: { type: String, index: true },
  riskScore: { type: Number, default: 0, index: true },
  riskLevel: { 
    type: String, 
    default: 'LOW', 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
  },
  riskBand: { type: String, default: '0–29' },
  reason: { type: String, required: true },
  eventType: { type: String, default: 'FRAUD_ALERT', index: true },
  type: { type: String, default: 'FRAUD_ALERT' },
  description: { type: String },
  signals: [{
    signalName: { type: String },
    score: { type: Number },
    details: { type: String }
  }],
  action: { 
    type: String, 
    default: 'BLOCKED', 
    enum: ['ALLOW', 'MONITORED', 'FLAGGED_FOR_REVIEW', 'CHALLENGE', 'AUTO_BLOCKED', 'BLOCKED'] 
  },
  actionTaken: { 
    type: String, 
    default: 'BLOCKED'
  },
  ipAddress: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// Compound indexes for rapid lookup by user and giveaway
FraudEventSchema.index({ userId: 1, giveawayId: 1 });
FraudEventSchema.index({ deviceHash: 1, giveawayId: 1 });

export const FraudEvent = mongoose.models.FraudEvent || mongoose.model('FraudEvent', FraudEventSchema);
