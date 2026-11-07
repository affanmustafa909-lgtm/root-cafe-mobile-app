import axios from 'axios';
import { API_URL } from '../../constants/config';
import { getToken, setToken } from './tokenStorage';

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url || '';
      // Failed login/register/password-reset are not expired sessions — don't wipe auth.
      const isPublicAuth =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password');
      if (!isPublicAuth) {
        await setToken(null);
        unauthorizedListeners.forEach((listener) => listener());
      }
    }
    return Promise.reject(error);
  },
);

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
