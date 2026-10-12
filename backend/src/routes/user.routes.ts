import { Router } from 'express';
import {
  listUsers,
  createUser,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  resetUserPassword,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createUserSchema,
  updateRoleSchema,
  updateStatusSchema,
  resetPasswordSchema,
} from '../validators/user.validator';

const router = Router();

// Guarded by Authentication and Admin Role
router.get('/admin/users', authenticate, requireAdmin, listUsers);
router.post('/admin/users', authenticate, requireAdmin, validateBody(createUserSchema), createUser);
router.get('/admin/users/:id', authenticate, requireAdmin, getUserById);
router.patch('/admin/users/:id/role', authenticate, requireAdmin, validateBody(updateRoleSchema), updateUserRole);
router.put('/admin/users/:id/role', authenticate, requireAdmin, validateBody(updateRoleSchema), updateUserRole);
router.patch('/admin/users/:id/status', authenticate, requireAdmin, validateBody(updateStatusSchema), updateUserStatus);
router.put('/admin/users/:id/status', authenticate, requireAdmin, validateBody(updateStatusSchema), updateUserStatus);
router.post('/admin/users/:id/reset-password', authenticate, requireAdmin, validateBody(resetPasswordSchema), resetUserPassword);
router.delete('/admin/users/:id', authenticate, requireAdmin, deleteUser);

export default router;
