import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import client from '../api/client';

// Configure foreground notification behavior (Section 19)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers device for push notifications and sends FCM / Expo token securely to backend
 * (Section 4 & 5)
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      console.log('[Notification Service] Push notifications not active on web.');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[Notification Service] Must use physical device for Push Notifications');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notification Service] Notification permission not granted');
      return null;
    }

    let tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '3c0da25f-6629-4b5a-80a1-b92c9fce1e43',
    });

    const token = tokenData.data;
    console.log('[Notification Service] Push Token:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#16a34a',
      });
    }

    // Register token with backend securely (Section 4)
    if (token) {
      try {
        await client.post('/auth/push-token', {
          pushToken: token,
          platform: Platform.OS,
          deviceId: Device.modelName || 'device',
        });
        console.log('[Notification Service] Push token synced with backend.');
      } catch (backendErr) {
        console.warn('[Notification Service] Push token sync warning:', backendErr);
      }
    }

    return token;
  } catch (error) {
    console.error('[Notification Service] Error getting push token:', error);
    return null;
  }
};

/**
 * Sets up notification response listener for notification tap navigation (Section 18)
 */
export const setupNotificationListeners = (navigationRef: any) => {
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    try {
      const data = response.notification.request.content.data;
      console.log('[Notification Listener] Tapped notification data:', data);

      if (!data || !navigationRef?.current) return;

      const { type, orderId } = data;

      if (type === 'NEW_ORDER') {
        navigationRef.current.navigate('OrdersHistory');
      } else if (type === 'DELIVERY_ASSIGNED') {
        navigationRef.current.navigate('DeliveryDashboard');
      } else if (type === 'ORDER_CONFIRMED' || type === 'OUT_FOR_DELIVERY' || type === 'DELIVERED') {
        if (orderId) {
          navigationRef.current.navigate('OrderTracking', { orderId });
        } else {
          navigationRef.current.navigate('OrdersHistory');
        }
      }
    } catch (e) {
      console.error('[Notification Listener] Error navigating from tap:', e);
    }
  });

  return () => {
    responseSubscription.remove();
  };
};
