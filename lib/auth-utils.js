import Cookies from 'js-cookie';
import { TOKEN_COOKIE } from './constants';

/**
 * Clears all authentication-related storage:
 * - All cookies
 * - All localStorage items
 * - All sessionStorage items
 *
 * This should be called when a token is invalid or expired
 * to ensure a clean state before redirecting to login.
 */
export function clearAllAuthStorage() {
  if (typeof window === 'undefined') return;

  try {
    // Clear all cookies
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName);
      // Also try to remove with path options in case they were set with specific paths
      Cookies.remove(cookieName, { path: '/' });
      Cookies.remove(cookieName, { path: '', domain: window.location.hostname });
    });

    // Clear all localStorage
    localStorage.clear();

    // Clear all sessionStorage
    sessionStorage.clear();

    console.log('[Auth] All storage cleared due to invalid token');
  } catch (error) {
    console.error('[Auth] Failed to clear storage:', error);
  }
}

/**
 * Checks if the user is authenticated by verifying the token exists
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!Cookies.get(TOKEN_COOKIE);
}

/**
 * Redirects to the landing page after clearing all storage
 * Used when an invalid token is detected
 */
export function redirectToLandingPage() {
  if (typeof window === 'undefined') return;

  clearAllAuthStorage();

  // Use window.location.href for a full page reload to ensure all state is reset
  window.location.href = '/';
}
