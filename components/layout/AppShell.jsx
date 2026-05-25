'use client';

import { Home, ClipboardList, User, Settings, Bell, HelpCircle, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

/**
 * AppShell — Responsive layout shell
 * Desktop (≥1024px): Dark sidebar + Light top bar + Light content
 * Mobile  (<1024px): Light content only, bottom nav handled in page
 */
export default function AppShell({ children, className = '' }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [userName, setUserName] = useState('Guest User');

  useEffect(() => {
    const token = Cookies.get('customer_token');
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        setUserName(payload.name || payload.phoneNumber || 'Pragya');
      } else {
        setUserName('Pragya');
      }
    } catch (_) {
      setUserName('Pragya');
    }
  }, []);

  const navItems = [
    { href: '/home',     label: 'Home',     icon: Home },
    { href: '/orders',   label: 'Orders',   icon: ClipboardList },
    { href: '/profile',  label: 'Profile',  icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`app-shell ${className}`}>

      {/* ── Dark Sidebar — shown only on desktop via CSS ── */}
      <aside className="desktop-sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <img
            src="/gadget-restore-logo.svg"
            alt="Gadget Restore"
            style={{ height: 44, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: isActive ? '800' : '500',
                  color: isActive ? '#000000' : '#8A8A8A',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  textTransform: isActive ? 'uppercase' : 'none',
                  letterSpacing: isActive ? '0.07em' : 'normal',
                  transition: 'all 150ms ease',
                }}
              >
                {isActive ? item.label.toUpperCase() : item.label}
              </Link>
            );
          })}
        </nav>

        {/* User snippet */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-divider)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src="/images/pragya.png"
            alt="User Avatar"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Hi {userName.startsWith('Guest') ? 'Pragya' : userName}
          </span>
        </div>
      </aside>

      {/* ── Light Content Column ── */}
      <main className="content-col">
        {/* Desktop Top Bar */}
        <header className="desktop-topbar">
          <div className="desktop-topbar-search">
            <Search size={15} color="var(--color-content-text-secondary)" />
            <input
              type="text"
              placeholder="Search devices, tickets, or serial numbers..."
              onClick={() => router.push('/select-brand')}
              readOnly
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto' }}>
            <button
              aria-label="Notifications"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-secondary)', display: 'flex', alignItems: 'center' }}
            >
              <Bell size={21} />
            </button>
            <button
              aria-label="Help"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-secondary)', display: 'flex', alignItems: 'center' }}
            >
              <HelpCircle size={21} />
            </button>
            <button
              onClick={() => router.push('/select-brand')}
              className="btn-primary"
              style={{ height: 38, fontSize: 13, padding: '0 18px', borderRadius: 10 }}
            >
              New Repair <Plus size={14} />
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
