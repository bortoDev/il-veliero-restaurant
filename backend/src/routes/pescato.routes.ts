import { Router } from 'express';
import {
  getPescatoList,
  getPescatoById,
  createPescato,
  updatePescato,
  deletePescato,
} from '../controllers/pescato.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGestore } from '../middleware/rbac.middleware';

const router = Router();

// Public Routes
router.get('/pescato', getPescatoList);
router.get('/pescato/:id', getPescatoById);

// Protected Gestore / Admin CRUD Routes
router.post('/pescato', requireAuth, requireGestore, createPescato);
router.put('/pescato/:id', requireAuth, requireGestore, updatePescato);
router.patch('/pescato/:id', requireAuth, requireGestore, updatePescato);
router.delete('/pescato/:id', requireAuth, requireGestore, deletePescato);

export default router;
