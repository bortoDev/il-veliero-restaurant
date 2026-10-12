import { Router } from 'express';
import {
  getUpcomingEventi,
  getAllEventi,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
} from '../controllers/evento.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGestore } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createEventoSchema, updateEventoSchema } from '../validators/evento.validator';

const router = Router();

// Public Routes
router.get('/eventi/upcoming', getUpcomingEventi);
router.get('/eventi', getAllEventi);
router.get('/eventi/:id', getEventoById);

// Protected Gestore / Admin CRUD Routes
router.post('/eventi', requireAuth, requireGestore, validateBody(createEventoSchema), createEvento);
router.put('/eventi/:id', requireAuth, requireGestore, validateBody(updateEventoSchema), updateEvento);
router.patch('/eventi/:id', requireAuth, requireGestore, validateBody(updateEventoSchema), updateEvento);
router.delete('/eventi/:id', requireAuth, requireGestore, deleteEvento);

export default router;
