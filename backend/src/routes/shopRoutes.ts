import { Router } from 'express';
import { getShops, getShopById, getMyShop, createShop, updateShop } from '../controllers/shopController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getShops);
router.get('/myshop', protect, authorize('SELLER', 'ADMIN'), getMyShop);
router.get('/:id', getShopById);
router.post('/', protect, authorize('SELLER', 'ADMIN'), createShop);
router.put('/:id', protect, authorize('SELLER', 'ADMIN'), updateShop);

export default router;
