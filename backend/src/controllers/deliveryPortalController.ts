import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { DeliveryPerson } from '../models/DeliveryPerson.js';
import { Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pakkam_super_secret_jwt_key_2026_hyperlocal';

/**
 * Dedicated Delivery Boy Login (POST /api/delivery/auth/login)
 */
export const deliveryLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({ success: false, message: 'Email/phone and password are required' });
      return;
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid delivery partner credentials' });
      return;
    }

    if (user.role !== 'DELIVERY' && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied. Account is not a registered delivery partner.' });
      return;
    }

    let deliveryBoy = await DeliveryPerson.findOne({ user: user._id });
    if (!deliveryBoy) {
      // Auto-create DeliveryPerson profile if missing for delivery user
      deliveryBoy = await DeliveryPerson.create({
        user: user._id,
        name: user.name,
        mobile: user.phone,
        email: user.email,
        vehicleType: 'BIKE',
        status: 'AVAILABLE',
        active: true,
        servicePincodes: ['600040', '600032', '600017', '600042'],
      });
    }

    const token = jwt.sign({ id: user._id, role: 'DELIVERY' }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      deliveryBoy: {
        id: deliveryBoy._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vehicleType: deliveryBoy.vehicleType,
        vehicleNumber: deliveryBoy.vehicleNumber,
        status: deliveryBoy.status,
        totalDeliveries: deliveryBoy.totalDeliveries || 0,
        rating: deliveryBoy.rating || 5.0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Available Orders ready for pickup (GET /api/delivery/orders/available)
 */
export const getAvailableOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ['READY_FOR_PICKUP', 'READY', 'PREPARING', 'CONFIRMED'] },
      deliveryPerson: { $exists: false },
    })
      .populate('shop', 'name address phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Assigned/My Deliveries (GET /api/delivery/orders/mine)
 */
export const getMyDeliveries = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const deliveryBoy = await DeliveryPerson.findOne({ user: userId });
    const riderId = deliveryBoy ? deliveryBoy._id : userId;

    const orders = await Order.find({
      $or: [{ deliveryPerson: riderId }, { deliveryPerson: userId }],
    })
      .populate('user', 'name phone')
      .populate('shop', 'name address phone')
      .sort({ createdAt: -1 });

    const active = orders.filter((o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELED');
    const completed = orders.filter((o) => o.orderStatus === 'DELIVERED');

    res.json({
      success: true,
      activeCount: active.length,
      completedCount: completed.length,
      activeOrders: active,
      completedOrders: completed,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Accept Delivery Order (POST /api/delivery/orders/:id/accept)
 */
export const acceptDeliveryOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    let deliveryBoy = await DeliveryPerson.findOne({ user: userId });

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.deliveryPerson && order.deliveryPerson.toString() !== (deliveryBoy?._id.toString() || userId.toString())) {
      res.status(400).json({ success: false, message: 'Order has already been assigned to another delivery partner.' });
      return;
    }

    order.deliveryPerson = deliveryBoy ? deliveryBoy._id : userId;
    order.orderStatus = 'DELIVERY_ACCEPTED';
    order.assignedAt = order.assignedAt || new Date();
    order.statusTimeline.push({
      status: 'DELIVERY_ACCEPTED',
      timestamp: new Date(),
      note: 'Delivery accepted by partner',
    });

    await order.save();

    if (deliveryBoy) {
      deliveryBoy.currentActiveOrders = (deliveryBoy.currentActiveOrders || 0) + 1;
      deliveryBoy.status = 'BUSY';
      await deliveryBoy.save();
    }

    res.json({ success: true, message: 'Order accepted successfully', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Picked Up Order from Shop (POST /api/delivery/orders/:id/picked-up)
 */
export const pickedUpDeliveryOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.orderStatus = 'OUT_FOR_DELIVERY';
    order.pickedUpAt = new Date();
    order.statusTimeline.push({
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(),
      note: 'Order picked up from shop and out for delivery',
    });

    await order.save();

    // Notify Customer
    try {
      await Notification.create({
        user: order.user,
        recipientRole: 'CUSTOMER',
        type: 'ORDER_UPDATE',
        title: '🛵 Order Out for Delivery',
        body: `Your PAKKAM order #${order.orderNumber} is on the way!`,
        message: `Your PAKKAM order #${order.orderNumber} is on the way!`,
        order: order._id,
      });
    } catch (e) {
      // ignore
    }

    res.json({ success: true, message: 'Order picked up and out for delivery', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delivered Order with 4-Digit OTP Handoff (POST /api/delivery/orders/:id/delivered)
 */
export const deliveredDeliveryOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // OTP Verification (Strict 4-digit validation & attempt limiting)
    const expectedCode = typeof order.deliveryOtp === 'object' ? order.deliveryOtp?.code : String(order.deliveryOtp || '');
    const currentAttempts = typeof order.deliveryOtp === 'object' ? (order.deliveryOtp?.attempts || 0) : 0;
    const otpStatus = typeof order.deliveryOtp === 'object' ? order.deliveryOtp?.status : 'PENDING';

    if (order.orderStatus === 'DELIVERED' || otpStatus === 'VERIFIED') {
      res.status(400).json({ success: false, message: 'This order has already been verified and delivered.' });
      return;
    }

    if (currentAttempts >= 5) {
      res.status(400).json({
        success: false,
        message: 'OTP verification temporarily blocked due to too many failed attempts (Max 5 attempts). Contact Admin.',
      });
      return;
    }

    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp || cleanOtp !== expectedCode) {
      if (typeof order.deliveryOtp === 'object') {
        order.deliveryOtp.attempts = currentAttempts + 1;
        await order.save();
      }
      res.status(400).json({
        success: false,
        message: 'Invalid delivery OTP code. Please verify the 4-digit OTP with the customer.',
      });
      return;
    }

    if (typeof order.deliveryOtp === 'object') {
      order.deliveryOtp.status = 'VERIFIED';
      order.deliveryOtp.verifiedAt = new Date();
    }

    order.orderStatus = 'DELIVERED';
    order.paymentStatus = 'COMPLETED';
    order.deliveredAt = new Date();
    order.statusTimeline.push({
      status: 'DELIVERED',
      timestamp: new Date(),
      note: 'Order delivered successfully to customer',
    });

    await order.save();

    // Update rider metrics
    if (order.deliveryPerson) {
      const deliveryBoy = await DeliveryPerson.findById(order.deliveryPerson);
      if (deliveryBoy) {
        deliveryBoy.currentActiveOrders = Math.max(0, (deliveryBoy.currentActiveOrders || 1) - 1);
        deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
        deliveryBoy.status = deliveryBoy.currentActiveOrders > 0 ? 'BUSY' : 'AVAILABLE';
        await deliveryBoy.save();
      }
    }

    // Notify Customer & Admin
    try {
      await Notification.create({
        user: order.user,
        recipientRole: 'CUSTOMER',
        type: 'ORDER_UPDATE',
        title: '🎉 Order Delivered',
        body: `Your PAKKAM order #${order.orderNumber} has been delivered!`,
        message: `Your PAKKAM order #${order.orderNumber} has been delivered!`,
        order: order._id,
      });
      await Notification.create({
        recipientRole: 'ADMIN',
        type: 'ORDER_UPDATE',
        title: 'Order Delivered ✅',
        body: `Order #${order.orderNumber} delivered by partner.`,
        message: `Order #${order.orderNumber} delivered by partner.`,
        order: order._id,
      });
    } catch (e) {
      // ignore
    }

    res.json({ success: true, message: 'Order marked delivered successfully', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Delivery Partner Earnings & Stats (GET /api/delivery/earnings)
 */
export const getDeliveryEarnings = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const deliveryBoy = await DeliveryPerson.findOne({ user: userId });
    const riderId = deliveryBoy ? deliveryBoy._id : userId;

    const completed = await Order.find({
      $or: [{ deliveryPerson: riderId }, { deliveryPerson: userId }],
      orderStatus: 'DELIVERED',
    });

    const totalCount = completed.length;
    const perDeliveryPayout = 40; // ₹40 payout per completed delivery
    const totalEarnings = totalCount * perDeliveryPayout;

    res.json({
      success: true,
      stats: {
        totalDeliveries: totalCount,
        todayDeliveries: totalCount,
        perDeliveryPayout,
        totalEarnings,
        todayEarnings: totalEarnings,
        rating: deliveryBoy?.rating || 5.0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Report Delivery Issue / Cannot Complete Delivery (POST /api/delivery/orders/:id/issue)
 * Requirement 42
 */
export const reportDeliveryIssue = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const issueReason = reason || 'Customer unavailable / Wrong address / Vehicle issue';
    order.statusTimeline.push({
      status: 'DELIVERY_ISSUE_RAISED',
      timestamp: new Date(),
      note: `Delivery partner reported issue: ${issueReason}. ${notes || ''}`,
    });

    await order.save();

    // Create Notification for Admin (Requirement 42, 53)
    try {
      await Notification.create({
        recipientRole: 'ADMIN',
        type: 'ORDER_UPDATE',
        title: '⚠️ Delivery Partner Reported Issue',
        body: `Order #${order.orderNumber}: Delivery issue reported (${issueReason})`,
        message: `Delivery issue reported on Order #${order.orderNumber}\nReason: ${issueReason}\nNotes: ${notes || 'None'}`,
        order: order._id,
        isRead: false,
      });
    } catch (e) {
      console.error('Error creating admin notification for delivery issue:', e);
    }

    res.json({
      success: true,
      message: 'Delivery issue submitted to Admin. Admin has been notified for reassignment.',
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Aliases for backwards compatibility
export const getAssignedDeliveryOrders = getMyDeliveries;
export const updateDeliveryOrderStatus = deliveredDeliveryOrder;
