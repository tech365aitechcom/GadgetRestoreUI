'use client';

import { useRouter } from 'next/navigation';
import { LogIn, ShieldAlert } from 'lucide-react';

/**
 * LoginAlertModal - Shows an alert when user is not authenticated
 * @param {boolean} isOpen - Controls modal visibility
 * @param {Function} onClose - Callback to close the modal (optional)
 * @param {string} redirectPath - Path to redirect after login (optional)
 */
export default function LoginAlertModal({ isOpen, onClose, redirectPath = null }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    // Store the intended destination if provided
    if (redirectPath && typeof window !== 'undefined') {
      sessionStorage.setItem('gr_redirect_after_login', redirectPath);
    }
    // Close the modal before navigating
    if (onClose) {
      onClose();
    }
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'var(--color-content-card)',
            border: '1px solid var(--color-content-border)',
          }}
        >
          {/* Header with icon */}
          <div
            className="flex flex-col items-center justify-center pt-8 pb-6 px-6"
            style={{ background: 'var(--color-content-bg)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'var(--color-accent-tint-8)',
                border: '2px solid var(--color-accent-tint-4)'
              }}
            >
              <ShieldAlert size={32} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h2
              className="text-xl font-bold text-center"
              style={{ color: 'var(--color-content-text)' }}
            >
              Authentication Required
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p
              className="text-center text-sm leading-relaxed mb-6"
              style={{ color: 'var(--color-content-text-secondary)' }}
            >
              You need to be logged in to access this page. Please sign in with your mobile number to continue.
            </p>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-btn-cta-bg)',
                padding: '14px 24px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogIn size={18} />
              Login to Continue
            </button>

            {/* Additional info */}
            <p
              className="text-center text-xs mt-4"
              style={{ color: 'var(--color-text-dim)' }}
            >
              New user? You'll be automatically registered during login
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
