import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL, TOKEN_COOKIE } from '@/lib/constants';
import { redirectToLandingPage } from '@/lib/auth-utils';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach customer token ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: handle 401 and 404 Customer not found globally ──────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - invalid/expired token
    if (error.response?.status === 401) {
      // Clear all storage (cookies, localStorage, sessionStorage) and redirect to landing page
      // This ensures no stale data remains when the token is invalid
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        redirectToLandingPage();
      }
    }

    // Handle 404 with "Customer not found" message - invalid token for non-existent customer
    if (
      error.response?.status === 404 &&
      error.response?.data?.message &&
      error.response.data.message.toLowerCase().includes('customer not found')
    ) {
      console.warn('[Auth] Customer not found - clearing invalid token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        redirectToLandingPage();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
