import { Router } from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);

export default router;
