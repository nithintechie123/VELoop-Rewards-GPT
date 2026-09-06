import { FraudService } from '../services/fraudService.js';

export const fraudInspectionMiddleware = async (req, res, next) => {
  const identifier = req.user?.id || req.headers['x-user-id'] || req.ip || '127.0.0.1';
  const giveawayId = req.params.id || req.params.giveawayId || req.body?.giveawayId;

  // 1. Velocity Burst Check
  const velocity = FraudService.checkVelocity(identifier);
  if (velocity.isThrottled) {
    await FraudService.recordFraudIncident({
      userId: req.user?.id || req.headers['x-user-id'] || 'ANONYMOUS',
      giveawayId,
      eventType: 'RAPID_FIRE_BURST',
      description: `User triggered ${velocity.requestCount} requests within ${velocity.windowMs}ms window.`,
      riskScore: 60,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    return res.status(429).json({
      error: 'RAPID_REQUEST_BURST_BLOCKED',
      message: 'Anti-bot velocity threshold exceeded. Please pause before sending more requests.',
      retryAfterSeconds: 5
    });
  }

  // 2. Payload Tampering Inspection on mutating participation requests
  if (req.method === 'POST' && (req.path.includes('/join') || req.path.includes('/participate'))) {
    const inspection = FraudService.inspectParticipationPayload(req.body);
    if (!inspection.isValid) {
      await FraudService.recordFraudIncident({
        userId: req.user?.id || req.headers['x-user-id'] || 'ANONYMOUS',
        giveawayId,
        eventType: 'PAYLOAD_TAMPERING_DETECTED',
        description: `Payload tampering detected: ${inspection.issues.join('; ')}`,
        riskScore: inspection.riskScore,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        metadata: req.body
      });

      let errorCode = 'PAYLOAD_TAMPERED';
      if (req.body.ticketCount !== undefined && (Number(req.body.ticketCount) <= 0 || !Number.isInteger(Number(req.body.ticketCount)))) {
        errorCode = 'INVALID_TICKET_COUNT';
      }

      return res.status(400).json({
        error: errorCode,
        message: 'Invalid request payload format or parameters rejected by server-side security checks.',
        details: inspection.issues
      });
    }
  }

  next();
};
