'use client';

import { useCallback, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import { TOKEN_COOKIE } from '@/lib/constants';

/**
 * Hook to handle protected navigation with authentication check
 * Shows login modal if user is not authenticated
 * @returns {Object} { navigateTo, showLoginModal, setShowLoginModal, redirectPath }
 */
export function useProtectedNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  const navigateTo = useCallback((href) => {
    // Define which routes require authentication
    const protectedRoutes = ['/orders', '/profile', '/settings', '/notifications', '/address', '/checkout', '/schedule'];

    const isProtectedRoute = protectedRoutes.some(route => href.startsWith(route));

    if (!isProtectedRoute) {
      // Not a protected route, navigate normally
      router.push(href);
      return;
    }

    // Check if user is authenticated
    const token = Cookies.get(TOKEN_COOKIE);
    const isAuthenticated = !!token || !!user;

    if (isAuthenticated) {
      // User is authenticated, navigate normally
      router.push(href);
    } else {
      // User is not authenticated, show login modal
      setRedirectPath(href);
      setShowLoginModal(true);
    }
  }, [router, user]);

  return {
    navigateTo,
    showLoginModal,
    setShowLoginModal,
    redirectPath,
  };
}
