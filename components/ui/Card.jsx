'use client';

import PropTypes from 'prop-types';

/**
 * Card component
 * Props:
 *   padding  — override inner padding
 *   onClick  — makes card interactive
 *   selected — highlights card with accent border
 */
Card.propTypes = {
  children: PropTypes.node.isRequired,
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default function Card({
  children,
  padding,
  onClick,
  selected = false,
  className = '',
  style = {},
}) {
  const isInteractive = !!onClick;
  const Component = isInteractive ? 'button' : 'div';

  return (
    <Component
      type={isInteractive ? 'button' : undefined}
      className={`card ${className} ${isInteractive ? 'text-left w-full block' : ''}`}
      onClick={onClick}
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
    </Component>
  );
}
