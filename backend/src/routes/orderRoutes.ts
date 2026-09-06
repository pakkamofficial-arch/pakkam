import { Router } from 'express';
import {
  createOrder,
  checkoutPreview,
  createPaymentOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  reorderItems,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createOrder);
router.post('/preview', optionalAuth, checkoutPreview);
router.post('/create-payment-order', protect, createPaymentOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);
router.post('/:id/cancel', protect, cancelOrder);
router.post('/:id/reorder', protect, reorderItems);

export default router;
