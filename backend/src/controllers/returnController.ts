import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ReturnRequest } from '../models/ReturnRequest.js';
import { Order } from '../models/Order.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';

export const createReturnRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, items, reason, details, images, refundDestination } = req.body;
    if (!orderId || !items || items.length === 0 || !reason) {
      return res.status(400).json({ success: false, message: 'orderId, items, and reason are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const returnId = 'RET-' + Math.floor(100000 + Math.random() * 900000);
    const refundAmount = items.reduce((acc: number, i: any) => acc + i.price * i.quantity, 0);

    const returnReq = await ReturnRequest.create({
      returnId,
      order: orderId,
      user: req.user?._id,
      items,
      reason,
      details,
      images,
      refundDestination: refundDestination || 'WALLET',
      refundAmount,
    });

    res.status(201).json({ success: true, returnRequest: returnReq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserReturns = async (req: AuthRequest, res: Response) => {
  try {
    const returns = await ReturnRequest.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.json({ success: true, returns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReturnStatusAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { status, refundAmount } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    returnReq.status = status;
    await returnReq.save();

    // If REFUNDED, issue wallet credit
    if (status === 'REFUNDED') {
      let wallet = await Wallet.findOne({ user: returnReq.user });
      if (!wallet) {
        wallet = await Wallet.create({ user: returnReq.user, balance: 0 });
      }

      const creditAmt = refundAmount || returnReq.refundAmount;
      wallet.balance += creditAmt;
      await wallet.save();

      await WalletTransaction.create({
        wallet: wallet._id,
        user: returnReq.user,
        amount: creditAmt,
        type: 'CREDIT',
        description: `Refund for Order Return #${returnReq.returnId}`,
        referenceType: 'REFUND',
        referenceId: returnReq.returnId,
      });
    }

    res.json({ success: true, returnRequest: returnReq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
