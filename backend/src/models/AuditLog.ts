import mongoose, { Document, Schema, Model } from 'mongoose';

export const AUDIT_STATUS = ['SUCCESS', 'FAILURE'] as const;
export type AuditStatus = (typeof AUDIT_STATUS)[number];

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId | string;
  userEmail?: string;
  username?: string;
  operator?: string;
  role?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  status: AuditStatus;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.Mixed,
      index: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    operator: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      default: 'anonymous',
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      index: true,
    },
    resource: {
      type: String,
      required: [true, 'Audit target resource is required'],
      trim: true,
      index: true,
    },
    resourceId: {
      type: String,
      trim: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    userAgent: {
      type: String,
      default: 'unknown',
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: {
        values: AUDIT_STATUS,
        message: 'Status must be either SUCCESS or FAILURE',
      },
      default: 'SUCCESS',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
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

AuditLogSchema.index({ timestamp: -1, resource: 1, action: 1 });
AuditLogSchema.index({ operator: 1, timestamp: -1 });
AuditLogSchema.index({ username: 1, timestamp: -1 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
