/**
 * Centralized navigation utilities for client-side routing
 * Prevents hard page reloads when navigating programmatically
 */

let routerInstance = null;

/**
 * Register Next.js router instance for use in non-component contexts
 * Call this from your root layout or app component
 */
export function setRouterInstance(router) {
  routerInstance = router;
}

/**
 * Navigate to a path using client-side routing
 * Falls back to window.location if router is not available
 */
export function navigateTo(path) {
  if (typeof window === 'undefined') return;

  // Try to use registered router instance first
  if (routerInstance) {
    routerInstance.push(path);
    return;
  }

  // Fallback to window.location.replace (no reload, replaces history)
  window.location.replace(path);
}

/**
 * Get the current router instance
 */
export function getRouter() {
  return routerInstance;
}
