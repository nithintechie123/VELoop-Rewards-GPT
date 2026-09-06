import express from 'express';
import {
  login,
  register,
  refresh,
  logout,
  me,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Authenticated user profile routes
router.get('/me', authMiddleware, me);
router.get('/profile', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

export default router;
