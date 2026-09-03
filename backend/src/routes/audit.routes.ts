import { Router } from 'express';
import { getAuditLogs, getAuditLogById } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

// Guarded by Authentication and Admin Role
router.get('/admin/audit-logs', authenticate, requireAdmin, getAuditLogs);
router.get('/admin/audit-logs/:id', authenticate, requireAdmin, getAuditLogById);

export default router;
