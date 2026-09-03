import { Router } from 'express';
import { uploadSingleImage } from '../middleware/upload.middleware';
import { uploadMediaFile } from '../controllers/upload.controller';

const router = Router();

// POST /api/v1/uploads
router.post('/uploads', uploadSingleImage, uploadMediaFile);

export default router;
