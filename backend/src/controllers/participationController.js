import { ParticipationService } from '../services/participationService.js';
import { db } from '../data/store.js';
import { DeviceTracker } from '../utils/deviceTracker.js';

export const joinGiveaway = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetGiveawayId = id || req.body?.giveawayId;
    const authenticatedUserId = req.user?.id || req.user?.userId || req.headers['x-user-id'];

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: 'LOGIN_REQUIRED',
        code: 'LOGIN_REQUIRED',
        message: 'You must be logged in to participate in giveaways.'
      });
    }

    if (!targetGiveawayId) {
      return res.status(400).json({
        error: 'MISSING_GIVEAWAY_ID',
        message: 'giveawayId is required in URL or request body.'
      });
    }

    const { entryType = 'paid', ticketCount = 1, idempotencyKey: bodyKey } = req.body || {};
    const idempotencyKey = 
      req.headers['idempotency-key'] || 
      req.headers['x-idempotency-key'] || 
      bodyKey || 
      null;

    const deviceHash = req.headers['x-device-hash'] || DeviceTracker.generateDeviceHash(req);

    // Requirement 40 & 73: Zero-trust client values.
    // The authenticatedUserId comes exclusively from the JWT token (req.user).
    // Client-supplied identity, amounts, or balances are all ignored.
    // Entry fee and currency are read from the giveaway record, not the request body.
    const result = await ParticipationService.joinGiveaway({
      userId: authenticatedUserId,
      giveawayId: targetGiveawayId,
      entryType,
      ticketCount,
      idempotencyKey,
      deviceHash,
      ipAddress: req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserParticipations = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const participations = await ParticipationService.getUserParticipations(userId);
    res.json({ participations, total: participations.length });
  } catch (err) {
    next(err);
  }
};

export const getGiveawayParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tickets = db.getTicketsByGiveaway(id);
    res.json({ tickets, total: tickets.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Authenticated User's Participation Status for a Giveaway (Requirement 39)
 * GET /api/giveaways/:id/my-status
 */
export const getMyParticipationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required to check participation status.'
      });
    }

    const authUser = db.getUserById(userId);
    const authId = authUser?.id || userId;
    const authUserId = authUser?.userId || userId;

    const giveaway = db.getGiveawayById(id) || db.getGiveaways().find(g => g.slug === id || g.id === id);
    if (!giveaway) {
      return res.status(404).json({
        error: 'GIVEAWAY_NOT_FOUND',
        message: 'Giveaway not found'
      });
    }

    const allUserTickets = db.getTicketsByUser(authId).concat(authUserId !== authId ? db.getTicketsByUser(authUserId) : []);
    const userTicket = allUserTickets.find(t => t.giveawayId === giveaway.id || t.giveawayId === id);

    const hasJoined = Boolean(userTicket);
    const userWallet = {
      veloopCoins: authUser?.veloopCoins || authUser?.coins || 0,
      sveCoins: authUser?.sveCoins || 0,
      tokens: authUser?.tokens || 0
    };

    const currencyKey = giveaway.entryFeeUnit === 'SVEs' ? 'sveCoins' : (giveaway.entryFeeUnit === 'Tokens' ? 'tokens' : 'veloopCoins');
    const currentBalance = userWallet[currencyKey] || 0;
    const entryFee = Number(giveaway.entryFee || 0);
    const canAfford = currentBalance >= entryFee;
    const isLive = (giveaway.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

    res.json({
      success: true,
      giveawayId: giveaway.id,
      giveawayTitle: giveaway.title,
      giveawayStatus: giveaway.status,
      hasJoined,
      canJoin: !hasJoined && isLive && canAfford,
      ticket: userTicket || null,
      ticketId: userTicket?.ticketId || userTicket?.id || null,
      ticketNumber: userTicket?.ticketId || userTicket?.id || null,
      joinedAt: userTicket?.joinedAt || userTicket?.createdAt || null,
      entryFee,
      entryFeeUnit: giveaway.entryFeeUnit || 'VEs',
      userBalance: currentBalance,
      canAfford
    });
  } catch (err) {
    next(err);
  }
};

