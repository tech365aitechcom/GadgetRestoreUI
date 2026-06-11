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

export default function AppShell({ children, className = '' }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { navigateTo, showLoginModal, setShowLoginModal, redirectPath } =
    useProtectedNavigation()
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
        <div className='pt-6 px-5 pb-5'>
          <img
            src='/gadget-restore-logo.svg'
            alt='Gadget Restore'
            className='h-11 w-auto object-contain'
          />
        </div>

        {/* Nav links */}
        <nav className='flex-1 py-2 px-3 flex flex-col gap-1'>
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
                className={`flex items-center gap-3 py-3 px-5 rounded-xl border-none cursor-pointer w-full text-sm text-left transition-all duration-150 ${
                  isActive
                    ? 'font-extrabold text-black bg-white'
                    : 'font-bold text-[#8A8A8A] bg-transparent hover:text-white hover:bg-white/6'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User snippet */}
        <div className='py-4 px-5 border-t border-divider flex items-center gap-3'>
          <div className='w-8.5 h-8.5 rounded-full bg-white/10 flex items-center justify-center shrink-0'>
            <User size={18} color='#fff' strokeWidth={2} />
          </div>
          <span className='text-[13px] font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap'>
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
          <div className='flex items-center gap-5 ml-auto'>
            <button
              aria-label='Notifications'
              onClick={() => setIsNotificationOpen(true)}
              className='bg-transparent border-none cursor-pointer text-content-text-secondary flex items-center relative'
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 w-1.75 h-1.75 rounded-full bg-danger border border-bg animate-pulse' />
              )}
            </button>
            <button
              aria-label='Help'
              className='bg-transparent border-none cursor-pointer text-content-text-secondary flex items-center'
            >
              <HelpCircle size={21} />
            </button>
            <button
              onClick={() => router.push('/select-brand')}
              className='btn-primary h-9.5 text-[13px] px-4.5 rounded-[10px]'
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
