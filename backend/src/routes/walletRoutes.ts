import { Router } from 'express';
import { getWallet, addMoney } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getWallet);
router.post('/add', protect, addMoney);

export default router;
