'use client'

import { useEffect } from 'react'
import { applyTheme, getStoredTheme } from '@/lib/theme'

/**
 * ThemeProvider Component
 *
 * The blocking script in the document <head> (see app/layout.js) already applies
 * the persisted theme before first paint. This component is a hydration-time
 * safety net: it re-asserts the stored theme in case the attribute was cleared,
 * and keeps <html data-theme> in sync if the app was navigated to without a full
 * document load. Add it to the root layout to enable theme support.
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  return <>{children}</>
}
