import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductPrice,
  getPriceHistory,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/price-history', getPriceHistory);
router.get('/:id/price-history', getPriceHistory);
router.get('/:id', getProductById);
router.post('/', protect, authorize('SELLER', 'ADMIN'), createProduct);
router.put('/:id', protect, authorize('SELLER', 'ADMIN'), updateProduct);
router.patch('/:id/price', protect, authorize('SELLER', 'ADMIN'), updateProductPrice);
router.delete('/:id', protect, authorize('SELLER', 'ADMIN'), deleteProduct);

export default router;
