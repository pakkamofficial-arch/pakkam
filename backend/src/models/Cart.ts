import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  shop: mongoose.Types.ObjectId;
  selectedUnit: string;
  unitMultiplier: number;
  quantity: number;
  price: number;
  discountPrice?: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  selectedUnit: { type: String, required: true },
  unitMultiplier: { type: Number, default: 1 },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
});

const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
