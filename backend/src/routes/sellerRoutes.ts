import { Router } from 'express';
import {
  applySellerOnboarding,
  getSellerStatus,
  getAllSellersAdmin,
  updateSellerStatusAdmin,
} from '../controllers/sellerController.js';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.get('/status', protect, getSellerStatus);
router.post('/onboard', protect, applySellerOnboarding);
router.get('/admin/all', adminAuth, getAllSellersAdmin);
router.put('/admin/:id/status', adminAuth, updateSellerStatusAdmin);

export default router;
