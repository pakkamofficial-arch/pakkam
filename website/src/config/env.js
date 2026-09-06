export const config = {
  downloadUrl: import.meta.env.EXPO_PUBLIC_APK_DOWNLOAD_URL || import.meta.env.VITE_ANDROID_DOWNLOAD_URL || 'https://expo.dev/artifacts/eas/biqp5tsSahvO0LtE6TO_A815bp0HPA9wyjV3GcJhi6w.apk',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'pakkamofficial@gmail.com',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+919876543210',
  whatsappUrl: import.meta.env.VITE_WHATSAPP_URL || 'https://wa.me/919876543210',
  apiUrl: import.meta.env.VITE_API_URL || 'https://pakkam.onrender.com/api',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
};
