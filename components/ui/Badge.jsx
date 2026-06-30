'use client';

import PropTypes from 'prop-types';

/**
 * Badge component
 * Props:
 *   variant — 'accent' | 'success' | 'warning' | 'danger' | 'muted'
 *   size — 'sm' | 'md' (default)
 */
Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['accent', 'success', 'warning', 'danger', 'muted']),
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
};

export default function Badge({ children, variant = 'muted', size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  return (
    <span className={`badge badge-${variant} ${sizeClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
