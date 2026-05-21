'use client';

/**
 * Card component
 * Props:
 *   padding  — override inner padding
 *   onClick  — makes card interactive
 *   selected — highlights card with accent border
 */
export default function Card({
  children,
  padding,
  onClick,
  selected = false,
  className = '',
  style = {},
}) {
  const isInteractive = !!onClick;

  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        padding: padding,
        cursor: isInteractive ? 'pointer' : 'default',
        borderColor: selected ? 'var(--color-accent)' : undefined,
        boxShadow: selected ? '0 0 0 1px var(--color-accent)' : undefined,
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
