import axios from 'axios';

const DEFAULT_API_URL = 'https://pakkam.onrender.com/api';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    envUrl = envUrl.trim();
    if (!envUrl.endsWith('/api')) {
      envUrl = envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
    }
    return envUrl;
  }
  return DEFAULT_API_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[API Client Error]', error?.response?.status, error?.config?.url);
    return Promise.reject(error);
  }
);

export default api;
