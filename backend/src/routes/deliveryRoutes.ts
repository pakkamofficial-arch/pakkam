import { Router } from 'express';
import { getDeliveryOrders, acceptDelivery, completeDelivery } from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/orders', protect, authorize('DELIVERY', 'ADMIN'), getDeliveryOrders);
router.put('/orders/:id/accept', protect, authorize('DELIVERY', 'ADMIN'), acceptDelivery);
router.put('/orders/:id/complete', protect, authorize('DELIVERY', 'ADMIN'), completeDelivery);

export default router;
