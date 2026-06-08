'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine } from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import BrandGrid, { CantFindBanner, TrustBadges, ScanSerialButton } from '@/components/booking/BrandGrid';
import catalogueService from '@/services/catalogue.service';
import { useBooking } from '@/context/BookingContext';

/* ── Shared "Can't Find" Gear SVG ─────────────────────────────────────────── */
const GearSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.488.488 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

export default function SelectBrandPage() {
  const router = useRouter();
  const { setBrand, brand: selectedBrand, category } = useBooking();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch brands whenever the category changes (or on first load)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    catalogueService.getBrands(category?._id || null)
      .then((data) => setBrands(data || []))
      .catch(() => setError('Failed to load brands. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [category?._id]);

  const handleSelectBrand = (b) => {
    if (!selectedBrand || selectedBrand._id !== b._id) setBrand(b);
    router.push('/select-model');
  };

  return (
    <AppShell>
      <div className="w-full min-h-[100svh] lg:min-h-0 bg-[var(--color-content-bg)] lg:bg-transparent pb-20 lg:pb-12">
        <div className="px-4 py-5 lg:p-8 flex flex-col gap-4 lg:gap-7">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            {/* Left: Category filter chip, Title, Description */}
            <div className="flex-1">
              {/* Category filter chip */}
              {category && (
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[10px] lg:text-[11px] font-bold text-[var(--color-btn-cta-bg)] bg-[var(--color-bg-700)] uppercase tracking-wider lg:tracking-widest px-3 lg:px-3.5 py-1 rounded-full">
                    {category.name}
                  </span>
                  <button
                    onClick={() => router.push('/home')}
                    className="background-none border-none cursor-pointer text-xs text-[var(--color-content-text-secondary)] underline p-0 hover:text-[var(--color-content-text)] transition-colors"
                  >
                    Change<span className="hidden lg:inline"> category</span>
                  </button>
                </div>
              )}

              {/* Page Heading */}
              <h1 className="text-[26px] lg:text-[36px] font-black tracking-tight lg:tracking-tighter text-[var(--color-content-text)] uppercase mb-2 lg:mb-2.5">
                Select Brand
              </h1>
              
              {/* Description */}
              <p className="text-sm text-[var(--color-content-text-secondary)] leading-relaxed max-w-[500px]">
                {category
                  ? `Showing ${category.name} brands. Use the search bar to filter further or contact our technician team directly.`
                  : 'We support over 50+ manufacturers. Use the search bar for specific model compatibility or contact our technician team directly.'}
              </p>
            </div>

            {/* Right: Scan Serial card (Desktop only) */}
            <div className="hidden lg:block min-w-[220px]">
              <button
                className="scan-serial-card w-full flex flex-col items-start gap-2 p-4 px-5"
                aria-label="Scan serial number"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="scan-serial-card-label text-[9px] font-bold uppercase tracking-wider text-neutral-500">Auto-Detect</span>
                    <span className="scan-serial-card-title text-base font-extrabold text-white">Scan Serial</span>
                  </div>
                  <div className="scan-serial-icon w-[42px] h-[42px] flex items-center justify-center bg-white/5 rounded-xl text-neutral-400">
                    <ScanLine size={20} />
                  </div>
                </div>
                <div className="w-full h-0.5 rounded-full bg-white/10 mt-1">
                  <div className="h-full w-2/5 bg-[var(--color-accent)] rounded-full" />
                </div>
              </button>
            </div>

          </div>

          {/* Scan Serial Button (Mobile only) */}
          <div className="lg:hidden">
            <ScanSerialButton />
          </div>

          {/* Main Grid Content: CantFind (left/order-3) + BrandGrid (right/order-4) */}
          {error ? (
            <div className="text-center p-8 lg:p-12 text-[var(--color-danger)] font-semibold">{error}</div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 items-start">
              {/* Left Column on Desktop / Order 3 on Mobile */}
              <div className="w-full order-3 lg:order-none">
                <CantFindBanner />
              </div>

              {/* Right Column on Desktop / Order 4 on Mobile */}
              <div className="w-full order-4 lg:order-none">
                <BrandGrid
                  brands={brands}
                  isLoading={isLoading}
                  onSelectBrand={handleSelectBrand}
                  selectedBrandId={selectedBrand?._id}
                />
              </div>
            </div>
          )}

          {/* Trust badges (Desktop only) */}
          <div className="hidden lg:block mt-8">
            <TrustBadges />
          </div>

        </div>

        {/* Floating Bottom Nav (Mobile only) */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </AppShell>
  );
}
