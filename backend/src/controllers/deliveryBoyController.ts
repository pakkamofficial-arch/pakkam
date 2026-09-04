import { Request, Response } from 'express';
import { DeliveryPerson } from '../models/DeliveryPerson.js';
import { Order } from '../models/Order.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { User } from '../models/User.js';

/**
 * Get recommended delivery boys for an order, ranked by match score
 * Part 7 & Part 8 implementation
 */
export const getRecommendedDeliveryBoys = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('deliveryZone');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const pincode = order.deliveryAddress?.pincode || order.pincode || '';
    const zoneId = order.deliveryZone ? (order.deliveryZone as any)._id : null;

    // Fetch active & available delivery boys
    const candidateBoys = await DeliveryPerson.find({
      active: true,
      status: { $ne: 'SUSPENDED' },
    }).populate('serviceZones');

    const recommendedList = candidateBoys
      .map((boy) => {
        let score = 0;

        const pincodeMatch = boy.servicePincodes.includes(pincode);
        const zoneMatch = zoneId
          ? boy.serviceZones.some((z: any) => String(z._id || z) === String(zoneId))
          : false;

        // Pincode match = 40 points
        if (pincodeMatch) score += 40;

        // Zone match = 30 points
        if (zoneMatch) score += 30;

        // Capacity check: must have room for orders
        const capacityLeft = boy.maxActiveOrders - (boy.currentActiveOrders || 0);
        if (capacityLeft <= 0) return null; // no capacity left

        // Available capacity score (up to 10 points)
        score += Math.min(10, capacityLeft * 2);

        // Low workload score (5 points if 0 active orders)
        if (boy.currentActiveOrders === 0) score += 5;

        // Distance simulation (15 points if exact pincode match)
        if (pincodeMatch) score += 15;

        // Must have pincode OR zone match to be eligible
        if (!pincodeMatch && !zoneMatch) return null;

        return {
          id: boy._id,
          name: boy.name,
          mobile: boy.mobile,
          status: boy.status,
          currentActiveOrders: boy.currentActiveOrders,
          maxActiveOrders: boy.maxActiveOrders,
          vehicleType: boy.vehicleType,
          servicePincodes: boy.servicePincodes,
          pincodeMatch,
          zoneMatch,
          score,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      customerPincode: pincode,
      deliveryZone: (order.deliveryZone as any)?.name || 'Local Area',
      recommendedDeliveryBoys: recommendedList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error calculating delivery recommendations' });
  }
};

/**
 * Admin assigns a delivery boy to an order
 * Part 9 Implementation
 */
export const assignDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { deliveryBoyId } = req.body;

    if (!deliveryBoyId) {
      res.status(400).json({ success: false, message: 'Delivery boy ID is required' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const deliveryBoy = await DeliveryPerson.findById(deliveryBoyId);
    if (!deliveryBoy) {
      res.status(404).json({ success: false, message: 'Delivery partner not found' });
      return;
    }

    // Backend validations (Part 9)
    if (!deliveryBoy.active || deliveryBoy.status === 'SUSPENDED') {
      res.status(400).json({ success: false, message: 'Selected delivery partner is inactive or suspended' });
      return;
    }

    if (deliveryBoy.currentActiveOrders >= deliveryBoy.maxActiveOrders) {
      res.status(400).json({ success: false, message: 'Selected delivery partner has reached maximum order capacity' });
      return;
    }

    // Assign to order
    order.deliveryPerson = deliveryBoy._id as any;
    order.orderStatus = 'DELIVERY_ASSIGNED';
    order.assignmentType = 'ADMIN';
    order.assignedAt = new Date();
    order.statusTimeline.push({
      status: 'DELIVERY_ASSIGNED',
      timestamp: new Date(),
      note: `Assigned to delivery partner ${deliveryBoy.name} by Admin`,
    });

    await order.save();

    // Increment active orders count
    deliveryBoy.currentActiveOrders = (deliveryBoy.currentActiveOrders || 0) + 1;
    if (!deliveryBoy.assignedOrders.includes(order._id as any)) {
      deliveryBoy.assignedOrders.push(order._id as any);
    }
    await deliveryBoy.save();

    res.json({
      success: true,
      message: 'Delivery partner assigned successfully!',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        assignedTo: deliveryBoy.name,
        assignedAt: order.assignedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error assigning delivery partner' });
  }
};

/**
 * Admin: Get all delivery boys / search by pincode (GET /api/admin/delivery-partners?pincode=625001)
 * Requirement 31, 32, 47
 */
export const getAdminDeliveryBoys = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode, status } = req.query;
    const filter: any = {};

    if (pincode) {
      const cleanPin = String(pincode).trim();
      filter.servicePincodes = cleanPin;
    }

    if (status) {
      filter.status = status;
    }

    const deliveryBoys = await DeliveryPerson.find(filter).populate('serviceZones').sort({ name: 1 });

    const formattedList = deliveryBoys.map((boy) => {
      const isEligible = pincode ? boy.servicePincodes.includes(String(pincode).trim()) : true;
      return {
        id: boy._id,
        _id: boy._id,
        name: boy.name,
        mobile: boy.mobile,
        email: boy.email,
        vehicleType: boy.vehicleType,
        vehicleNumber: boy.vehicleNumber,
        status: boy.status,
        active: boy.active,
        servicePincodes: boy.servicePincodes,
        maxActiveOrders: boy.maxActiveOrders,
        currentActiveOrders: boy.currentActiveOrders || 0,
        totalDeliveries: boy.totalDeliveries || 0,
        rating: boy.rating || 5.0,
        isEligible,
      };
    });

    res.json({ success: true, count: formattedList.length, deliveryBoys: formattedList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Create delivery boy
 */
export const createAdminDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, mobile, email, password, vehicleType, vehicleNumber, servicePincodes, maxActiveOrders } = req.body;

    if (!name || !mobile || !servicePincodes) {
      res.status(400).json({ success: false, message: 'Name, mobile, and service pincodes are required' });
      return;
    }

    // Create user with DELIVERY role if doesn't exist
    let user = await User.findOne({ phone: mobile });
    if (!user) {
      user = await User.create({
        name,
        phone: mobile,
        email: email || `${mobile}@pakkam.test`,
        password: password || 'Password123!',
        role: 'DELIVERY',
        hasCompletedOnboarding: true,
      });
    }

    const cleanPincodes = Array.isArray(servicePincodes)
      ? servicePincodes.map((p) => String(p).trim())
      : String(servicePincodes).split(',').map((p) => p.trim());

    // Find matching zones automatically
    const matchingZones = await DeliveryZone.find({ pincodes: { $in: cleanPincodes }, active: true });
    const zoneIds = matchingZones.map((z) => z._id);

    const deliveryPerson = await DeliveryPerson.create({
      user: user._id,
      name,
      mobile,
      email: user.email,
      vehicleType: vehicleType || 'BIKE',
      vehicleNumber: vehicleNumber || '',
      status: 'AVAILABLE',
      active: true,
      servicePincodes: cleanPincodes,
      serviceZones: zoneIds,
      maxActiveOrders: maxActiveOrders || 5,
      currentActiveOrders: 0,
    });

    res.status(201).json({ success: true, message: 'Delivery partner created successfully', deliveryPerson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update delivery boy
 */
export const updateAdminDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, mobile, vehicleType, vehicleNumber, status, active, servicePincodes, maxActiveOrders } = req.body;

    const boy = await DeliveryPerson.findById(id);
    if (!boy) {
      res.status(404).json({ success: false, message: 'Delivery partner not found' });
      return;
    }

    if (name) boy.name = name;
    if (mobile) boy.mobile = mobile;
    if (vehicleType) boy.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) boy.vehicleNumber = vehicleNumber;
    if (status) boy.status = status;
    if (active !== undefined) boy.active = active;
    if (maxActiveOrders) boy.maxActiveOrders = maxActiveOrders;

    if (servicePincodes && Array.isArray(servicePincodes)) {
      boy.servicePincodes = servicePincodes.map((p) => String(p).trim());
      const matchingZones = await DeliveryZone.find({ pincodes: { $in: boy.servicePincodes }, active: true });
      boy.serviceZones = matchingZones.map((z) => z._id as any);
    }

    await boy.save();

    res.json({ success: true, message: 'Delivery partner updated successfully', deliveryPerson: boy });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete delivery boy
 */
export const deleteAdminDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await DeliveryPerson.findByIdAndDelete(id);
    res.json({ success: true, message: 'Delivery partner deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
