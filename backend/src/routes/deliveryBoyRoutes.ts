import { Router } from 'express';
import {
  getRecommendedDeliveryBoys,
  assignDeliveryBoy,
  getAdminDeliveryBoys,
  createAdminDeliveryBoy,
  updateAdminDeliveryBoy,
  deleteAdminDeliveryBoy,
} from '../controllers/deliveryBoyController.js';
import {
  deliveryLogin,
  getAvailableOrders,
  getMyDeliveries,
  acceptDeliveryOrder,
  pickedUpDeliveryOrder,
  deliveredDeliveryOrder,
  getDeliveryEarnings,
  getAssignedDeliveryOrders,
  updateDeliveryOrderStatus,
  reportDeliveryIssue,
} from '../controllers/deliveryPortalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Delivery Boy Auth
router.post('/auth/login', deliveryLogin);

// Admin Delivery Boy CRUD & Recommendation
router.get('/admin', adminAuth, getAdminDeliveryBoys);
router.post('/admin', adminAuth, createAdminDeliveryBoy);
router.put('/admin/:id', adminAuth, updateAdminDeliveryBoy);
router.delete('/admin/:id', adminAuth, deleteAdminDeliveryBoy);
router.get('/admin/orders/:orderId/recommended', adminAuth, getRecommendedDeliveryBoys);
router.post('/admin/orders/:orderId/assign', adminAuth, assignDeliveryBoy);

// Delivery Boy Application Routes (/api/delivery/*)
router.get('/orders/available', protect, authorize('DELIVERY', 'ADMIN'), getAvailableOrders);
router.get('/orders/mine', protect, authorize('DELIVERY', 'ADMIN'), getMyDeliveries);
router.post('/orders/:id/accept', protect, authorize('DELIVERY', 'ADMIN'), acceptDeliveryOrder);
router.post('/orders/:id/picked-up', protect, authorize('DELIVERY', 'ADMIN'), pickedUpDeliveryOrder);
router.post('/orders/:id/delivered', protect, authorize('DELIVERY', 'ADMIN'), deliveredDeliveryOrder);
router.post('/orders/:id/verify-otp', protect, authorize('DELIVERY', 'ADMIN'), deliveredDeliveryOrder);
router.post('/orders/:id/issue', protect, authorize('DELIVERY', 'ADMIN'), reportDeliveryIssue);
router.get('/earnings', protect, authorize('DELIVERY', 'ADMIN'), getDeliveryEarnings);

// Legacy/Compatibility Portal Endpoints
router.get('/portal/orders', protect, getAssignedDeliveryOrders);
router.post('/portal/orders/:orderId/update-status', protect, updateDeliveryOrderStatus);

export default router;
