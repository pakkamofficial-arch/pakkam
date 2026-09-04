import { Router } from 'express';
import {
  getUserTickets,
  createTicket,
  replyTicket,
  getAllTicketsAdmin,
} from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getUserTickets);
router.post('/', protect, createTicket);
router.post('/:id/reply', protect, replyTicket);
router.get('/admin/all', protect, authorize('ADMIN'), getAllTicketsAdmin);

export default router;
