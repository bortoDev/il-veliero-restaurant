import { z } from 'zod';

export const createEventoSchema = z.object({
  title: z.string().trim().min(1, 'Event title is required').max(150),
  description: z.string().trim().min(1, 'Event description is required').max(3000),
  image: z.string().trim().optional(),
  images: z.array(z.string().trim()).optional(),
  eventDate: z.union([z.string(), z.date()]),
  price: z.number().min(0, 'Price cannot be negative').optional().default(0),
  maxSeats: z.number().min(0, 'Max seats cannot be negative').optional(),
  reservedSeats: z.number().min(0, 'Reserved seats cannot be negative').optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateEventoSchema = createEventoSchema.partial();
