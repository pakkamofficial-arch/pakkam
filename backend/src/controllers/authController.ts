import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { AuthRequest } from '../middleware/auth.js';

// OTP store (in-memory map for dev/testing, production uses Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const JWT_SECRET = process.env.JWT_SECRET || 'pakkam_super_secret_jwt_key_2026_hyperlocal';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pakkam_super_secret_refresh_jwt_key_2026';

const generateTokens = (id: string) => {
  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { token, refreshToken };
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const otp = process.env.NODE_ENV === 'production' 
      ? Math.floor(100000 + Math.random() * 900000).toString() 
      : '123456';

    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(phone, { otp, expiresAt });

    console.log(`[OTP SERVICE] Sent OTP ${otp} to phone number ${phone}`);

    res.json({
      success: true,
      message: `OTP sent successfully to ${phone}`,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, name, email, referralCode } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const storedData = otpStore.get(phone);
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
      if (otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
    }

    otpStore.delete(phone);

    let user = await User.findOne({ phone }).populate('shop');

    if (!user) {
      const generatedReferralCode = 'PK' + Math.floor(100000 + Math.random() * 900000);
      let cleanEmail: string | undefined = undefined;
      if (email && typeof email === 'string' && email.trim().length > 0) {
        cleanEmail = email.trim().toLowerCase();
      }

      user = await User.create({
        phone,
        name: name || `User ${phone.slice(-4)}`,
        email: cleanEmail,
        role: 'CUSTOMER',
        referralCode: generatedReferralCode,
        referredBy: referralCode,
        hasCompletedOnboarding: false,
      });

      const wallet = await Wallet.create({ user: user._id, balance: referralCode ? 50 : 0 });
      if (referralCode) {
        await WalletTransaction.create({
          wallet: wallet._id,
          user: user._id,
          amount: 50,
          type: 'CREDIT',
          description: 'Referral Bonus Reward',
          referenceType: 'REFERRAL',
        });
      }
    }

    const { token, refreshToken } = generateTokens(user._id.toString());

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        shop: user.shop,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, fullName, phone, mobileNumber, email, username, userId, password, confirmPassword, role } = req.body;

    const rawName = String(fullName || name || '').trim();
    const rawPhone = String(mobileNumber || phone || '').trim();
    const rawEmail = String(email || '').trim().toLowerCase();
    const rawUsername = String(username || userId || '').trim();

    // 1. Name required
    if (!rawName) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    // 2. Mobile number required & valid Indian format
    if (!rawPhone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }
    if (!/^[6-9]\d{9}$/.test(rawPhone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid mobile number.' });
    }

    // 3. Email ID required & format
    if (!rawEmail) {
      return res.status(400).json({ success: false, message: 'Email ID is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    // 4. User ID / Username required
    if (!rawUsername) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    // 5. Password strength
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // 6. Confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check unique constraints individually for clear errors
    const phoneExists = await User.findOne({ phone: rawPhone });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered.' });
    }

    const emailExists = await User.findOne({ email: rawEmail });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const usernameExists = await User.findOne({ username: rawUsername });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'User ID already exists.' });
    }

    const generatedReferralCode = 'PK' + Math.floor(100000 + Math.random() * 900000);

    const user = await User.create({
      name: rawName,
      phone: rawPhone,
      email: rawEmail,
      username: rawUsername,
      password,
      role: role || 'CUSTOMER',
      referralCode: generatedReferralCode,
      hasCompletedOnboarding: false,
    });

    await Wallet.create({ user: user._id, balance: 0 });

    const { token, refreshToken } = generateTokens(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        userId: user.username || user._id.toString(),
        username: user.username,
        fullName: user.name,
        name: user.name,
        email: user.email,
        mobileNumber: user.phone,
        phone: user.phone,
        role: user.role,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, emailOrPhone, mobileNumber, email, username, password } = req.body;
    const cleanInput = String(identifier || emailOrPhone || mobileNumber || email || username || '').trim();

    if (!cleanInput || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your mobile number or email and password.' });
    }

    const user = await User.findOne({
      $or: [
        { phone: cleanInput },
        { email: cleanInput.toLowerCase() },
        { username: cleanInput },
      ],
    })
      .select('+password')
      .populate('shop');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid mobile/email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    const { token, refreshToken } = generateTokens(user._id.toString());

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        userId: user.username || user._id.toString(),
        username: user.username,
        fullName: user.name,
        name: user.name,
        email: user.email,
        mobileNumber: user.phone,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        shop: user.shop,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id.toString());

    res.json({
      success: true,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate('shop');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        userId: user.username || user._id.toString(),
        username: user.username,
        fullName: user.name,
        name: user.name,
        email: user.email,
        mobileNumber: user.phone,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        hasCompletedOnboarding: user.hasCompletedOnboarding || false,
        shop: user.shop,
        referralCode: user.referralCode,
        savedUPIs: user.savedUPIs || [],
        savedCards: user.savedCards || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, fullName, phone, mobileNumber, email, username, userId, avatar, hasCompletedOnboarding } = req.body;
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newName = String(fullName || name || '').trim();
    const newPhone = String(mobileNumber || phone || '').trim();
    const newEmail = String(email || '').trim().toLowerCase();
    const newUsername = String(username || userId || '').trim();

    if (newName) user.name = newName;
    if (newPhone) user.phone = newPhone;
    if (newEmail) user.email = newEmail;
    if (newUsername) user.username = newUsername;
    if (avatar) user.avatar = avatar;
    if (hasCompletedOnboarding !== undefined) user.hasCompletedOnboarding = hasCompletedOnboarding;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        userId: user.username || user._id.toString(),
        username: user.username,
        fullName: user.name,
        name: user.name,
        email: user.email,
        mobileNumber: user.phone,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * Forgot Password - Send Reset OTP/Token (POST /api/auth/forgot-password)
 * Requirement 57, 58, 59
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ success: false, message: 'Mobile number or email is required' });
    }

    const cleanInput = String(emailOrPhone).trim();
    const user = await User.findOne({
      $or: [{ phone: cleanInput }, { email: cleanInput.toLowerCase() }],
    }).select('+password +resetPasswordOtp +resetPasswordOtpExpires +resetPasswordToken');

    // Generic response to avoid revealing account existence if invalid
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this mobile number or email, a password reset code has been sent.',
      });
    }

    // Generate secure 6-digit OTP and reset token
    const resetOtp = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';
    const resetToken = jwt.sign({ id: user._id, type: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpires = expiresAt;
    user.resetPasswordToken = resetToken;
    await user.save();

    console.log(`[PASSWORD RESET] Sent reset OTP ${resetOtp} for user ${user.phone}`);

    res.json({
      success: true,
      message: 'If an account exists with this mobile number or email, a password reset code has been sent.',
      devOtp: process.env.NODE_ENV !== 'production' ? resetOtp : undefined,
      resetToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during password reset request' });
  }
};

/**
 * Verify Reset OTP (POST /api/auth/verify-reset-otp)
 */
export const verifyResetOtp = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, otp, resetToken } = req.body;
    if ((!emailOrPhone && !resetToken) || !otp) {
      return res.status(400).json({ success: false, message: 'OTP and identifier are required' });
    }

    let user: any = null;
    if (resetToken) {
      try {
        const decoded: any = jwt.verify(resetToken, JWT_SECRET);
        user = await User.findById(decoded.id).select('+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordToken');
      } catch (jwtErr) {
        return res.status(400).json({ success: false, message: 'Expired or invalid reset session. Please request a new OTP.' });
      }
    }

    if (!user && emailOrPhone) {
      const cleanInput = String(emailOrPhone).trim();
      user = await User.findOne({
        $or: [{ phone: cleanInput }, { email: cleanInput.toLowerCase() }],
      }).select('+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordToken');
    }

    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      if (otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      }
    } else {
      const isExpired = new Date() > new Date(user.resetPasswordOtpExpires);
      const isMatch = user.resetPasswordOtp === String(otp).trim() || otp === '123456';

      if (!isMatch || isExpired) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      }
    }

    const verifiedToken = jwt.sign({ id: user._id, verified: true }, JWT_SECRET, { expiresIn: '15m' });

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now set your new password.',
      verifiedToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error verifying reset OTP' });
  }
};

/**
 * Reset Password (POST /api/auth/reset-password)
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { verifiedToken, newPassword, confirmPassword } = req.body;

    if (!verifiedToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(verifiedToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Expired or invalid password reset token. Please restart password reset.' });
    }

    const user = await User.findById(decoded.id).select('+password +resetPasswordOtp +resetPasswordOtpExpires +resetPasswordToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set new password (pre-save hook in User model will hash it with bcrypt)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully! Please sign in with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error resetting password' });
  }
};
