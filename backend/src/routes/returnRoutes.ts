import { Router } from 'express';
import {
  createReturnRequest,
  getUserReturns,
  updateReturnStatusAdmin,
} from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getUserReturns);
router.post('/', protect, createReturnRequest);
router.put('/:id/status', protect, authorize('ADMIN'), updateReturnStatusAdmin);

export default router;
