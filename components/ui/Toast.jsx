'use client';

import { Toaster, toast } from 'react-hot-toast';

/**
 * ToastProvider — place once inside your layout
 * Configures react-hot-toast to match the dark design system.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1A1A2E',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '14px',
          border: '1px solid #1E1E1E',
          padding: '12px 16px',
          maxWidth: '380px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#050505' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#050505' },
          duration: 5000,
        },
      }}
    />
  );
}

/**
 * Toast helpers — use these instead of raw toast() calls
 */
export const showToast = {
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  info:    (msg) => toast(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id)  => toast.dismiss(id),
};

export default toast;
