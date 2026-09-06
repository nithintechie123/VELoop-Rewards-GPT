import express from 'express';
import { submitClaim, getClaimStatus } from '../controllers/claimController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:id', optionalAuthMiddleware, submitClaim);
router.get('/:id', optionalAuthMiddleware, getClaimStatus);

export default router;
