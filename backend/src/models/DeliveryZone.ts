import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryZone extends Document {
  name: string;
  city: string;
  state: string;
  pincodes: string[];
  active: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: 'Tamil Nadu' },
    pincodes: [{ type: String, required: true, trim: true }],
    active: { type: Boolean, default: true },
    latitude: { type: Number },
    longitude: { type: Number },
    radius: { type: Number, default: 5 }, // radius in km
  },
  { timestamps: true }
);

DeliveryZoneSchema.index({ pincodes: 1 });
DeliveryZoneSchema.index({ active: 1 });

export const DeliveryZone = mongoose.model<IDeliveryZone>('DeliveryZone', DeliveryZoneSchema);
