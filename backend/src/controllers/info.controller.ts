import { Request, Response, NextFunction } from 'express';
import { InfoLocale, IInfoLocale } from '../models/InfoLocale';
import { BadRequestError } from '../utils/errors';

const DEFAULT_INFO = {
  name: 'Il Veliero — Ristorante & Pizzeria dal Campione del Mondo',
  legalName: 'Pizza dal Campione del Mondo s.n.c. di Bortolato Federico e Mazzeracca Sabina',
  pIva: '03450720242',
  sdi: 'P62QHVQ',
  address: 'Via G. Fattori 7 - Località San Michele, 36061 Bassano del Grappa (VI)',
  city: 'Bassano del Grappa',
  province: 'VI',
  postalCode: '36061',
  phone: '0424 500 200',
  mobile: '',
  whatsapp: '',
  email: 'pizzadalcampione@gmail.com',
  secondaryEmail: '',
  historyStory:
    "Nata dalla passione per l'eccellenza culinaria e l'arte bianca, la storia de Il Veliero è un viaggio di dedizione e trionfi. Guidato dal Maestro Federico Bortolato, Campione del Mondo della Pizza, e da Sabina Mazzeracca, il nostro ristorante a Bassano del Grappa unisce la migliore tradizione dei piatti di mare freschissimi dell'Adriatico a pizze gourmet cotte a legna con impasti a lunga maturazione.",
  openingHours: {
    monday: {
      lunch: { open: '12:00', close: '14:00' },
      dinner: { open: '19:00', close: '22:00' },
      isClosed: false,
    },
    tuesday: {
      lunch: { open: '12:00', close: '14:00' },
      dinner: { open: '19:00', close: '22:00' },
      isClosed: false,
    },
    wednesday: {
      lunch: { open: '', close: '' },
      dinner: { open: '', close: '' },
      isClosed: true,
    },
    thursday: {
      lunch: { open: '12:00', close: '14:00' },
      dinner: { open: '19:00', close: '22:00' },
      isClosed: false,
    },
    friday: {
      lunch: { open: '12:00', close: '14:00' },
      dinner: { open: '19:00', close: '22:00' },
      isClosed: false,
    },
    saturday: {
      lunch: { open: '12:00', close: '14:00' },
      dinner: { open: '19:00', close: '22:00' },
      isClosed: false,
    },
    sunday: {
      lunch: { open: '12:00', close: '14:00' },
      dinner: { open: '19:00', close: '22:00' },
      isClosed: false,
    },
    notes:
      'Orari Cucina: Pranzo 12:00-14:00 | Cena 19:00-22:00 (la cucina non fa pasti fuori da questi orari; la pizzeria può aprire leggermente prima o chiudere dopo). Chiuso il Mercoledì per riposo settimanale.',
  },
  coordinates: {
    lat: 45.7667,
    lng: 11.7333,
  },
  socialLinks: {
    facebook: 'https://facebook.com/ilvelierobassano',
    instagram: 'https://www.instagram.com/ilvelierotrattoria',
    whatsapp: '',
    tripadvisor: '',
  },
};

/**
 * Retrieve restaurant information and story singleton.
 * GET /api/v1/info or GET /api/v1/info-locale
 */
export const getInfoLocale = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let info = await InfoLocale.findOne();

    if (!info) {
      info = await InfoLocale.create(DEFAULT_INFO);
    }

    res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update restaurant information and story singleton.
 * PUT /api/v1/info or PUT /api/v1/info-locale or PATCH
 */
export const updateInfoLocale = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let info = await InfoLocale.findOne();

    if (!info) {
      info = new InfoLocale(DEFAULT_INFO);
    }

    const {
      name,
      legalName,
      pIva,
      sdi,
      historyStory,
      historicalEras,
      mosaicItems,
      address,
      city,
      province,
      postalCode,
      phone,
      mobile,
      whatsapp,
      email,
      secondaryEmail,
      openingHours,
      coordinates,
      socialLinks,
    } = req.body;

    if (historicalEras !== undefined) {
      if (Array.isArray(historicalEras)) {
        info.historicalEras = historicalEras;
      }
    }

    if (mosaicItems !== undefined) {
      if (Array.isArray(mosaicItems)) {
        info.mosaicItems = mosaicItems;
      }
    }

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new BadRequestError('Restaurant name cannot be empty');
      }
      info.name = name.trim();
    }

    if (legalName !== undefined) {
      info.legalName = String(legalName).trim();
    }

    if (pIva !== undefined) {
      info.pIva = String(pIva).trim();
    }

    if (sdi !== undefined) {
      info.sdi = String(sdi).trim();
    }

    if (historyStory !== undefined) {
      if (!historyStory || typeof historyStory !== 'string' || historyStory.trim().length === 0) {
        throw new BadRequestError('History story cannot be empty');
      }
      info.historyStory = historyStory.trim();
    }

    if (address !== undefined) {
      if (!address || typeof address !== 'string' || address.trim().length === 0) {
        throw new BadRequestError('Address cannot be empty');
      }
      info.address = address.trim();
    }

    if (city !== undefined) {
      info.city = String(city).trim();
    }

    if (province !== undefined) {
      info.province = String(province).trim();
    }

    if (postalCode !== undefined) {
      info.postalCode = String(postalCode).trim();
    }

    if (phone !== undefined) {
      if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
        throw new BadRequestError('Phone number cannot be empty');
      }
      info.phone = phone.trim();
    }

    if (mobile !== undefined) {
      info.mobile = String(mobile).trim();
    }

    if (whatsapp !== undefined) {
      info.whatsapp = String(whatsapp).trim();
    }

    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new BadRequestError('A valid email address is required');
      }
      info.email = email.toLowerCase().trim();
    }

    if (secondaryEmail !== undefined) {
      info.secondaryEmail = String(secondaryEmail).toLowerCase().trim();
    }

    if (openingHours !== undefined) {
      if (typeof openingHours !== 'object' || openingHours === null) {
        throw new BadRequestError('openingHours must be a valid schedule object');
      }
      info.openingHours = { ...info.openingHours, ...openingHours };
    }

    if (coordinates !== undefined) {
      if (
        typeof coordinates !== 'object' ||
        coordinates === null ||
        typeof coordinates.lat !== 'number' ||
        typeof coordinates.lng !== 'number'
      ) {
        throw new BadRequestError('coordinates must contain numeric lat and lng properties');
      }
      info.coordinates = coordinates;
    }

    if (socialLinks !== undefined) {
      info.socialLinks = { ...info.socialLinks, ...socialLinks };
    }

    await info.save();

    res.locals.auditDetails = {
      restaurantName: info.name,
      updatedFields: Object.keys(req.body),
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant information updated successfully',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};
