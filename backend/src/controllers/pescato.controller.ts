import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Pescato, IPescato } from '../models/Pescato';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * List fresh catches / news items with filtering and search.
 * GET /api/v1/pescato
 */
export const getPescatoList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { available, date, search, page, limit, all } = req.query;

    const filter: Record<string, any> = {};

    // Default to available only unless all=true or available parameter explicitly set
    if (all !== 'true') {
      if (available !== undefined && available !== '') {
        filter.isAvailable = String(available) === 'true';
      } else {
        filter.isAvailable = true;
      }
    }

    if (date) {
      const targetDate = new Date(String(date));
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.catchDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    if (search) {
      const searchRegex = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [{ title: searchRegex }, { description: searchRegex }, { marketLocation: searchRegex }];
    }

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [total, items] = await Promise.all([
        Pescato.countDocuments(filter),
        Pescato.find(filter)
          .sort({ catchDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
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
      const items = await Pescato.find(filter)
        .sort({ catchDate: -1, createdAt: -1 })
        .lean();

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
 * Retrieve single pescato item by ID.
 * GET /api/v1/pescato/:id
 */
export const getPescatoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Pescato ID: '${id}'`);
    }

    const item = await Pescato.findById(id).lean();
    if (!item) {
      throw new NotFoundError(`Catch with ID '${id}' not found`);
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
 * Create a new daily catch record.
 * POST /api/v1/pescato
 */
export const createPescato = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      price = 0,
      image = '',
      images = [],
      catchDate,
      isAvailable = true,
      marketLocation = 'Mercato Ittico Adriatico',
      kilogramsAvailable,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Catch title is required');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new BadRequestError('Description is required');
    }
    let numericPrice = 0;
    if (price !== undefined && price !== null) {
      if (typeof price !== 'number' || price < 0 || isNaN(price)) {
        throw new BadRequestError('A valid non-negative price is required');
      }
      numericPrice = Number(price);
    }

    let parsedCatchDate = new Date();
    if (catchDate) {
      const d = new Date(catchDate);
      if (isNaN(d.getTime())) {
        throw new BadRequestError('Invalid catchDate format');
      }
      parsedCatchDate = d;
    }

    if (kilogramsAvailable !== undefined && kilogramsAvailable !== null) {
      if (typeof kilogramsAvailable !== 'number' || kilogramsAvailable < 0 || isNaN(kilogramsAvailable)) {
        throw new BadRequestError('kilogramsAvailable must be a non-negative number');
      }
    }

    let parsedImages: string[] = [];
    if (Array.isArray(images)) {
      parsedImages = images.map(img => String(img).trim()).filter(Boolean);
    } else if (typeof images === 'string' && images.trim().length > 0) {
      parsedImages = images.split(/[\n,]+/).map(img => img.trim()).filter(Boolean);
    }
    if (parsedImages.length === 0 && image) {
      parsedImages = [String(image).trim()];
    }

    const item = new Pescato({
      title: title.trim(),
      description: description.trim(),
      price: numericPrice,
      image: typeof image === 'string' && image.trim().length > 0 ? image.trim() : (parsedImages[0] || ''),
      images: parsedImages,
      catchDate: parsedCatchDate,
      isAvailable: Boolean(isAvailable),
      marketLocation: typeof marketLocation === 'string' ? marketLocation.trim() : 'Mercato Ittico Adriatico',
      kilogramsAvailable: kilogramsAvailable !== undefined ? Number(kilogramsAvailable) : undefined,
    });

    await item.save();

    res.locals.auditDetails = {
      pescatoId: item._id.toString(),
      title: item.title,
      catchDate: item.catchDate,
      price: item.price,
    };

    res.status(201).json({
      success: true,
      message: 'Daily catch record created successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing catch record.
 * PUT /api/v1/pescato/:id or PATCH /api/v1/pescato/:id
 */
export const updatePescato = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Pescato ID: '${id}'`);
    }

    const item = await Pescato.findById(id);
    if (!item) {
      throw new NotFoundError(`Catch with ID '${id}' not found`);
    }

    const {
      title,
      description,
      price,
      image,
      catchDate,
      isAvailable,
      marketLocation,
      kilogramsAvailable,
    } = req.body;

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new BadRequestError('Catch title cannot be empty');
      }
      item.title = title.trim();
    }

    if (description !== undefined) {
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        throw new BadRequestError('Description cannot be empty');
      }
      item.description = description.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0 || isNaN(price)) {
        throw new BadRequestError('Price must be a valid non-negative number');
      }
      item.price = Number(price);
    }

    if (image !== undefined) {
      item.image = String(image).trim();
    }

    if (req.body.images !== undefined) {
      const incomingImages = req.body.images;
      if (Array.isArray(incomingImages)) {
        item.images = incomingImages.map(img => String(img).trim()).filter(Boolean);
      } else if (typeof incomingImages === 'string') {
        item.images = incomingImages.split(/[\n,]+/).map(img => img.trim()).filter(Boolean);
      }
    }

    if (catchDate !== undefined) {
      const d = new Date(catchDate);
      if (isNaN(d.getTime())) {
        throw new BadRequestError('Invalid catchDate format');
      }
      item.catchDate = d;
    }

    if (isAvailable !== undefined) {
      item.isAvailable = Boolean(isAvailable);
    }

    if (marketLocation !== undefined) {
      item.marketLocation = String(marketLocation).trim();
    }

    if (kilogramsAvailable !== undefined) {
      if (kilogramsAvailable !== null && (typeof kilogramsAvailable !== 'number' || kilogramsAvailable < 0 || isNaN(kilogramsAvailable))) {
        throw new BadRequestError('kilogramsAvailable must be a non-negative number');
      }
      item.kilogramsAvailable = kilogramsAvailable !== null ? Number(kilogramsAvailable) : undefined;
    }

    await item.save();

    res.locals.auditDetails = {
      pescatoId: item._id.toString(),
      title: item.title,
      updatedFields: Object.keys(req.body),
    };

    res.status(200).json({
      success: true,
      message: 'Daily catch record updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a daily catch record.
 * DELETE /api/v1/pescato/:id
 */
export const deletePescato = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Pescato ID: '${id}'`);
    }

    const item = await Pescato.findByIdAndDelete(id);
    if (!item) {
      throw new NotFoundError(`Catch with ID '${id}' not found`);
    }

    res.locals.auditDetails = {
      deletedPescatoId: id,
      deletedTitle: item.title,
    };

    res.status(200).json({
      success: true,
      message: 'Catch record deleted successfully',
      data: {
        id: item._id.toString(),
        title: item.title,
      },
    });
  } catch (error) {
    next(error);
  }
};
