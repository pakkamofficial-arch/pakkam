import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  fullName?: string;
  phone: string;
  mobileNumber?: string;
  houseFlat: string;
  street: string;
  area: string;
  addressLine?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  type: 'HOME' | 'WORK' | 'OTHER';
}

const AddressSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fullName: { type: String },
    phone: { type: String, required: true },
    mobileNumber: { type: String },
    houseFlat: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    addressLine: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true, default: 'Tamil Nadu' },
    pincode: { type: String, required: true },
    landmark: { type: String, default: '' },
    latitude: { type: Number, default: 13.0827 },
    longitude: { type: Number, default: 80.2707 },
    isDefault: { type: Boolean, default: false },
    type: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
  },
  { timestamps: true }
);

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
