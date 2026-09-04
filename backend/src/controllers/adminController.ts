import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AppSetting } from '../models/AppSetting.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalShops = await Shop.countDocuments();
    const activeShops = await Shop.countDocuments({ status: 'APPROVED' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELED' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const recentOrders = await Order.find().populate('user shop').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalShops,
        activeShops,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    const settings = await AppSetting.find();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key, value, description } = req.body;
    const setting = await AppSetting.findOneAndUpdate({ key }, { value, description }, { new: true, upsert: true });
    res.json({ success: true, setting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
