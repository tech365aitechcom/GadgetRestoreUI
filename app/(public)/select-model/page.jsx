'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine } from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import ModelList from '@/components/booking/ModelList';
import { CantFindBanner, ScanSerialButton } from '@/components/booking/BrandGrid';
import catalogueService from '@/services/catalogue.service';
import { useBooking } from '@/context/BookingContext';

export default function SelectModelPage() {
  const router = useRouter();
  const { brand, model: selectedModel, setModel } = useBooking();
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guard: if no brand selected, redirect back
  useEffect(() => {
    if (!brand) router.replace('/select-brand');
  }, [brand, router]);

  useEffect(() => {
    if (!brand) return;
    setIsLoading(true);
    catalogueService.getModelsByBrand(brand._id)
      .then((data) => setModels(data || []))
      .catch(() => setError('Failed to load models. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [brand]);

  const handleSelectModel = (m) => {
    setModel(m);
    router.push('/select-symptoms');
  };

  if (!brand) return null;

  const brandName = brand.name;

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
              {/* Back link */}
              <button
                onClick={() => router.push('/select-brand')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 14, padding: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}
              >
                <ArrowLeft size={14} /> Back to Brands
              </button>

              <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-content-text)', textTransform: 'uppercase', marginBottom: 10 }}>
                Select Model
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-content-text-secondary)', lineHeight: 1.65, maxWidth: 500 }}>
                Identify your {brandName} model to receive a precise technical evaluation and repair quote.
              </p>
            </div>

            {/* Scan Serial card — desktop right */}
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

          {/* Model grid — full width */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-danger)', fontWeight: 600 }}>{error}</div>
          ) : (
            <div style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', borderRadius: 20, padding: 24 }}>
              <ModelList
                models={models}
                isLoading={isLoading}
                onSelectModel={handleSelectModel}
                selectedModelId={selectedModel?._id}
              />
            </div>
          )}

          {/* Can't find — full width at bottom */}
          <div style={{ marginTop: 24 }}>
            <CantFindBanner desktop />
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE  <1024px
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile" style={{ background: 'var(--color-content-bg)', minHeight: '100svh', paddingBottom: 80 }}>
        {/* Content */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Brand chip + heading */}
          <div>
            {/* Selected brand chip */}
            {brand.logo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <img src={brand.logo} alt={brandName} style={{ height: 28, objectFit: 'contain' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{brandName}</span>
              </div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(108,123,255,0.1)', padding: '4px 12px', borderRadius: 999 }}>
                  {brandName}
                </span>
              </div>
            )}

            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-content-text)', marginBottom: 8 }}>
              Select Model
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.65 }}>
              Identify your {brandName} model to receive a precise technical evaluation and repair quote.
            </p>
          </div>

          {/* Model grid */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-danger)', fontWeight: 600 }}>{error}</div>
          ) : (
            <ModelList
              models={models}
              isLoading={isLoading}
              onSelectModel={handleSelectModel}
              selectedModelId={selectedModel?._id}
            />
          )}

          {/* Can't Find */}
          <CantFindBanner />

        </div>

        <BottomNav />
      </div>

    </AppShell>
  );
}
