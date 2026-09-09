import express from 'express';
import { submitClaim, getClaimStatus, getClaimRequirements, getAdminClaims, processClaim } from '../controllers/claimController.js';
import { optionalAuthMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import { claimRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.get('/', requireAdmin, getAdminClaims);
router.get('/:id/requirements', optionalAuthMiddleware, getClaimRequirements);
router.get('/:id', optionalAuthMiddleware, getClaimStatus);
router.post('/:id', claimRateLimiter, optionalAuthMiddleware, submitClaim);
router.patch('/:id/process', requireAdmin, processClaim);
router.patch('/:id', requireAdmin, processClaim);

export default router;
