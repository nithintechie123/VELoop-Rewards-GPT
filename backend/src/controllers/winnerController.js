import { WinnerService } from '../services/winnerService.js';
import { CryptoFairEngine } from '../utils/cryptoFair.js';
import { db } from '../data/store.js';

export const getWinners = async (req, res, next) => {
  try {
    const result = await WinnerService.getWinners();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getWinnerLookup = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const winner = await WinnerService.getWinnerByUserId(userId);
    if (!winner) {
      return res.json({ hasWon: false, winner: null });
    }

    res.json({ hasWon: true, winner });
  } catch (err) {
    next(err);
  }
};

export const verifyFairness = (req, res, next) => {
  try {
    const { serverSeed, clientSeed, nonce = 1, totalTickets, winningIndex } = req.body || {};

    if (!serverSeed || !clientSeed || !totalTickets || winningIndex === undefined) {
      return res.status(400).json({
        error: 'INVALID_PARAMETERS',
        message: 'serverSeed, clientSeed, totalTickets, and winningIndex are required.'
      });
    }

    const verification = CryptoFairEngine.verifyProof(
      serverSeed,
      clientSeed,
      Number(nonce),
      Number(totalTickets),
      Number(winningIndex)
    );

    res.json(verification);
  } catch (err) {
    next(err);
  }
};

/**
 * Get sanitized winners for a specific giveaway (Requirement 39)
 * GET /api/giveaways/:id/winners
 */
export const getGiveawayWinners = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allArchive = db.getArchiveWinners() || [];
    const giveaway = db.getGiveawayById(id) || db.getGiveaways().find(g => g.slug === id || g.id === id);

    let winners = [];
    if (giveaway?.winners && giveaway.winners.length > 0) {
      winners = giveaway.winners;
    } else if (giveaway?.winner) {
      winners = [giveaway.winner];
    } else {
      winners = allArchive.filter(w => w.giveawayId === id || (giveaway && w.giveawayId === giveaway.id));
    }

    const sanitized = winners.map(w => WinnerService.sanitizePublicWinner(w));

    res.json({
      success: true,
      giveawayId: giveaway?.id || id,
      giveawayTitle: giveaway?.title || 'Giveaway Draw',
      winnerCount: sanitized.length,
      winners: sanitized,
      winner: sanitized[0] || null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get archive winners from previous giveaways (Requirement 39)
 * GET /api/giveaways/previous/winners
 */
export const getPreviousGiveawayWinners = async (req, res, next) => {
  try {
    const allWinners = await WinnerService.getWinners();
    res.json({
      success: true,
      total: allWinners.archiveWinners.length,
      winners: allWinners.archiveWinners
    });
  } catch (err) {
    next(err);
  }
};

