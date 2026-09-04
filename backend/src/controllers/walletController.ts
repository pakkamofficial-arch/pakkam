import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user?._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user?._id, balance: 0 });
    }

    const transactions = await WalletTransaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      balance: wallet.balance,
      transactions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMoney = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    let wallet = await Wallet.findOne({ user: req.user?._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user?._id, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    const tx = await WalletTransaction.create({
      wallet: wallet._id,
      user: req.user?._id,
      amount,
      type: 'CREDIT',
      description: 'Wallet Top Up',
      referenceType: 'ADMIN_ADJUSTMENT',
    });

    res.json({
      success: true,
      balance: wallet.balance,
      transaction: tx,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
