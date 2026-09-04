import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
