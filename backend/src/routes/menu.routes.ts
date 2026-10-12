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
import { validateBody } from '../middleware/validate.middleware';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menu.validator';

const router = Router();

// Public Routes
router.get('/menu', getMenuItems);
router.get('/menu/categories', getCategoriesSummary);
router.get('/menu/:id', getMenuItemById);

// Protected Gestore / Admin CRUD Routes
router.post('/menu', requireAuth, requireGestore, validateBody(createMenuItemSchema), createMenuItem);
router.put('/menu/:id', requireAuth, requireGestore, validateBody(updateMenuItemSchema), updateMenuItem);
router.patch('/menu/:id', requireAuth, requireGestore, validateBody(updateMenuItemSchema), updateMenuItem);
router.delete('/menu/:id', requireAuth, requireGestore, deleteMenuItem);

export default router;
