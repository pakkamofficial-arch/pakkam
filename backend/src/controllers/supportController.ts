import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { SupportTicket } from '../models/SupportTicket.js';

export const getUserTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user?._id }).sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, category, description, orderId } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const ticketId = 'TICK-' + Math.floor(100000 + Math.random() * 900000);

    const ticket = await SupportTicket.create({
      ticketId,
      user: req.user?._id,
      order: orderId,
      subject,
      category: category || 'OTHER',
      description,
      messages: [
        {
          sender: 'USER',
          message: description,
        },
      ],
    });

    res.status(201).json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const sender = req.user?.role === 'ADMIN' ? 'ADMIN' : 'USER';
    ticket.messages.push({
      sender,
      message,
      createdAt: new Date(),
    });

    if (sender === 'ADMIN') {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTicketsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find().populate('user', 'name phone email').sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
