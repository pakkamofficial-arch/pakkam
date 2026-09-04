import { Router } from 'express';
import { applyCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', getCoupons);
router.post('/apply', protect, applyCoupon);
router.post('/', adminAuth, createCoupon);
router.delete('/:id', adminAuth, deleteCoupon);

export default router;
