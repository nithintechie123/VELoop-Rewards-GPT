import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { PrizeClaim } from '../models/PrizeClaim.js';

export const submitClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const {
      prizeType = 'PHYSICAL',
      prizeTitle,
      fullName,
      phoneNumber,
      address,
      city,
      state,
      pin,
      notes
    } = req.body || {};

    const winnerRecord = db.getWinnerRecord(userId);
    const trackingNumber = `FDX-${Math.floor(10000000 + Math.random() * 90000000)}-IN`;

    const claimDoc = {
      id: `claim_${Date.now()}`,
      giveawayId: id,
      userId,
      winnerName: fullName || winnerRecord?.userName || 'Winner',
      prizeTitle: prizeTitle || winnerRecord?.prizeTitle || 'Exclusive Reward',
      prizeType,
      claimType: prizeType === 'PHYSICAL' ? 'shipping_address' : 'digital_voucher',
      trackingNumber,
      carrier: 'FedEx Priority',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingDetails: {
        fullName,
        phoneNumber,
        address,
        city,
        state,
        pin,
        notes: notes || ''
      },
      status: 'PROCESSING',
      statusStep: 1,
      claimedAt: new Date().toISOString()
    };

    db.addClaim(claimDoc);
    if (winnerRecord) {
      db.updateWinnerRecord(userId, {
        claimed: true,
        claimStatus: 'claimed',
        trackingNumber
      });
    }

    try {
      await PrizeClaim.create(claimDoc);
    } catch {}

    db.logAudit({
      action: 'PRIZE_CLAIM_SUBMITTED',
      userId,
      giveawayId: id,
      claimId: claimDoc.id,
      trackingNumber,
      prizeType
    });

    AuditLogger.info(`Prize Claim submitted by ${userId} for giveaway ${id} (Tracking: ${trackingNumber})`);

    res.json({
      success: true,
      message: 'Prize claim successfully registered and sent for fulfillment.',
      claim: claimDoc
    });
  } catch (err) {
    next(err);
  }
};

export const getClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'];

    const claim = db.state.claims.find(c => c.id === id || c.giveawayId === id || c.userId === userId);
    if (!claim) {
      return res.status(404).json({
        error: 'CLAIM_NOT_FOUND',
        message: 'No claim record found for this request'
      });
    }

    res.json({ claim });
  } catch (err) {
    next(err);
  }
};
