'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';

/**
 * TopBar — sticky mobile header
 *
 * Props:
 *   title       — page title (optional)
 *   onBack      — custom back handler; defaults to router.back()
 *   showBack    — show back arrow (default: true)
 *   rightAction — JSX node for right side (e.g. a button)
 *   borderless  — hide bottom border (default: false)
 *   closeMode   — use X icon instead of arrow (default: false)
 */
export default function TopBar({
  title,
  onBack,
  showBack = true,
  rightAction,
  borderless = false,
  closeMode = false,
}) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    router.back();
  };

  return (
    <header
      className="top-bar"
      style={{ borderBottom: borderless ? 'none' : undefined }}
    >
      {/* Left — back button */}
      <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-divider)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {closeMode ? <X size={20} /> : <ArrowLeft size={20} />}
          </button>
        )}
      </div>

      {/* Center — title */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        {title && (
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Right — action slot */}
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {rightAction}
      </div>
    </header>
  );
}
