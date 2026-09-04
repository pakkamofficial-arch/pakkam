import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  logo?: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  deliveryRadius: number; // in kilometers
  minimumOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true, default: 13.0827 },
    longitude: { type: Number, required: true, default: 80.2707 },
    logo: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
    coverImage: { type: String, default: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800' },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 120 },
    openingTime: { type: String, default: '07:00 AM' },
    closingTime: { type: String, default: '10:00 PM' },
    isOpen: { type: Boolean, default: true },
    deliveryRadius: { type: Number, default: 5 }, // 5 km
    minimumOrder: { type: Number, default: 100 },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'APPROVED' },
  },
  { timestamps: true }
);

export const Shop = mongoose.model<IShop>('Shop', ShopSchema);
