import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Wishlist } from '../models/Wishlist.js';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user?._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user?._id, products: [] });
    }
    res.json({ success: true, wishlist: wishlist.products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user?._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user?._id, products: [productId] });
    } else {
      const idx = wishlist.products.findIndex((p) => p.toString() === productId);
      if (idx > -1) {
        wishlist.products.splice(idx, 1);
      } else {
        wishlist.products.push(productId as any);
      }
      await wishlist.save();
    }

    await wishlist.populate('products');
    res.json({ success: true, wishlist: wishlist.products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
