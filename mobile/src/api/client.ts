import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PAKKAM_TOKEN_KEY = 'pakkam_token';

// Helper to reliably get token across web and mobile
export const getStoredToken = async (): Promise<string | null> => {
  try {
    let token: string | null = null;
    // 1. Try AsyncStorage first
    token = await AsyncStorage.getItem(PAKKAM_TOKEN_KEY);
    // 2. Fallback to localStorage on web
    if (!token && Platform.OS === 'web') {
      token = localStorage.getItem(PAKKAM_TOKEN_KEY);
    }
    if (token && typeof token === 'string' && token !== 'undefined' && token !== 'null') {
      return token.trim();
    }
  } catch (e) {
    console.error('Error fetching stored token:', e);
  }
  return null;
};

// Helper to reliably set token across web and mobile
export const setStoredToken = async (token: string): Promise<void> => {
  try {
    if (!token || typeof token !== 'string') return;
    const cleanToken = token.trim();
    await AsyncStorage.setItem(PAKKAM_TOKEN_KEY, cleanToken);
    if (Platform.OS === 'web') {
      localStorage.setItem(PAKKAM_TOKEN_KEY, cleanToken);
    }
  } catch (e) {
    console.error('Error setting stored token:', e);
  }
};

// Helper to clear token across web and mobile
export const clearStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PAKKAM_TOKEN_KEY);
    if (Platform.OS === 'web') {
      localStorage.removeItem(PAKKAM_TOKEN_KEY);
    }
  } catch (e) {
    console.error('Error clearing stored token:', e);
  }
};

const DEFAULT_PROD_API_URL = 'https://pakkam.onrender.com/api';

const getBaseUrl = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || '';
  if (url && typeof url === 'string' && url.trim().length > 0) {
    url = url.trim();
    if (!url.endsWith('/api')) {
      url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
  }
  // Development fallback for local emulator
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
    return 'http://localhost:5000/api';
  }
  // Standalone Production Build fallback (never use localhost on physical device)
  return DEFAULT_PROD_API_URL;
};

const client = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Bearer token cleanly
client.interceptors.request.use(async (config) => {
  try {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  } catch (e) {
    console.error('Error attaching authorization token:', e);
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized cleanly
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        await clearStoredToken();
      }
    }
    return Promise.reject(error);
  }
);

export default client;
