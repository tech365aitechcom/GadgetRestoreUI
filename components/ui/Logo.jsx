/**
 * Logo
 *
 * The Gadget Restore wordmark, in the variant that suits the active theme:
 *   dark theme  → /gadget-restore-logo.svg       (white ink)
 *   light theme → /gadget-restore-logo-light.png (black ink)
 *
 * A single element whose art comes from the --brand-wordmark CSS variable, so
 * exactly one mark can ever be on screen. The variable flips in app/globals.css
 * (see .brand-logo) and the blocking script in app/layout.js sets data-theme
 * before first paint, so the right mark is painted on the very first frame —
 * a useState/useEffect swap would render the dark logo during SSR and flash it
 * on every light-theme page load.
 *
 * Size it with a height alone — `<Logo className='h-7' />` — the aspect ratio
 * supplies the width.
 *
 * Only use this where the surrounding surface is itself theme-aware. Screens
 * with a hard-coded dark background (onboarding, the marketing footer, the
 * policies header) should keep referencing the white .svg directly.
 *
 * Props:
 *   className — extra classes (height, opacity, …)
 *   label     — accessible name (default 'Gadget Restore')
 *   ...props  — forwarded to the element
 */
export default function Logo({ className = '', label = 'Gadget Restore', ...props }) {
  return (
    <div role='img' aria-label={label} className={`brand-logo ${className}`} {...props} />
  )
}
