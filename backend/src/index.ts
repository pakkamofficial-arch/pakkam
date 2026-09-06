import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import monthlyGroceryRoutes from './routes/monthlyGroceryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import wishlistRoutes from './routes/wishlistRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import deliveryZoneRoutes from './routes/deliveryZoneRoutes.js';
import deliveryBoyRoutes from './routes/deliveryBoyRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pincodeRoutes from './routes/pincodeRoutes.js';
import deliveryApplicationRoutes from './routes/deliveryApplicationRoutes.js';
import guestRoutes from './routes/guestRoutes.js';

dotenv.config();

// Validate Admin Credentials Environment Variables
if (
  !process.env.ADMIN_EMAIL ||
  !process.env.ADMIN_PASSWORD ||
  process.env.ADMIN_EMAIL.trim() === '' ||
  process.env.ADMIN_PASSWORD.trim() === ''
) {
  console.error('[CRITICAL SERVER ERROR] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables!');
  console.error('[CRITICAL SERVER ERROR] Admin authentication system will reject logins until credentials are set in environment variables.');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('[CRITICAL SERVER ERROR] JWT_SECRET must be configured in environment variables!');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(compression());
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res: any, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth rate limiter (Requirement 1: 10-20 requests/min/IP)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again in a minute.' },
});

// Root Health Check
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'PAKKAM API is running', status: 'OK' });
});

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'PAKKAM backend is healthy' });
});

// Direct APK Download Endpoint
app.get(['/download', '/api/download'], (_req, res) => {
  res.redirect(302, 'https://expo.dev/artifacts/eas/biqp5tsSahvO0LtE6TO_A815bp0HPA9wyjV3GcJhi6w.apk');
});

// API Routes (supporting both /api/admin and /admin for deployment flexibility)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/auth', authLimiter, authRoutes);
app.use('/api/pincode', pincodeRoutes);
app.use('/pincode', pincodeRoutes);
app.use('/api/shops', shopRoutes);
app.use('/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);
app.use('/api/guest', guestRoutes);
app.use('/guest', guestRoutes);
app.use('/api/monthly-grocery', monthlyGroceryRoutes);
app.use('/monthly-grocery', monthlyGroceryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/coupons', couponRoutes);
app.use('/api/delivery', deliveryBoyRoutes);
app.use('/delivery', deliveryBoyRoutes);
app.use('/api/delivery-applications', deliveryApplicationRoutes);
app.use('/delivery-applications', deliveryApplicationRoutes);
app.use('/api/admin/delivery-applications', deliveryApplicationRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/wishlist', wishlistRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/wallet', walletRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/banners', bannerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/support', supportRoutes);
app.use('/api/returns', returnRoutes);
app.use('/returns', returnRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/seller', sellerRoutes);
app.use('/api/delivery-zones', deliveryZoneRoutes);
app.use('/delivery-zones', deliveryZoneRoutes);
app.use('/api/delivery-boys', deliveryBoyRoutes);
app.use('/delivery-boys', deliveryBoyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[PAKKAM Server Running] http://localhost:${PORT}`);
});
