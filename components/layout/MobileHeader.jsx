'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'

/**
 * Mobile header component with back button, logo, and notification bell
 * Used across all public pages in mobile view
 */
export default function MobileHeader({
  onBackClick,
  showNotification = true,
  showBack = true,
  unreadCount = 0,
}) {
  const router = useRouter()
  const pathname = usePathname()

  // Define back navigation mapping.
  // NOTE: /select-model is intentionally absent — it uses router.back() so that
  // both the normal flow (select-brand → select-model) and the products flow
  // (products → select-model) return to the correct previous page via history.
  const backNavigation = {
    '/select-category': '/',
    '/select-brand': '/',
    '/select-symptoms': '/select-model',
    '/select-tier': '/select-symptoms',
    '/select-mode': '/select-tier',
    '/pricing': '/select-mode',
    '/schedule': '/pricing',
    '/address': '/schedule',
    '/checkout/summary': '/address',
    '/checkout/customer-details': '/checkout/summary',
  }

  // Check if we're on home page (no back button)
  const isHomePage = pathname === '/home' || pathname === '/'

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      const backPath = backNavigation[pathname]
      if (backPath) {
        router.push(backPath)
      } else {
        router.back()
      }
    }
  }

  return (
    <div className='top-bar'>
      {/* Left side - Back button or empty space */}
      {showBack && !isHomePage ? (
        <button
          onClick={handleBackClick}
          className='bg-transparent border-0 cursor-pointer text-white flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0'
          aria-label='Go back'
        >
          <ArrowLeft size={20} />
        </button>
      ) : (
        <div className='w-9 flex-shrink-0' />
      )}

      {/* Center - Logo */}
      <div className='flex-1 flex justify-center'>
        <img
          src='/gadget-restore-logo.svg'
          alt='Gadget Restore'
          className='h-7 object-contain'
        />
      </div>

      {/* Right side - Notification bell */}
      {showNotification ? (
        <button
          onClick={() => router.push('/notifications')}
          className='bg-transparent border-0 cursor-pointer text-[#888] flex items-center w-9 h-9 justify-center rounded-full flex-shrink-0 relative'
          aria-label='Notifications'
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className='absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-[var(--color-danger)] border-[1.5px] border-[#111] animate-pulse' />
          )}
        </button>
      ) : (
        <div className='w-9 h-9' />
      )}
    </div>
  )
}
