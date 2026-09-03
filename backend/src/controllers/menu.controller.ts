import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  MenuItem,
  IMenuItem,
  MENU_CATEGORIES,
  MenuCategory,
  OFFICIAL_ALLERGEN_MAP,
  ALLERGEN_SLUG_TO_NUMBER,
  EU_ALLERGENS,
} from '../models/MenuItem';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * List menu items with multi-criteria filtering, allergen exclusion, search, and pagination.
 * GET /api/v1/menu
 */
export const getMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      subcategory,
      available,
      excludeAllergens,
      search,
      isChefSpecial,
      isVegetarian,
      isVegan,
      isGlutenFree,
      wineType,
      wineRegion,
      wineVintage,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page,
      limit,
    } = req.query;

    const filter: Record<string, any> = {};

    // 1. Filter by Category (Single category or comma-separated list)
    if (category) {
      const rawCategories = String(category)
        .split(',')
        .map((c) => c.toLowerCase().trim())
        .filter(Boolean);

      if (rawCategories.length === 1) {
        filter.category = rawCategories[0];
      } else if (rawCategories.length > 1) {
        filter.category = { $in: rawCategories };
      }
    }

    // 2. Filter by Subcategory (Single or comma-separated list)
    if (subcategory) {
      const rawSubcategories = String(subcategory)
        .split(',')
        .map((s) => s.toLowerCase().trim())
        .filter(Boolean);

      if (rawSubcategories.length === 1) {
        filter.subcategory = rawSubcategories[0];
      } else if (rawSubcategories.length > 1) {
        filter.subcategory = { $in: rawSubcategories };
      }
    }

    // 3. Filter by Availability
    if (available !== undefined && available !== '') {
      filter.isAvailable = String(available) === 'true';
    }

    // 4. Filter by Chef Special / World Champion Signature Items
    if (isChefSpecial !== undefined && isChefSpecial !== '') {
      filter.isChefSpecial = String(isChefSpecial) === 'true';
    }

    // 5. Dietary Filters
    if (isVegetarian !== undefined && isVegetarian !== '') {
      filter['dietary.isVegetarian'] = String(isVegetarian) === 'true';
    }
    if (isVegan !== undefined && isVegan !== '') {
      filter['dietary.isVegan'] = String(isVegan) === 'true';
    }
    if (isGlutenFree !== undefined && isGlutenFree !== '') {
      filter['dietary.isGlutenFree'] = String(isGlutenFree) === 'true';
    }

    // 6. Wine Specific Filters
    if (wineType) {
      filter['wineDetails.type'] = String(wineType).toLowerCase().trim();
    }
    if (wineRegion) {
      filter['wineDetails.region'] = { $regex: String(wineRegion).trim(), $options: 'i' };
    }
    if (wineVintage) {
      filter['wineDetails.vintage'] = Number(wineVintage);
    }

    // 7. Allergen Exclusion Filter (Accepts numbers e.g. "1,4" or slugs e.g. "glutine,pesce")
    if (excludeAllergens) {
      const tokens = String(excludeAllergens)
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const excludeNumbers: number[] = [];
      const excludeSlugs: string[] = [];

      for (const token of tokens) {
        const num = parseInt(token, 10);
        if (!isNaN(num) && num >= 1 && num <= 14) {
          excludeNumbers.push(num);
          const slug = OFFICIAL_ALLERGEN_MAP[num]?.slug;
          if (slug) excludeSlugs.push(slug);
        } else if (ALLERGEN_SLUG_TO_NUMBER[token]) {
          excludeSlugs.push(token);
          excludeNumbers.push(ALLERGEN_SLUG_TO_NUMBER[token]);
        } else {
          excludeSlugs.push(token);
        }
      }

      const conditions: any[] = [];
      if (excludeNumbers.length > 0) {
        conditions.push({ allergenNumbers: { $nin: Array.from(new Set(excludeNumbers)) } });
      }
      if (excludeSlugs.length > 0) {
        conditions.push({ allergens: { $nin: Array.from(new Set(excludeSlugs)) } });
      }

      if (conditions.length > 0) {
        filter.$and = filter.$and || [];
        filter.$and.push(...conditions);
      }
    }

    // 8. Text Search (Across Title, Description, Subcategory, Wine Producer, Wine Region)
    if (search) {
      const searchRegex = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { subcategory: searchRegex },
        { 'wineDetails.producer': searchRegex },
        { 'wineDetails.region': searchRegex },
      ];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortField = String(sortBy);
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    // 9. Pagination or Complete Result Set
    if (page || limit) {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [total, items] = await Promise.all([
        MenuItem.countDocuments(filter),
        MenuItem.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      ]);

      res.status(200).json({
        success: true,
        count: items.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: items,
      });
    } else {
      const items = await MenuItem.find(filter).sort(sortOptions).lean();
      res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get category summary breakdown with dish counts and subcategories.
 * GET /api/v1/menu/categories
 */
export const getCategoriesSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await MenuItem.aggregate([
      {
        $group: {
          _id: { category: '$category', subcategory: '$subcategory' },
          count: { $sum: 1 },
          availableCount: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] },
          },
          specialCount: {
            $sum: { $cond: [{ $eq: ['$isChefSpecial', true] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          totalDishes: { $sum: '$count' },
          availableDishes: { $sum: '$availableCount' },
          specialDishes: { $sum: '$specialCount' },
          subcategories: {
            $push: {
              subcategory: '$_id.subcategory',
              count: '$count',
              availableCount: '$availableCount',
              specialCount: '$specialCount',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      categories: MENU_CATEGORIES,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve single menu item by ID.
 * GET /api/v1/menu/:id
 */
export const getMenuItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Menu item ID: '${id}'`);
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      throw new NotFoundError(`Menu item with ID '${id}' not found`);
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new menu item.
 * POST /api/v1/menu (Gestore / Admin)
 */
export const createMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      category,
      subcategory,
      allergens = [],
      allergenNumbers = [],
      image = '',
      isAvailable = true,
      isChefSpecial = false,
      dietary,
      wineDetails,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Dish title is required');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new BadRequestError('Dish description is required');
    }
    if (price === undefined || price === null || typeof price !== 'number' || price < 0 || isNaN(price)) {
      throw new BadRequestError('A valid non-negative price is required');
    }
    if (!category || !MENU_CATEGORIES.includes(String(category).toLowerCase().trim() as MenuCategory)) {
      throw new BadRequestError(
        `Invalid category: '${category}'. Allowed categories: ${MENU_CATEGORIES.join(', ')}`
      );
    }

    const formattedAllergens = Array.isArray(allergens)
      ? allergens.map((a) => String(a).toLowerCase().trim()).filter(Boolean)
      : [];

    const formattedAllergenNumbers = Array.isArray(allergenNumbers)
      ? allergenNumbers
          .map((n) => Number(n))
          .filter((n) => Number.isInteger(n) && n >= 1 && n <= 14)
      : [];

    const item = new MenuItem({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: String(category).toLowerCase().trim(),
      subcategory: subcategory ? String(subcategory).toLowerCase().trim() : undefined,
      allergens: formattedAllergens,
      allergenNumbers: formattedAllergenNumbers,
      image: typeof image === 'string' ? image.trim() : '',
      isAvailable: Boolean(isAvailable),
      isChefSpecial: Boolean(isChefSpecial),
      dietary: dietary || {},
      wineDetails: wineDetails || undefined,
    });

    await item.save();

    res.locals.auditDetails = {
      menuItemId: item._id.toString(),
      title: item.title,
      category: item.category,
      price: item.price,
    };

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing menu item.
 * PUT /api/v1/menu/:id or PATCH /api/v1/menu/:id (Gestore / Admin)
 */
export const updateMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Menu item ID: '${id}'`);
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      throw new NotFoundError(`Menu item with ID '${id}' not found`);
    }

    const {
      title,
      description,
      price,
      category,
      subcategory,
      allergens,
      allergenNumbers,
      image,
      isAvailable,
      isChefSpecial,
      dietary,
      wineDetails,
    } = req.body;

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new BadRequestError('Dish title cannot be empty');
      }
      item.title = title.trim();
    }

    if (description !== undefined) {
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        throw new BadRequestError('Dish description cannot be empty');
      }
      item.description = description.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0 || isNaN(price)) {
        throw new BadRequestError('Price must be a valid non-negative number');
      }
      item.price = Number(price);
    }

    if (category !== undefined) {
      const cleanCat = String(category).toLowerCase().trim();
      if (!MENU_CATEGORIES.includes(cleanCat as MenuCategory)) {
        throw new BadRequestError(
          `Invalid category: '${category}'. Allowed categories: ${MENU_CATEGORIES.join(', ')}`
        );
      }
      item.category = cleanCat as MenuCategory;
    }

    if (subcategory !== undefined) {
      item.subcategory = subcategory ? String(subcategory).toLowerCase().trim() : undefined;
    }

    if (allergens !== undefined) {
      if (!Array.isArray(allergens)) {
        throw new BadRequestError('Allergens must be an array of strings');
      }
      item.allergens = allergens.map((a) => String(a).toLowerCase().trim()).filter(Boolean);
    }

    if (allergenNumbers !== undefined) {
      if (!Array.isArray(allergenNumbers)) {
        throw new BadRequestError('AllergenNumbers must be an array of numbers');
      }
      item.allergenNumbers = allergenNumbers
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 14);
    }

    if (image !== undefined) {
      item.image = String(image).trim();
    }

    if (isAvailable !== undefined) {
      item.isAvailable = Boolean(isAvailable);
    }

    if (isChefSpecial !== undefined) {
      item.isChefSpecial = Boolean(isChefSpecial);
    }

    if (dietary !== undefined) {
      item.dietary = { ...item.dietary, ...dietary };
    }

    if (wineDetails !== undefined) {
      item.wineDetails = { ...item.wineDetails, ...wineDetails };
    }

    await item.save();

    res.locals.auditDetails = {
      menuItemId: item._id.toString(),
      title: item.title,
      updatedFields: Object.keys(req.body),
    };

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a menu item.
 * DELETE /api/v1/menu/:id (Gestore / Admin)
 */
export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Menu item ID: '${id}'`);
    }

    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      throw new NotFoundError(`Menu item with ID '${id}' not found`);
    }

    res.locals.auditDetails = {
      deletedMenuItemId: id,
      deletedTitle: item.title,
    };

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: {
        id: item._id.toString(),
        title: item.title,
      },
    });
  } catch (error) {
    next(error);
  }
};
