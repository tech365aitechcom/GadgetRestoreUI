'use client';

import PropTypes from 'prop-types';

/**
 * Button component
 *
 * Props:
 *   variant   — 'primary' | 'secondary' | 'ghost'   default: 'primary'
 *   size      — 'md' | 'sm'                          default: 'md'
 *   fullWidth — boolean                              default: true
 *   loading   — shows spinner when true
 *   disabled
 *   onClick
 *   type      — 'button' | 'submit'                  default: 'button'
 */
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['md', 'sm']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const sizeClass = size === 'sm'
    ? 'text-[14px] h-[46px]'
    : '';
  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
}
