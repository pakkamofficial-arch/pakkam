import { Router } from 'express';
import {
  submitApplication,
  getApplications,
  getApplicationById,
  acceptApplication,
  rejectApplication,
} from '../controllers/deliveryApplicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public submission route for Google Form / Webhook / App
router.post('/apply', submitApplication);

// Admin-protected routes
router.get('/', protect, authorize('ADMIN'), getApplications);
router.get('/:id', protect, authorize('ADMIN'), getApplicationById);
router.patch('/:id/accept', protect, authorize('ADMIN'), acceptApplication);
router.patch('/:id/reject', protect, authorize('ADMIN'), rejectApplication);

export default router;
