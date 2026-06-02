'use client';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import AuthGuard from '@/components/auth/AuthGuard';

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
  return (
    <AuthGuard>
      <AppShell className="bg-[var(--color-bg-card)] sm:bg-[var(--color-bg)]">
        {/* Mobile Header - visible only on mobile */}
        <div className="lg:hidden">
          <MobileHeader showNotification={true} />
        </div>

        <div className="flex-1 pb-nav w-full">
          {children}
        </div>
        <BottomNav />
      </AppShell>
    </AuthGuard>
  );
}
