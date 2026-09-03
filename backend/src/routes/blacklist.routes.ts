import { Router } from 'express';
import {
  getBlacklistedTokens,
  blacklistToken,
  removeFromBlacklist,
} from '../controllers/blacklist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

// Guarded by Authentication and Admin Role
router.get('/admin/blacklist', authenticate, requireAdmin, getBlacklistedTokens);
router.post('/admin/blacklist', authenticate, requireAdmin, blacklistToken);
router.delete('/admin/blacklist/:token', authenticate, requireAdmin, removeFromBlacklist);

export default router;
