import { Router } from 'express';
import {
  getMenuItems,
  getCategoriesSummary,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menu.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGestore } from '../middleware/rbac.middleware';

const router = Router();

// Public Routes
router.get('/menu', getMenuItems);
router.get('/menu/categories', getCategoriesSummary);
router.get('/menu/:id', getMenuItemById);

// Protected Gestore / Admin CRUD Routes
router.post('/menu', requireAuth, requireGestore, createMenuItem);
router.put('/menu/:id', requireAuth, requireGestore, updateMenuItem);
router.patch('/menu/:id', requireAuth, requireGestore, updateMenuItem);
router.delete('/menu/:id', requireAuth, requireGestore, deleteMenuItem);

export default router;
