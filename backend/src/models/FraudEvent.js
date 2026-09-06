import mongoose from 'mongoose';

const FraudEventSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  ip: { type: String, index: true },
  userAgent: { type: String },
  requestCount: { type: Number },
  timeWindowMs: { type: Number },
  endpoint: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed },
  riskScoreIncrease: { type: Number, default: 25 },
  actionTaken: { type: String, default: 'BLOCKED' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const FraudEvent = mongoose.models.FraudEvent || mongoose.model('FraudEvent', FraudEventSchema);
