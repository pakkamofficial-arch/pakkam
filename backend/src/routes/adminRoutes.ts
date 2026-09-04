import { Router } from 'express';
import {
  adminLogin,
  getAdminMe,
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getAppSettings,
  updateAppSetting,
} from '../controllers/adminController.js';
import { getAdminDeliveryBoys } from '../controllers/deliveryBoyController.js';
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '../controllers/adminNotificationController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Public Admin Auth
router.post('/login', adminLogin);

// Protected Admin Endpoints
router.get('/me', adminAuth, getAdminMe);
router.get('/stats', adminAuth, getDashboardStats);
router.get('/dashboard', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getUsers);
router.put('/users/:id/toggle', adminAuth, toggleUserStatus);
router.get('/settings', adminAuth, getAppSettings);
router.put('/settings', adminAuth, updateAppSetting);
router.get('/delivery-partners', adminAuth, getAdminDeliveryBoys);

// Admin Notifications
router.get('/notifications', adminAuth, getAdminNotifications);
router.put('/notifications/read-all', adminAuth, markAllAdminNotificationsRead);
router.put('/notifications/:id/read', adminAuth, markAdminNotificationRead);

export default router;
