'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Check,
  Smartphone,
  FlaskConical,
  Home,
  Truck,
  Lock,
  Award,
  Shield,
  BadgeCheck,
  Cpu,
} from 'lucide-react';

import { useBooking } from '@/context/BookingContext';
import catalogueService from '@/services/catalogue.service';
import { useBookingGuard } from '@/hooks/useBookingGuard';

/* ─── Service mode config (Phase 1: Lab only) ───────────────────────────────── */
const SERVICE_MODES = [
  {
    id: 'lab',
    label: 'Lab (Pick & Drop)',
    description: 'We pick up, repair at lab, deliver back.',
    icon: <Truck size={24} strokeWidth={1.5} />,
    active: true,
    badges: ['Secure', 'Convenient'],
  },
  {
    id: 'doorstep',
    label: 'Doorstep Repair',
    description: 'Certified technician comes to your location and repairs on-site.',
    icon: <Home size={24} strokeWidth={1.5} />,
    active: false,
    badges: ['Premium Service', 'Fastest'],
  },
];

/* ─── ServiceModeCard ────────────────────────────────────────────────────────── */
function ServiceModeCard({ mode, isSelected, onSelect }) {
  return (
    <button
      onClick={() => mode.active && onSelect(mode.id)}
      disabled={!mode.active}
      aria-pressed={isSelected}
      className="flex-1 min-w-0 flex flex-col items-start gap-3 lg:gap-4 p-4 lg:p-6 border-2 rounded-[var(--radius-card)] bg-[var(--color-content-card)] cursor-pointer text-left outline-none relative transition-all duration-200"
      style={{
        borderColor: isSelected ? 'var(--color-accent)' : 'transparent',
        cursor: mode.active ? 'pointer' : 'not-allowed',
        boxShadow: isSelected ? '0 4px 14px rgba(108,123,255,0.12)' : '0 1px 6px rgba(0,0,0,0.04)',
      }}
    >
      <div className="w-full flex flex-col gap-2 lg:gap-4" style={{ opacity: mode.active ? 1 : 0.35, pointerEvents: 'none' }}>
        {/* Badges */}
        {mode.badges && mode.badges.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-0 lg:mb-1">
            {mode.badges.map((b, i) => (
              <span
                key={i}
                className="text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--color-tag-bg)',
                  color: 'var(--color-tag-text)',
                }}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Icon */}
        <div style={{ color: 'var(--color-content-text)' }}>
          {React.cloneElement(mode.icon, { size: 20, strokeWidth: 1.5, className: 'lg:w-6 lg:h-6' })}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 relative">
          <div className="text-[17px] lg:text-xl font-extrabold mb-1.5 lg:mb-2.5" style={{ color: 'var(--color-content-text)' }}>
            {mode.label}
          </div>
          <div className="text-[13px] leading-relaxed lg:min-h-[62px]" style={{ color: 'var(--color-content-text-secondary)' }}>
            {mode.description}
          </div>
        </div>

        <div className="w-full flex items-center justify-end mt-1 lg:mt-2 border-t pt-3.5 lg:pt-5" style={{ borderColor: 'var(--color-content-border)' }}>
          <ChevronRight size={16} strokeWidth={2} color="var(--color-content-text)" className="lg:w-[18px] lg:h-[18px]" />
        </div>
      </div>

      {!mode.active && (
        <div className="absolute top-[90px] lg:top-[115px] left-1/2 -translate-x-1/2 z-[1]">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide px-3.5 py-2 rounded-full whitespace-nowrap shadow-lg" style={{ background: 'var(--color-bg-100)', color: 'var(--color-btn-cta-bg)' }}>
            <Lock size={12} strokeWidth={2.5} /> COMING SOON
          </span>
        </div>
      )}
    </button>
  );
}

/* ─── Remarks textarea ──────────────────────────────────────────────────────── */
function RemarksField({ value, onChange }) {
  const MAX = 500;
  const remaining = MAX - (value || '').length;
  const isNearLimit = remaining < 80;

  return (
    <div className="flex flex-col gap-2 my-8">
      <h3 className="text-sm font-extrabold uppercase" style={{ color: 'var(--color-content-text)' }}>
        Remarks (Optional)
      </h3>
      <div className="relative">
        <textarea
          id="booking-remarks"
          rows={4}
          maxLength={MAX}
          placeholder="Describe your device condition, accessories included, or any special instructions for our engineer."
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX))}
          className="w-full p-4 pr-[60px] rounded-[var(--radius-input,12px)] text-sm outline-none resize-none leading-relaxed transition-all duration-200 box-border"
          style={{
            background: 'var(--color-content-card)',
            border: '1px solid var(--color-content-border)',
            color: 'var(--color-content-text)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent)';
            e.target.style.boxShadow = '0 0 0 4px rgba(108,123,255,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-content-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <span
          className="absolute bottom-4 right-4 text-xs font-bold pointer-events-none"
          style={{ color: isNearLimit ? 'var(--color-warning)' : 'var(--color-content-text-secondary)' }}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function SelectModePage() {
  const router = useRouter();
  const {
    brand, model, symptoms, partTier,
    serviceMode: contextServiceMode,
    remarks: contextRemarks,
    setServiceMode,
    setRemarks,
  } = useBooking();

  const [selectedMode, setSelectedMode] = useState('');
  const [remarksText, setRemarksText] = useState('');

  /* Guard */
  const { isReady } = useBookingGuard({ brand: true, model: true, symptoms: true, partTier: true });

  /* Restore context state */
  useEffect(() => {
    if (contextServiceMode) setSelectedMode(contextServiceMode);
    if (contextRemarks) setRemarksText(contextRemarks);
  }, [contextServiceMode, contextRemarks]);

  /* Continue handler — routes to /pricing */
  const handleContinue = () => {
    if (!selectedMode) return;
    setServiceMode(selectedMode);
    setRemarks(remarksText);
    router.push('/pricing');
  };

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    setServiceMode(modeId);
    setRemarks(remarksText);
    router.push('/pricing');
  };

  if (!isReady) return null;

  return (
    <div className="min-h-[100svh] pb-40 lg:pb-[60px]" style={{ background: 'var(--color-content-bg)' }}>
      <div className="p-4 lg:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="mb-0 lg:mb-4">
          <button
            onClick={() => router.push('/select-tier')}
            className="hidden lg:inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-xs font-semibold mb-3.5 p-0 uppercase tracking-wider"
            style={{ color: 'var(--color-content-text-secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Part Quality
          </button>
          <h1 className="text-[26px] lg:text-[42px] font-black tracking-tight mb-2 lg:mb-3" style={{ color: 'var(--color-content-text)' }}>
            Service Mode
          </h1>
          <p className="text-[13px] lg:text-base leading-relaxed lg:max-w-[640px]" style={{ color: 'var(--color-content-text-secondary)' }}>
            <span className="lg:hidden">Choose how you would like your device to be handled.</span>
            <span className="hidden lg:inline">Choose how you would like your device to be handled. Each option includes our signature multi-point inspection and certified repair guarantee.</span>
          </p>
        </div>

        {/* Service Mode Cards */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-6 lg:mb-6">
          {SERVICE_MODES.map((mode) => (
            <ServiceModeCard
              key={mode.id}
              mode={mode}
              isSelected={selectedMode === mode.id}
              onSelect={handleModeSelect}
            />
          ))}
        </div>

        {/* Promise Banner */}
        <div className="rounded-3xl lg:rounded-[36px] overflow-hidden mt-4 lg:mt-0" style={{ background: 'var(--color-bg-300)', color: 'var(--color-btn-cta-bg)' }}>
          {/* Mobile: Image on top */}
          <img src="/images/service-mode-banner.png" alt="Precision Repair" className="w-full h-[140px] object-cover lg:hidden" />

          {/* Desktop: Side-by-side layout */}
          <div className="lg:flex lg:relative hidden">
            <div className="p-12 flex-1 z-[2]">
              <div className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--color-text-mid)' }}>
                The Repair.co Promise
              </div>
              <h2 className="text-[32px] font-extrabold leading-tight mb-4 tracking-tight">
                Precision is not an option; it is our standard.
              </h2>
              <p className="text-[15px] leading-relaxed mb-8 max-w-[440px]" style={{ color: 'var(--color-text-soft)' }}>
                Every repair is backed by a comprehensive 3-month warranty. We use only premium components to ensure your hardware maintains its original factory integrity and performance metrics.
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  <BadgeCheck size={16} /> 3-Month Warranty
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  <Cpu size={16} /> Premium Parts
                </div>
              </div>
            </div>
            <div className="w-[35%] relative" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
              <img
                src="/images/service-mode-banner.png"
                alt="Precision Repair"
                className="absolute top-7 bottom-7 left-7 right-7 w-[calc(100%-56px)] h-[calc(100%-56px)] object-cover rounded-3xl"
              />
            </div>
          </div>

          {/* Mobile: Content below image */}
          <div className="p-6 lg:hidden">
            <h2 className="text-xl font-extrabold leading-tight mb-3 tracking-tight">
              Precision is not an option; it is our standard.
            </h2>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--color-text-soft)' }}>
              Every repair is backed by a comprehensive 3-month warranty with Premium grade components.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
                <BadgeCheck size={14} /> 3-Month Warranty
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
                <Cpu size={14} /> Premium Parts
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <RemarksField value={remarksText} onChange={setRemarksText} />
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div
        className="fixed lg:hidden left-0 right-0 flex items-center justify-between gap-3 p-3 z-[90] border-t shadow-sm"
        style={{
          bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
          background: 'var(--color-content-surface)',
          borderColor: 'var(--color-content-border)',
        }}
      >
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-content-text-secondary)' }}>
            Service Mode
          </span>
          <span className="text-[13px] font-extrabold" style={{ color: 'var(--color-content-text)' }}>
            {SERVICE_MODES.find(m => m.id === selectedMode)?.label || 'Select Mode'}
          </span>
        </div>
        <button
          onClick={handleContinue}
          disabled={!selectedMode}
          className="h-11 px-5 border-none rounded-[var(--radius-btn)] font-bold text-[13px] flex items-center gap-1.5 transition-all duration-150"
          style={{
            background: selectedMode ? 'var(--color-accent)' : 'var(--color-content-border)',
            color: selectedMode ? '#fff' : 'var(--color-content-text-secondary)',
            cursor: selectedMode ? 'pointer' : 'not-allowed',
            opacity: selectedMode ? 1 : 0.6,
          }}
        >
          View Pricing <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
