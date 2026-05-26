'use client'

import { useEffect } from 'react'
import { DEFAULT_THEME, THEMES } from '@/lib/theme'

/**
 * ThemeProvider Component
 *
 * This component automatically applies the theme when the app loads.
 * Add this to your root layout to enable theme support.
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    const theme = DEFAULT_THEME
    const themeValues = THEMES[theme]

    if (!themeValues) {
      console.warn(`Theme "${theme}" not found. Using dark theme.`)
      return
    }

    // Apply CSS custom properties to document root
    Object.entries(themeValues).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value)
    })

    // Set data attribute for theme-specific selectors
    document.documentElement.setAttribute('data-theme', theme)

    console.log(`✓ Theme applied: ${theme}`)
  }, [])

  return <>{children}</>
}
