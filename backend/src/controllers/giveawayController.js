import { GiveawayService } from '../services/giveawayService.js';

export const getGiveaways = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const result = await GiveawayService.getAllGiveaways({ category, status });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getGiveawayById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const giveaway = await GiveawayService.getGiveawayById(id);
    if (!giveaway) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Giveaway not found'
      });
    }
    res.json(giveaway);
  } catch (err) {
    next(err);
  }
};

export const getHeroGiveaway = async (req, res, next) => {
  try {
    const result = await GiveawayService.getAllGiveaways();
    if (!result.heroGiveaway) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'No active hero giveaway found'
      });
    }
    res.json(result.heroGiveaway);
  } catch (err) {
    next(err);
  }
};

export const getCurrentGiveaways = async (req, res, next) => {
  try {
    const result = await GiveawayService.getAllGiveaways();
    res.json({
      hero: result.heroGiveaway,
      active: result.giveaways,
      heroGiveaway: result.heroGiveaway,
      giveaways: result.giveaways,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export const getPreviousGiveaways = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const result = await GiveawayService.getAllGiveaways({ category, status: 'ended' });
    res.json({
      giveaways: result.giveaways,
      total: result.giveaways.length
    });
  } catch (err) {
    next(err);
  }
};
