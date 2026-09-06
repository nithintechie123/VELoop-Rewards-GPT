import { ParticipationService } from '../services/participationService.js';
import { db } from '../data/store.js';

export const joinGiveaway = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'You must be logged in to participate in giveaways.'
      });
    }

    const { entryType = 'paid', ticketCount = 1 } = req.body || {};

    const result = await ParticipationService.joinGiveaway({
      userId,
      giveawayId: id,
      entryType,
      ticketCount,
      ipAddress: req.ip || '127.0.0.1',
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
