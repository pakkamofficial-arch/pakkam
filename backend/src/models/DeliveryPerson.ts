import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryPerson extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  email?: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'BICYCLE' | 'VAN';
  vehicleNumber?: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  active: boolean;
  servicePincodes: string[];
  serviceZones: mongoose.Types.ObjectId[];
  currentLatitude?: number;
  currentLongitude?: number;
  maxActiveOrders: number;
  currentActiveOrders: number;
  totalDeliveries: number;
  rating: number;
  assignedOrders: mongoose.Types.ObjectId[];
  lastLocationUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPersonSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    vehicleType: { type: String, enum: ['BIKE', 'SCOOTER', 'BICYCLE', 'VAN'], default: 'BIKE' },
    vehicleNumber: { type: String, default: '' },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE', 'SUSPENDED'],
      default: 'AVAILABLE',
    },
    active: { type: Boolean, default: true },
    servicePincodes: [{ type: String, required: true, trim: true }],
    serviceZones: [{ type: Schema.Types.ObjectId, ref: 'DeliveryZone' }],
    currentLatitude: { type: Number },
    currentLongitude: { type: Number },
    maxActiveOrders: { type: Number, default: 5 },
    currentActiveOrders: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    assignedOrders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    lastLocationUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DeliveryPersonSchema.index({ servicePincodes: 1 });
DeliveryPersonSchema.index({ status: 1, active: 1 });

export const DeliveryPerson = mongoose.model<IDeliveryPerson>('DeliveryPerson', DeliveryPersonSchema);
