'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import BottomNav from '@/components/ui/BottomNav'
import MobileHeader from '@/components/layout/MobileHeader'
import StepIndicator from '@/components/layout/StepIndicator'
import { useAuth } from '@/context/AuthContext'
import notificationService from '@/services/notification.service'

export default function PublicLayout({ children }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  // Hide navigation on onboarding page
  const isOnboarding = pathname === '/onboarding'

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        setUnreadCount(res?.data?.count ?? res?.count ?? 0)
      } catch (err) {
        setUnreadCount(0)
      }
    }

    fetchUnreadCount()
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <AppShell>
      <div
        className='home-mobile'
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          paddingTop: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111111',
        }}
      >
        <MobileHeader
          unreadCount={unreadCount}
          showNotification={!isOnboarding}
          showBack={!isOnboarding}
        />
        <StepIndicator />
      </div>

      {children}

      {/* Bottom navigation - hide on onboarding */}
      {!isOnboarding && <BottomNav />}
    </AppShell>
  )
}
