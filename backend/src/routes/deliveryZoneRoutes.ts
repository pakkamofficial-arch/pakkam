import { Router } from 'express';
import {
  checkPincodeServiceable,
  getAdminDeliveryZones,
  createAdminDeliveryZone,
  updateAdminDeliveryZone,
  deleteAdminDeliveryZone,
} from '../controllers/deliveryZoneController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Public / Customer check
router.get('/check-serviceable', checkPincodeServiceable);

// Admin Delivery Zone Management
router.get('/admin', adminAuth, getAdminDeliveryZones);
router.post('/admin', adminAuth, createAdminDeliveryZone);
router.put('/admin/:id', adminAuth, updateAdminDeliveryZone);
router.delete('/admin/:id', adminAuth, deleteAdminDeliveryZone);

export default router;
