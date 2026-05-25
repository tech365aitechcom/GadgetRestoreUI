'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const SLIDES = [
  {
    title: 'Reliable<br />Repairs You<br />Can Trust',
    description: "From minor fixes to major issues,<br />we've got your device covered.",
    image: '/images/-original-imagtc3kfyhgfcvr 1.png',
  },
  {
    title: 'Genuine Parts<br />Expert Technicians.',
    description: 'We use high-quality parts and industry<br />leading tools for the best results.',
    image: '/images/6b7bf23b15c2ac21517dc925fd18d6cb32f6c7eb.png',
  },
  {
    title: 'Quick. Easy.<br />Hassle-Free.',
    description: "Choose your device, issue and<br />we'll take care of the rest.",
    image: '/images/09a267788a452b3b3a834a548b6252b68a3ce3c9.png',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const isApp = Capacitor.isNativePlatform();
      if (!isApp) {
        router.replace('/home');
        return;
      }

      let hasSeen = 'false';
      try {
        const { value } = await Preferences.get({ key: 'has_seen_onboarding' });
        hasSeen = value || 'false';
      } catch (e) {
        hasSeen = 'false';
      }

      if (hasSeen === 'true') {
        router.replace('/home');
      } else {
        setMounted(true);
      }
    };

    checkAccess();
  }, [router]);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const finishOnboarding = async () => {
    try {
      await Preferences.set({ key: 'has_seen_onboarding', value: 'true' });
    } catch (e) {
      // Fallback for browser storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('has_seen_onboarding', 'true');
      }
    }
    router.replace('/home');
  };

  if (!mounted) return null;

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen w-screen bg-[#070709] flex items-center justify-center text-white font-sans overflow-hidden">

      {/* Immersive Phone Sized Onboarding Shell */}
      <div
        className="w-full max-w-[420px] h-[100svh] flex flex-col justify-between bg-[#0c0c0e] relative z-10 box-border"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(108, 123, 255, 0.03) 0%, transparent 60%), #0c0c0e'
        }}
      >
        {/* ─── 1. Header Navigation ─── */}
        <header className="flex items-center justify-between px-6 pt-12 pb-4 select-none z-20">
          {/* Back button (only shown on Slide 2 & 3) */}
          <div className="w-8 h-8 flex items-center justify-start">
            {currentSlide > 0 && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] text-white flex items-center justify-center hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all cursor-pointer"
                aria-label="Go back"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Centered Small Logo */}
          <div className="flex-1 flex justify-center">
            <img
              src="/gadget-restore-logo.svg"
              alt="Gadget Restore Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Skip Button */}
          <div className="w-12 flex justify-end">
            <button
              onClick={finishOnboarding}
              className="border border-white/20 hover:border-white/40 active:scale-95 text-white rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider transition uppercase cursor-pointer"
            >
              SKIP
            </button>
          </div>
        </header>

        {/* ─── 2. Continuous Rounded Container ─── */}
        <div
          className="flex-1 flex flex-col justify-between bg-[#121216]/95 border-t border-white/5 rounded-t-[36px] px-6 pt-8 pb-12 shadow-[0_-15px_35px_rgba(0,0,0,0.4)] relative z-20"
        >
          {/* Text Labels Area */}
          <div className="text-left mb-4 px-2 pt-2">
            <h1
              className="text-[30px] font-extrabold text-white tracking-tight leading-[1.2] mb-3.5"
              dangerouslySetInnerHTML={{ __html: slide.title }}
            />
            <p
              className="text-[13.5px] text-zinc-400 font-medium leading-relaxed max-w-[340px]"
              dangerouslySetInnerHTML={{ __html: slide.description }}
            />
          </div>

          {/* Illustration Area */}
          <div className="flex-1 flex items-center justify-center py-4 select-none">
            <div className="w-full flex items-center justify-center transition-all duration-500 ease-in-out transform">
              <img
                src={slide.image}
                alt="Illustration"
                className="max-h-[220px] max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex flex-col gap-12 px-2">
            {/* Page indicators (pill and dots) */}
            <div className="flex gap-2 items-center justify-center select-none">
              {[0, 1, 2].map((idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? 'w-6 bg-white' : 'w-1.5 bg-zinc-800'
                      }`}
                  />
                );
              })}
            </div>

            {/* Action button */}
            <button
              onClick={handleNext}
              className="w-full h-[54px] bg-transparent border border-white hover:bg-white/10 active:scale-[0.98] text-white rounded-lg text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-1 transition-all duration-200 select-none cursor-pointer"
            >
              NEXT &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
