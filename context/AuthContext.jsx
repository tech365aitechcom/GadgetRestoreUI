'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import { redirectToLandingPage } from '@/lib/auth-utils'
import customerService from '@/services/customer.service'

const AuthContext = createContext({
  user: null,
  setUser: () => { },
  updateUser: () => { },
  logout: () => { },
  isLoading: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUserData = useCallback(async () => {
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
        const parts = token?.split('.')
        if (parts?.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          setUser({
            name: payload.name || payload.phoneNumber || 'Guest User',
            email: payload.email || '',
            mobile: payload.phoneNumber || '',
          })
        }
      } catch (tokenError) {
        console.debug('Failed to parse token payload fallback:', tokenError)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    // Clear all storage (cookies, localStorage, sessionStorage) and redirect to landing page
    redirectToLandingPage()
  }, [])

  const contextValue = useMemo(() => ({
    user,
    setUser,
    updateUser,
    logout,
    isLoading,
  }), [user, updateUser, logout, isLoading])

  return (
    <AuthContext.Provider value={contextValue}>
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
