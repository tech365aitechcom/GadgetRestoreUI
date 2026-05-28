'use client';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';

/**
 * Layout for authenticated customer routes (Home, Orders, Profile).
 * Wraps content in AppShell, adds bottom padding for the nav,
 * and renders the BottomNav bar.
 */
export default function CustomerLayout({ children }) {
  return (
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
  );
}
