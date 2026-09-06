import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  giveawayId: { type: String, index: true },
  ip: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
