'use client';

/**
 * Input component
 *
 * Props:
 *   label       — field label text
 *   error       — error message string
 *   hint        — hint text below field
 *   type        — HTML input type  default: 'text'
 *   prefix      — content before input (e.g. "+91")
 *   suffix      — content after input (e.g. icon)
 */
export default function Input({
  label,
  error,
  hint,
  id,
  type = 'text',
  prefix,
  suffix,
  className = '',
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: '16px',
              color: 'var(--color-text-secondary)',
              fontSize: '16px',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={type}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          style={{
            paddingLeft: prefix ? '56px' : undefined,
            paddingRight: suffix ? '48px' : undefined,
            borderColor: error ? 'var(--color-danger)' : undefined,
          }}
          {...props}
        />

        {suffix && (
          <span
            style={{
              position: 'absolute',
              right: '16px',
              color: 'var(--color-text-secondary)',
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{hint}</span>
      )}
    </div>
  );
}
