import mongoose, { Schema, Document } from 'mongoose';

export interface ISeller extends Document {
  user: mongoose.Types.ObjectId;
  shopName: string;
  businessName: string;
  gstin?: string;
  pan: string;
  fssaiNumber?: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  kycDocuments: {
    panCardUrl?: string;
    gstCertificateUrl?: string;
    addressProofUrl?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  commissionPercentage: number;
  totalEarnings: number;
  payoutPending: number;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopName: { type: String, required: true },
    businessName: { type: String, required: true },
    gstin: { type: String },
    pan: { type: String, required: true },
    fssaiNumber: { type: String },
    bankAccount: {
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      accountHolderName: { type: String, required: true },
      bankName: { type: String, required: true },
    },
    kycDocuments: {
      panCardUrl: { type: String },
      gstCertificateUrl: { type: String },
      addressProofUrl: { type: String },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    rejectionReason: { type: String },
    commissionPercentage: { type: Number, default: 5 },
    totalEarnings: { type: Number, default: 0 },
    payoutPending: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Seller = mongoose.model<ISeller>('Seller', SellerSchema);
