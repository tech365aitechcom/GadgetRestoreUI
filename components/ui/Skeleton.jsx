'use client';

/**
 * Skeleton — shimmer placeholder for loading states
 *
 * Props:
 *   width   — CSS width  (default: '100%')
 *   height  — CSS height (default: '16px')
 *   rounded — CSS border-radius override
 *   circle  — shortcut for round avatar-style skeleton
 *   lines   — render N stacked lines (useful for text blocks)
 */
export default function Skeleton({
  width = '100%',
  height = '16px',
  rounded,
  circle = false,
  lines,
  className = '',
  style = {},
}) {
  if (lines && lines > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            height={height}
            width={i === lines - 1 ? '70%' : '100%'}
            rounded={rounded}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : (rounded || 'var(--radius-sm)'),
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonCard — prebuilt skeleton for a list card
 */
export function SkeletonCard() {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton circle height="40px" />
        <div style={{ flex: 1 }}>
          <Skeleton height="14px" width="60%" style={{ marginBottom: '6px' }} />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton height="12px" />
      <Skeleton height="12px" width="80%" />
    </div>
  );
}
