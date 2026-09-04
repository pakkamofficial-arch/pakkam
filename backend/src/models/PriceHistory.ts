import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceHistory extends Document {
  product: mongoose.Types.ObjectId;
  productName: string;
  marketPrice: number;
  sellingPrice: number;
  previousSellingPrice?: number;
  source: string;
  region: string;
  changedBy?: mongoose.Types.ObjectId;
  changedByName?: string;
  reason?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PriceHistorySchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    marketPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    previousSellingPrice: { type: Number },
    source: { type: String, default: 'Government Price Monitoring System' },
    region: { type: String, default: 'Madurai' },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changedByName: { type: String, default: 'System' },
    reason: { type: String, default: 'Price Synchronization / Admin Update' },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PriceHistorySchema.index({ product: 1, recordedAt: -1 });

export const PriceHistory = mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);
