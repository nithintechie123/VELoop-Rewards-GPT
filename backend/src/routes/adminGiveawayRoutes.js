import express from 'express';
import { createGiveaway, updateGiveaway, drawWinner } from '../controllers/adminGiveawayController.js';
import { requireAdmin, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuthMiddleware, createGiveaway);
router.patch('/:id', optionalAuthMiddleware, updateGiveaway);
router.post('/:id/draw', optionalAuthMiddleware, drawWinner);

export default router;
