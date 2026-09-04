import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId;
  recipientRole?: 'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN';
  title: string;
  body: string;
  message?: string;
  type: 'NEW_ORDER' | 'ORDER_UPDATE' | 'DELIVERY_ASSIGNED' | 'OFFER' | 'PRICE_DROP' | 'BACK_IN_STOCK' | 'WALLET_CREDIT' | 'SYSTEM';
  isRead: boolean;
  order?: mongoose.Types.ObjectId;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String, enum: ['CUSTOMER', 'SELLER', 'DELIVERY', 'ADMIN'], default: 'CUSTOMER' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    message: { type: String, default: '' },
    type: {
      type: String,
      enum: ['NEW_ORDER', 'ORDER_UPDATE', 'DELIVERY_ASSIGNED', 'OFFER', 'PRICE_DROP', 'BACK_IN_STOCK', 'WALLET_CREDIT', 'SYSTEM'],
      default: 'SYSTEM',
    },
    isRead: { type: Boolean, default: false },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientRole: 1, isRead: 1 });
NotificationSchema.index({ user: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
