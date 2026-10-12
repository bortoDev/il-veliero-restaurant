import { z } from 'zod';
import { MENU_CATEGORIES } from '../models/MenuItem';

const dietarySchema = z.object({
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
}).optional();

const wineDetailsSchema = z.object({
  type: z.string().trim().optional(),
  vintage: z.union([z.number(), z.string().trim()]).optional(),
  region: z.string().trim().optional(),
  producer: z.string().trim().optional(),
  bottleSize: z.string().trim().optional(),
  grape: z.string().trim().optional(),
  alcohol: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).optional();

export const createMenuItemSchema = z.object({
  title: z.string().trim().min(1, 'Dish title is required').max(120),
  description: z.string().trim().min(1, 'Dish description is required').max(1000),
  price: z.number().min(0, 'Price must be a non-negative number'),
  category: z.enum(MENU_CATEGORIES, {
    message: `Invalid category. Allowed: ${MENU_CATEGORIES.join(', ')}`,
  }),
  subcategory: z.string().trim().optional(),
  allergens: z.array(z.string().trim().toLowerCase()).optional(),
  allergenNumbers: z
    .array(z.number().int().min(1).max(14))
    .optional(),
  image: z.string().trim().optional(),
  isAvailable: z.boolean().optional().default(true),
  isChefSpecial: z.boolean().optional().default(false),
  dietary: dietarySchema,
  wineDetails: wineDetailsSchema,
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
