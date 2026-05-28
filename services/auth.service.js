import api from './api';
import Cookies from 'js-cookie';
import { TOKEN_COOKIE, TOKEN_EXPIRY_DAYS } from '@/lib/constants';

const MOCK_AUTH_ENABLED =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';

function authenticationError(error, fallbackMessage) {
  return new Error(error.response?.data?.message || fallbackMessage);
}

export const authService = {
  /**
   * Request OTP for mobile number.
   * @param {string} phone 
   */
  async sendOtp(phone) {
    try {
      // Normalize to 10 digits
      const normalizedPhone = phone.replace(/\D/g, '');
      const mobileNum = normalizedPhone.length > 10 ? normalizedPhone.slice(-10) : normalizedPhone;
      
      const response = await api.post('/mobile-auth/send-otp', { mobile: mobileNum });
      return response.data;
    } catch (error) {
      if (MOCK_AUTH_ENABLED) {
        console.warn('OTP API unavailable, using explicitly enabled development mock mode.');
        return { success: true, message: 'OTP sent successfully (Development Mock Mode)', mock: true };
      }

      throw authenticationError(error, 'Unable to send OTP right now. Please try again.');
    }
  },

  /**
   * Verify OTP code.
   * @param {string} phone 
   * @param {string} code 
   */
  async verifyOtp(phone, code) {
    try {
      // Normalize to 10 digits
      const normalizedPhone = phone.replace(/\D/g, '');
      const mobileNum = normalizedPhone.length > 10 ? normalizedPhone.slice(-10) : normalizedPhone;
      
      const response = await api.post('/mobile-auth/verify-otp', { mobile: mobileNum, otp: code });
      
      // Standard response formatter wraps the object in a 'data' key
      const dataObj = response.data?.data || response.data || {};
      const { token, mobile } = dataObj;
      
      if (token) {
        Cookies.set(TOKEN_COOKIE, token, { expires: TOKEN_EXPIRY_DAYS });
      }
      return { token, customer: { phone: mobile || mobileNum } };
    } catch (error) {
      if (MOCK_AUTH_ENABLED && code === '123456') {
        console.warn('OTP API unavailable, using explicitly enabled development mock mode.');
        const mockToken = 'mock_jwt_customer_token_grest';
        const mockCustomer = {
          _id: 'mock_customer_id_123',
          phone: phone,
          name: 'Customer',
          createdAt: new Date().toISOString()
        };
        
        Cookies.set(TOKEN_COOKIE, mockToken, { expires: TOKEN_EXPIRY_DAYS });
        return { token: mockToken, customer: mockCustomer, mock: true };
      }

      throw authenticationError(error, 'Verification failed. Please try again.');
    }
  },

  /**
   * Logout customer.
   */
  logout() {
    Cookies.remove(TOKEN_COOKIE);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

export default authService;
