import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Evento, IEvento } from '../models/Evento';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * List upcoming events for public calendar and landing showcase.
 * GET /api/v1/eventi/upcoming
 */
export const getUpcomingEventi = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    const events = await Evento.find({
      isActive: true,
      eventDate: { $gte: now },
    })
      .sort({ eventDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List events with filtering, search, and pagination.
 * GET /api/v1/eventi
 */
export const getAllEventi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { timeframe, isActive, search, page, limit } = req.query;

    const filter: Record<string, any> = {};
    const now = new Date();

    if (timeframe === 'upcoming') {
      filter.eventDate = { $gte: now };
    } else if (timeframe === 'past') {
      filter.eventDate = { $lt: now };
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = String(isActive) === 'true';
    }

    if (search) {
      const searchRegex = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [total, items] = await Promise.all([
        Evento.countDocuments(filter),
        Evento.find(filter)
          .sort({ eventDate: 1 })
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
      const items = await Evento.find(filter).sort({ eventDate: 1 }).lean();

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
 * Retrieve single event by ID.
 * GET /api/v1/eventi/:id
 */
export const getEventoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Evento ID: '${id}'`);
    }

    const item = await Evento.findById(id).lean();
    if (!item) {
      throw new NotFoundError(`Event with ID '${id}' not found`);
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
 * Create a new event.
 * POST /api/v1/eventi
 */
export const createEvento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      image = '',
      eventDate,
      price = 0,
      maxSeats,
      reservedSeats = 0,
      isActive = true,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Event title is required');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new BadRequestError('Event description is required');
    }
    if (!eventDate) {
      throw new BadRequestError('Event date is required');
    }

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate.getTime())) {
      throw new BadRequestError('Invalid eventDate format');
    }

    if (price !== undefined && price !== null) {
      if (typeof price !== 'number' || price < 0 || isNaN(price)) {
        throw new BadRequestError('Price must be a valid non-negative number');
      }
    }

    if (maxSeats !== undefined && maxSeats !== null) {
      if (typeof maxSeats !== 'number' || maxSeats < 0 || isNaN(maxSeats)) {
        throw new BadRequestError('maxSeats must be a non-negative number');
      }
    }

    if (reservedSeats !== undefined && reservedSeats !== null) {
      if (typeof reservedSeats !== 'number' || reservedSeats < 0 || isNaN(reservedSeats)) {
        throw new BadRequestError('reservedSeats must be a non-negative number');
      }
    }

    const event = new Evento({
      title: title.trim(),
      description: description.trim(),
      image: typeof image === 'string' ? image.trim() : '',
      eventDate: parsedEventDate,
      price: Number(price) || 0,
      maxSeats: maxSeats !== undefined && maxSeats !== null ? Number(maxSeats) : undefined,
      reservedSeats: Number(reservedSeats) || 0,
      isActive: Boolean(isActive),
    });

    await event.save();

    res.locals.auditDetails = {
      eventoId: event._id.toString(),
      title: event.title,
      eventDate: event.eventDate,
      price: event.price,
    };

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing event.
 * PUT /api/v1/eventi/:id or PATCH /api/v1/eventi/:id
 */
export const updateEvento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Evento ID: '${id}'`);
    }

    const event = await Evento.findById(id);
    if (!event) {
      throw new NotFoundError(`Event with ID '${id}' not found`);
    }

    const {
      title,
      description,
      image,
      eventDate,
      price,
      maxSeats,
      reservedSeats,
      isActive,
    } = req.body;

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new BadRequestError('Event title cannot be empty');
      }
      event.title = title.trim();
    }

    if (description !== undefined) {
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        throw new BadRequestError('Event description cannot be empty');
      }
      event.description = description.trim();
    }

    if (image !== undefined) {
      event.image = String(image).trim();
    }

    if (eventDate !== undefined) {
      const d = new Date(eventDate);
      if (isNaN(d.getTime())) throw new BadRequestError('Invalid eventDate format');
      event.eventDate = d;
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0 || isNaN(price)) {
        throw new BadRequestError('Price must be a valid non-negative number');
      }
      event.price = Number(price);
    }

    if (maxSeats !== undefined) {
      if (maxSeats !== null && (typeof maxSeats !== 'number' || maxSeats < 0 || isNaN(maxSeats))) {
        throw new BadRequestError('maxSeats must be a non-negative number');
      }
      event.maxSeats = maxSeats !== null ? Number(maxSeats) : undefined;
    }

    if (reservedSeats !== undefined) {
      if (typeof reservedSeats !== 'number' || reservedSeats < 0 || isNaN(reservedSeats)) {
        throw new BadRequestError('reservedSeats must be a non-negative number');
      }
      event.reservedSeats = Number(reservedSeats);
    }

    if (isActive !== undefined) {
      event.isActive = Boolean(isActive);
    }

    await event.save();

    res.locals.auditDetails = {
      eventoId: event._id.toString(),
      title: event.title,
      updatedFields: Object.keys(req.body),
    };

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an event.
 * DELETE /api/v1/eventi/:id
 */
export const deleteEvento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Evento ID: '${id}'`);
    }

    const event = await Evento.findByIdAndDelete(id);
    if (!event) {
      throw new NotFoundError(`Event with ID '${id}' not found`);
    }

    res.locals.auditDetails = {
      deletedEventoId: id,
      deletedTitle: event.title,
    };

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {
        id: event._id.toString(),
        title: event.title,
      },
    });
  } catch (error) {
    next(error);
  }
};
