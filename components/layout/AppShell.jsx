'use client'

import { useState, useEffect } from 'react'
import {
  Home,
  ClipboardList,
  User,
  Settings,
  Bell,
  HelpCircle,
  Search,
  Plus,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation'
import NotificationDrawer from '@/components/layout/NotificationDrawer'
import LoginAlertModal from '@/components/ui/LoginAlertModal'
import notificationService from '@/services/notification.service'
import { setRouterInstance } from '@/lib/navigation'

/**
 * AppShell — Responsive layout shell
 * Desktop (≥1024px): Dark sidebar + Light top bar + Light content
 * Mobile  (<1024px): Light content only, bottom nav handled in page
 */
export default function AppShell({ children, className = '' }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { navigateTo, showLoginModal, setShowLoginModal, redirectPath } = useProtectedNavigation()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Register router instance for use in API interceptor
  useEffect(() => {
    setRouterInstance(router)
  }, [router])

  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        setUnreadCount(res?.data?.count ?? res?.count ?? 0)
      } catch (err) {
        // Set to 0 on error
        setUnreadCount(0)
      }
    }
    fetchUnreadCount()
    // Fetch unread count every 30 seconds to keep drawer icon in sync
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/profile', label: 'Profile', icon: User },
    // { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className={`app-shell ${className}`}>
      {/* ── Dark Sidebar — shown only on desktop via CSS ── */}
      <aside className='desktop-sidebar'>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <img
            src='/gadget-restore-logo.svg'
            alt='Gadget Restore'
            style={{ height: 44, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Nav links */}
        <nav
          style={{
            flex: 1,
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  navigateTo(item.href)
                }}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: isActive ? '800' : '500',
                  color: isActive ? '#000000' : '#8A8A8A',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  transition: 'all 150ms ease',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            )
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
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={18} color='#fff' strokeWidth={2} />
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Hi {user?.name || 'Guest'}
          </span>
        </div>
      </aside>

      {/* ── Light Content Column ── */}
      <main className='content-col'>
        {/* Desktop Top Bar */}
        <header className='desktop-topbar'>
          <div className='desktop-topbar-search'>
            <Search size={15} color='var(--color-content-text-secondary)' />
            <input
              type='text'
              placeholder='Search devices, tickets, or serial numbers...'
              onClick={() => router.push('/select-brand')}
              readOnly
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginLeft: 'auto',
            }}
          >
            <button
              aria-label='Notifications'
              onClick={() => setIsNotificationOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-content-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger)',
                    border: '1px solid var(--color-bg)',
                  }}
                  className='animate-pulse'
                />
              )}
            </button>
            <button
              aria-label='Help'
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-content-text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HelpCircle size={21} />
            </button>
            <button
              onClick={() => router.push('/select-brand')}
              className='btn-primary'
              style={{
                height: 38,
                fontSize: 13,
                padding: '0 18px',
                borderRadius: 10,
              }}
            >
              New Repair <Plus size={14} />
            </button>
          </div>
        </header>

        {children}
      </main>

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <LoginAlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={redirectPath}
      />
    </div>
  )
}
