'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/context/AuthContext'
import { BookingProvider } from '@/context/BookingContext'
import { ToastProvider } from '@/components/ui/Toast'

/**
 * ScrollToTop component to automatically reset scroll position on page transitions.
 */
function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    try {
      window.scrollTo(0, 0)
      document.documentElement.scrollTo(0, 0)
      document.body.scrollTo(0, 0)
    } catch (error) {
      console.error('Scroll reset failed:', error)
    }
  }, [pathname])

  return null
}

/**
 * Providers wrapper — all client-side context providers live here.
 * Kept separate so RootLayout stays a server component.
 */
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <BookingProvider>
        <ScrollToTop />
        <ToastProvider />
        {children}
      </BookingProvider>
    </AuthProvider>
  )
}
