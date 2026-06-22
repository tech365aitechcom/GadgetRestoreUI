'use client';

import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import LoginAlertModal from './LoginAlertModal';

const TABS = [
  // { href: '/home',    label: 'Home',    icon: Home },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: User },
];

/**
 * BottomNav — Fixed 3-tab navigation bar.
 * Visibility controlled via CSS (.bottom-nav is hidden on ≥1024px).
 * Light theme: white background, dark icons/labels.
 * Protected routes show login modal for unauthenticated users.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { navigateTo, showLoginModal, setShowLoginModal, redirectPath } = useProtectedNavigation();

  return (
    <>
      <nav className="bottom-nav" aria-label="Main navigation">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <button
              key={href}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(href);
              }}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              style={{ cursor: 'pointer' }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <LoginAlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={redirectPath}
      />
    </>
  );
}
