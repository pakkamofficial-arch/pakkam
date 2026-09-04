import { Router } from 'express';
import {
  checkPincodeServiceable,
  getAdminDeliveryZones,
  createAdminDeliveryZone,
  updateAdminDeliveryZone,
  deleteAdminDeliveryZone,
} from '../controllers/deliveryZoneController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public / Customer check
router.get('/check-serviceable', checkPincodeServiceable);

// Admin Delivery Zone Management
router.get('/admin', protect, adminOnly, getAdminDeliveryZones);
router.post('/admin', protect, adminOnly, createAdminDeliveryZone);
router.put('/admin/:id', protect, adminOnly, updateAdminDeliveryZone);
router.delete('/admin/:id', protect, adminOnly, deleteAdminDeliveryZone);

export default router;
