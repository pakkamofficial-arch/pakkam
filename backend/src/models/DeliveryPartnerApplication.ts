import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryPartnerApplication extends Document {
  applicationId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'BICYCLE' | 'VAN';
  vehicleNumber?: string;
  servicePincodes: string[];
  preferredDeliveryArea?: string;
  identityVerificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentReference?: string; // Masked / restricted reference
  applicationStatus: 'pending' | 'under_review' | 'accepted' | 'rejected';
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  externalResponseId?: string; // For Google Form deduplication
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPartnerApplicationSchema: Schema = new Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true, default: 'Tamil Nadu' },
    vehicleType: { type: String, enum: ['BIKE', 'SCOOTER', 'BICYCLE', 'VAN'], default: 'BIKE' },
    vehicleNumber: { type: String, default: '' },
    servicePincodes: [{ type: String, required: true, trim: true }],
    preferredDeliveryArea: { type: String, default: '' },
    identityVerificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    documentReference: { type: String, select: false }, // Security: Never return document reference in general queries
    applicationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'accepted', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    externalResponseId: { type: String, sparse: true },
  },
  { timestamps: true }
);

DeliveryPartnerApplicationSchema.index({ mobileNumber: 1 });
DeliveryPartnerApplicationSchema.index({ pincode: 1 });
DeliveryPartnerApplicationSchema.index({ applicationStatus: 1 });

export const DeliveryPartnerApplication = mongoose.model<IDeliveryPartnerApplication>(
  'DeliveryPartnerApplication',
  DeliveryPartnerApplicationSchema
);
