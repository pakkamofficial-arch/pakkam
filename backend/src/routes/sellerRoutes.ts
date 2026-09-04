import { Router } from 'express';
import {
  applySellerOnboarding,
  getSellerStatus,
  getAllSellersAdmin,
  updateSellerStatusAdmin,
} from '../controllers/sellerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/status', protect, getSellerStatus);
router.post('/onboard', protect, applySellerOnboarding);
router.get('/admin/all', protect, authorize('ADMIN'), getAllSellersAdmin);
router.put('/admin/:id/status', protect, authorize('ADMIN'), updateSellerStatusAdmin);

export default router;
