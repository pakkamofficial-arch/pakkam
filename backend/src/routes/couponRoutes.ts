import { Router } from 'express';
import { applyCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getCoupons);
router.post('/apply', protect, applyCoupon);
router.post('/', protect, authorize('ADMIN'), createCoupon);
router.delete('/:id', protect, authorize('ADMIN'), deleteCoupon);

export default router;
