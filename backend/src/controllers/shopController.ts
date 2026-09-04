import { Request, Response } from 'express';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AuthRequest } from '../middleware/auth.js';

export const getShops = async (req: Request, res: Response) => {
  try {
    const { search, lat, lng, radius } = req.query;
    let query: any = { status: 'APPROVED' };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const shops = await Shop.find(query).sort({ rating: -1 });
    res.json({ success: true, count: shops.length, shops });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShopById = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    const products = await Product.find({ shop: shop._id, isActive: true }).populate('category');
    res.json({ success: true, shop, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findOne({ owner: req.user?._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'No shop found for this user' });
    }

    // Calculate today stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({ shop: shop._id });
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= startOfDay);

    const todaySales = todayOrders
      .filter((o) => o.orderStatus !== 'CANCELED')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.orderStatus)).length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

    res.json({
      success: true,
      shop,
      stats: {
        totalOrders: orders.length,
        todayOrdersCount: todayOrders.length,
        todaySales,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.create({
      ...req.body,
      owner: req.user?._id,
    });
    res.status(201).json({ success: true, shop });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShop = async (req: AuthRequest, res: Response) => {
  try {
    let shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    if (shop.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this shop' });
    }

    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, shop });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
