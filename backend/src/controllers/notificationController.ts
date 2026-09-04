import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user?._id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ user: req.user?._id, isRead: false });

    res.json({ success: true, unreadCount, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ user: req.user?._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
