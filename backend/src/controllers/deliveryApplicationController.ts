import { Request, Response } from 'express';
import { DeliveryPartnerApplication } from '../models/DeliveryPartnerApplication.js';
import { DeliveryPerson } from '../models/DeliveryPerson.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

/**
 * Submit Delivery Partner Application (Google Form Webhook / Internal Form)
 * POST /api/delivery-applications/apply or POST /api/delivery/apply
 * Requirement 19, 21, 22, 23, 24, 75, 76, 77
 */
export const submitApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      address,
      pincode,
      city,
      state,
      vehicleType,
      vehicleNumber,
      servicePincodes,
      preferredDeliveryArea,
      documentReference,
      externalResponseId,
    } = req.body;

    const cleanMobile = String(mobileNumber || '').trim();
    if (!fullName || !cleanMobile || !pincode) {
      res.status(400).json({ success: false, message: 'Full name, mobile number, and PIN code are required' });
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number' });
      return;
    }

    // Duplicate check on external response ID or pending/active application (Requirement 75, 76, 77)
    if (externalResponseId) {
      const existingExt = await DeliveryPartnerApplication.findOne({ externalResponseId });
      if (existingExt) {
        res.json({
          success: true,
          message: 'Application response already synced.',
          application: existingExt,
        });
        return;
      }
    }

    const existingPending = await DeliveryPartnerApplication.findOne({
      mobileNumber: cleanMobile,
      applicationStatus: { $in: ['pending', 'under_review', 'accepted'] },
    });

    if (existingPending) {
      res.status(400).json({
        success: false,
        message: 'An active or pending application already exists for this mobile number.',
      });
      return;
    }

    const pinsArray = Array.isArray(servicePincodes)
      ? servicePincodes.map((p) => String(p).trim())
      : String(servicePincodes || pincode)
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

    const applicationId = `DPA${Date.now()}`;

    const application = await DeliveryPartnerApplication.create({
      applicationId,
      fullName: String(fullName).trim(),
      mobileNumber: cleanMobile,
      email: email ? String(email).trim().toLowerCase() : undefined,
      address: String(address || 'N/A').trim(),
      pincode: String(pincode).trim(),
      city: String(city || 'Madurai').trim(),
      state: String(state || 'Tamil Nadu').trim(),
      vehicleType: vehicleType || 'BIKE',
      vehicleNumber: vehicleNumber || '',
      servicePincodes: pinsArray.length > 0 ? pinsArray : [String(pincode).trim()],
      preferredDeliveryArea: preferredDeliveryArea || '',
      documentReference: documentReference ? String(documentReference).trim() : undefined,
      applicationStatus: 'pending',
      externalResponseId,
      submittedAt: new Date(),
    });

    // Notify Admin (Requirement 53)
    try {
      await Notification.create({
        recipientRole: 'ADMIN',
        type: 'SYSTEM_ALERT',
        title: '🛵 New Delivery Partner Application',
        body: `Application received from ${application.fullName} (${application.mobileNumber}) for PIN ${application.pincode}`,
        message: `New Delivery Partner Application\nName: ${application.fullName}\nMobile: ${application.mobileNumber}\nPIN: ${application.pincode}\nCity: ${application.city}`,
        isRead: false,
      });
    } catch (e) {
      console.error('Error creating admin notification for application:', e);
    }

    res.status(201).json({
      success: true,
      message: 'Delivery Partner application submitted successfully! Our team will review your application.',
      applicationId: application.applicationId,
      applicationStatus: application.applicationStatus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting application' });
  }
};

/**
 * Admin: Get all Delivery Partner Applications (GET /api/admin/delivery-applications)
 * Requirement 22, 25
 */
export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, pincode } = req.query;
    const filter: any = {};

    if (status) {
      filter.applicationStatus = status;
    }
    if (pincode) {
      filter.$or = [{ pincode: String(pincode).trim() }, { servicePincodes: String(pincode).trim() }];
    }

    const applications = await DeliveryPartnerApplication.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get Application Detail (GET /api/admin/delivery-applications/:id)
 */
export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await DeliveryPartnerApplication.findById(id).select('+documentReference');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    res.json({ success: true, application });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Accept Delivery Partner Application (PATCH /api/admin/delivery-applications/:id/accept)
 * Requirement 26, 27, 28, 78, 79
 */
export const acceptApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await DeliveryPartnerApplication.findById(id);

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (application.applicationStatus === 'accepted') {
      res.status(400).json({ success: false, message: 'Application is already accepted.' });
      return;
    }

    // 1. Check or create User with DELIVERY role
    let user = await User.findOne({ phone: application.mobileNumber }).select('+password');
    const tempPassword = `Pakkam@${Math.floor(1000 + Math.random() * 9000)}`;

    if (!user) {
      user = await User.create({
        name: application.fullName,
        phone: application.mobileNumber,
        email: application.email || `${application.mobileNumber}@delivery.pakkam.test`,
        password: tempPassword,
        role: 'DELIVERY',
        hasCompletedOnboarding: true,
        isActive: true,
      });
    } else {
      user.role = 'DELIVERY';
      user.isActive = true;
      if (!user.password) {
        user.password = tempPassword;
      }
      await user.save();
    }

    // 2. Check or create DeliveryPerson profile
    let deliveryPerson = await DeliveryPerson.findOne({ user: user._id });
    if (!deliveryPerson) {
      deliveryPerson = await DeliveryPerson.create({
        user: user._id,
        name: application.fullName,
        mobile: application.mobileNumber,
        email: user.email,
        vehicleType: application.vehicleType || 'BIKE',
        vehicleNumber: application.vehicleNumber || '',
        status: 'AVAILABLE',
        active: true,
        servicePincodes: application.servicePincodes,
        maxActiveOrders: 5,
        currentActiveOrders: 0,
      });
    } else {
      deliveryPerson.active = true;
      deliveryPerson.status = 'AVAILABLE';
      deliveryPerson.servicePincodes = Array.from(new Set([...deliveryPerson.servicePincodes, ...application.servicePincodes]));
      await deliveryPerson.save();
    }

    // 3. Update application record
    application.applicationStatus = 'accepted';
    application.identityVerificationStatus = 'VERIFIED';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user?._id as any;
    await application.save();

    res.json({
      success: true,
      message: 'Application ACCEPTED! Delivery Partner account activated successfully.',
      partner: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        mobile: deliveryPerson.mobile,
        servicePincodes: deliveryPerson.servicePincodes,
        temporaryCredentialsIssued: {
          username: user.phone,
          temporaryPassword: tempPassword,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error accepting application' });
  }
};

/**
 * Admin: Reject Delivery Partner Application (PATCH /api/admin/delivery-applications/:id/reject)
 * Requirement 78
 */
export const rejectApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const application = await DeliveryPartnerApplication.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    application.applicationStatus = 'rejected';
    application.rejectionReason = rejectionReason || 'Application did not meet operational criteria';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user?._id as any;
    await application.save();

    res.json({
      success: true,
      message: 'Application rejected.',
      application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error rejecting application' });
  }
};
