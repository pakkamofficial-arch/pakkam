import { Response } from 'express';
import { Address } from '../models/Address.js';
import { AuthRequest } from '../middleware/auth.js';
import { validateAndLookupPincode } from '../services/pincodeService.js';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user?._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      fullName,
      phone,
      mobileNumber,
      houseFlat,
      street,
      area,
      addressLine,
      city,
      state,
      pincode,
      landmark,
      isDefault,
      type,
    } = req.body;

    const recipientName = String(fullName || name || '').trim();
    const phoneNum = String(mobileNumber || phone || '').trim();
    const cleanPincode = String(pincode || '').trim();
    const addrLineStr = String(addressLine || `${houseFlat || ''} ${street || ''} ${area || ''}`).trim();
    const inputCity = String(city || '').trim();
    const inputState = String(state || 'Tamil Nadu').trim();

    // 1. Name validation
    if (!recipientName || recipientName.length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter a valid full name.' });
    }

    // 2. Mobile validation (Indian 10-digit mobile)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(phoneNum)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // 3. Address Line validation (Min 5 chars)
    if (!addrLineStr || addrLineStr.length < 5) {
      return res.status(400).json({ success: false, message: 'Please enter a complete delivery address (building, street, area).' });
    }

    // 4. PIN Code & Location Validation Service (Requirement 3, 4, 7, 8)
    const pinCheck = await validateAndLookupPincode(cleanPincode);
    if (!pinCheck.success) {
      return res.status(400).json({ success: false, message: pinCheck.message || 'Please enter a valid PIN code.' });
    }

    if (!pinCheck.serviceable) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, delivery is currently unavailable for this PIN code.',
      });
    }

    // Check city mismatch (Requirement 4)
    if (inputCity && pinCheck.city && inputCity.toLowerCase() !== pinCheck.city.toLowerCase()) {
      // Allow minor district/suburb variations, but reject major city mismatches
      const isPartMatch =
        inputCity.toLowerCase().includes(pinCheck.city.toLowerCase()) ||
        pinCheck.city.toLowerCase().includes(inputCity.toLowerCase());
      if (!isPartMatch) {
        return res.status(400).json({
          success: false,
          message: `City '${inputCity}' does not match PIN code ${cleanPincode} (${pinCheck.city}, ${pinCheck.state}). Please select a valid city for this PIN code.`,
        });
      }
    }

    const resolvedCity = pinCheck.city || inputCity || 'Madurai';
    const resolvedState = pinCheck.state || inputState || 'Tamil Nadu';

    if (isDefault) {
      await Address.updateMany({ user: req.user?._id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ user: req.user?._id });

    const address = await Address.create({
      user: req.user?._id,
      name: recipientName,
      fullName: recipientName,
      phone: phoneNum,
      mobileNumber: phoneNum,
      houseFlat: houseFlat || addrLineStr,
      street: street || addrLineStr,
      area: area || resolvedCity,
      addressLine: addrLineStr,
      city: resolvedCity,
      state: resolvedState,
      pincode: cleanPincode,
      landmark: String(landmark || '').trim(),
      type: type || 'HOME',
      isDefault: isDefault || count === 0,
    });

    res.status(201).json({ success: true, address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { isDefault, pincode, city } = req.body;

    if (pincode) {
      const pinCheck = await validateAndLookupPincode(String(pincode).trim());
      if (!pinCheck.success || !pinCheck.serviceable) {
        return res.status(400).json({
          success: false,
          message: pinCheck.message || 'Sorry, delivery is currently unavailable for this PIN code.',
        });
      }
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user?._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user?._id }, req.body, {
      new: true,
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    await Address.updateMany({ user: req.user?._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user?._id }, { isDefault: true }, { new: true });
    res.json({ success: true, address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, message: 'Address deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
