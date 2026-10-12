import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPescato extends Document {
  title: string;
  description: string;
  image?: string;
  images?: string[];
  price?: number;
  catchDate: Date;
  isAvailable?: boolean;
  marketLocation?: string;
  kilogramsAvailable?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PescatoSchema = new Schema<IPescato>(
  {
    title: {
      type: String,
      required: [true, 'Catch title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    catchDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    marketLocation: {
      type: String,
      trim: true,
      default: 'Mercato Ittico Adriatico',
    },
    kilogramsAvailable: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
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

PescatoSchema.index({ catchDate: -1, isAvailable: 1 });

export const Pescato: Model<IPescato> = mongoose.model<IPescato>('Pescato', PescatoSchema);
export default Pescato;
