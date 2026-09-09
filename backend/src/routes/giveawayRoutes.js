import express from 'express';
import { getGiveaways, getGiveawayById, getHeroGiveaway, getCurrentGiveaways, getPreviousGiveaways } from '../controllers/giveawayController.js';
import { getWinners, getGiveawayWinners, getPreviousGiveawayWinners } from '../controllers/winnerController.js';
import { joinGiveaway, getGiveawayParticipants, getMyParticipationStatus } from '../controllers/participationController.js';
import { submitClaim, getClaimRequirements, getMyClaim } from '../controllers/claimController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { fraudInspectionMiddleware } from '../middleware/fraudMiddleware.js';
import { joinRateLimiter, claimRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// 1. Giveaway Endpoints (Requirement 39)
router.get('/current', getCurrentGiveaways);
router.get('/previous/winners', getPreviousGiveawayWinners);
router.get('/previous', getPreviousGiveaways);
router.get('/hero', getHeroGiveaway);
router.get('/current/winners', getWinners);
router.get('/', getGiveaways);
router.get('/:id', getGiveawayById);

// 2. Participation Endpoints (Requirement 39, 40, 44)
router.get('/:id/my-status', optionalAuthMiddleware, getMyParticipationStatus);
router.get('/:id/participants', getGiveawayParticipants);
router.post('/join', joinRateLimiter, optionalAuthMiddleware, fraudInspectionMiddleware, joinGiveaway);
router.post('/:id/join', joinRateLimiter, optionalAuthMiddleware, fraudInspectionMiddleware, joinGiveaway);

// 3. Winners Endpoints (Requirement 39)
router.get('/:id/winners', getGiveawayWinners);

// 4. Claim Endpoints (Requirement 39, 44)
router.get('/:id/claim-requirements', optionalAuthMiddleware, getClaimRequirements);
router.get('/:id/my-claim', optionalAuthMiddleware, getMyClaim);
router.post('/:id/claim', claimRateLimiter, optionalAuthMiddleware, submitClaim);

export default router;
