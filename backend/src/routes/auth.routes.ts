import { Router } from 'express';
import {
  register,
  login,
  logout,
  logoutAll,
  emergencyRecovery,
  getMe,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/emergency-recovery', emergencyRecovery);

// Authenticated routes
router.post('/auth/logout', authenticate, logout);
router.post('/auth/logout-all', authenticate, logoutAll);
router.post('/auth/change-password', authenticate, changePassword);
router.get('/auth/me', authenticate, getMe);

export default router;
