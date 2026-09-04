import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyGroceryItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  priceAtCreation: number;
  isAvailable: boolean;
}

export interface IMonthlyGroceryList extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  month: string;
  familySize?: string;
  items: IMonthlyGroceryItem[];
  estimatedTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyGroceryItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, required: true, default: '1 kg' },
  priceAtCreation: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
});

const MonthlyGroceryListSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    month: { type: String, required: true },
    familySize: { type: String, default: 'Custom' },
    items: [MonthlyGroceryItemSchema],
    estimatedTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MonthlyGroceryList = mongoose.model<IMonthlyGroceryList>('MonthlyGroceryList', MonthlyGroceryListSchema);
