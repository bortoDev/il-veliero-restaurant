import { Router } from 'express';
import {
  getActiveAvvisi,
  getAllAvvisi,
  getAvvisoById,
  createAvviso,
  updateAvviso,
  deleteAvviso,
} from '../controllers/avviso.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGestore } from '../middleware/rbac.middleware';

const router = Router();

// Public Routes
router.get('/avvisi/active', getActiveAvvisi);
router.get('/avvisi', getAllAvvisi);
router.get('/avvisi/:id', getAvvisoById);

// Protected Gestore / Admin CRUD Routes
router.post('/avvisi', requireAuth, requireGestore, createAvviso);
router.put('/avvisi/:id', requireAuth, requireGestore, updateAvviso);
router.patch('/avvisi/:id', requireAuth, requireGestore, updateAvviso);
router.delete('/avvisi/:id', requireAuth, requireGestore, deleteAvviso);

export default router;
