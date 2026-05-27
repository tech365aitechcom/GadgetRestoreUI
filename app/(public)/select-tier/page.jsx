'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Shield,
  Award,
  ChevronRight,
  Check,
  Clock,
  Smartphone,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import catalogueService from '@/services/catalogue.service';
import { useBooking } from '@/context/BookingContext';

/* ─── Tier visual config (keyed by tier.tier from DB) ──────────────────────── */
const TIER_STYLE = {
  Pro: {
    accentColor: 'var(--color-accent)',
    accentBg: 'rgba(108,123,255,0.08)',
    badge: null,
    icon: <Shield size={22} />,
    tagline: 'OEM-equivalent quality — great value',
  },
  Premium: {
    accentColor: 'var(--color-accent)',
    accentBg: 'rgba(108,123,255,0.08)',
    badge: 'Recommended',
    icon: <Award size={22} />,
    tagline: 'Original OEM / highest-grade parts',
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function collectRepairTypeIds(symptoms) {
  const ids = new Set();
  (symptoms || []).forEach((s) => {
    (s.repairTypes || []).forEach((rt) => {
      const id = typeof rt === 'object' ? rt._id : rt;
      if (id) ids.add(id);
    });
  });
  return [...ids];
}

/* ─── TierCard ──────────────────────────────────────────────────────────────── */
function TierCard({ tier, isSelected, availability, onSelect, compact = false }) {
  const style = TIER_STYLE[tier.tier] || TIER_STYLE.Pro;
  const avail = availability[tier.tier];
  const unavailable = avail !== undefined && avail !== null && avail.available === false;

  const totalPartsCost = avail?.totalPartsCost ?? null;
  const totalLabourCost = avail?.totalLabourCost ?? null;
  const hasPrice = totalPartsCost !== null && (totalPartsCost + totalLabourCost) > 0;

  return (
    <button
      onClick={() => !unavailable && onSelect(tier)}
      disabled={unavailable}
      aria-pressed={isSelected}
      style={{
        flex: 1,
        minWidth: 0,
        border: isSelected
          ? `2px solid ${style.accentColor}`
          : '1px solid var(--color-content-border)',
        borderRadius: 'var(--radius-card)',
        background: isSelected ? style.accentBg : 'var(--color-content-card)',
        padding: compact ? '18px 16px' : '26px 22px',
        cursor: unavailable ? 'not-allowed' : 'pointer',
        opacity: unavailable ? 0.45 : 1,
        transition: 'all 0.2s ease',
        textAlign: 'left',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: isSelected ? `0 4px 20px ${style.accentColor}22` : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Badge */}
      {style.badge && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: style.accentColor, color: '#fff',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.07em',
          textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999,
        }}>
          {style.badge}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: isSelected ? style.accentColor : 'var(--color-content-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isSelected ? '#fff' : style.accentColor, flexShrink: 0,
          transition: 'all 0.2s ease',
        }}>
          {style.icon}
        </div>
        <div>
          <div style={{ fontSize: compact ? 17 : 21, fontWeight: 900, letterSpacing: '-0.02em', color: isSelected ? style.accentColor : 'var(--color-content-text)' }}>
            {tier.tier}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-content-text-secondary)', marginTop: 1 }}>
            {style.tagline}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: 'var(--color-content-text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {tier.description}
      </p>

      {/* Features */}
      {tier.features?.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5, margin: 0, padding: 0 }}>
          {tier.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--color-content-text-secondary)' }}>
              <div style={{ width: 15, height: 15, borderRadius: '50%', background: style.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={9} strokeWidth={3} color={style.accentColor} />
              </div>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Warranty pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 13px',
        background: isSelected ? style.accentBg : 'var(--color-content-bg)',
        borderRadius: 9, fontSize: 12, fontWeight: 600,
        color: isSelected ? style.accentColor : 'var(--color-content-text-secondary)',
        transition: 'all 0.2s ease',
      }}>
        <Clock size={13} />
        {tier.defaultWarrantyMonths} month{tier.defaultWarrantyMonths > 1 ? 's' : ''} warranty
      </div>

      {/* Price */}
      {unavailable ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-danger)' }}>
          <AlertCircle size={13} /> Price not configured for this device and repair
        </div>
      ) : hasPrice ? (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
            Estimated Cost
          </div>
          <div style={{ fontSize: compact ? 20 : 26, fontWeight: 900, letterSpacing: '-0.02em', color: isSelected ? style.accentColor : 'var(--color-content-text)' }}>
            ₹{(totalPartsCost + totalLabourCost).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-content-text-secondary)', marginTop: 2 }}>
            Parts ₹{totalPartsCost.toLocaleString('en-IN')} · Labour ₹{totalLabourCost.toLocaleString('en-IN')}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--color-content-text-secondary)' }}>
          Final pricing confirmed after diagnosis
        </div>
      )}

      {/* Radio dot */}
      <div style={{
        position: 'absolute', bottom: 14, right: 14,
        width: 20, height: 20, borderRadius: '50%',
        border: isSelected ? 'none' : `2px solid var(--color-content-border)`,
        background: isSelected ? style.accentColor : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        {isSelected && <Check size={11} strokeWidth={3} color="#fff" />}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function SelectTierPage() {
  const router = useRouter();
  const {
    brand, model, symptoms,
    partTier: contextTier,
    setPartTier,
    category,
  } = useBooking();

  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedMode, setSelectedMode] = useState('lab');
  const [remarksText, setRemarksText] = useState('');
  const [availability, setAvailability] = useState({});
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);
  const [isCheckingPricing, setIsCheckingPricing] = useState(false);
  const [error, setError] = useState(null);

  /* Guard */
  useEffect(() => {
    if (!brand) { router.replace('/select-brand'); return; }
    if (!model) { router.replace('/select-model'); return; }
    if (!symptoms?.length) { router.replace('/select-symptoms'); return; }
  }, [brand, model, symptoms, router]);

  /* Restore context state */
  useEffect(() => {
    // The context value can arrive after localStorage hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (contextTier) setSelectedTier(contextTier);
  }, [contextTier]);

  /* Fetch part tiers from backend */
  useEffect(() => {
    catalogueService.getPartTiers()
      .then((data) => {
        const sorted = [...data].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        setTiers(sorted);
      })
      .catch(() => setError('Failed to load part tiers. Please try again.'))
      .finally(() => setIsLoadingTiers(false));
  }, []);

  /* Check pricing availability once tiers + symptoms are ready */
  useEffect(() => {
    if (!tiers.length || !symptoms?.length || !brand || !model) return;
    const repairTypeIds = collectRepairTypeIds(symptoms);
    if (!repairTypeIds.length) return;

    // Display progress while the async matrix lookup is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCheckingPricing(true);
    Promise.all(
      tiers.map((tier) =>
        catalogueService
          .checkPricingAvailability({ brandId: brand._id, modelId: model._id, repairTypeIds, partTier: tier.tier })
          .then((result) => ({ tier: tier.tier, result }))
          .catch(() => ({ tier: tier.tier, result: null }))
      )
    ).then((results) => {
      const avail = {};
      results.forEach(({ tier: tierName, result }) => {
        if (result?.results) {
          avail[tierName] = {
            available: result.allAvailable,
            totalPartsCost: result.results.reduce((s, r) => s + (r.pricing?.partsCost || 0), 0),
            totalLabourCost: result.results.reduce((s, r) => s + (r.pricing?.labourCost || 0), 0),
          };
        } else {
          avail[tierName] = null; // API error — don't block selection
        }
      });
      setAvailability(avail);
    }).finally(() => setIsCheckingPricing(false));
  }, [tiers, symptoms, brand, model]);

  /* Continue handler — routes to /select-mode */
  const handleContinue = () => {
    if (!selectedTier) return;
    setPartTier(selectedTier);
    router.push('/select-mode');
  };

  if (!brand || !model || !symptoms?.length) return null;

  const categoryName = category?.name || model?.categoryId?.name || 'Device';
  const canContinue = !!selectedTier;

  /* Price summary for footer / sidebar */
  const tierPrice = selectedTier && availability[selectedTier.tier]
    ? (availability[selectedTier.tier].totalPartsCost || 0) + (availability[selectedTier.tier].totalLabourCost || 0)
    : null;

  return (
    <AppShell>

      {/* ══════════════════════════════════════════════════════
          DESKTOP ≥1024px
          ══════════════════════════════════════════════════════ */}
      <div className="home-desktop">
        <div className="page-container" style={{ paddingBottom: 60 }}>

          {/* Back + breadcrumb */}
          <div style={{ marginBottom: 28 }}>
            <button
              onClick={() => router.push('/select-symptoms')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 14, padding: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}
            >
              <ArrowLeft size={14} /> Back to Symptoms
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#111', color: '#fff', padding: '4px 12px', borderRadius: 999 }}>{categoryName}</span>
              <span style={{ fontSize: 12, color: 'var(--color-content-text-secondary)' }}>/</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase' }}>{brand.name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-content-text-secondary)' }}>/</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase' }}>{model.name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-content-text-secondary)' }}>/</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase' }}>{symptoms.length} symptom{symptoms.length > 1 ? 's' : ''}</span>
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-content-text)', textTransform: 'uppercase', marginBottom: 6 }}>
              Repair Options
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-content-text-secondary)', lineHeight: 1.65, maxWidth: 540 }}>
              Choose your part quality, repair method, and any additional notes — then see your pricing.
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

            {/* Left: all three modules stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* ── Section 1: Part Quality ── */}
              <div>
                {isLoadingTiers && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    {[0, 1].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-card)' }} />)}
                  </div>
                )}
                {!isLoadingTiers && error && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-danger)', fontWeight: 600 }}>{error}</div>
                )}
                {!isLoadingTiers && !error && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tiers.length || 2}, 1fr)`, gap: 18 }}>
                    {tiers.map((tier) => (
                      <TierCard
                        key={tier._id}
                        tier={tier}
                        isSelected={selectedTier?._id === tier._id}
                        availability={availability}
                        onSelect={setSelectedTier}
                      />
                    ))}
                  </div>
                )}

                {/* Pricing disclaimer */}
                {!isLoadingTiers && !isCheckingPricing && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '12px 16px', background: 'rgba(108,123,255,0.04)', border: '1px solid rgba(108,123,255,0.14)', borderRadius: 10, fontSize: 12, color: 'var(--color-content-text-secondary)', lineHeight: 1.6, marginTop: 14 }}>
                    <Sparkles size={13} color="var(--color-accent)" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>Pricing is an estimate based on your symptoms. Final cost confirmed after device diagnosis at our service centre.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: sticky summary */}
            <div style={{ position: 'sticky', top: 96 }}>
              <div style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-content-text)', marginBottom: 16, borderBottom: '1px solid var(--color-content-divider)', paddingBottom: 12 }}>
                  Repair Summary
                </h3>

                {/* Device */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--color-content-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', display: 'block' }}>{brand.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-content-text)' }}>{model.name}</span>
                  </div>
                </div>

                {/* Symptoms */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>
                    Symptoms ({symptoms.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {symptoms.map(s => (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-content-text)' }}>
                        <Check size={11} strokeWidth={3} color="var(--color-accent)" />
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selections recap */}
                <div style={{ background: 'var(--color-content-bg)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-content-text-secondary)' }}>Part Quality</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: selectedTier ? (TIER_STYLE[selectedTier.tier] || TIER_STYLE.Pro).accentColor : 'var(--color-content-text-secondary)' }}>
                      {selectedTier ? `${selectedTier.tier} Parts` : '— Not selected'}
                    </span>
                  </div>
                  {tierPrice !== null && tierPrice > 0 && (
                    <>
                      <div style={{ height: 1, background: 'var(--color-content-divider)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--color-content-text-secondary)' }}>Est. Total</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-content-text)' }}>₹{tierPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  style={{
                    width: '100%',
                    height: 'var(--btn-height-primary)',
                    background: canContinue ? 'var(--color-accent)' : 'var(--color-content-divider)',
                    color: canContinue ? '#fff' : 'var(--color-content-text-secondary)',
                    border: 'none', borderRadius: 'var(--radius-btn)',
                    fontWeight: 700, fontSize: 14,
                    cursor: canContinue ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s ease',
                    boxShadow: canContinue ? '0 4px 16px rgba(108,123,255,0.25)' : 'none',
                  }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE <1024px
          ══════════════════════════════════════════════════════ */}
      <div className="home-mobile">
        <div style={{ background: 'var(--color-content-bg)', minHeight: '100svh', paddingBottom: 160 }}>

          {/* Top bar */}
          <div className="top-bar">
            <button onClick={() => router.push('/select-symptoms')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <img src="/gadget-restore-logo.svg" alt="Gadget Restore" style={{ height: 28, objectFit: 'contain' }} />
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', width: 36, height: 36, justifyContent: 'center', borderRadius: '50%' }} aria-label="Notifications">
              <Bell size={20} />
            </button>
          </div>

          {/* Step progress — step 4 of 5 */}
          <div className="step-progress">
            <div className="step-dot done" />
            <div className="step-dot done" />
            <div className="step-dot done" />
            <div className="step-dot active" />
            <div className="step-dot" />
          </div>

          {/* Content */}
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Page header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: '#111', color: '#fff', padding: '4px 10px', borderRadius: 999 }}>{categoryName}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', background: 'rgba(108,123,255,0.1)', padding: '4px 10px', borderRadius: 999 }}>{model.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', padding: '4px 10px', borderRadius: 999 }}>{symptoms.length} symptom{symptoms.length > 1 ? 's' : ''}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-content-text)', marginBottom: 4 }}>
                Repair Options
              </h1>
              <p style={{ fontSize: 12, color: 'var(--color-content-text-secondary)', lineHeight: 1.6 }}>
                Choose part quality, repair mode, and any notes before viewing pricing.
              </p>
            </div>

            {/* ── 1. Part Quality ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isLoadingTiers && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[0, 1].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-card)' }} />)}
                </div>
              )}
              {!isLoadingTiers && error && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-danger)', fontWeight: 600 }}>{error}</div>
              )}
              {!isLoadingTiers && !error && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tiers.map((tier) => (
                    <TierCard
                      key={tier._id}
                      tier={tier}
                      isSelected={selectedTier?._id === tier._id}
                      availability={availability}
                      onSelect={setSelectedTier}
                      compact
                    />
                  ))}
                </div>
              )}

              {!isLoadingTiers && !isCheckingPricing && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '10px 12px', background: 'rgba(108,123,255,0.04)', border: '1px solid rgba(108,123,255,0.12)', borderRadius: 9, fontSize: 11, color: 'var(--color-content-text-secondary)', lineHeight: 1.55 }}>
                  <Sparkles size={11} color="var(--color-accent)" style={{ marginTop: 1, flexShrink: 0 }} />
                  Pricing shown is an estimate. Final cost confirmed after device diagnosis.
                </div>
              )}
            </div>

          </div>

          {/* Mobile sticky bottom CTA */}
          <div style={{
            position: 'fixed', bottom: 64, left: 0, right: 0,
            background: 'var(--color-content-surface)',
            borderTop: '1px solid var(--color-content-border)',
            padding: '12px 16px', zIndex: 90,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            boxShadow: '0 -4px 10px rgba(0,0,0,0.04)',
          }}>
            <div>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedTier ? `${selectedTier.tier} Parts` : 'Select part quality to continue'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: canContinue ? (TIER_STYLE[selectedTier?.tier] || TIER_STYLE.Pro).accentColor : 'var(--color-content-text)' }}>
                {canContinue
                  ? (tierPrice && tierPrice > 0
                    ? `~₹${tierPrice.toLocaleString('en-IN')}`
                    : 'Continue to Repair Mode')
                  : 'Choose Pro or Premium above'}
              </span>
            </div>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              style={{
                height: 44, padding: '0 22px',
                background: canContinue ? 'var(--color-accent)' : 'var(--color-content-divider)',
                color: canContinue ? '#fff' : 'var(--color-content-text-secondary)',
                border: 'none', borderRadius: 'var(--radius-btn)',
                fontWeight: 700, fontSize: 13,
                cursor: canContinue ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              Continue <ChevronRight size={14} />
            </button>
          </div>

          <BottomNav />
        </div>
      </div>

    </AppShell>
  );
}
