import express from 'express';
import { createGiveaway, updateGiveaway, drawWinner, startGiveaway, endGiveaway, getAdminParticipants } from '../controllers/adminGiveawayController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { validateCreateGiveawayInput, validateDrawWinnerInput } from '../validators/index.js';

const router = express.Router();

/**
 * Requirement 49: Admin Actions Must Be Protected
 * Every admin endpoint requires:
 * 1. Authentication (valid session / identity check via requireAdmin)
 * 2. Authorization (role: admin verification via requireAdmin)
 * 3. Validation (request schema and parameters verified)
 */
router.post('/', requireAdmin, validate(validateCreateGiveawayInput), createGiveaway);
router.patch('/:id', requireAdmin, updateGiveaway);
router.post('/:id/start', requireAdmin, startGiveaway);
router.post('/:id/end', requireAdmin, endGiveaway);
router.get('/:id/participants', requireAdmin, getAdminParticipants);
router.post('/:id/draw', requireAdmin, validate(validateDrawWinnerInput), drawWinner);
router.post('/select-winner', requireAdmin, validate(validateDrawWinnerInput), drawWinner);

export default router;

