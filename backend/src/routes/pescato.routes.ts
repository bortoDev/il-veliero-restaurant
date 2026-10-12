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
import { validateBody } from '../middleware/validate.middleware';
import { createPescatoSchema, updatePescatoSchema } from '../validators/pescato.validator';

const router = Router();

// Public Routes
router.get('/pescato', getPescatoList);
router.get('/pescato/:id', getPescatoById);

// Protected Gestore / Admin CRUD Routes
router.post('/pescato', requireAuth, requireGestore, validateBody(createPescatoSchema), createPescato);
router.put('/pescato/:id', requireAuth, requireGestore, validateBody(updatePescatoSchema), updatePescato);
router.patch('/pescato/:id', requireAuth, requireGestore, validateBody(updatePescatoSchema), updatePescato);
router.delete('/pescato/:id', requireAuth, requireGestore, deletePescato);

export default router;
