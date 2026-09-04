import { Router } from 'express';
import { getActiveBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', getActiveBanners);
router.post('/', adminAuth, createBanner);
router.delete('/:id', adminAuth, deleteBanner);

export default router;
