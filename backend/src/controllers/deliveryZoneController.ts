import { Request, Response } from 'express';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { AppSetting } from '../models/AppSetting.js';

/**
 * Check if a customer pincode is serviceable based on delivery_coverage_mode (Part 9, 10, 11)
 */
export const checkPincodeServiceable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode } = req.query;

    if (!pincode) {
      res.status(400).json({ success: false, message: 'Pincode is required' });
      return;
    }

    const cleanPincode = String(pincode).trim();

    // Part 11: Validate 6-digit Indian pincode format
    if (!/^\d{6}$/.test(cleanPincode)) {
      res.status(400).json({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }

    // Check delivery coverage mode setting (Part 9 & 10)
    const modeSetting = await AppSetting.findOne({ key: 'delivery_coverage_mode' });
    const coverageMode = modeSetting?.value || 'ALL_VALID_PINCODES'; // Default to ALL_VALID_PINCODES for MVP

    if (coverageMode === 'ALL_VALID_PINCODES') {
      const zone = await DeliveryZone.findOne({ pincodes: cleanPincode, active: true });

      res.json({
        success: true,
        serviceable: true,
        message: 'PIN code is serviceable!',
        mode: 'ALL_VALID_PINCODES',
        zone: zone
          ? { id: zone._id, name: zone.name, city: zone.city, pincodes: zone.pincodes }
          : { id: null, name: 'Local Delivery Area', city: 'Chennai', pincodes: [cleanPincode] },
      });
      return;
    }

    // SELECTED_PINCODES mode
    const zone = await DeliveryZone.findOne({
      pincodes: cleanPincode,
      active: true,
    });

    if (zone) {
      res.json({
        success: true,
        serviceable: true,
        message: 'PIN code is serviceable!',
        mode: 'SELECTED_PINCODES',
        zone: {
          id: zone._id,
          name: zone.name,
          city: zone.city,
          pincodes: zone.pincodes,
        },
      });
    } else {
      res.json({
        success: true,
        serviceable: false,
        message: 'Sorry, PAKKAM is currently unavailable in this PIN code.',
        mode: 'SELECTED_PINCODES',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error checking pincode' });
  }
};

/**
 * Admin: Get all delivery zones
 */
export const getAdminDeliveryZones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const zones = await DeliveryZone.find().sort({ name: 1 });
    res.json({ success: true, zones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Create delivery zone
 */
export const createAdminDeliveryZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, city, state, pincodes, active, latitude, longitude } = req.body;

    if (!name || !city || !pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
      res.status(400).json({ success: false, message: 'Name, city, and at least one pincode are required' });
      return;
    }

    const cleanPincodes = pincodes.map((p: string) => String(p).trim());

    const zone = await DeliveryZone.create({
      name,
      city,
      state: state || 'Tamil Nadu',
      pincodes: cleanPincodes,
      active: active !== undefined ? active : true,
      latitude,
      longitude,
    });

    res.status(201).json({ success: true, message: 'Delivery zone created successfully', zone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update delivery zone
 */
export const updateAdminDeliveryZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, city, state, pincodes, active } = req.body;

    const zone = await DeliveryZone.findById(id);
    if (!zone) {
      res.status(404).json({ success: false, message: 'Delivery zone not found' });
      return;
    }

    if (name) zone.name = name;
    if (city) zone.city = city;
    if (state) zone.state = state;
    if (pincodes && Array.isArray(pincodes)) {
      zone.pincodes = pincodes.map((p: string) => String(p).trim());
    }
    if (active !== undefined) zone.active = active;

    await zone.save();

    res.json({ success: true, message: 'Delivery zone updated successfully', zone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete delivery zone
 */
export const deleteAdminDeliveryZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await DeliveryZone.findByIdAndDelete(id);
    res.json({ success: true, message: 'Delivery zone deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
