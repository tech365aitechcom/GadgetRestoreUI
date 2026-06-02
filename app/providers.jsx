'use client'

import { AuthProvider } from '@/context/AuthContext'
import { BookingProvider } from '@/context/BookingContext'
import { ToastProvider } from '@/components/ui/Toast'

/**
 * Providers wrapper — all client-side context providers live here.
 * Kept separate so RootLayout stays a server component.
 */
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <BookingProvider>
        <ToastProvider />
        {children}
      </BookingProvider>
    </AuthProvider>
  )
}
