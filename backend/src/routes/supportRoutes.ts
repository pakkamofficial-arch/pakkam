import { Router } from 'express';
import {
  getUserTickets,
  createTicket,
  replyTicket,
  getAllTicketsAdmin,
} from '../controllers/supportController.js';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', protect, getUserTickets);
router.post('/', protect, createTicket);
router.post('/:id/reply', protect, replyTicket);
router.get('/admin/all', adminAuth, getAllTicketsAdmin);

export default router;
