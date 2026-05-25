'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Check,
  Smartphone,
  FlaskConical,
  Home,
  Truck,
  Lock,
  Award,
  Shield,
} from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import { useBooking } from '@/context/BookingContext';
import catalogueService from '@/services/catalogue.service';

/* ─── Service mode config (Phase 1: Lab only) ───────────────────────────────── */
const SERVICE_MODES = [
  {
    id: 'lab',
    label: 'Lab (Pick & Drop)',
    description: 'We pick up, repair at lab, deliver back.',
    icon: <Truck size={24} strokeWidth={1.5} />,
    active: true,
    badges: ['Secure', 'Convenient'],
    est: 'Est. Delivery: 48h',
  },
  {
    id: 'doorstep',
    label: 'Doorstep Repair',
    description: 'Certified technician comes to your location and repairs on-site.',
    icon: <Home size={24} strokeWidth={1.5} />,
    active: false,
    badges: ['Premium Service', 'Fastest'],
    est: 'Est. Start: Today',
  },
];

/* ─── ServiceModeCard ────────────────────────────────────────────────────────── */
function ServiceModeCard({ mode, isSelected, onSelect }) {
  return (
    <button
      onClick={() => mode.active && onSelect(mode.id)}
      disabled={!mode.active}
      aria-pressed={isSelected}
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        padding: '24px',
        border: isSelected
          ? '2px solid var(--color-accent)'
          : '1px solid transparent',
        borderRadius: 'var(--radius-card)',
        background: 'var(--color-content-card)',
        cursor: mode.active ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        outline: 'none',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 4px 14px rgba(108,123,255,0.12)' : '0 1px 6px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ opacity: mode.active ? 1 : 0.35, display: 'flex', flexDirection: 'column', gap: 16, width: '100%', pointerEvents: 'none' }}>
        {/* Badges */}
        {mode.badges && mode.badges.length > 0 && (
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4
          }}>
            {mode.badges.map((b, i) => (
              <span key={i} style={{
                background: '#F2F2F2', color: '#111',
                fontSize: 9, fontWeight: 800, letterSpacing: '0.07em',
                textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999,
              }}>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Icon */}
        <div style={{
          color: 'var(--color-content-text)',
        }}>
          {mode.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{
            fontSize: 20, fontWeight: 800,
            color: 'var(--color-content-text)',
            marginBottom: 10,
          }}>
            {mode.label}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.6, minHeight: 62 }}>
            {mode.description}
          </div>
        </div>

        <div style={{ 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: 8,
          borderTop: '1px solid var(--color-content-border)',
          paddingTop: 20
        }}>
           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-content-text)' }}>{mode.est}</span>
           <ChevronRight size={18} strokeWidth={2} color="var(--color-content-text)" />
        </div>
      </div>

      {!mode.active && (
         <div style={{ position: 'absolute', top: 115, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
            <span style={{ background: '#555555', color: '#fff', fontSize: 10, fontWeight: 800, padding: '8px 14px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 32 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-content-text)' }}>
        Additional Remarks (Optional)
      </h3>
      <div style={{ position: 'relative' }}>
        <textarea
          id="booking-remarks"
          rows={4}
          maxLength={MAX}
          placeholder="Describe your device condition, accessories included, or any special instructions for our engineer."
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX))}
          style={{
            width: '100%',
            padding: '16px',
            paddingRight: 60,
            background: 'var(--color-content-card)',
            border: '1px solid var(--color-content-border)',
            borderRadius: 'var(--radius-input, 12px)',
            color: 'var(--color-content-text)',
            fontSize: 14,
            outline: 'none',
            resize: 'none',
            lineHeight: 1.6,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 4px rgba(108,123,255,0.1)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--color-content-border)'; e.target.style.boxShadow = 'none'; }}
        />
        <span style={{
          position: 'absolute', bottom: 16, right: 16,
          fontSize: 12, fontWeight: 700,
          color: isNearLimit ? 'var(--color-warning)' : 'var(--color-content-text-secondary)',
          pointerEvents: 'none',
        }}>
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

  const [selectedMode, setSelectedMode] = useState('lab');
  const [remarksText, setRemarksText] = useState('');

  /* Guard */
  useEffect(() => {
    if (!brand) { router.replace('/select-brand'); return; }
    if (!model) { router.replace('/select-model'); return; }
    if (!symptoms?.length) { router.replace('/select-symptoms'); return; }
    if (!partTier) { router.replace('/select-tier'); return; }
  }, [brand, model, symptoms, partTier, router]);

  /* Restore context state */
  useEffect(() => {
    if (contextServiceMode) setSelectedMode(contextServiceMode);
    if (contextRemarks) setRemarksText(contextRemarks);
  }, [contextServiceMode, contextRemarks]);

  /* Continue handler — routes to /pricing */
  const handleContinue = () => {
    setServiceMode(selectedMode);
    setRemarks(remarksText);
    router.push('/pricing');
  };

  if (!brand || !model || !symptoms?.length || !partTier) return null;

  return (
    <AppShell>

      {/* ══════════════════════════════════════════════════════
          DESKTOP ≥1024px
          ══════════════════════════════════════════════════════ */}
      <div className="home-desktop">
        <div className="page-container" style={{ paddingBottom: 60, maxWidth: 1280 }}>
          
          <div style={{ marginBottom: 40 }}>
            <button
              onClick={() => router.push('/select-tier')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 14, padding: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}
            >
              <ArrowLeft size={14} /> Back to Part Quality
            </button>
            <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-content-text)', marginBottom: 12 }}>
              Service Mode
            </h1>
            <p style={{ fontSize: 16, color: 'var(--color-content-text-secondary)', lineHeight: 1.6, maxWidth: 640 }}>
              Choose how you would like your device to be handled. Each option includes our signature multi-point inspection and certified repair guarantee.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 48 }}>
             {SERVICE_MODES.map((mode) => (
               <ServiceModeCard
                 key={mode.id}
                 mode={mode}
                 isSelected={selectedMode === mode.id}
                 onSelect={setSelectedMode}
               />
             ))}
          </div>
          
          {/* Bottom Banner Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'stretch' }}>
             
             {/* Left: Banner + Remarks */}
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <div style={{ 
                     background: '#2B2B2B', 
                     borderRadius: 'var(--radius-card)', 
                     overflow: 'hidden',
                     display: 'flex',
                     color: '#fff',
                     position: 'relative'
                 }}>
                     <div style={{ padding: '48px 40px', flex: 1, zIndex: 2 }}>
                         <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A0A0A0', marginBottom: 16 }}>
                             The Repair.co Promise
                         </div>
                         <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
                             Precision is not an option; it is our standard.
                         </h2>
                         <p style={{ fontSize: 15, color: '#CCCCCC', lineHeight: 1.6, marginBottom: 32, maxWidth: 440 }}>
                             Every repair is backed by a comprehensive 12-month warranty. We use only OEM-grade components to ensure your hardware maintains its original factory integrity and performance metrics.
                         </p>
                         <div style={{ display: 'flex', gap: 24 }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                 <Award size={16} /> 12-Month Warranty
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                 <Shield size={16} /> OEM Certified Parts
                             </div>
                         </div>
                     </div>
                     <div style={{ width: '35%', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, #2B2B2B, transparent)', zIndex: 1 }} />
                        <img src="/images/service-mode-banner.png" alt="Precision Repair" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                 </div>

                 <RemarksField value={remarksText} onChange={setRemarksText} />
             </div>

             {/* Right: Summary panel */}
             <div>
               <div style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', borderRadius: 'var(--radius-card)', padding: 24, position: 'sticky', top: 96, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-content-text)', marginBottom: 16, borderBottom: '1px solid var(--color-content-divider)', paddingBottom: 12 }}>
                    Repair Summary
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--color-content-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-content-text-secondary)', textTransform: 'uppercase', display: 'block' }}>{brand.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-content-text)' }}>{model.name}</span>
                    </div>
                  </div>

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

                  <div style={{ background: 'var(--color-content-bg)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-content-text-secondary)' }}>Part Quality</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-content-text)' }}>{partTier.tier} Parts</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--color-content-divider)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-content-text-secondary)' }}>Repair Mode</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>
                        {SERVICE_MODES.find(m => m.id === selectedMode)?.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    style={{
                      width: '100%',
                      height: 'var(--btn-height-primary)',
                      background: 'var(--color-accent)',
                      color: '#fff',
                      border: 'none', borderRadius: 'var(--radius-btn)',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 16px rgba(108,123,255,0.25)',
                    }}
                  >
                    View Pricing <ChevronRight size={16} />
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
          
          <div className="top-bar">
            <button onClick={() => router.push('/select-tier')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <img src="/gadget-restore-logo.svg" alt="Gadget Restore" style={{ height: 28, objectFit: 'contain' }} />
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', width: 36, height: 36, justifyContent: 'center', borderRadius: '50%' }}>
              <Bell size={20} />
            </button>
          </div>

          <div className="step-progress">
            <div className="step-dot done" />
            <div className="step-dot done" />
            <div className="step-dot done" />
            <div className="step-dot done" />
            <div className="step-dot active" />
          </div>

          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-content-text)', marginBottom: 8 }}>
                Service Mode
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.6 }}>
                Choose how you would like your device to be handled.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {SERVICE_MODES.map((mode) => (
                 <ServiceModeCard
                   key={mode.id}
                   mode={mode}
                   isSelected={selectedMode === mode.id}
                   onSelect={setSelectedMode}
                 />
               ))}
            </div>

            <div style={{ 
                 background: '#2B2B2B', 
                 borderRadius: 'var(--radius-card)', 
                 overflow: 'hidden',
                 color: '#fff',
                 marginTop: 16
             }}>
                 <img src="/images/service-mode-banner.png" alt="Precision Repair" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                 <div style={{ padding: '24px' }}>
                     <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.02em' }}>
                         Precision is not an option; it is our standard.
                     </h2>
                     <p style={{ fontSize: 13, color: '#CCCCCC', lineHeight: 1.6, marginBottom: 20 }}>
                         Every repair is backed by a comprehensive 12-month warranty with OEM-grade components.
                     </p>
                 </div>
             </div>

             <RemarksField value={remarksText} onChange={setRemarksText} />
          </div>

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
                Service Mode
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-content-text)' }}>
                {SERVICE_MODES.find(m => m.id === selectedMode)?.label}
              </span>
            </div>
            <button
              onClick={handleContinue}
              style={{
                height: 44, padding: '0 22px',
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none', borderRadius: 'var(--radius-btn)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              View Pricing <ChevronRight size={14} />
            </button>
          </div>

          <BottomNav />
        </div>
      </div>
    </AppShell>
  );
}
