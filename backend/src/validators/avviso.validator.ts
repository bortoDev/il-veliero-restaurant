import { z } from 'zod';
import { AVVISO_SEVERITY } from '../models/Avviso';

export const createAvvisoSchema = z.object({
  title: z.string().trim().min(1, 'Notice title is required').max(150),
  message: z.string().trim().min(1, 'Notice message is required').max(2000),
  severity: z.enum(AVVISO_SEVERITY).optional().default('info'),
  image: z.string().trim().optional(),
  images: z.array(z.string().trim()).optional(),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateAvvisoSchema = createAvvisoSchema.partial();
