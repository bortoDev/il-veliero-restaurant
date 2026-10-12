import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEvento extends Document {
  title: string;
  description: string;
  image: string;
  images: string[];
  eventDate: Date;
  price: number;
  maxSeats?: number;
  reservedSeats: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventoSchema = new Schema<IEvento>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
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
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    maxSeats: {
      type: Number,
      min: [0, 'Max seats cannot be negative'],
    },
    reservedSeats: {
      type: Number,
      default: 0,
      min: [0, 'Reserved seats cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

EventoSchema.index({ eventDate: 1, isActive: 1 });

export const Evento: Model<IEvento> = mongoose.model<IEvento>('Evento', EventoSchema);
export default Evento;
