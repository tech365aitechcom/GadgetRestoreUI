'use client';

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
