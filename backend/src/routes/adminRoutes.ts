import { Router } from 'express';
import { getDashboardStats, getUsers, toggleUserStatus, getAppSettings, updateAppSetting } from '../controllers/adminController.js';
import { getAdminDeliveryBoys } from '../controllers/deliveryBoyController.js';
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '../controllers/adminNotificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', protect, authorize('ADMIN'), getDashboardStats);
router.get('/users', protect, authorize('ADMIN'), getUsers);
router.put('/users/:id/toggle', protect, authorize('ADMIN'), toggleUserStatus);
router.get('/settings', getAppSettings);
router.put('/settings', protect, authorize('ADMIN'), updateAppSetting);
router.get('/delivery-partners', protect, authorize('ADMIN'), getAdminDeliveryBoys);

// Admin Notifications (Part 17 & 18)
router.get('/notifications', protect, authorize('ADMIN'), getAdminNotifications);
router.put('/notifications/read-all', protect, authorize('ADMIN'), markAllAdminNotificationsRead);
router.put('/notifications/:id/read', protect, authorize('ADMIN'), markAdminNotificationRead);

export default router;
