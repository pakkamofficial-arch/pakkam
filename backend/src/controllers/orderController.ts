import { Response } from 'express';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Address } from '../models/Address.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { AppSetting } from '../models/AppSetting.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { getUnitMultiplier } from './cartController.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { sendOrderConfirmationWhatsApp } from '../services/whatsappService.js';
import { calculateEffectiveProductPrice } from '../services/priceSyncService.js';
import { generateDeliveryOtp } from '../utils/otp.js';

export const checkoutPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { couponCode, walletAmountApplied = 0 } = req.body;

    const cart = await Cart.findOne({ user: req.user?._id }).populate({
      path: 'items.product',
      populate: { path: 'shop' },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    let subtotal = 0;
    let totalWeightKg = 0;
    let priceChanged = false;
    const priceChangeMessages: string[] = [];
    const itemsPreview: any[] = [];

    for (const item of cart.items) {
      const prod: any = item.product;
      if (!prod || !prod.isActive) {
        return res.status(400).json({ success: false, message: `Product ${prod?.name || ''} is no longer available` });
      }

      const multiplier = item.unitMultiplier || getUnitMultiplier(item.selectedUnit);
      const requestedUnits = multiplier * item.quantity;

      // Stock Check
      if (prod.availableQuantity !== undefined && requestedUnits > prod.availableQuantity) {
        const unitLabel = prod.unitType || 'kg';
        return res.status(400).json({
          success: false,
          message: `Only ${prod.availableQuantity} ${unitLabel} is currently available for ${prod.name}.`,
        });
      }

      const priceInfo = calculateEffectiveProductPrice(prod);
      const currentPrice = priceInfo.effectiveUnitPrice;

      if (item.price !== currentPrice) {
        priceChanged = true;
        priceChangeMessages.push(
          `Price updated for ${prod.name}: was ₹${item.price}/unit, now ₹${currentPrice}/unit`
        );
      }

      // Integer paise calculation to prevent JS floating point inaccuracies
      const itemSubtotalPaise = Math.round(currentPrice * 100) * requestedUnits;
      const itemSubtotal = itemSubtotalPaise / 100;
      subtotal += itemSubtotal;
      totalWeightKg += requestedUnits;

      itemsPreview.push({
        productId: prod._id,
        name: prod.name,
        image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
        selectedUnit: item.selectedUnit,
        quantity: item.quantity,
        multiplier,
        requestedUnits,
        unitPrice: currentPrice,
        marketPrice: priceInfo.marketPrice,
        priceSource: priceInfo.priceSource,
        itemSubtotal,
      });
    }

    subtotal = Math.round(subtotal);

    // Delivery Fee calculation (Base + Weight / Bulk Delivery Rules)
    const feeSetting = await AppSetting.findOne({ key: 'delivery_fee_tiers' });
    const tiers = feeSetting?.value || { tier1Threshold: 299, tier1Fee: 30, tier2Threshold: 499, tier2Fee: 20, freeThreshold: 500 };

    let deliveryFee = tiers.tier1Fee;
    if (subtotal >= tiers.freeThreshold) {
      deliveryFee = 0;
    } else if (subtotal >= tiers.tier1Threshold) {
      deliveryFee = tiers.tier2Fee;
    }

    // Bulk delivery surcharge for >50kg
    if (totalWeightKg >= 50 && totalWeightKg < 200) {
      deliveryFee += 100; // Bulk weight surcharge
    } else if (totalWeightKg >= 200) {
      deliveryFee += 300; // Heavy bulk freight charge
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

    // Wallet discount
    let actualWalletDeducted = 0;
    if (walletAmountApplied > 0) {
      const wallet = await Wallet.findOne({ user: req.user?._id });
      if (wallet && wallet.balance > 0) {
        actualWalletDeducted = Math.min(wallet.balance, walletAmountApplied, subtotal + deliveryFee - couponDiscount);
      }
    }

    const totalDiscount = couponDiscount + actualWalletDeducted;
    const grandTotal = Math.max(0, subtotal + deliveryFee - totalDiscount);

    res.json({
      success: true,
      items: itemsPreview,
      subtotal,
      discount: totalDiscount,
      couponDiscount,
      walletDiscount: actualWalletDeducted,
      deliveryFee,
      totalWeightKg,
      grandTotal,
      priceChanged,
      priceChangeMessages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPaymentOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const receipt = `rcpt_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({ amount, receipt });

    res.json({
      success: true,
      order: razorpayOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      addressId,
      newAddress,
      shippingAddress,
      directItems,
      productId,
      quantity,
      selectedUnit,
      paymentMethod = 'COD',
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      couponCode,
      walletAmountApplied = 0,
      notes,
    } = req.body;

    // Verify online payment signature if method is ONLINE / RAZORPAY
    if (paymentMethod === 'ONLINE' || paymentMethod === 'RAZORPAY') {
      if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
        const isValid = verifyRazorpaySignature({
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        });

        if (!isValid) {
          return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
      }
    }

    let cart: any = null;
    if (req.user?._id) {
      cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        populate: { path: 'shop' },
      });
    }

    let itemsToProcess: any[] = [];
    if (cart && cart.items && cart.items.length > 0) {
      itemsToProcess = cart.items;
    } else if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      itemsToProcess = directItems;
    } else if (productId) {
      itemsToProcess = [{ product: productId, quantity: quantity || 1, selectedUnit: selectedUnit || 'kg' }];
    } else {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Resolve address
    let address: any = null;
    if (addressId && req.user?._id) {
      address = await Address.findOne({ _id: addressId, user: req.user._id });
    }
    if (!address && addressId) {
      address = await Address.findById(addressId);
    }

    const inputAddr = shippingAddress || newAddress;
    if (!address && inputAddr) {
      if (req.user?._id) {
        const isFirst = (await Address.countDocuments({ user: req.user._id })) === 0;
        address = await Address.create({
          user: req.user._id,
          name: inputAddr.name || inputAddr.fullName || 'Customer',
          fullName: inputAddr.fullName || inputAddr.name || 'Customer',
          phone: inputAddr.phone || inputAddr.mobileNumber || '9876543210',
          mobileNumber: inputAddr.mobileNumber || inputAddr.phone || '9876543210',
          houseFlat: inputAddr.houseFlat || inputAddr.addressLine || 'Address',
          street: inputAddr.street || inputAddr.addressLine || 'Street',
          area: inputAddr.area || inputAddr.city || '',
          addressLine: inputAddr.addressLine || `${inputAddr.houseFlat || ''} ${inputAddr.street || ''}`.trim(),
          city: inputAddr.city || 'Madurai',
          state: inputAddr.state || 'Tamil Nadu',
          pincode: inputAddr.pincode || '625001',
          landmark: inputAddr.landmark || '',
          type: inputAddr.type || 'HOME',
          isDefault: isFirst,
        });
      } else {
        address = {
          name: inputAddr.name || inputAddr.fullName || 'Guest Customer',
          fullName: inputAddr.fullName || inputAddr.name || 'Guest Customer',
          phone: inputAddr.phone || inputAddr.mobileNumber || '9876543210',
          mobileNumber: inputAddr.mobileNumber || inputAddr.phone || '9876543210',
          houseFlat: inputAddr.houseFlat || inputAddr.addressLine || 'Address',
          street: inputAddr.street || inputAddr.addressLine || 'Street',
          area: inputAddr.area || inputAddr.city || '',
          addressLine: inputAddr.addressLine || `${inputAddr.houseFlat || ''} ${inputAddr.street || ''}`.trim(),
          city: inputAddr.city || 'Madurai',
          state: inputAddr.state || 'Tamil Nadu',
          pincode: inputAddr.pincode || '625001',
          landmark: inputAddr.landmark || '',
        };
      }
    }

    if (!address) {
      return res.status(400).json({ success: false, message: 'Please provide a delivery location.' });
    }

    // Pincode Format Check Only (Strict 6 numeric digits)
    const cleanPincode = String(address.pincode).trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
    }

    const matchingZone = await DeliveryZone.findOne({
      pincodes: cleanPincode,
      active: true,
    });

    const firstProductDoc: any = typeof itemsToProcess[0].product === 'object' ? itemsToProcess[0].product : await Product.findById(itemsToProcess[0].product);
    const shopId = firstProductDoc?.shop?._id || firstProductDoc?.shop;

    // Calculate Subtotal & Verify Stock
    let subtotal = 0;
    let totalWeightKg = 0;
    const orderItemsSnapshot: any[] = [];
    const productsToUpdate: { productDoc: any; deductUnits: number }[] = [];

    for (const item of itemsToProcess) {
      const prodId = typeof item.product === 'object' ? item.product._id : item.product;
      const prod: any = await Product.findById(prodId);
      if (!prod || !prod.isActive) {
        return res.status(400).json({ success: false, message: 'Product is no longer available' });
      }

      const multiplier = item.unitMultiplier || getUnitMultiplier(item.selectedUnit);
      const requestedUnits = multiplier * item.quantity;

      // Strict stock validation
      if (prod.availableQuantity !== undefined && requestedUnits > prod.availableQuantity) {
        const unitLabel = prod.unitType || 'kg';
        return res.status(400).json({
          success: false,
          message: `Only ${prod.availableQuantity} ${unitLabel} is currently available for ${prod.name}.`,
        });
      }

      const priceInfo = calculateEffectiveProductPrice(prod);
      const itemPrice = priceInfo.effectiveUnitPrice;
      const itemSubtotal = Math.round(itemPrice * 100 * requestedUnits) / 100;
      subtotal += itemSubtotal;
      totalWeightKg += requestedUnits;

      orderItemsSnapshot.push({
        product: prod._id,
        name: prod.name,
        image: prod.images && prod.images.length > 0 ? prod.images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
        selectedUnit: item.selectedUnit,
        quantity: item.quantity,
        price: itemPrice,
        discountPrice: priceInfo.discountActive ? priceInfo.effectiveUnitPrice : undefined,
      });

      productsToUpdate.push({ productDoc: prod, deductUnits: requestedUnits });
    }

    subtotal = Math.round(subtotal);

    // Dynamic Delivery Fee Tiers
    const feeSetting = await AppSetting.findOne({ key: 'delivery_fee_tiers' });
    const tiers = feeSetting?.value || { tier1Threshold: 299, tier1Fee: 30, tier2Threshold: 499, tier2Fee: 20, freeThreshold: 500 };

    let deliveryFee = tiers.tier1Fee;
    if (subtotal >= tiers.freeThreshold) {
      deliveryFee = 0;
    } else if (subtotal >= tiers.tier1Threshold) {
      deliveryFee = tiers.tier2Fee;
    }

    if (totalWeightKg >= 50 && totalWeightKg < 200) {
      deliveryFee += 100;
    } else if (totalWeightKg >= 200) {
      deliveryFee += 300;
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
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Wallet discount
    let actualWalletDeducted = 0;
    if (walletAmountApplied > 0) {
      const wallet = await Wallet.findOne({ user: req.user?._id });
      if (wallet && wallet.balance > 0) {
        actualWalletDeducted = Math.min(wallet.balance, walletAmountApplied, subtotal + deliveryFee - couponDiscount);
        wallet.balance -= actualWalletDeducted;
        await wallet.save();

        await WalletTransaction.create({
          wallet: wallet._id,
          user: req.user?._id,
          amount: actualWalletDeducted,
          type: 'DEBIT',
          description: `Wallet Payment for Order`,
          referenceType: 'ORDER',
        });
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - couponDiscount - actualWalletDeducted);
    const orderNumber = `PKM${Math.floor(100000 + Math.random() * 900000)}`;
    const otpCode = generateDeliveryOtp();
    const deliveryOtpData = {
      code: otpCode,
      generatedAt: new Date(),
      attempts: 0,
      status: 'PENDING',
    };

    const order = await Order.create({
      orderNumber,
      user: req.user?._id,
      shop: shopId,
      deliveryOtp: deliveryOtpData,
      items: orderItemsSnapshot,
      deliveryAddress: {
        name: address.name,
        phone: address.phone,
        houseFlat: address.houseFlat,
        street: address.street,
        area: address.area || address.landmark || '',
        city: address.city,
        pincode: cleanPincode,
        landmark: address.landmark,
      },
      pincode: cleanPincode,
      deliveryZone: matchingZone ? matchingZone._id : undefined,
      subtotal,
      discount: couponDiscount + actualWalletDeducted,
      deliveryFee,
      total,
      couponCode: couponCode || '',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'CONFIRMED',
      notes,
      statusTimeline: [
        {
          status: 'CONFIRMED',
          timestamp: new Date(),
          note: 'Order confirmed successfully.',
        },
      ],
    });

    // Finalize Inventory Deduction & Low Stock Notifications
    for (const itemUpd of productsToUpdate) {
      const pDoc = itemUpd.productDoc;
      pDoc.availableQuantity = Math.max(0, (pDoc.availableQuantity || 0) - itemUpd.deductUnits);
      if (pDoc.availableQuantity === 0) {
        pDoc.stockStatus = 'OUT_OF_STOCK';
      } else if (pDoc.availableQuantity <= 25) {
        pDoc.stockStatus = 'LOW_STOCK';

        // Send Low Stock Alert to Admin
        try {
          await Notification.create({
            recipientRole: 'ADMIN',
            type: 'SYSTEM_ALERT',
            title: 'Low Stock Alert ⚠️',
            body: `${pDoc.name} is running low! Remaining stock: ${pDoc.availableQuantity} ${pDoc.unitType || 'kg'}`,
            message: `${pDoc.name} stock alert: ${pDoc.availableQuantity} remaining.`,
            isRead: false,
          });
        } catch (e) {
          console.error('Error creating low stock alert:', e);
        }
      }
      await pDoc.save();
    }

    // Clear cart after order creation if cart exists
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Check Bulk Order Alert (>= 100 kg or total >= ₹10,000)
    const isBulkOrder = totalWeightKg >= 100 || total >= 10000;
    const notifTitle = isBulkOrder ? '🚨 BULK ORDER RECEIVED 📦' : 'New Order Received 🛒';

    // Create Admin Notification in MongoDB
    try {
      await Notification.create({
        recipientRole: 'ADMIN',
        type: 'NEW_ORDER',
        title: notifTitle,
        body: `Order #${order.orderNumber} placed by ${address.name} (${address.phone}) - Total: ₹${order.total} (${totalWeightKg} kg)`,
        message: `Order #${order.orderNumber} placed by ${address.name} (${address.phone})\nTotal: ₹${order.total}\nWeight: ${totalWeightKg} kg\nPayment: ${order.paymentMethod}`,
        order: order._id,
        isRead: false,
      });
    } catch (notifErr) {
      console.error('Admin notification creation error:', notifErr);
    }

    // Trigger WhatsApp Notification (Fail-safe)
    sendOrderConfirmationWhatsApp(order).catch((err) =>
      console.error('WhatsApp notification dispatch error:', err)
    );

    const orderObj = order.toObject ? order.toObject() : { ...order };
    (orderObj as any).orderId = order.orderNumber || order._id;
    (orderObj as any).grandTotal = order.total;
    (orderObj as any).shippingAddress = order.deliveryAddress;

    res.status(201).json({
      success: true,
      message: 'Order placed and confirmed successfully',
      order: orderObj,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};
    if (req.user?.role === 'CUSTOMER') {
      query.user = req.user._id;
    } else if (req.user?.role === 'SELLER' && req.user.shop) {
      query.shop = req.user.shop;
    } else if (req.user?.role === 'DELIVERY') {
      query.$or = [{ deliveryPerson: req.user._id }, { orderStatus: 'READY_FOR_PICKUP' }];
    }

    const orders = await Order.find(query)
      .populate('shop', 'name phone address rating logo')
      .populate('user', 'name phone email')
      .populate('deliveryPerson', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shop', 'name phone address rating logo')
      .populate('user', 'name phone email')
      .populate('deliveryPerson', 'name phone vehicleType vehicleNumber');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check: Customer can only view own order
    const orderUserId = (order.user as any)?._id ? (order.user as any)._id.toString() : order.user?.toString();
    if (req.user?.role === 'CUSTOMER' && orderUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    const orderObj: any = order.toObject();

    // Part 28: Protect driver personal phone from customer
    if (req.user?.role === 'CUSTOMER' && orderObj.deliveryPerson) {
      delete orderObj.deliveryPerson.phone;
    }

    res.json({ success: true, order: orderObj });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate Status Transitions (Part 7, 38)
    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'SHOP_ACCEPTED',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'READY_FOR_PICKUP',
      'DELIVERY_ASSIGNED',
      'DELIVERY_ACCEPTED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    order.orderStatus = status;
    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`,
    });

    if (status === 'OUT_FOR_DELIVERY' && req.user?.role === 'DELIVERY') {
      order.deliveryPerson = req.user._id;
    }

    await order.save();

    // Dispatch Role Notifications (Part 15 & 19)
    try {
      if (status === 'OUT_FOR_DELIVERY') {
        await Notification.create({
          user: order.user,
          recipientRole: 'CUSTOMER',
          type: 'ORDER_UPDATE',
          title: '🛵 Order Out for Delivery',
          body: `Your PAKKAM order #${order.orderNumber} is out for delivery!`,
          message: `Your PAKKAM order #${order.orderNumber} is out for delivery!`,
          order: order._id,
        });
      } else if (status === 'DELIVERED') {
        await Notification.create({
          user: order.user,
          recipientRole: 'CUSTOMER',
          type: 'ORDER_UPDATE',
          title: '🎉 Order Delivered',
          body: `Your PAKKAM order #${order.orderNumber} has been delivered successfully.`,
          message: `Your PAKKAM order #${order.orderNumber} has been delivered successfully.`,
          order: order._id,
        });
        await Notification.create({
          recipientRole: 'ADMIN',
          type: 'ORDER_UPDATE',
          title: 'Order Delivered ✅',
          body: `Order #${order.orderNumber} marked delivered.`,
          message: `Order #${order.orderNumber} marked delivered.`,
          order: order._id,
        });
      } else if (status === 'PREPARING') {
        await Notification.create({
          user: order.user,
          recipientRole: 'CUSTOMER',
          type: 'ORDER_UPDATE',
          title: '🍳 Order Being Prepared',
          body: `Your order #${order.orderNumber} is being prepared by the shop.`,
          message: `Your order #${order.orderNumber} is being prepared by the shop.`,
          order: order._id,
        });
      }
    } catch (notifErr) {
      console.error('Error dispatching status notification:', notifErr);
    }

    res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderItems = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Original order not found' });
    }

    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    let addedCount = 0;
    let unavailableCount = 0;

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.isActive && product.stockStatus !== 'OUT_OF_STOCK') {
        const unitMultiplier = getUnitMultiplier(item.selectedUnit);
        const itemPrice = product.discountPrice || product.price;

        const existingIndex = cart.items.findIndex(
          (ci) => ci.product.toString() === item.product.toString() && ci.selectedUnit === item.selectedUnit
        );

        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += item.quantity;
        } else {
          cart.items.push({
            product: product._id,
            shop: product.shop,
            selectedUnit: item.selectedUnit,
            unitMultiplier,
            quantity: item.quantity,
            price: itemPrice,
            discountPrice: product.discountPrice,
          });
        }
        addedCount++;
      } else {
        unavailableCount++;
      }
    }

    await cart.save();

    res.json({
      success: true,
      message: `${addedCount} items added to cart.${unavailableCount > 0 ? ` ${unavailableCount} items were unavailable.` : ''}`,
      addedCount,
      unavailableCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel Order with Automatic Refund if Paid (POST /api/orders/:id/cancel)
 */
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name phone email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const cancelOrderUserId = (order.user as any)?._id ? (order.user as any)._id.toString() : order.user?.toString();
    if (req.user?.role === 'CUSTOMER' && cancelOrderUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    const nonCancellable = ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED', 'CANCELLED'];
    if (nonCancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in current status (${order.orderStatus})`,
      });
    }

    const cancelReasonStr = reason || 'Customer requested cancellation';
    order.orderStatus = 'CANCELLED';
    order.cancelledBy = req.user?.role === 'CUSTOMER' ? 'CUSTOMER' : 'ADMIN';
    order.cancelledAt = new Date();
    order.cancellationReason = cancelReasonStr;

    let refundMessage = '';
    if (order.paymentStatus === 'PAID') {
      order.paymentStatus = 'REFUND_PENDING';
      refundMessage = ` Refund of ₹${order.total} initiated to original payment method.`;
    } else if (order.paymentStatus === 'PENDING' || order.paymentStatus === 'COD') {
      order.paymentStatus = 'CANCELLED';
    }

    order.statusTimeline.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Cancelled by ${order.cancelledBy}: ${cancelReasonStr}.${refundMessage}`,
    });

    await order.save();

    const customerName = order.deliveryAddress?.name || (order.user as any)?.name || req.user?.name || 'Customer';
    const customerMobile = order.deliveryAddress?.phone || (order.user as any)?.phone || req.user?.phone || 'N/A';

    // Dispatch Customer & Admin Notifications
    try {
      await Notification.create({
        user: (order.user as any)?._id || order.user,
        recipientRole: 'CUSTOMER',
        type: 'ORDER_UPDATE',
        title: 'Order Cancelled 🚫',
        body: `Order #${order.orderNumber} has been cancelled.${refundMessage}`,
        message: `Order #${order.orderNumber} has been cancelled.${refundMessage}`,
        order: order._id,
        isRead: false,
      });

      await Notification.create({
        recipientRole: 'ADMIN',
        type: 'ORDER_CANCELLED',
        title: 'Order Cancelled by Customer 🚫',
        body: `Order #${order.orderNumber} cancelled by ${customerName} (${customerMobile}). Total: ₹${order.total}. Payment: ${order.paymentMethod}`,
        message: `Order Cancelled\nCustomer: ${customerName}\nMobile: ${customerMobile}\nOrder ID: #${order.orderNumber}\nAmount: ₹${order.total}\nPayment: ${order.paymentMethod}\nPayment Status: ${order.paymentStatus}\nReason: ${cancelReasonStr}\nStatus: CANCELLED`,
        order: order._id,
        isRead: false,
      });
    } catch (e) {
      console.error('Error creating cancellation notification:', e);
    }

    res.json({
      success: true,
      message: `Order #${order.orderNumber} cancelled successfully.${refundMessage}`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
