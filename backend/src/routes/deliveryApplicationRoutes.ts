import { Router } from 'express';
import {
  submitApplication,
  getApplications,
  getApplicationById,
  acceptApplication,
  rejectApplication,
} from '../controllers/deliveryApplicationController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Public submission route for Google Form / Webhook / App
router.post('/apply', submitApplication);

// Admin-protected routes
router.get('/', adminAuth, getApplications);
router.get('/:id', adminAuth, getApplicationById);
router.patch('/:id/accept', adminAuth, acceptApplication);
router.patch('/:id/reject', adminAuth, rejectApplication);

export default router;
