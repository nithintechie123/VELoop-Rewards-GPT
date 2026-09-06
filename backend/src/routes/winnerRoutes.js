import express from 'express';
import { getWinners, getWinnerLookup, verifyFairness } from '../controllers/winnerController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getWinners);
router.get('/lookup', optionalAuthMiddleware, getWinnerLookup);
router.post('/verify', verifyFairness);

export default router;
