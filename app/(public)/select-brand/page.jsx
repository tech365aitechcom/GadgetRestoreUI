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

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP  ≥1024px
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-desktop">
        <div className="p-8" style={{ paddingBottom: 48 }}>

          {/* Page header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
            <div>
              {/* Category filter chip */}
              {category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--color-bg-700)', color: 'var(--color-btn-cta-bg)', padding: '4px 14px', borderRadius: 999 }}>
                    {category.name}
                  </span>
                  <button
                    onClick={() => router.push('/home')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-content-text-secondary)', textDecoration: 'underline', padding: 0 }}
                  >
                    Change category
                  </button>
                </div>
              )}
              <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-content-text)', textTransform: 'uppercase', marginBottom: 10 }}>
                Select Brand
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-content-text-secondary)', lineHeight: 1.65, maxWidth: 500 }}>
                {category
                  ? `Showing ${category.name} brands. Use the search bar to filter further or contact our technician team directly.`
                  : 'We support over 50+ manufacturers. Use the search bar for specific model compatibility or contact our technician team directly.'}
              </p>
            </div>

            {/* Scan Serial — desktop right */}
            <div style={{ minWidth: 220 }}>
              <button
                className="scan-serial-card"
                style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '16px 20px' }}
                aria-label="Scan serial number"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <span className="scan-serial-card-label">Auto-Detect</span>
                    <span className="scan-serial-card-title">Scan Serial</span>
                  </div>
                  <div className="scan-serial-icon">
                    <ScanLine size={20} />
                  </div>
                </div>
                <div style={{ width: '100%', height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ height: '100%', width: '40%', background: 'var(--color-accent)', borderRadius: 3 }} />
                </div>
              </button>
            </div>
          </div>

          {/* Main content: Can't Find (left) + Brand Grid (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left: Can't Find card */}
            <CantFindBanner />

            {/* Right: Search + brand grid */}
            <div>
              <BrandGrid
                brands={brands}
                isLoading={isLoading}
                onSelectBrand={handleSelectBrand}
                selectedBrandId={selectedBrand?._id}
              />
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: 32 }}>
            <TrustBadges />
          </div>

          {error && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-danger)', fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE  <1024px
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile" style={{ background: 'var(--color-content-bg)', minHeight: '100svh', paddingBottom: 80 }}>
        {/* Content */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Heading */}
          <div>
            {/* Category filter chip */}
            {category && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'var(--color-bg-700)', color: 'var(--color-btn-cta-bg)', padding: '4px 12px', borderRadius: 999 }}>
                  {category.name}
                </span>
                <button
                  onClick={() => router.push('/home')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-content-text-secondary)', textDecoration: 'underline', padding: 0 }}
                >
                  Change
                </button>
              </div>
            )}
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-content-text)', marginBottom: 8 }}>
              Select Brand
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.65 }}>
              {category
                ? `Showing brands for ${category.name}. Use search to filter further.`
                : 'We support over 50+ manufacturers. Use the search bar for specific model compatibility or contact our technician team directly.'}
            </p>
          </div>


          {/* Scan Serial */}
          <ScanSerialButton />

          {/* Can't Find card */}
          <CantFindBanner />

          {/* Brand grid */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-danger)', fontWeight: 600 }}>{error}</div>
          ) : (
            <BrandGrid
              brands={brands}
              isLoading={isLoading}
              onSelectBrand={handleSelectBrand}
              selectedBrandId={selectedBrand?._id}
            />
          )}

        </div>

        <BottomNav />
      </div>

    </AppShell>
  );
}
