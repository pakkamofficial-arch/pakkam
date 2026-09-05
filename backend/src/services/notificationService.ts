import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { User, IUser } from '../models/User.js';

let firebaseApp: App | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newline strings in env vars
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    const existingApps = getApps();
    if (!existingApps.length) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[FCM Notification Service] Firebase Admin initialized successfully.');
    } else {
      firebaseApp = existingApps[0];
    }
  } else {
    console.warn('[FCM Notification Service] Firebase Admin environment variables not set. Running in dev fallback log mode.');
  }
} catch (error: any) {
  console.error('[FCM Notification Service] Firebase Admin init error:', error.message);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Collect active device tokens for a given User document or ID
 */
export const getUserTokens = async (userId: any): Promise<string[]> => {
  try {
    const user: IUser | null = await User.findById(userId);
    if (!user) return [];

    const tokens: string[] = [];
    if (user.pushToken) {
      tokens.push(user.pushToken);
    }
    if (Array.isArray(user.notificationTokens)) {
      user.notificationTokens.forEach((t) => {
        if (t.token && t.isActive !== false && !tokens.includes(t.token)) {
          tokens.push(t.token);
        }
      });
    }
    return tokens;
  } catch (e) {
    return [];
  }
};

/**
 * Remove invalid / expired FCM push tokens from User documents safely
 */
export const deactivateInvalidToken = async (userId: any, invalidToken: string): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (user) {
      if (user.pushToken === invalidToken) {
        user.pushToken = undefined;
      }
      if (Array.isArray(user.notificationTokens)) {
        user.notificationTokens = user.notificationTokens.filter((t) => t.token !== invalidToken);
      }
      await user.save();
    }
  } catch (e) {
    // Ignore cleanup error
  }
};

/**
 * Sends FCM push notification to a specific user (all registered active devices)
 * Fail-safe: Never throws or cancels order.
 */
export const sendPushNotificationToUser = async (
  userId: any,
  payload: PushNotificationPayload
): Promise<boolean> => {
  try {
    const tokens = await getUserTokens(userId);
    console.log(`[FCM Service] Sending to user ${userId} (${tokens.length} token(s)): "${payload.title}" - "${payload.body}"`);

    if (tokens.length === 0) {
      console.log(`[FCM Service Dev Mode] No push tokens registered for user ${userId}.`);
      return false;
    }

    if (firebaseApp) {
      const messaging = getMessaging(firebaseApp);
      const messagePayload: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      };

      const response = await messaging.sendEachForMulticast(messagePayload);
      console.log(`[FCM Service] Sent to ${response.successCount} device(s) successfully for user ${userId}.`);

      // Deactivate invalid tokens if any failed with registration error
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success && resp.error) {
          const errCode = resp.error.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            deactivateInvalidToken(userId, tokens[idx]);
          }
        }
      });
      return response.successCount > 0;
    }

    return true;
  } catch (error: any) {
    console.error(`[FCM Service Error] Failed to send push notification to user ${userId}:`, error.message);
    return false;
  }
};

/**
 * Sends FCM push notification to multiple user IDs
 */
export const sendPushNotificationToUsers = async (
  userIds: any[],
  payload: PushNotificationPayload
): Promise<boolean> => {
  try {
    const results = await Promise.all(userIds.map((uid) => sendPushNotificationToUser(uid, payload)));
    return results.some((r) => r);
  } catch (error: any) {
    console.error('[FCM Service Error] Failed to send push notification to users:', error.message);
    return false;
  }
};

/**
 * Sends FCM push notification to all active users matching a specific role (e.g. 'ADMIN')
 */
export const sendPushNotificationToRole = async (
  role: 'ADMIN' | 'CUSTOMER' | 'DELIVERY' | 'SELLER',
  payload: PushNotificationPayload
): Promise<boolean> => {
  try {
    const users = await User.find({ role, isActive: true }).select('_id pushToken notificationTokens');
    const userIds = users.map((u) => u._id);
    console.log(`[FCM Service] Dispatching notification to role ${role} (${userIds.length} user(s))`);
    return await sendPushNotificationToUsers(userIds, payload);
  } catch (error: any) {
    console.error(`[FCM Service Error] Failed to send push notification to role ${role}:`, error.message);
    return false;
  }
};

/**
 * Helper to construct product summary string
 */
export const buildProductSummary = (items: any[]): string => {
  if (!items || items.length === 0) return 'Groceries';
  return items
    .map((item) => {
      const name = item.name || item.productName || item.product?.name || 'Item';
      const qty = item.quantity || 1;
      return `${name} x${qty}`;
    })
    .join(', ');
};

/**
 * Backward compatibility alias replacing old WhatsApp function with FCM Push Notification
 */
export const sendOrderConfirmationWhatsApp = async (order: any): Promise<boolean> => {
  try {
    if (!order || !order.user) return false;
    const customerName = order.deliveryAddress?.name || 'Valued Customer';
    const amount = order.total || 0;
    const paymentMethodStr = order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';
    const otp = typeof order.deliveryOtp === 'object' ? order.deliveryOtp?.code : (order.deliveryOtp || '----');

    return await sendPushNotificationToUser(order.user, {
      title: 'Pakkam — Order Confirmed',
      body: `Hello ${customerName}, your order has been confirmed successfully.\nAmount: ₹${amount}\nPayment: ${paymentMethodStr}\nDelivery OTP: ${otp}`,
      data: {
        type: 'ORDER_CONFIRMED',
        orderId: order._id?.toString() || order.orderNumber,
      },
    });
  } catch (err: any) {
    console.error('[FCM Service Error] Order confirmation notification error:', err.message);
    return false;
  }
};
