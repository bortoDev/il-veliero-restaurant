import mongoose, { Document, Schema, Model } from 'mongoose';

export const AVVISO_SEVERITY = ['info', 'warning', 'danger'] as const;
export type AvvisoSeverity = (typeof AVVISO_SEVERITY)[number];

export interface IAvviso extends Document {
  title: string;
  message: string;
  severity: AvvisoSeverity;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvvisoSchema = new Schema<IAvviso>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notice message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: AVVISO_SEVERITY,
        message: 'Invalid severity level. Allowed: info, warning, danger',
      },
      default: 'info',
      lowercase: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endDate: {
      type: Date,
      index: true,
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

AvvisoSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export const Avviso: Model<IAvviso> = mongoose.model<IAvviso>('Avviso', AvvisoSchema);
export default Avviso;
