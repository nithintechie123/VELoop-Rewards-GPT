import { GiveawayService } from '../services/giveawayService.js';
import { WinnerService } from '../services/winnerService.js';
import { db } from '../data/store.js';

export const createGiveaway = async (req, res, next) => {
  try {
    const giveaway = await GiveawayService.createGiveaway(req.body);
    res.status(201).json({
      success: true,
      message: 'Giveaway created successfully with SHA-256 seed commitment',
      giveaway
    });
  } catch (err) {
    next(err);
  }
};

export const updateGiveaway = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = db.updateGiveaway(id, req.body);
    if (!updated) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Giveaway not found'
      });
    }
    res.json({
      success: true,
      giveaway: updated
    });
  } catch (err) {
    next(err);
  }
};

export const drawWinner = async (req, res, next) => {
  try {
    const giveawayId = req.params.id || req.body?.giveawayId;
    if (!giveawayId) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        code: 'VALIDATION_FAILED',
        message: 'giveawayId is required to execute winner selection.'
      });
    }

    const giveaway = db.getGiveawayById(giveawayId);
    if (!giveaway) {
      return res.status(404).json({
        error: 'GIVEAWAY_NOT_FOUND',
        message: `Giveaway '${giveawayId}' was not found.`
      });
    }

    const { communitySeed } = req.body || {};
    const result = await WinnerService.drawGiveawayWinner(giveawayId, communitySeed);
    const primaryWinner = result.winner || result;
    const allWinners = result.winners || (primaryWinner ? [primaryWinner] : []);

    res.json({
      success: true,
      message: 'Winner(s) calculated deterministically via SHA-256 algorithm',
      winner: primaryWinner,
      winners: allWinners,
      configuredWinnerCount: result.configuredWinnerCount || allWinners.length,
      proofs: result.proofs || (primaryWinner?.proof ? [primaryWinner.proof] : [])
    });
  } catch (err) {
    next(err);
  }
};

export const startGiveaway = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = db.updateGiveaway(id, {
      status: 'ACTIVE',
      startAt: new Date().toISOString()
    });
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Giveaway not found' });
    }
    res.json({
      success: true,
      message: `Giveaway ${updated.title} started successfully (status: ACTIVE)`,
      giveaway: updated
    });
  } catch (err) {
    next(err);
  }
};

export const endGiveaway = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = db.updateGiveaway(id, {
      status: 'ENDED',
      endAt: new Date().toISOString()
    });
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Giveaway not found' });
    }
    res.json({
      success: true,
      message: `Giveaway ${updated.title} ended successfully (status: ENDED)`,
      giveaway: updated
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tickets = db.getTicketsByGiveaway(id);
    res.json({
      success: true,
      giveawayId: id,
      totalParticipants: tickets.length,
      participants: tickets
    });
  } catch (err) {
    next(err);
  }
};

