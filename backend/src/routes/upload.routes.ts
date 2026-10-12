import { Router } from 'express';
import { uploadSingleImage } from '../middleware/upload.middleware';
import { uploadMediaFile } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireGestore } from '../middleware/rbac.middleware';

const router = Router();

// POST /api/v1/uploads (Protected: Gestore / Admin only)
router.post('/uploads', authenticate, requireGestore, uploadSingleImage, uploadMediaFile);

export default router;
