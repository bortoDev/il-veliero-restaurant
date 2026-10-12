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
import { validateBody } from '../middleware/validate.middleware';
import { createAvvisoSchema, updateAvvisoSchema } from '../validators/avviso.validator';

const router = Router();

// Public Routes
router.get('/avvisi/active', getActiveAvvisi);
router.get('/avvisi', getAllAvvisi);
router.get('/avvisi/:id', getAvvisoById);

// Protected Gestore / Admin CRUD Routes
router.post('/avvisi', requireAuth, requireGestore, validateBody(createAvvisoSchema), createAvviso);
router.put('/avvisi/:id', requireAuth, requireGestore, validateBody(updateAvvisoSchema), updateAvviso);
router.patch('/avvisi/:id', requireAuth, requireGestore, validateBody(updateAvvisoSchema), updateAvviso);
router.delete('/avvisi/:id', requireAuth, requireGestore, deleteAvviso);

export default router;
