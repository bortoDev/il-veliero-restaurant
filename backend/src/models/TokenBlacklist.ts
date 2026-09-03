import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITokenBlacklist extends Document {
  token: string;
  expiresAt: Date;
  reason?: string;
  revokedAt: Date;
  revokedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>(
  {
    token: {
      type: String,
      required: [true, 'Token string is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required for TTL purging'],
    },
    reason: {
      type: String,
      default: 'user_logout',
      trim: true,
    },
    revokedAt: {
      type: Date,
      default: Date.now,
    },
    revokedBy: {
      type: Schema.Types.Mixed,
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

// MongoDB TTL Index: automatically purges documents when expiresAt has passed
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist: Model<ITokenBlacklist> = mongoose.model<ITokenBlacklist>(
  'TokenBlacklist',
  TokenBlacklistSchema
);
export default TokenBlacklist;
