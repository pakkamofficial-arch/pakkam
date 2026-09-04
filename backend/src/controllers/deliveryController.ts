import { Response } from 'express';
import { Order } from '../models/Order.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDeliveryOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({
      $or: [{ deliveryPerson: req.user?._id }, { orderStatus: 'READY_FOR_PICKUP' }],
    })
      .populate('shop', 'name phone address logo')
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.deliveryPerson = req.user?._id;
    order.orderStatus = 'OUT_FOR_DELIVERY';
    order.statusTimeline.push({
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(),
      note: `Delivery person ${req.user?.name} picked up the order and is on the way.`,
    });

    await order.save();
    res.json({ success: true, message: 'Order accepted for delivery', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = 'DELIVERED';
    order.paymentStatus = 'COMPLETED';
    order.statusTimeline.push({
      status: 'DELIVERED',
      timestamp: new Date(),
      note: 'Order successfully delivered to customer.',
    });

    await order.save();
    res.json({ success: true, message: 'Order delivered', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
