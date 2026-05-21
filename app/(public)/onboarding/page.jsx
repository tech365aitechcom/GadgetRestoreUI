'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Preferences } from '@capacitor/preferences';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';

const SLIDES = [
  {
    title: 'Expert Mobile Repair',
    description: 'Get your phone fixed by certified professionals with genuine parts.',
    icon: '🛠️',
  },
  {
    title: 'Pick & Drop Service',
    description: 'We collect your device, repair it at our secure lab, and deliver it back to you.',
    icon: '🚚',
  },
  {
    title: 'Assured Warranty',
    description: 'Enjoy peace of mind with our assured warranty on all parts and repairs.',
    icon: '🛡️',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await Preferences.set({ key: 'has_seen_onboarding', value: 'true' });
    } catch (e) {
      // Ignore preference errors on web
    }
    router.replace('/select-brand');
  };

  const slide = SLIDES[currentSlide];

  return (
    <AppShell>
      <div className="flex flex-col h-[100svh] px-6 py-8">
        
        {/* Skip Button */}
        <div className="flex justify-end">
          <button 
            onClick={finishOnboarding}
            className="text-[var(--color-text-secondary)] font-medium text-sm py-2 px-4 -mr-4"
          >
            Skip
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
          <div className="text-8xl mb-12 select-none">
            {slide.icon}
          </div>
          <h1 className="text-2xl font-bold mb-4">{slide.title}</h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed max-w-sm">
            {slide.description}
          </p>
        </div>

        {/* Bottom controls */}
        <div className="pb-8">
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mb-8">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'w-6 bg-[var(--color-accent)]' 
                    : 'w-2 bg-[var(--color-divider)]'
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
