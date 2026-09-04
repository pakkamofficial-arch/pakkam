import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  wallet: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  referenceType?: 'REFERRAL' | 'ORDER' | 'REFUND' | 'ADMIN_ADJUSTMENT';
  referenceId?: string;
  createdAt: Date;
}

const WalletTransactionSchema: Schema = new Schema(
  {
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    description: { type: String, required: true },
    referenceType: { type: String, enum: ['REFERRAL', 'ORDER', 'REFUND', 'ADMIN_ADJUSTMENT'] },
    referenceId: { type: String },
  },
  { timestamps: true }
);

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
