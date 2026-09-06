import express from 'express';
import { joinGiveaway, getUserParticipations, getGiveawayParticipants } from '../controllers/participationController.js';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';
import { fraudInspectionMiddleware } from '../middleware/fraudMiddleware.js';

const router = express.Router();

router.get('/my', optionalAuthMiddleware, getUserParticipations);
router.get('/user', optionalAuthMiddleware, getUserParticipations);
router.get('/giveaway/:id', getGiveawayParticipants);
router.post('/join/:id', optionalAuthMiddleware, fraudInspectionMiddleware, joinGiveaway);

export default router;
