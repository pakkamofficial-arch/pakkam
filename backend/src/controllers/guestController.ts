import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { AppSetting } from '../models/AppSetting.js';
import { Shop } from '../models/Shop.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { sendOrderConfirmationWhatsApp } from '../services/whatsappService.js';
import { sendPushNotificationToRole } from '../services/notificationService.js';
import { calculateEffectiveProductPrice } from '../services/priceSyncService.js';
import { generateDeliveryOtp } from '../utils/otp.js';

export const createGuestPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const receipt = `rcpt_guest_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({ amount: Math.round(amount), receipt });

    return res.json({
      success: true,
      order: razorpayOrder,
    });
  } catch (error: any) {
    console.error('[GuestPaymentOrder Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment initiation failed' });
  }
};

export const createGuestOrder = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      address,
      items,
      paymentMethod = 'COD',
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      couponCode,
      notes,
    } = req.body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Full Name is required' });
    }
    const cleanPhone = (phone || '').toString().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
    }
    if (!address || !address.city || !address.pincode) {
      return res.status(400).json({ success: false, message: 'Delivery address with city and pincode is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    // 2. Razorpay Verification for ONLINE payment
    const isOnlinePayment = paymentMethod === 'ONLINE' || paymentMethod === 'RAZORPAY';
    if (isOnlinePayment) {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Razorpay payment verification details are required for online payment' });
      }
      const isValidSig = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });
      if (!isValidSig) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature. Payment verification failed.' });
      }
    }

    // 3. Recompute Totals Server-Side
    let subtotal = 0;
    const verifiedOrderItems: any[] = [];
    let defaultShopId: string | null = null;

    for (const item of items) {
      const prodId = item.productId || item.product;
      const prod: any = await Product.findById(prodId).populate('shop');
      if (!prod || !prod.isActive) {
        return res.status(400).json({ success: false, message: `Product ${prod?.name || item.name || 'item'} is unavailable` });
      }

      if (!defaultShopId) {
        defaultShopId = prod.shop?._id?.toString() || prod.shop?.toString();
      }

      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      const selectedUnit = item.selectedUnit || prod.unit || '1 kg';
      
      const priceInfo = calculateEffectiveProductPrice(prod);
      const unitPrice = priceInfo.effectiveUnitPrice;

      const itemSubtotal = Math.round(unitPrice * qty);
      subtotal += itemSubtotal;
      verifiedOrderItems.push({
        product: prod._id,
        name: prod.name,
        image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
        selectedUnit,
        quantity: qty,
        price: unitPrice,
        discountPrice: prod.discountPrice || unitPrice,
      });
    }

    if (!defaultShopId) {
      const firstShop = await Shop.findOne({});
      defaultShopId = firstShop?._id?.toString() || '';
    }

    // Delivery Fee calculation from AppSetting
    const feeSetting = await AppSetting.findOne({ key: 'delivery_fee_tiers' });
    const tiers = feeSetting?.value || { tier1Threshold: 199, tier1Fee: 30, tier2Threshold: 499, tier2Fee: 20, freeThreshold: 500 };

    let deliveryFee = tiers.tier1Fee;
    if (subtotal >= tiers.freeThreshold) {
      deliveryFee = 0;
    } else if (subtotal >= tiers.tier1Threshold) {
      deliveryFee = tiers.tier2Fee;
    }

    // Coupon discount
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date() && subtotal >= coupon.minimumOrder) {
        if (coupon.discountType === 'PERCENTAGE') {
          couponDiscount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maximumDiscount && couponDiscount > coupon.maximumDiscount) {
            couponDiscount = coupon.maximumDiscount;
          }
        } else {
          couponDiscount = coupon.discountValue;
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

    // 4. Generate Order Number & Delivery OTP
    const orderNumber = `PKM${Math.floor(100000 + Math.random() * 900000)}`;
    const otpCode = generateDeliveryOtp();

    const formattedAddress = {
      name: fullName.trim(),
      fullName: fullName.trim(),
      phone: cleanPhone,
      mobileNumber: cleanPhone,
      houseFlat: address.houseFlat || address.line1 || '',
      street: address.street || address.line2 || '',
      area: address.area || '',
      addressLine: `${address.line1 || ''} ${address.line2 || ''}`.trim(),
      city: address.city.trim(),
      state: address.state || 'Tamil Nadu',
      pincode: address.pincode.trim(),
      landmark: address.landmark || '',
    };

    const newOrder = new Order({
      orderNumber,
      user: null,
      customerType: 'guest',
      guestName: fullName.trim(),
      guestPhone: cleanPhone,
      guestAddress: formattedAddress,
      shop: defaultShopId,
      items: verifiedOrderItems,
      deliveryAddress: formattedAddress,
      pincode: address.pincode.trim(),
      subtotal,
      discount: couponDiscount,
      deliveryFee,
      total,
      couponCode: couponCode || '',
      paymentMethod: isOnlinePayment ? 'ONLINE' : 'COD',
      paymentStatus: isOnlinePayment ? 'PAID' : 'COD',
      paymentId: razorpayPaymentId || '',
      paymentOrderId: razorpayOrderId || '',
      paymentSignature: razorpaySignature || '',
      orderStatus: 'CONFIRMED',
      deliveryOtp: {
        code: otpCode,
        generatedAt: new Date(),
        status: 'PENDING',
      },
      notes: notes || 'Guest Web Order',
      statusTimeline: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          note: 'Guest order placed successfully on PAKKAM Website',
        },
        {
          status: 'CONFIRMED',
          timestamp: new Date(),
          note: isOnlinePayment ? 'Online payment verified' : 'Cash on Delivery confirmed',
        },
      ],
    });

    const savedOrder = await newOrder.save();

    // 5. Trigger Notifications
    try {
      await sendOrderConfirmationWhatsApp(savedOrder);
    } catch (wsErr) {
      console.warn('[WhatsApp Service Notice]', wsErr);
    }

    try {
      await sendPushNotificationToRole('ADMIN', {
        title: '🆕 New Guest Order Received!',
        body: `Guest Order ${savedOrder.orderNumber} placed by ${fullName} (₹${savedOrder.total})`,
      });
    } catch (notifErr) {
      console.warn('[Admin Notification Notice]', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Order confirmed successfully',
      order: {
        _id: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        total: savedOrder.total,
        subtotal: savedOrder.subtotal,
        deliveryFee: savedOrder.deliveryFee,
        paymentMethod: savedOrder.paymentMethod,
        paymentStatus: savedOrder.paymentStatus,
        orderStatus: savedOrder.orderStatus,
        deliveryOtp: savedOrder.deliveryOtp?.code,
        createdAt: savedOrder.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[CreateGuestOrder Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create guest order' });
  }
};

export const trackGuestOrder = async (req: Request, res: Response) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Both Order Number and Phone Number are required to track your order.',
      });
    }

    const cleanOrderNo = (orderNumber as string).trim().toUpperCase();
    const cleanPhone = (phone as string).toString().replace(/\D/g, '');

    const order = await Order.findOne({
      orderNumber: cleanOrderNo,
      $or: [
        { 'deliveryAddress.phone': cleanPhone },
        { 'deliveryAddress.mobileNumber': cleanPhone },
        { guestPhone: cleanPhone },
      ],
    }).populate('items.product', 'name images unit unitType');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please verify your Order Number and Phone Number.',
      });
    }

    // Field-scoped response (no cost/profit internal data)
    return res.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.guestName || order.deliveryAddress?.name || 'Customer',
        phone: order.guestPhone || order.deliveryAddress?.phone,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryFee: order.deliveryFee,
        total: order.total,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        deliveryOtp: order.deliveryOtp?.code,
        statusTimeline: order.statusTimeline,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[TrackGuestOrder Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to track order' });
  }
};
