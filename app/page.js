'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export default function SplashPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Set mounted and redirect immediately if on desktop/web
  useEffect(() => {
    const isApp = Capacitor.isNativePlatform();
    if (!isApp) {
      router.replace('/home');
    } else {
      setMounted(true);
    }
  }, [router]);

  // Smooth progress animation over 2.2 seconds
  useEffect(() => {
    if (!mounted) return;

    const duration = 2200; // 2.2 seconds
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [mounted]);

  // Navigate after progress completes
  useEffect(() => {
    if (progress >= 100) {
      const decideRoute = async () => {
        let hasSeen = 'false';

        // Native mobile detection
        const isApp = Capacitor.isNativePlatform();
        if (isApp) {
          try {
            const { value } = await Preferences.get({ key: 'has_seen_onboarding' });
            hasSeen = value || 'false';
          } catch (e) {
            hasSeen = 'false';
          }
        } else {
          // Web fallback
          if (typeof window !== 'undefined') {
            hasSeen = localStorage.getItem('has_seen_onboarding') || 'false';
          }
        }

        if (hasSeen === 'true') {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      };
      decideRoute();
    }
  }, [progress, router]);

  if (!mounted) return null;

  const activeDotIndex = Math.min(2, Math.floor(progress / 33.3));

  return (
    <div className="min-h-screen w-screen text-white flex flex-col overflow-hidden relative" style={{ background: 'var(--color-bg)' }}>

      {/* 💻 DESKTOP SPLASH VIEW (lg size screen) */}
      <div
        className="hidden lg:flex flex-col justify-between w-full h-screen p-10 box-border z-10"
        style={{
          background: 'radial-gradient(circle at 75% 25%, var(--color-accent-tint-8) 0%, transparent 55%), linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-900) 50%, var(--color-bg-600) 100%)'
        }}
      >
        {/* Header Row */}
        <header className="flex justify-between items-center w-full">
          {/* Top-left Indicator */}
          <div className="flex gap-1.5 text-zinc-700 font-mono text-[10px] select-none">
            <span>——</span>
            <span>——</span>
            <span>——</span>
          </div>

          {/* Top-right Status */}
          <div className="flex items-center gap-8 text-[10px] tracking-[0.18em] font-extrabold text-zinc-500 font-sans select-none">
            <div>STATUS: <span className="text-emerald-400">ONLINE</span></div>
            <div>DIAGNOSTIC_MODE: <span className="text-blue-400">ACTIVE</span></div>
          </div>
        </header>

        {/* Center Contents */}
        <main className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Logo container */}
          <div className="mb-3">
            <img
              src="/gadget-restore-logo.svg"
              alt="Gadget Restore Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Widely spaced text subtitle */}
          <div className="text-[10px] tracking-[0.8em] text-zinc-400 font-bold uppercase leading-relaxed mr-[-0.8em] select-none">
            TECHNICAL PRECISION
          </div>

          {/* Initializing Info with checkmark */}
          <div className="flex items-center justify-center gap-2 mt-16 mb-4 select-none">
            <div className="w-[18px] h-[18px] rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10.5px] tracking-[0.2em] font-extrabold text-zinc-300 uppercase">
              INITIALIZING SYSTEMS
            </span>
          </div>

          {/* Clean progress bar line */}
          <div className="w-[280px] h-[1px] bg-zinc-800/80 relative overflow-hidden rounded-full">
            <div
              className="h-full bg-white transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </main>

        {/* Footer Row */}
        <footer className="flex justify-between items-center w-full text-zinc-600 font-sans text-[9px] tracking-[0.12em] font-bold uppercase select-none">
          {/* Bottom-left Copyright */}
          <div>
            © 2026 GADGET RESTORE. TECHNICAL PRECISION.
          </div>

          {/* Bottom-right Metadata */}
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              SYSTEM V1.0.2
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              ENCRYPTED CONNECTION
            </span>
          </div>
        </footer>
      </div>

      {/* 📱 MOBILE SPLASH VIEW (lg hidden) */}
      <div
        className="flex lg:hidden flex-col justify-between w-full h-[100svh] px-6 py-10 box-border z-10 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 30%, var(--color-accent-tint-4) 0%, transparent 60%), var(--color-bg-900)'
        }}
      >
        {/* Empty top spacing for balance */}
        <div className="h-4" />

        {/* Center Contents */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Motherboard circuit overlay */}
          <div className="relative mb-9 select-none animate-pulse duration-[3000ms]">
            <img
              src="/images/Logo Container.png"
              alt="System Hardware"
              className="w-28 h-28 object-contain"
            />
          </div>

          {/* Logo */}
          <div className="mb-2">
            <img
              src="/gadget-restore-logo.svg"
              alt="Gadget Restore Logo"
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Widely spaced text subtitle */}
          <div className="text-[9px] tracking-[0.65em] text-zinc-500 font-bold uppercase mr-[-0.65em] select-none">
            TECHNICAL PRECISION
          </div>

          {/* Thin progress bar */}
          <div className="w-[190px] h-[1px] bg-zinc-800/80 relative overflow-hidden mt-12 mb-5 rounded-full">
            <div
              className="h-full bg-white transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Interactive loading dots */}
          <div className="flex justify-center gap-2 mb-3.5 select-none">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeDotIndex ? 'bg-white scale-110' : 'bg-zinc-800'
                  }`}
              />
            ))}
          </div>

          {/* Status text change */}
          <div className="text-[10px] tracking-[0.2em] font-extrabold text-zinc-400 uppercase select-none">
            {progress < 40 ? 'INITIALIZING' : progress < 85 ? 'SECURITY SYNC' : 'LAUNCHING'}
          </div>
        </div>

        {/* Bottom hardware icons row */}
        <footer className="flex justify-center gap-10 text-zinc-500 pb-2">
          {/* Secure Shield Circle */}
          <div
            className="w-[42px] h-[42px] rounded-full border border-zinc-800 bg-zinc-900/10 flex items-center justify-center hover:bg-zinc-800/20 active:scale-95 transition-all"
            title="Secure System"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          {/* Network Web Circle */}
          <div
            className="w-[42px] h-[42px] rounded-full border border-zinc-800 bg-zinc-900/10 flex items-center justify-center hover:bg-zinc-800/20 active:scale-95 transition-all"
            title="Cloud Connected"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
            </svg>
          </div>

          {/* Config Gear Circle */}
          <div
            className="w-[42px] h-[42px] rounded-full border border-zinc-800 bg-zinc-900/10 flex items-center justify-center hover:bg-zinc-800/20 active:scale-95 transition-all"
            title="Hardware Diagnostics"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </footer>
      </div>

    </div>
  );
}
