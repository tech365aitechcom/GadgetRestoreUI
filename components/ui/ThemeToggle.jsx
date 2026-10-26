'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getCurrentTheme, setTheme, DEFAULT_THEME } from '@/lib/theme'

/**
 * ThemeToggle
 *
 * A single button that switches between dark and light themes.
 * - Persists the choice to localStorage (via lib/theme setTheme)
 * - Reflects the current theme with a Sun / Moon icon
 * - Safe to drop into the topbar, mobile header, or anywhere else
 *
 * Props:
 *   className — extra classes for the <button>
 *   size      — icon size in px (default 20)
 */
export default function ThemeToggle({ className = '', size = 20 }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME)

  // Sync local state with the theme already applied on <html> (external DOM state).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(getCurrentTheme())
  }, [])

  const handleToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  const isDark = theme === 'dark'

  return (
    <button
      type='button'
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`bg-transparent border-none cursor-pointer flex items-center justify-center transition-colors ${className}`}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  )
}
