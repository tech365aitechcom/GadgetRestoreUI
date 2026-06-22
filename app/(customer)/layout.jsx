'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import PushNotificationRegistrar from '@/components/notifications/PushNotificationRegistrar';
import AuthGuard from '@/components/auth/AuthGuard';
import notificationService from '@/services/notification.service';
import PropTypes from 'prop-types';

import { usePathname } from 'next/navigation';

/**
 * Layout for authenticated customer routes (Home, Orders, Profile).
 * Wraps content in AppShell, adds bottom padding for the nav,
 * and renders the BottomNav bar.
 *
 * IMPORTANT: All routes under (customer) are protected by AuthGuard.
 * Unauthenticated users will see a login modal and won't be able to
 * make any API calls until they authenticate.
 */
export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const hideMobileHeader =
    pathname === '/notifications' ||
    pathname.startsWith('/profile/personal-info') ||
    pathname.startsWith('/profile/addresses');

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(
          res?.data?.unreadCount ??
          res?.data?.count ??
          res?.count ??
          0
        );
      } catch (err) {
        console.warn('Failed to fetch unread notifications count:', err);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthGuard>
      <PushNotificationRegistrar />
      <AppShell className="bg-[var(--color-bg-card)] sm:bg-[var(--color-bg)]">
        {/* Mobile Header - visible only on mobile. Hidden if the sub-page renders its own TopBar. */}
        {!hideMobileHeader && (
          <MobileHeader showNotification={true} unreadCount={unreadCount} />
        )}

        <div className="flex-1 pb-nav lg:pb-0 w-full">
          {children}
        </div>
        <BottomNav />
      </AppShell>
    </AuthGuard>
  );
}

CustomerLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
