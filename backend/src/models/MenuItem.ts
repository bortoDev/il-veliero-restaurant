import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * 8 Official Top-Level Categories of Il Veliero
 */
export const MENU_CATEGORIES = [
  'pesce',
  'carne',
  'contorni',
  'pizze',
  'vini',
  'bevande',
  'insalatone',
  'piatti_estivi',
] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

/**
 * Subcategories covering every section across the physical 29-photo menu catalog
 */
export const MENU_SUBCATEGORIES = [
  // Pesce
  'antipasti',
  'crudo',
  'primi',
  'secondi',
  'pescato_della_settimana',
  'pescato_settimana', // alias
  // Carne
  'antipasti_carne',
  'primi_carne',
  'secondi_carne',
  // Piatti Estivi & Insalatone
  'piatti_estivi',
  'estivi', // alias
  'insalatone',
  'gourmet', // alias
  // Contorni & Coperto
  'contorni',
  'coperto',
  // Pizze del Campione
  'stagionali',
  'stagione_finferli', // alias
  'finferli_stagione', // alias
  'classiche',
  'della_casa',
  'ricercate', // alias
  'speciali',
  'bianche',
  'verdure',
  'vegetariane',
  // Carta dei Vini
  'bollicine_charmat',
  'bollicine_metodo_classico',
  'metodo_classico', // alias
  'bollicine', // alias
  'bianchi',
  'rossi',
  'rosati',
  'vino_della_casa',
  'vino_sfuso', // alias
  // Bevande & Bar
  'caffetteria',
  'bibite',
  'birre',
  'birre_artigianali', // alias
  'amari',
  'amari_grappe', // alias
  'grappe',
  // Legacy / fallback
  'dolci',
] as const;
export type MenuSubcategory = (typeof MENU_SUBCATEGORIES)[number] | string;

/**
 * Official EU Allergen Definition Structure
 */
export interface AllergenDefinition {
  number: number;
  name: string;
  slug: string;
  description: string;
}

/**
 * Official 1–14 Allergen Map matching physical restaurant chart in Bassano del Grappa
 */
export const OFFICIAL_ALLERGEN_MAP: Record<number, AllergenDefinition> = {
  1: {
    number: 1,
    name: 'Pesce',
    slug: 'pesce',
    description: 'Prodotti alimentari in cui è presente il pesce anche se in piccole percentuali.',
  },
  2: {
    number: 2,
    name: 'Crostacei',
    slug: 'crostacei',
    description: "Marini e d'acqua dolce: gamberi, scampi, aragoste, astici, granchi e simili.",
  },
  3: {
    number: 3,
    name: 'Molluschi',
    slug: 'molluschi',
    description: 'Canestrello, cannolicchio, capasanta, cozza, ostrica, patella, vongola, tellina.',
  },
  4: {
    number: 4,
    name: 'Glutine',
    slug: 'glutine',
    description: 'Cereali, grano, segale, orzo, avena, farro, kamut, inclusi ibridati derivati.',
  },
  5: {
    number: 5,
    name: 'Uova',
    slug: 'uova',
    description: "Uova e prodotti che le contengano come: maionese, emulsionanti, pasta all'uovo.",
  },
  6: {
    number: 6,
    name: 'Latte',
    slug: 'latte',
    description: 'Ogni prodotto in cui viene usato il latte: formaggi, yogurt, burro, creme varie.',
  },
  7: {
    number: 7,
    name: 'Sedano',
    slug: 'sedano',
    description: "Sia in pezzi che all'interno di preparati per zuppe, salse e concentrati vegetali.",
  },
  8: {
    number: 8,
    name: 'Senape',
    slug: 'senape',
    description: 'Si può trovare nelle salse e nei condimenti, specie nella mostarda.',
  },
  9: {
    number: 9,
    name: 'Sesamo',
    slug: 'semi_di_sesamo',
    description: 'Semi interi usati per pane, farine anche se lo contengono in minima percentuale.',
  },
  10: {
    number: 10,
    name: 'Frutta a guscio',
    slug: 'frutta_a_guscio',
    description: 'Mandorle, nocciole, noci comuni, noci di acagiù, noci pecan, anacardi e pistacchi.',
  },
  11: {
    number: 11,
    name: 'Arachidi',
    slug: 'arachidi',
    description: 'Snack confezionati, creme, oli e condimenti in cui vi sia anche in piccole dosi.',
  },
  12: {
    number: 12,
    name: 'Solfiti',
    slug: 'anidride_solforosa',
    description: "Cibi sott'aceto, sott'olio, in salamoia, funghi secchi, conserve, marmellate, vini.",
  },
  13: {
    number: 13,
    name: 'Lupini',
    slug: 'lupini',
    description: 'Presenti in cibi vegan sottoforma di arrosti, salamini, farine e similari.',
  },
  14: {
    number: 14,
    name: 'Soia',
    slug: 'soia',
    description: 'Prodotti derivati come: latte di soia, tofu, spaghetti di soia e simili.',
  },
};

/**
 * Reverse lookup map from slug to allergen number (e.g. 'glutine' -> 4)
 */
export const ALLERGEN_SLUG_TO_NUMBER: Record<string, number> = Object.entries(
  OFFICIAL_ALLERGEN_MAP
).reduce((acc, [numStr, def]) => {
  acc[def.slug] = Number(numStr);
  return acc;
}, {} as Record<string, number>);

