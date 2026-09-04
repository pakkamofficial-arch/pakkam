import { Router } from 'express';
import { getActiveBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getActiveBanners);
router.post('/', protect, authorize('ADMIN'), createBanner);
router.delete('/:id', protect, authorize('ADMIN'), deleteBanner);

export default router;
