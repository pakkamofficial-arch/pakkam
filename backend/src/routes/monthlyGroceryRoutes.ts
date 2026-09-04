import { Router } from 'express';
import {
  getMonthlyLists,
  getMonthlyListById,
  createMonthlyList,
  updateMonthlyList,
  addItemToMonthlyList,
  duplicateMonthlyList,
  addAllToCart,
  deleteMonthlyList,
  getTemplates,
} from '../controllers/monthlyGroceryController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/templates', protect, getTemplates);
router.get('/', protect, getMonthlyLists);
router.get('/:id', protect, getMonthlyListById);
router.post('/', protect, createMonthlyList);
router.put('/:id', protect, updateMonthlyList);
router.post('/:id/add-item', protect, addItemToMonthlyList);
router.post('/:id/duplicate', protect, duplicateMonthlyList);
router.post('/:id/add-to-cart', protect, addAllToCart);
router.delete('/:id', protect, deleteMonthlyList);

export default router;
