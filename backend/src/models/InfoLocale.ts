import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDaySchedule {
  lunch?: { open: string; close: string };
  dinner?: { open: string; close: string };
  isClosed: boolean;
}

export interface IOpeningHours {
  monday: IDaySchedule;
  tuesday: IDaySchedule;
  wednesday: IDaySchedule;
  thursday: IDaySchedule;
  friday: IDaySchedule;
  saturday: IDaySchedule;
  sunday: IDaySchedule;
  notes?: string;
}

export interface IHistoricalEra {
  year: string;
  title: string;
  subtitle: string;
  badge: string;
  narrative: string[];
  achievements: string[];
  quote: string;
  quoteAuthor: string;
  image: string;
}

export interface IMosaicItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  type?: string;
}

export interface IInfoLocale extends Document {
  name: string;
  legalName?: string;
  pIva?: string;
  sdi?: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
  email: string;
  secondaryEmail?: string;
  historyStory: string;
  historicalEras?: IHistoricalEra[];
  mosaicItems?: IMosaicItem[];
  openingHours: IOpeningHours;
  coordinates: {
    lat: number;
    lng: number;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    tripadvisor?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DayScheduleSchema = new Schema(
  {
    lunch: {
      open: { type: String, default: '12:00' },
      close: { type: String, default: '14:00' },
    },
    dinner: {
      open: { type: String, default: '19:00' },
      close: { type: String, default: '22:00' },
    },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const InfoLocaleSchema = new Schema<IInfoLocale>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      default: 'Il Veliero — Ristorante & Pizzeria dal Campione del Mondo',
      trim: true,
    },
    legalName: {
      type: String,
      default: 'Pizza dal Campione del Mondo s.n.c. di Bortolato Federico e Mazzeracca Sabina',
      trim: true,
    },
    pIva: {
      type: String,
      default: '03450720242',
      trim: true,
    },
    sdi: {
      type: String,
      default: 'P62QHVQ',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      default: 'Via G. Fattori 7 - Località San Michele, 36061 Bassano del Grappa (VI)',
      trim: true,
    },
    city: {
      type: String,
      default: 'Bassano del Grappa',
      trim: true,
    },
    province: {
      type: String,
      default: 'VI',
      trim: true,
    },
    postalCode: {
      type: String,
      default: '36061',
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      default: '0424 500 200',
      trim: true,
    },
    mobile: {
      type: String,
      default: '334 623 2941',
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '334 623 2941',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      default: 'pizzadalcampione@gmail.com',
      trim: true,
      lowercase: true,
    },
    secondaryEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    historyStory: {
      type: String,
      required: [true, 'History story is required'],
      default:
        "Nata dalla passione per l'eccellenza culinaria e l'arte bianca, la storia de Il Veliero è un viaggio di dedizione e trionfi. Guidato dal Maestro Federico Bortolato, Campione del Mondo della Pizza, e da Sabina Mazzeracca, il nostro ristorante a Bassano del Grappa unisce la migliore tradizione dei piatti di mare freschissimi dell'Adriatico a pizze gourmet cotte a legna con impasti a lunga maturazione.",
      trim: true,
    },
    historicalEras: [
      {
        year: { type: String, required: true },
        title: { type: String, required: true },
        subtitle: { type: String, default: '' },
        badge: { type: String, default: '' },
        narrative: [{ type: String }],
        achievements: [{ type: String }],
        quote: { type: String, default: '' },
        quoteAuthor: { type: String, default: '' },
        image: { type: String, default: '' },
      },
    ],
    mosaicItems: [
      {
        id: { type: String },
        tag: { type: String, default: '' },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        icon: { type: String, default: '' },
        type: { type: String, default: '' },
      },
    ],
    openingHours: {
      monday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false }) },
      tuesday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false }) },
      wednesday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '', close: '' }, dinner: { open: '', close: '' }, isClosed: true }) },
      thursday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false }) },
      friday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false }) },
      saturday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false }) },
      sunday: { type: DayScheduleSchema, default: () => ({ lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false }) },
      notes: { type: String, default: 'Pranzo 12:00-14:00 | Cena 19:00-22:00. Chiuso il Mercoledì per riposo settimanale.' },
    },
    coordinates: {
      lat: { type: Number, default: 45.7667 },
      lng: { type: Number, default: 11.7333 },
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/ilvelierobassano' },
      instagram: { type: String, default: 'https://www.instagram.com/ilvelierotrattoria' },
      whatsapp: { type: String, default: 'https://wa.me/393346232941' },
      tripadvisor: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const InfoLocale: Model<IInfoLocale> = mongoose.model<IInfoLocale>('InfoLocale', InfoLocaleSchema);
export default InfoLocale;
