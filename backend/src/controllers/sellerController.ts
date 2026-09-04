import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Seller } from '../models/Seller.js';
import { User } from '../models/User.js';

export const applySellerOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const { shopName, businessName, gstin, pan, fssaiNumber, bankAccount, kycDocuments } = req.body;

    if (!shopName || !businessName || !pan || !bankAccount) {
      return res.status(400).json({ success: false, message: 'Please provide all required business & bank details' });
    }

    let seller = await Seller.findOne({ user: req.user?._id });
    if (seller) {
      seller.shopName = shopName;
      seller.businessName = businessName;
      seller.gstin = gstin;
      seller.pan = pan;
      seller.fssaiNumber = fssaiNumber;
      seller.bankAccount = bankAccount;
      seller.kycDocuments = kycDocuments || {};
      seller.status = 'PENDING';
      await seller.save();
    } else {
      seller = await Seller.create({
        user: req.user?._id,
        shopName,
        businessName,
        gstin,
        pan,
        fssaiNumber,
        bankAccount,
        kycDocuments: kycDocuments || {},
        status: 'PENDING',
      });
    }

    res.status(201).json({ success: true, seller });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOne({ user: req.user?._id });
    res.json({ success: true, seller });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSellersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const sellers = await Seller.find().populate('user', 'name phone email').sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSellerStatusAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    seller.status = status;
    if (rejectionReason) seller.rejectionReason = rejectionReason;
    await seller.save();

    if (status === 'APPROVED') {
      await User.findByIdAndUpdate(seller.user, { role: 'SELLER' });
    }

    res.json({ success: true, seller });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
