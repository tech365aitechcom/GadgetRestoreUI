'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Palette } from 'lucide-react'
import { applyTheme } from '@/lib/theme'

// ─── Settings Page ─────────────────────────────────────────────────────────
// Temporary page for testing theme switching.
// To remove: delete this file and the /settings route disappears cleanly.
// ───────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState('dark')

  // Read persisted preference on mount and apply it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gr_theme') || 'dark'
      setCurrentTheme(saved)
      applyTheme(saved)
    }
  }, [])

  const handleThemeChange = (theme) => {
    applyTheme(theme)
    setCurrentTheme(theme)
    localStorage.setItem('gr_theme', theme)
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='lg:hidden min-h-screen pb-24' style={{ background: 'var(--theme-bg)', color: 'var(--theme-text-primary)' }}>
        <div className='px-5 pt-6 pb-4'>
          <h1 className='text-[22px] font-extrabold tracking-tight mb-6'>SETTINGS</h1>

          {/* Appearance */}
          <h3 className='text-[11px] font-bold tracking-[0.1em] uppercase mb-3' style={{ color: 'var(--theme-text-disabled)' }}>
            APPEARANCE
          </h3>
          <div className='rounded-2xl border p-5 mb-6' style={{ background: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
            {/* Header */}
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: 'var(--theme-btn-secondary-bg)' }}>
                <Palette size={20} style={{ color: 'var(--theme-text-secondary)' }} />
              </div>
              <div>
                <div className='text-[15px] font-bold'>Theme</div>
                <div className='text-[12px]' style={{ color: 'var(--theme-text-secondary)' }}>
                  Choose your preferred display theme
                </div>
              </div>
            </div>

            {/* Theme options */}
            <div className='grid grid-cols-2 gap-3'>
              {/* Dark */}
              <button
                id='theme-dark-btn'
                onClick={() => handleThemeChange('dark')}
                className='relative flex flex-col items-center justify-center gap-2 h-[88px] rounded-2xl border-2 transition-all active:scale-[0.97]'
                style={{
                  borderColor: currentTheme === 'dark' ? 'var(--theme-btn-primary-bg)' : 'var(--theme-border)',
                  background: 'var(--theme-btn-secondary-bg)',
                  opacity: currentTheme === 'dark' ? 1 : 0.55,
                }}
              >
                <Moon size={24} style={{ color: 'var(--theme-text-primary)' }} />
                <span className='text-[13px] font-bold' style={{ color: 'var(--theme-text-primary)' }}>Dark</span>
                {currentTheme === 'dark' && (
                  <span className='absolute top-2 right-2 w-2 h-2 rounded-full' style={{ background: 'var(--theme-btn-primary-bg)' }} />
                )}
              </button>

              {/* Light */}
              <button
                id='theme-light-btn'
                onClick={() => handleThemeChange('light')}
                className='relative flex flex-col items-center justify-center gap-2 h-[88px] rounded-2xl border-2 transition-all active:scale-[0.97]'
                style={{
                  borderColor: currentTheme === 'light' ? 'var(--theme-btn-primary-bg)' : 'var(--theme-border)',
                  background: 'var(--theme-btn-secondary-bg)',
                  opacity: currentTheme === 'light' ? 1 : 0.55,
                }}
              >
                <Sun size={24} style={{ color: 'var(--theme-text-primary)' }} />
                <span className='text-[13px] font-bold' style={{ color: 'var(--theme-text-primary)' }}>Light</span>
                {currentTheme === 'light' && (
                  <span className='absolute top-2 right-2 w-2 h-2 rounded-full' style={{ background: 'var(--theme-btn-primary-bg)' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='hidden lg:block p-8' style={{ background: 'var(--theme-bg)', color: 'var(--theme-text-primary)', minHeight: 'calc(100vh - var(--topbar-height))' }}>
        <div className='max-w-[680px]'>
          <h1 className='text-[32px] font-extrabold tracking-tight mb-2'>Settings</h1>
          <p className='text-[15px] mb-10' style={{ color: 'var(--theme-text-secondary)' }}>
            Manage your application preferences.
          </p>

          {/* Appearance Card */}
          <div className='rounded-2xl border p-8 shadow-sm' style={{ background: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
            <div className='flex items-center gap-3 mb-2'>
              <Palette size={22} style={{ color: 'var(--theme-text-primary)' }} />
              <h2 className='text-[20px] font-extrabold'>Appearance</h2>
            </div>
            <p className='text-[13px] mb-7' style={{ color: 'var(--theme-text-secondary)' }}>
              Choose how Gadget Restore looks. Select Dark or Light theme.
            </p>

            <div className='grid grid-cols-2 gap-4 max-w-[400px]'>
              {/* Dark option */}
              <button
                id='theme-dark-btn-desktop'
                onClick={() => handleThemeChange('dark')}
                className='relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer'
                style={{
                  height: 110,
                  borderColor: currentTheme === 'dark' ? 'var(--theme-btn-primary-bg)' : 'var(--theme-border)',
                  background: 'var(--theme-btn-secondary-bg)',
                  opacity: currentTheme === 'dark' ? 1 : 0.5,
                }}
              >
                <Moon size={28} style={{ color: 'var(--theme-text-primary)' }} />
                <span className='text-[13px] font-bold' style={{ color: 'var(--theme-text-primary)' }}>Dark</span>
                {currentTheme === 'dark' && (
                  <span
                    className='absolute top-3 right-3 w-2.5 h-2.5 rounded-full'
                    style={{ background: 'var(--theme-btn-primary-bg)' }}
                  />
                )}
              </button>

              {/* Light option */}
              <button
                id='theme-light-btn-desktop'
                onClick={() => handleThemeChange('light')}
                className='relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer'
                style={{
                  height: 110,
                  borderColor: currentTheme === 'light' ? 'var(--theme-btn-primary-bg)' : 'var(--theme-border)',
                  background: 'var(--theme-btn-secondary-bg)',
                  opacity: currentTheme === 'light' ? 1 : 0.5,
                }}
              >
                <Sun size={28} style={{ color: 'var(--theme-text-primary)' }} />
                <span className='text-[13px] font-bold' style={{ color: 'var(--theme-text-primary)' }}>Light</span>
                {currentTheme === 'light' && (
                  <span
                    className='absolute top-3 right-3 w-2.5 h-2.5 rounded-full'
                    style={{ background: 'var(--theme-btn-primary-bg)' }}
                  />
                )}
              </button>
            </div>

            <p className='text-[11px] mt-6' style={{ color: 'var(--theme-text-disabled)' }}>
              Your preference is saved locally and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
