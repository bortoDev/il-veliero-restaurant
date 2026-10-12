import { Router } from 'express';
import { getInfoLocale, updateInfoLocale } from '../controllers/info.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireGestore } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateInfoLocaleSchema } from '../validators/info.validator';

const router = Router();

// Public Routes (supporting both /info and /info-locale)
router.get('/info', getInfoLocale);
router.get('/info-locale', getInfoLocale);

// Protected Gestore / Admin Update Routes
router.put('/info', requireAuth, requireGestore, validateBody(updateInfoLocaleSchema), updateInfoLocale);
router.patch('/info', requireAuth, requireGestore, validateBody(updateInfoLocaleSchema), updateInfoLocale);
router.put('/info-locale', requireAuth, requireGestore, validateBody(updateInfoLocaleSchema), updateInfoLocale);
router.patch('/info-locale', requireAuth, requireGestore, validateBody(updateInfoLocaleSchema), updateInfoLocale);

export default router;
