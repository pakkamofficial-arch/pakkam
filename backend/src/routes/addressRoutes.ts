import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress } from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getAddresses);
router.post('/', protect, createAddress);
router.put('/:id', protect, updateAddress);
router.put('/:id/default', protect, setDefaultAddress);
router.delete('/:id', protect, deleteAddress);

export default router;
