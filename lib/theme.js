/**
 * Theme Configuration
 *
 * To switch between light and dark themes globally:
 * 1. Change the DEFAULT_THEME constant below
 * 2. The entire app will automatically use the selected theme
 *
 * Options: 'dark' or 'light'
 */

export const DEFAULT_THEME = 'dark' // Change this to 'light' to enable light mode

/**
 * Theme definitions
 * These values are applied as CSS custom properties
 */
export const THEMES = {
  dark: {
    // Main backgrounds
    '--theme-bg': '#050505',
    '--theme-surface': '#0D0D0F',
    '--theme-card': '#0D0D0F',
    '--theme-card-darker': '#111111',

    // Extended surface shades — added to support full-page dark/light switching.
    // These map to hardcoded hex values found in pricing, schedule, address and checkout pages.
    '--theme-bg-900': '#0a0a0a',     // deep page-wrapper bg (pricing, schedule, checkout)
    '--theme-bg-600': '#141414',     // card-face bg (pricing/checkout panels)
    '--theme-bg-400': '#222222',     // border/divider surface in content area
    '--theme-bg-300': '#2b2b2b',     // editorial banner bg (select-mode promo section)
    '--theme-bg-200': '#333333',     // strong border / outlined input
    '--theme-bg-100': '#555555',     // muted pill bg ("Coming Soon" label)

    // Extended text shades — added to support full-page dark/light switching.
    '--theme-text-muted': '#666666',       // section-header / tertiary label text
    '--theme-text-mid': '#a0a0a0',         // subtitle / description text
    '--theme-text-soft': '#cccccc',        // banner paragraph / soft body text
    '--theme-text-near-white': '#e0e0e0',  // near-white on deep-dark surfaces

    // Text colors
    '--theme-text-primary': '#FFFFFF',
    '--theme-text-secondary': 'rgba(255, 255, 255, 0.6)',
    '--theme-text-tertiary': 'rgba(255, 255, 255, 0.5)',
    '--theme-text-disabled': 'rgba(255, 255, 255, 0.4)',

    // Borders and dividers
    '--theme-border': 'rgba(255, 255, 255, 0.05)',
    '--theme-border-strong': 'rgba(255, 255, 255, 0.1)',
    '--theme-divider': 'rgba(255, 255, 255, 0.05)',

    // Interactive elements
    '--theme-input-bg': 'rgba(255, 255, 255, 0.04)',
    '--theme-input-border': 'rgba(255, 255, 255, 0.1)',
    '--theme-input-border-focus': 'rgba(255, 255, 255, 0.4)',
    '--theme-placeholder': 'rgba(255, 255, 255, 0.3)',

    // Buttons
    '--theme-btn-primary-bg': '#FFFFFF',
    '--theme-btn-primary-text': '#000000',
    '--theme-btn-primary-hover': 'rgba(255, 255, 255, 0.9)',
    '--theme-btn-primary-border': 'rgba(255, 255, 255, 0.2)',
    '--theme-btn-secondary-bg': 'rgba(255, 255, 255, 0.05)',
    '--theme-btn-secondary-text': '#FFFFFF',
    '--theme-btn-secondary-border': 'rgba(255, 255, 255, 0.1)',
    '--theme-btn-secondary-hover': 'rgba(255, 255, 255, 0.1)',

    // Toggle switches
    '--theme-toggle-bg-on': '#34C759',
    '--theme-toggle-bg-off': 'rgba(255, 255, 255, 0.2)',
    '--theme-toggle-thumb': '#FFFFFF',

    // Scrollbar
    '--theme-scrollbar-thumb': 'rgba(255, 255, 255, 0.2)',
    '--theme-scrollbar-thumb-hover': 'rgba(255, 255, 255, 0.3)',

    // Shadows
    '--theme-shadow-sm': '0 1px 4px rgba(0, 0, 0, 0.3)',
    '--theme-shadow-md': '0 3px 10px rgba(0, 0, 0, 0.5)',
    '--theme-shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.5)',

    // Info/Alert colors
    '--theme-info-bg': 'rgba(59, 130, 246, 0.1)',
    '--theme-info-border': 'rgba(59, 130, 246, 0.2)',
    '--theme-info-text': '#93C5FD',
    '--theme-info-icon': '#60A5FA',
  },

  light: {
    // Main backgrounds
    '--theme-bg': '#F5F5F7',
    '--theme-surface': '#FFFFFF',
    '--theme-card': '#FFFFFF',
    '--theme-card-darker': '#F5F5F7',

    // Extended surface shades — light equivalents of the dark shades above.
    '--theme-bg-900': '#f5f5f7',     // light: main page-wrapper bg
    '--theme-bg-600': '#f0f0f0',     // light: card-face bg
    '--theme-bg-400': '#e0e0e0',     // light: border/divider
    '--theme-bg-300': '#e8e8e8',     // light: editorial/banner bg
    '--theme-bg-200': '#d0d0d0',     // light: strong border
    '--theme-bg-100': '#909090',     // light: muted pill bg

    // Extended text shades — light equivalents.
    '--theme-text-muted': '#999999',       // light: tertiary text
    '--theme-text-mid': '#555555',         // light: subtitle text
    '--theme-text-soft': '#333333',        // light: banner paragraph text
    '--theme-text-near-white': '#1a1a1a',  // light: near-black on light surfaces

    // Text colors
    '--theme-text-primary': '#000000',
    '--theme-text-secondary': 'rgba(0, 0, 0, 0.6)',
    '--theme-text-tertiary': '#6B6B6B',
    '--theme-text-disabled': 'rgba(0, 0, 0, 0.4)',

    // Borders and dividers
    '--theme-border': '#E5E5EA',
    '--theme-border-strong': '#D0D0D0',
    '--theme-divider': '#E5E5EA',

    // Interactive elements
    '--theme-input-bg': '#F8F8F8',
    '--theme-input-border': '#E8E8E8',
    '--theme-input-border-focus': '#D0D0D0',
    '--theme-placeholder': '#B0B0B0',

    // Buttons
    '--theme-btn-primary-bg': '#000000',
    '--theme-btn-primary-text': '#FFFFFF',
    '--theme-btn-primary-hover': '#222222',
    '--theme-btn-primary-border': '#000000',
    '--theme-btn-secondary-bg': '#F5F5F7',
    '--theme-btn-secondary-text': '#000000',
    '--theme-btn-secondary-border': '#E5E5EA',
    '--theme-btn-secondary-hover': 'rgba(0, 0, 0, 0.05)',

    // Toggle switches
    '--theme-toggle-bg-on': '#34C759',
    '--theme-toggle-bg-off': '#E5E5EA',
    '--theme-toggle-thumb': '#FFFFFF',

    // Scrollbar
    '--theme-scrollbar-thumb': 'rgba(0, 0, 0, 0.2)',
    '--theme-scrollbar-thumb-hover': 'rgba(0, 0, 0, 0.3)',

    // Shadows
    '--theme-shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
    '--theme-shadow-md': '0 3px 8px rgba(0, 0, 0, 0.1)',
    '--theme-shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.15)',

    // Info/Alert colors
    '--theme-info-bg': '#E3F2FD',
    '--theme-info-border': '#90CAF9',
    '--theme-info-text': '#1565C0',
    '--theme-info-icon': '#1976D2',
  },
}

/**
 * Apply theme to the document
 */
export function applyTheme(theme = DEFAULT_THEME) {
  const themeValues = THEMES[theme]

  if (!themeValues) {
    console.warn(`Theme "${theme}" not found. Falling back to dark theme.`)
    return applyTheme('dark')
  }

  // Apply CSS custom properties to document root
  Object.entries(themeValues).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value)
  })

  // Set data attribute for theme-specific selectors
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME
}

/**
 * Toggle between themes
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}
