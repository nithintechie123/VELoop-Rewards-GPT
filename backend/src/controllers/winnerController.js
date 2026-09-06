import { WinnerService } from '../services/winnerService.js';
import { CryptoFairEngine } from '../utils/cryptoFair.js';

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
