import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  savePushToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/push-token', protect, savePushToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
