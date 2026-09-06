import { Router } from 'express';
import {
  createGuestPaymentOrder,
  createGuestOrder,
  trackGuestOrder,
} from '../controllers/guestController.js';

const router = Router();

router.post('/create-payment-order', createGuestPaymentOrder);
router.post('/orders', createGuestOrder);
router.get('/orders/track', trackGuestOrder);

export default router;
