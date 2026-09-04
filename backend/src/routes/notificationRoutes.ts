import { Router } from 'express';
import { getUserNotifications, markRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getUserNotifications);
router.post('/read', protect, markRead);

export default router;
