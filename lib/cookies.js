import Cookies from 'js-cookie';

const isClient = typeof window !== 'undefined';

const CookiesWrapper = {
  /**
   * Get a cookie value by name, or get all cookies if name is not provided.
   * On iOS/WKWebView custom schemes, falls back to localStorage.
   * @param {string} [name]
   */
  get(name) {
    if (!isClient) {
      try {
        return name ? Cookies.get(name) : Cookies.get();
      } catch (e) {
        return name ? undefined : {};
      }
    }
    
    if (name === undefined) {
      const cookiesObj = Cookies.get() || {};
      const localStorageObj = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localStorageObj[key] = localStorage.getItem(key);
          }
        }
      } catch (e) {}
      return { ...localStorageObj, ...cookiesObj };
    }
    
    // 1. Try to get from actual cookies first
    let value = Cookies.get(name);
    
    // 2. If no cookie found, try localStorage as a fallback
    if (!value) {
      try {
        value = localStorage.getItem(name);
      } catch (e) {
        // Suppress or log error
      }
    }
    
    return value;
  },

  /**
   * Set a cookie and sync it to localStorage.
   * @param {string} name
   * @param {string} value
   * @param {object} [options]
   */
  set(name, value, options) {
    if (!isClient) return;

    // 1. Set the actual cookie
    try {
      Cookies.set(name, value, options);
    } catch (e) {
      // Suppress or log error
    }

    // 2. Sync to localStorage
    if (name) {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        // Suppress or log error
      }
    }
  },

  /**
   * Remove a cookie and delete it from localStorage.
   * @param {string} name
   * @param {object} [options]
   */
  remove(name, options) {
    if (!isClient) return;

    // 1. Remove from actual cookies
    try {
      Cookies.remove(name, options);
    } catch (e) {
      // Suppress or log error
    }

    // 2. Remove from localStorage
    if (name) {
      try {
        localStorage.removeItem(name);
      } catch (e) {
        // Suppress or log error
      }
    }
  }
};

export default CookiesWrapper;
