'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoginAlertModal from '@/components/ui/LoginAlertModal'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'

/**
 * AuthGuard - Protects routes from unauthenticated access
 * Shows LoginAlertModal when user is not authenticated
 * Prevents API calls by blocking render of children until authenticated
 *
 * @param {React.ReactNode} children - Protected content
 */
export default function AuthGuard({ children }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Double check with cookie as well for immediate feedback
    const token = Cookies.get(TOKEN_COOKIE)
    const hasAuth = !!token || !!user

    if (!isLoading) {
      if (!hasAuth) {
        setShowLoginModal(true)
        setIsAuthenticated(false)
      } else {
        setShowLoginModal(false)
        setIsAuthenticated(true)
      }
    }
  }, [user, isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ background: 'var(--color-bg)' }}
      >
        <div className='text-center'>
          <div
            className='w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4'
            style={{
              borderColor: 'var(--color-accent-tint-8)',
              borderTopColor: 'var(--color-accent)',
            }}
          />
          <p
            className='text-sm font-medium'
            style={{ color: 'var(--color-content-text-secondary)' }}
          >
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // Show modal if not authenticated, don't render children (prevents API calls)
  if (!isAuthenticated) {
    return (
      <LoginAlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={pathname}
      />
    )
  }

  // User is authenticated, render protected content
  return <>{children}</>
}
