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

const router = Router();

// Guarded by Authentication and Admin Role
router.get('/admin/users', authenticate, requireAdmin, listUsers);
router.post('/admin/users', authenticate, requireAdmin, createUser);
router.get('/admin/users/:id', authenticate, requireAdmin, getUserById);
router.patch('/admin/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.put('/admin/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.patch('/admin/users/:id/status', authenticate, requireAdmin, updateUserStatus);
router.put('/admin/users/:id/status', authenticate, requireAdmin, updateUserStatus);
router.post('/admin/users/:id/reset-password', authenticate, requireAdmin, resetUserPassword);
router.delete('/admin/users/:id', authenticate, requireAdmin, deleteUser);

export default router;
