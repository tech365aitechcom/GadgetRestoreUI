'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';

const TABS = [
  { href: '/home',    label: 'Home',    icon: Home },
  { href: '/orders',  label: 'Orders',  icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: User },
];

/**
 * BottomNav — Fixed 3-tab navigation bar.
 * Visibility controlled via CSS (.bottom-nav is hidden on ≥1024px).
 * Light theme: white background, dark icons/labels.
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
