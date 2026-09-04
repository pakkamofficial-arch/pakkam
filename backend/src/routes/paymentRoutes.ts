import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, handleRazorpayWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.post('/razorpay/webhook', handleRazorpayWebhook);
router.post('/webhook', handleRazorpayWebhook);

export default router;
