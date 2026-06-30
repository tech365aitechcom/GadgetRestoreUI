'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import { redirectToLandingPage } from '@/lib/auth-utils'
import customerService from '@/services/customer.service'

const PUSH_PERMISSION_REQUESTED_KEY = 'gr_push_permission_requested'

const AuthContext = createContext({
  user: null,
  setUser: () => { },
  updateUser: () => { },
  logout: () => { },
  isLoading: true,
  requestPushPermissionIfNeeded: () => { },
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = Cookies.get(TOKEN_COOKIE)
      if (!token) {
        setIsLoading(false)
        return
      }

      // Fetch user profile from API
      const profile = await customerService.getProfile()
      setUser({
        name: profile.fullName || 'Guest User',
        email: profile.email || '',
        mobile: profile.mobile || '',
        ...profile,
      })
    } catch (error) {
      console.warn('Could not load full profile (expected for new users):', error.message)
      // Try to get basic info from token
      try {
        const token = Cookies.get(TOKEN_COOKIE)
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          setUser({
            name: payload.name || payload.phoneNumber || 'Guest User',
            email: payload.email || '',
            mobile: payload.phoneNumber || '',
          })
        }
      } catch (_) {
        // Token parsing failed, user stays null
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const logout = () => {
    setUser(null)
    // Clear all storage (cookies, localStorage, sessionStorage) and redirect to landing page
    redirectToLandingPage()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
