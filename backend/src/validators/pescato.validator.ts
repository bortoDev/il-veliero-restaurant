import { z } from 'zod';

export const createPescatoSchema = z.object({
  title: z.string().trim().min(1, 'Catch title is required').max(120),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  price: z.number().min(0, 'Price must be a non-negative number').optional().default(0),
  image: z.string().trim().optional(),
  images: z.array(z.string().trim()).optional(),
  catchDate: z.union([z.string().datetime(), z.string(), z.date()]).optional(),
  isAvailable: z.boolean().optional().default(true),
  marketLocation: z.string().trim().optional().default('Mercato Ittico Adriatico'),
  kilogramsAvailable: z.number().min(0, 'Quantity cannot be negative').optional(),
});

export const updatePescatoSchema = createPescatoSchema.partial();
