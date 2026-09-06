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
    const { id } = req.params;
    const { communitySeed } = req.body || {};
    const winner = await WinnerService.drawGiveawayWinner(id, communitySeed);
    res.json({
      success: true,
      message: 'Winner calculated deterministically via SHA-256 algorithm',
      winner
    });
  } catch (err) {
    next(err);
  }
};
