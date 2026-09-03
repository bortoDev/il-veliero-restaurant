import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ['client', 'gestore', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  name: string;
  email?: string;
  username?: string;
  password?: string;
  role: UserRole;
  isMasterAdmin: boolean;
  tokenVersion: number;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: 'Invalid role. Allowed: client, gestore, admin',
      },
      default: 'client',
      lowercase: true,
      index: true,
    },
    isMasterAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Validate that either email or username is present before validation
UserSchema.pre<IUser>('validate', function (next) {
  if (this.email === '') {
    this.email = undefined;
  }
  if (this.username === '') {
    this.username = undefined;
  }
  if (!this.email && !this.username) {
    return next(new Error('Either email or username is required'));
  }
  next();
});

// Hash password with bcrypt before saving if modified
UserSchema.pre<IUser>('save', async function (next) {
  if (this.email === '') {
    this.email = undefined;
  }
  if (this.username === '') {
    this.username = undefined;
  }
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare candidate password against stored bcrypt hash
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // If password was not selected, fetch document with password explicitly
  let hash = this.password;
  if (!hash) {
    const userWithPassword = await mongoose.model<IUser>('User').findById(this._id).select('+password');
    hash = userWithPassword?.password;
  }
  if (!hash) return false;
  return bcrypt.compare(candidatePassword, hash);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
