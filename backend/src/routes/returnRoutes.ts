import { Router } from 'express';
import {
  createReturnRequest,
  getUserReturns,
  updateReturnStatusAdmin,
} from '../controllers/returnController.js';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', protect, getUserReturns);
router.post('/', protect, createReturnRequest);
router.put('/:id/status', adminAuth, updateReturnStatusAdmin);

export default router;
