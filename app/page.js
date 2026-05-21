'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import AppShell from '@/components/layout/AppShell';

export default function SplashPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkFirstLaunch = async () => {
      // Small delay for splash effect
      await new Promise(r => setTimeout(r, 1000));

      const isApp = Capacitor.isNativePlatform();
      
      if (isApp) {
        // Mobile App logic: check if seen onboarding
        try {
          const { value } = await Preferences.get({ key: 'has_seen_onboarding' });
          if (value === 'true') {
            router.replace('/home');
          } else {
            router.replace('/onboarding');
          }
        } catch (e) {
          router.replace('/onboarding');
        }
      } else {
        // Web logic: straight to home page
        router.replace('/home');
      }
    };

    checkFirstLaunch();
  }, [router]);

  // Simple splash screen while deciding where to route
  if (!mounted) return null;

  return (
    <AppShell className="justify-center items-center">
      <div className="flex flex-col items-center justify-center h-[100svh]">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gadget Restore</h1>
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mt-8" />
      </div>
    </AppShell>
  );
}
