import express from 'express';
import { getGiveaways, getGiveawayById, getHeroGiveaway, getCurrentGiveaways, getPreviousGiveaways } from '../controllers/giveawayController.js';
import { getWinners } from '../controllers/winnerController.js';
import { joinGiveaway, getGiveawayParticipants } from '../controllers/participationController.js';
import { submitClaim } from '../controllers/claimController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { fraudInspectionMiddleware } from '../middleware/fraudMiddleware.js';

const router = express.Router();

router.get('/current/winners', getWinners);
router.get('/current', getCurrentGiveaways);
router.get('/previous', getPreviousGiveaways);
router.get('/hero', getHeroGiveaway);
router.get('/', getGiveaways);
router.get('/:id', getGiveawayById);
router.get('/:id/participants', getGiveawayParticipants);

// Direct giveaway participation endpoint
router.post('/:id/join', optionalAuthMiddleware, fraudInspectionMiddleware, joinGiveaway);

// Direct prize claim endpoint
router.post('/:id/claim', optionalAuthMiddleware, submitClaim);

export default router;