// Add common slug aliases
ALLERGEN_SLUG_TO_NUMBER['solfiti'] = 12;
ALLERGEN_SLUG_TO_NUMBER['sesamo'] = 9;
ALLERGEN_SLUG_TO_NUMBER['frutta_guscio'] = 10;
ALLERGEN_SLUG_TO_NUMBER['fruttaguscio'] = 10;

export const EU_ALLERGENS = [
  'pesce',
  'crostacei',
  'molluschi',
  'glutine',
  'uova',
  'latte',
  'sedano',
  'senape',
  'semi_di_sesamo',
  'frutta_a_guscio',
  'arachidi',
  'anidride_solforosa',
  'lupini',
  'soia',
] as const;
export type Allergen = (typeof EU_ALLERGENS)[number] | string;

/**
 * Wine Specific Enological Details
 */
export interface WineDetails {
  type?: string;       // e.g. 'bianco', 'rosso', 'rosato', 'bollicine', 'champagne', 'sfuso'
  vintage?: number | string; // e.g. 2021, 2023, '2021/2023'
  region?: string;     // e.g. 'Veneto', 'Trentino', 'Lombardia', 'Toscana', 'Puglia', 'Sardegna', 'Sicilia'
  producer?: string;   // e.g. 'Cantina Bortoluz', 'Monte Zovo', 'Romantica', 'Aldeno', 'Freccianera'
  bottleSize?: string; // e.g. '750ml', '0.75L', '0.33L', '0.50L', '1.00L'
  grape?: string;
  alcohol?: string;
  notes?: string;
}

/**
 * Dietary Preference Flags
 */
export interface DietaryFlags {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

/**
 * Mongoose MenuItem Document Interface
 */
export interface IMenuItem extends Document {
  title: string;
  description: string;
  price: number;
  category: MenuCategory;
  subcategory?: string;
  allergens: string[];
  allergenNumbers: number[];
  image: string;
  isAvailable: boolean;
  isChefSpecial?: boolean;
  dietary: DietaryFlags;
  wineDetails?: WineDetails;
  createdAt: Date;
  updatedAt: Date;
}

const WineDetailsSchema = new Schema<WineDetails>(
  {
    type: { type: String, trim: true, lowercase: true },
    vintage: { type: Schema.Types.Mixed },
    region: { type: String, trim: true },
    producer: { type: String, trim: true },
    bottleSize: { type: String, trim: true, default: '750ml' },
    grape: { type: String, trim: true },
    alcohol: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const DietaryFlagsSchema = new Schema<DietaryFlags>(
  {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<IMenuItem>(
  {
    title: {
      type: String,
      required: [true, 'Dish title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Dish description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: MENU_CATEGORIES,
        message: 'Invalid category. Allowed: {VALUES}',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    allergens: {
      type: [String],
      default: [],
      lowercase: true,
    },
    allergenNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr: number[]) =>
          Array.isArray(arr) && arr.every((n) => Number.isInteger(n) && n >= 1 && n <= 14),
        message: 'Allergen numbers must be integers between 1 and 14',
      },
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isChefSpecial: {
      type: Boolean,
      default: false,
    },
    dietary: {
      type: DietaryFlagsSchema,
      default: () => ({ isVegetarian: false, isVegan: false, isGlutenFree: false }),
    },
    wineDetails: {
      type: WineDetailsSchema,
      required: false,
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

/**
 * Pre-save middleware: Synchronize allergenNumbers <-> allergens
 */
MenuItemSchema.pre('save', function (next) {
  // If allergenNumbers are present, populate allergens slugs if empty or incomplete
  if (this.allergenNumbers && this.allergenNumbers.length > 0) {
    const derivedSlugs = this.allergenNumbers
      .map((num) => OFFICIAL_ALLERGEN_MAP[num]?.slug)
      .filter(Boolean) as string[];

    const combinedSlugs = Array.from(new Set([...(this.allergens || []), ...derivedSlugs]));
    this.allergens = combinedSlugs;
  } else if (this.allergens && this.allergens.length > 0) {
    // If only allergens slugs are provided, derive allergenNumbers
    const derivedNumbers = this.allergens
      .map((slug) => ALLERGEN_SLUG_TO_NUMBER[slug.toLowerCase().trim()])
      .filter((n): n is number => n !== undefined && n >= 1 && n <= 14);

    this.allergenNumbers = Array.from(new Set(derivedNumbers)).sort((a, b) => a - b);
  }

  // Auto-set gluten-free flag if no gluten and not explicitly specified as false
  if (this.dietary && this.dietary.isGlutenFree === undefined) {
    this.dietary.isGlutenFree =
      !this.allergenNumbers.includes(4) && !this.allergens.includes('glutine');
  }

  next();
});

// Compound indexes for optimal performance
MenuItemSchema.index({ category: 1, subcategory: 1, isAvailable: 1 });
MenuItemSchema.index({ allergens: 1 });
MenuItemSchema.index({ allergenNumbers: 1 });
MenuItemSchema.index({ isChefSpecial: 1 });
MenuItemSchema.index({ 'dietary.isVegetarian': 1 });
MenuItemSchema.index({ 'dietary.isVegan': 1 });
MenuItemSchema.index({ 'dietary.isGlutenFree': 1 });
MenuItemSchema.index({ 'wineDetails.type': 1, 'wineDetails.region': 1 });

export const MenuItem: Model<IMenuItem> = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export default MenuItem;
