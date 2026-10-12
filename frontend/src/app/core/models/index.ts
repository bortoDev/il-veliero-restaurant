export type UserRole = 'client' | 'gestore' | 'admin';

export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: UserRole;
  isActive: boolean;
  isMasterAdmin?: boolean;
  tokenVersion?: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export type MenuCategory =
  | 'pesce'
  | 'carne'
  | 'contorni'
  | 'pizze'
  | 'vini'
  | 'bevande'
  | 'insalatone'
  | 'piatti_estivi';

export interface WineDetails {
  type?: string;
  vintage?: number | string;
  region?: string;
  producer?: string;
  bottleSize?: string;
  grape?: string;
  alcohol?: string;
  notes?: string;
}

export interface DietaryFlags {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

export interface MenuItem {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: MenuCategory;
  subcategory?: string;
  allergens: string[];
  allergenNumbers?: number[];
  image: string;
  isAvailable: boolean;
  isChefSpecial?: boolean;
  dietary?: DietaryFlags;
  wineDetails?: WineDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface PescatoItem {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price?: number;
  image?: string;
  images?: string[];
  catchDate: string;
  isAvailable?: boolean;
  marketLocation?: string;
  kilogramsAvailable?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AvvisoSeverity = 'info' | 'warning' | 'danger';

export interface Avviso {
  id?: string;
  _id?: string;
  title: string;
  message: string;
  severity: AvvisoSeverity;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  image?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Evento {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  image?: string;
  images?: string[];
  eventDate: string;
  price: number;
  maxSeats?: number;
  reservedSeats: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DaySchedule {
  lunch?: { open: string; close: string };
  dinner?: { open: string; close: string };
  isClosed: boolean;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  notes?: string;
}

export interface HistoricalEra {
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

export interface MosaicItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  type?: string;
}

export interface InfoLocale {
  _id?: string;
  id?: string;
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
  historicalEras?: HistoricalEra[];
  mosaicItems?: MosaicItem[];
  openingHours: OpeningHours;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  user?: string;
  userEmail?: string;
  username?: string;
  operator?: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE';
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlacklistedToken {
  _id?: string;
  token: string;
  tokenSnippet?: string;
  reason: string;
  expiresAt: string;
  revokedAt: string;
  isExpired?: boolean;
  ttlRemainingSeconds?: number;
}

