/**
 * Theme Configuration
 *
 * The actual colour values for each theme live in `app/globals.css`, keyed on
 * the `data-theme` attribute of <html>:
 *   :root                     → dark (default)
 *   :root[data-theme='light'] → light overrides
 *
 * Switching themes is therefore just a matter of flipping that one attribute —
 * CSS resolves every `--theme-*` / `--color-*` token automatically. This keeps a
 * single source of truth (CSS) and lets a blocking script in the document <head>
 * apply the saved theme before first paint (no flash of the wrong theme).
 *
 * The persisted choice is stored in localStorage under `gr_theme`.
 */

export const DEFAULT_THEME = 'dark'
export const STORAGE_KEY = 'gr_theme'
export const THEME_NAMES = ['dark', 'light']

/**
 * Apply a theme by setting the `data-theme` attribute on <html>.
 * CSS keyed on that attribute swaps every token value.
 */
export function applyTheme(theme = DEFAULT_THEME) {
  const next = THEME_NAMES.includes(theme) ? theme : DEFAULT_THEME
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', next)
  }
  return next
}

/**
 * Read the currently applied theme from the DOM (falls back to the default).
 */
export function getCurrentTheme() {
  if (typeof document === 'undefined') return DEFAULT_THEME
  return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME
}

/**
 * Read the persisted theme from localStorage (falls back to the default).
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/**
 * Persist a theme choice to localStorage.
 */
export function storeTheme(theme) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage unavailable (private mode / disabled) — ignore */
  }
}

/**
 * Apply + persist a theme in one call.
 */
export function setTheme(theme) {
  const applied = applyTheme(theme)
  storeTheme(applied)
  return applied
}

/**
 * Toggle between dark and light, applying and persisting the result.
 */
export function toggleTheme() {
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark'
  return setTheme(next)
}
