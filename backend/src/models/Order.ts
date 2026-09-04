import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  selectedUnit: string;
  quantity: number;
  price: number;
  discountPrice?: number;
}

export interface IOrderTimeline {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customerType?: 'guest' | 'registered';
  shop: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryAddress: {
    name: string;
    fullName?: string;
    phone: string;
    mobileNumber?: string;
    houseFlat?: string;
    street?: string;
    area?: string;
    addressLine?: string;
    city: string;
    state?: string;
    pincode: string;
    landmark?: string;
  };
  pincode?: string;
  deliveryZone?: mongoose.Types.ObjectId;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'TEST_PAYMENT' | 'UPI' | 'CARD' | 'COD' | 'ONLINE' | 'RAZORPAY';
  paymentStatus: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'CANCELLED' | 'COD';
  paymentId?: string;
  paymentOrderId?: string;
  paymentSignature?: string;
  orderStatus:
    | 'PAYMENT_PENDING'
    | 'PLACED'
    | 'CONFIRMED'
    | 'SHOP_ACCEPTED'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'READY_FOR_PICKUP'
    | 'DELIVERY_ASSIGNED'
    | 'DELIVERY_ACCEPTED'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELED'
    | 'CANCELLED'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_CANCELLED';
  cancellationReason?: string;
  cancelledBy?: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  cancelledAt?: Date;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
  deliveryPerson?: mongoose.Types.ObjectId;
  assignmentType?: 'ADMIN' | 'AUTO';
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  deliveryOtp?: {
    code: string;
    generatedAt?: Date;
    verifiedAt?: Date;
    attempts?: number;
    status?: 'PENDING' | 'VERIFIED';
  } | any;
  whatsappStatus?: 'PENDING' | 'SENT' | 'FAILED';
  whatsappConfirmationSent?: boolean;
  whatsappMessageId?: string;
  whatsappSentAt?: Date;
  whatsappError?: string;
  notes?: string;
  statusTimeline: IOrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    customerType: { type: String, enum: ['guest', 'registered'], default: 'guest' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        selectedUnit: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
      },
    ],
    deliveryAddress: {
      name: { type: String, required: true },
      fullName: { type: String },
      phone: { type: String, required: true },
      mobileNumber: { type: String },
      houseFlat: { type: String, default: '' },
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      addressLine: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: 'Tamil Nadu' },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    pincode: { type: String, required: true },
    deliveryZone: { type: Schema.Types.ObjectId, ref: 'DeliveryZone' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['TEST_PAYMENT', 'UPI', 'CARD', 'COD', 'ONLINE', 'RAZORPAY'], default: 'COD' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'COMPLETED', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'CANCELLED', 'COD'], default: 'COD' },
    paymentId: { type: String },
    paymentOrderId: { type: String },
    paymentSignature: { type: String },
    orderStatus: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'PLACED',
        'CONFIRMED',
        'SHOP_ACCEPTED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'READY_FOR_PICKUP',
        'DELIVERY_ASSIGNED',
        'DELIVERY_ACCEPTED',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELED',
        'CANCELLED',
        'PAYMENT_FAILED',
        'PAYMENT_CANCELLED',
      ],
      default: 'CONFIRMED',
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['CUSTOMER', 'ADMIN', 'SYSTEM'] },
    cancelledAt: { type: Date },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundedAt: { type: Date },
    deliveryPerson: { type: Schema.Types.ObjectId, ref: 'DeliveryPerson' },
    assignmentType: { type: String, enum: ['ADMIN', 'AUTO'], default: 'ADMIN' },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    deliveryOtp: {
      code: { type: String },
      generatedAt: { type: Date, default: Date.now },
      verifiedAt: { type: Date },
      attempts: { type: Number, default: 0 },
      status: { type: String, enum: ['PENDING', 'VERIFIED'], default: 'PENDING' },
    },
    whatsappStatus: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    whatsappConfirmationSent: { type: Boolean, default: false },
    whatsappMessageId: { type: String },
    whatsappSentAt: { type: Date },
    whatsappError: { type: String },
    notes: { type: String, default: '' },
    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
