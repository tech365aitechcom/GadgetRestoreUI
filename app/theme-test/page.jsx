'use client'

import { DEFAULT_THEME } from '@/lib/theme'

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[32px] font-bold text-[var(--theme-text-primary)] mb-4">
          Theme System Test
        </h1>
        <p className="text-[16px] text-[var(--theme-text-secondary)] mb-8">
          Current theme: <strong>{DEFAULT_THEME}</strong>
        </p>

        {/* Test Card */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-8 mb-6">
          <h2 className="text-[24px] font-bold text-[var(--theme-text-primary)] mb-4">
            Test Card
          </h2>
          <p className="text-[14px] text-[var(--theme-text-secondary)] mb-6">
            This card uses theme variables. If you change DEFAULT_THEME in lib/theme.js
            from 'light' to 'dark', this card should automatically switch appearance.
          </p>

          {/* Input Test */}
          <input
            type="text"
            placeholder="Test input field"
            className="w-full h-[54px] bg-[var(--theme-input-bg)] border border-[var(--theme-input-border)] rounded-lg text-[var(--theme-text-primary)] px-4 outline-none focus:border-[var(--theme-input-border-focus)] placeholder:text-[var(--theme-placeholder)] mb-4"
          />

          {/* Button Tests */}
          <div className="flex gap-3">
            <button className="flex-1 h-[48px] bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] rounded-lg font-bold hover:bg-[var(--theme-btn-primary-hover)]">
              Primary Button
            </button>
            <button className="flex-1 h-[48px] bg-[var(--theme-btn-secondary-bg)] text-[var(--theme-btn-secondary-text)] border border-[var(--theme-btn-secondary-border)] rounded-lg font-bold hover:bg-[var(--theme-btn-secondary-hover)]">
              Secondary Button
            </button>
          </div>
        </div>

        {/* Hardcoded Dark Card (for comparison) */}
        <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-8 mb-6">
          <h2 className="text-[24px] font-bold text-white mb-4">
            Hardcoded Dark Card
          </h2>
          <p className="text-[14px] text-white/60 mb-6">
            This card uses hardcoded dark colors (bg-[#0D0D0F], text-white, etc.).
            It will ALWAYS be dark, regardless of the DEFAULT_THEME setting.
          </p>
          <p className="text-[12px] text-white/40">
            This is how your current profile pages are styled - they won't respond
            to theme changes until you replace hardcoded colors with CSS variables.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-6">
          <h3 className="text-[18px] font-bold text-[var(--theme-text-primary)] mb-3">
            How to Test
          </h3>
          <ol className="text-[14px] text-[var(--theme-text-secondary)] space-y-2 list-decimal list-inside">
            <li>Open <code className="bg-[var(--theme-input-bg)] px-2 py-1 rounded text-[var(--theme-text-primary)] border border-[var(--theme-border)]">lib/theme.js</code></li>
            <li>Change line 11: <code className="bg-[var(--theme-input-bg)] px-2 py-1 rounded text-[var(--theme-text-primary)] border border-[var(--theme-border)]">DEFAULT_THEME = 'light'</code> to <code className="bg-[var(--theme-input-bg)] px-2 py-1 rounded text-[var(--theme-text-primary)] border border-[var(--theme-border)]">DEFAULT_THEME = 'dark'</code></li>
            <li>Refresh this page</li>
            <li>The first card should change colors!</li>
            <li>The second "Hardcoded Dark Card" will stay dark (this is expected)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
