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
  const cardStyle = {
    padding: padding,
    cursor: onClick ? 'pointer' : 'default',
    borderColor: selected ? 'var(--color-accent)' : undefined,
    boxShadow: selected ? '0 0 0 1px var(--color-accent)' : undefined,
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        className={`card w-full text-left font-inherit text-inherit ${className}`}
        onClick={onClick}
        style={cardStyle}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      className={`card ${className}`}
      style={cardStyle}
    >
      {children}
    </div>
  );
}
