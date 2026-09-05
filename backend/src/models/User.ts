import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface INotificationToken {
  token: string;
  platform?: string;
  deviceId?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  username?: string;
  password?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN';
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  shop?: mongoose.Types.ObjectId;
  referralCode?: string;
  referredBy?: string;
  pushToken?: string;
  notificationTokens?: INotificationToken[];
  savedUPIs?: string[];
  savedCards?: {
    cardToken: string;
    cardBrand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
  }[];
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  resetPasswordToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: false, sparse: true, lowercase: true, trim: true, default: undefined },
    username: { type: String, required: false, sparse: true, trim: true, default: undefined },
    password: { type: String, select: false },
    avatar: { type: String },
    role: { type: String, enum: ['CUSTOMER', 'SELLER', 'DELIVERY', 'ADMIN'], default: 'CUSTOMER' },
    isActive: { type: Boolean, default: true },
    hasCompletedOnboarding: { type: Boolean, default: false },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String },
    pushToken: { type: String },
    notificationTokens: [
      {
        token: { type: String, required: true },
        platform: { type: String, default: 'android' },
        deviceId: { type: String },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordOtp: { type: String, select: false },
    resetPasswordOtpExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    savedUPIs: [{ type: String }],
    savedCards: [
      {
        cardToken: { type: String },
        cardBrand: { type: String },
        last4: { type: String },
        expiryMonth: { type: String },
        expiryYear: { type: String },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
