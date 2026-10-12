import { z } from 'zod';

export const updateInfoLocaleSchema = z.object({
  name: z.string().trim().min(1, 'Restaurant name cannot be empty').max(150).optional(),
  legalName: z.string().trim().optional(),
  pIva: z.string().trim().optional(),
  sdi: z.string().trim().optional(),
  historyStory: z.string().trim().min(1, 'History story cannot be empty').optional(),
  historicalEras: z.array(z.any()).optional(),
  mosaicItems: z.array(z.any()).optional(),
  address: z.string().trim().min(1, 'Address cannot be empty').optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  phone: z.string().trim().min(1, 'Phone number cannot be empty').optional(),
  mobile: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  secondaryEmail: z.string().trim().optional(),
  openingHours: z.record(z.string(), z.any()).optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  socialLinks: z.record(z.string(), z.any()).optional(),
});
