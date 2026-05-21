import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes (used by shadcn-ui)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian currency (₹)
 * e.g. formatPrice(1500) → "₹1,500"
 */
export function formatPrice(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to "15 May 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to "15 May, 10:30 AM"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Validate Indian mobile number (10 digits starting with 6–9)
 */
export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.toString().trim());
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate 6-digit pincode
 */
export function isValidPincode(pin) {
  return /^\d{6}$/.test(pin.toString().trim());
}

/**
 * Truncate a string to maxLen chars with ellipsis
 */
export function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Slugify a string for URL usage
 * e.g. "iPhone 15 Pro" → "iphone-15-pro"
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get initials from a name (max 2 chars)
 * e.g. "John Doe" → "JD"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Sleep utility for debounce / delay
 */
export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
