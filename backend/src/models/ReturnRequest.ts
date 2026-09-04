import mongoose, { Schema, Document } from 'mongoose';

export interface IReturnRequest extends Document {
  returnId: string;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }[];
  reason: 'DAMAGED' | 'EXPIRED' | 'WRONG_ITEM' | 'QUALITY_ISSUE' | 'NOT_NEEDED';
  details?: string;
  images?: string[];
  refundDestination: 'ORIGINAL_SOURCE' | 'WALLET';
  status: 'REQUESTED' | 'APPROVED' | 'PICKUP_SCHEDULED' | 'PICKED_UP' | 'REFUNDED' | 'REJECTED';
  refundAmount: number;
  pickupDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnRequestSchema: Schema = new Schema(
  {
    returnId: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    reason: {
      type: String,
      enum: ['DAMAGED', 'EXPIRED', 'WRONG_ITEM', 'QUALITY_ISSUE', 'NOT_NEEDED'],
      required: true,
    },
    details: { type: String },
    images: [{ type: String }],
    refundDestination: {
      type: String,
      enum: ['ORIGINAL_SOURCE', 'WALLET'],
      default: 'WALLET',
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'REFUNDED', 'REJECTED'],
      default: 'REQUESTED',
    },
    refundAmount: { type: Number, required: true },
    pickupDate: { type: Date },
  },
  { timestamps: true }
);

export const ReturnRequest = mongoose.model<IReturnRequest>('ReturnRequest', ReturnRequestSchema);
