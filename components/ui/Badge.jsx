'use client';

/**
 * Badge component
 * Props:
 *   variant — 'accent' | 'success' | 'warning' | 'danger' | 'muted'
 *   size — 'sm' | 'md' (default)
 */
export default function Badge({ children, variant = 'muted', size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  return (
    <span className={`badge badge-${variant} ${sizeClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
