import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketId: string;
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  subject: string;
  category: 'ORDER_ISSUE' | 'PAYMENT' | 'DELIVERY' | 'REFUND' | 'ACCOUNT' | 'OTHER';
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  messages: {
    sender: 'USER' | 'SUPPORT' | 'ADMIN';
    message: string;
    attachments?: string[];
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['ORDER_ISSUE', 'PAYMENT', 'DELIVERY', 'REFUND', 'ACCOUNT', 'OTHER'],
      default: 'OTHER',
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    messages: [
      {
        sender: { type: String, enum: ['USER', 'SUPPORT', 'ADMIN'], required: true },
        message: { type: String, required: true },
        attachments: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
