import { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';

/**
 * Get Admin Notifications & Unread Count (Part 17, 18, 20)
 */
export const getAdminNotifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipientRole: 'ADMIN' })
      .populate('order', 'orderNumber total deliveryAddress pincode orderStatus')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientRole: 'ADMIN',
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark Admin Notification as read
 */
export const markAdminNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });

    const unreadCount = await Notification.countDocuments({
      recipientRole: 'ADMIN',
      isRead: false,
    });

    res.json({ success: true, message: 'Notification marked as read', unreadCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark all Admin Notifications as read
 */
export const markAllAdminNotificationsRead = async (_req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ recipientRole: 'ADMIN', isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
