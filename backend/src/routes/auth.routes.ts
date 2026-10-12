import { Router } from 'express';
import {
  register,
  login,
  logout,
  logoutAll,
  emergencyRecovery,
  getMe,
  changePassword,
  refreshTokenHandler,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, emergencyRecoveryLimiter } from '../middleware/rate-limit.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  emergencyRecoverySchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes with dedicated rate limiting and Zod schema validation
router.post('/auth/register', validateBody(registerSchema), register);
router.post('/auth/login', authLimiter, validateBody(loginSchema), login);
router.post('/auth/refresh', validateBody(refreshTokenSchema), refreshTokenHandler);
router.post(
  '/auth/emergency-recovery',
  emergencyRecoveryLimiter,
  validateBody(emergencyRecoverySchema),
  emergencyRecovery
);

// Authenticated routes
router.post('/auth/logout', authenticate, logout);
router.post('/auth/logout-all', authenticate, logoutAll);
router.post('/auth/change-password', authenticate, validateBody(changePasswordSchema), changePassword);
router.get('/auth/me', authenticate, getMe);

export default router;
