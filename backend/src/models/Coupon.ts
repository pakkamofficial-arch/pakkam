import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    discountValue: { type: Number, required: true },
    minimumOrder: { type: Number, default: 0 },
    maximumDiscount: { type: Number },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
