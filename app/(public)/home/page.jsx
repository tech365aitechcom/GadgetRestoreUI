'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import {
  Bell,
  Search,
  Smartphone,
  Laptop,
  BatteryCharging,
  Microscope,
  Play,
  Scan,
  BookOpen,
  FileText,
  History,
  Sparkles,
  Plus,
  ArrowRight,
  ChevronRight,
  Tablet,
  Watch,
} from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import catalogueService from '@/services/catalogue.service';
import { useBooking } from '@/context/BookingContext';

/* ─── style helpers ─────────────────────────────────────────────────────── */
const S = {
  /* Dark card for mobile (scan, active repair, promo, live) */
  darkCard: {
    background: 'var(--color-bg-700)',          /* #111111 */
    border: '1px solid var(--color-bg-400)',     /* #252525 → nearest is bg-400 (#222) */
    borderRadius: 18,
  },
  /* Muted label on dark card */
  mutedLabel: { color: 'var(--color-text-dim)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' },
  /* Progress bar track */
  progressTrack: { height: 4, borderRadius: 4, background: 'var(--color-accent-tint-8)' },
  progressFill:  { height: 4, borderRadius: 4, width: '65%', background: 'var(--color-accent)' },
};

export default function HomePage() {
  const router = useRouter();
  const { reset, setCategory } = useBooking();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState('Guest');

  useEffect(() => {
    const token = Cookies.get('customer_token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setCustomerName(payload.name || payload.phoneNumber || 'Guest');
        } else {
          setCustomerName('Guest');
        }
      } catch { setCustomerName('Guest'); }
    }

    const fetchCategories = async () => {
      try {
        const data = await catalogueService.getCategories();
        if (data && data.length > 0) {
          const mapped = data.map((cat) => {
            let icon = Smartphone;
            const n = cat.name.toLowerCase();
            if (n.includes('phone') || n.includes('mobile'))                      icon = Smartphone;
            else if (n.includes('laptop') || n.includes('macbook'))               icon = Laptop;
            else if (n.includes('battery') || n.includes('power'))                icon = BatteryCharging;
            else if (n.includes('diagnose') || n.includes('diagnostic'))          icon = Microscope;
            else if (n.includes('tablet') || n.includes('ipad'))                  icon = Tablet;
            else if (n.includes('watch'))                                          icon = Watch;
            return { ...cat, icon };
          }).sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
          setCategories(mapped);
          setError(null);
        } else {
          setError('No service categories available at the moment.');
        }
      } catch (err) {
        setError('Failed to load service categories. Please try again later.');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Generic CTA — no category filter, fresh start
  const handleStart = () => { reset(); router.push('/select-brand'); };

  // Category-aware CTA — sets category context so brand page filters accordingly
  const handleCategorySelect = (cat) => {
    if (cat && cat._id) {
      // API-backed category: store it so select-brand can filter brands
      setCategory({ _id: cat._id, name: cat.name });
      router.push('/select-brand');
    }
  };

  return (
    <AppShell>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP  — shown only at ≥1024 px via .home-desktop CSS class
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-desktop">
        <div className="page-container" style={{ paddingBottom: 48 }}>

          {/* Welcome row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-content-text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                Welcome back, Hi {customerName}&nbsp;
                <span style={{ display: 'inline-block', animation: 'bounce 1s infinite' }}>👋</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-content-text-secondary)' }}>
                Here is what's happening in your workshop today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
              <div className="stat-card"><div className="stat-card-label">Queue Size</div><div className="stat-card-value">12</div></div>
              <div className="stat-card"><div className="stat-card-label">Avg Turnaround</div><div className="stat-card-value">4.2h</div></div>
            </div>
          </div>

          {/* Hero Banner */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 28, minHeight: 260, background: 'var(--color-bg-900)', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <Image src="/images/home-banner-top.png" alt="Workshop" width={1200} height={260} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} priority />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(5,5,5,0.95) 40%,rgba(5,5,5,0.25) 100%)' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, padding: '40px 48px', maxWidth: 520 }}>
              <span style={{ display: 'inline-block', background: 'var(--color-overlay-white-10)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, marginBottom: 16 }}>
                Special Offer
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: 12 }}>
                Get 20% Off on First Repair
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 28, lineHeight: 1.6 }}>
                Exclusive offer for new service registrations. Boost your conversion rates today.
              </p>
              <button onClick={handleStart} style={{ background: '#ffffff', color: '#000000', border: 'none', borderRadius: 12, padding: '13px 28px', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Claim Offer
              </button>
              <div style={{ marginTop: 14 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Limited Offer</span>
              </div>
            </div>
          </div>

          {/* 3-column cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>

            {/* Scan Serial */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20, padding: 24, cursor: 'pointer' }} onClick={handleStart}>
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-content-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-content-text-secondary)', marginBottom: 16 }}>
                  <Scan size={22} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-content-text)', marginBottom: 8 }}>Scan Serial</h3>
                <p style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.55 }}>
                  Identify and log device technical specifications instantly via barcode scanner.
                </p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleStart(); }} className="btn-primary" style={{ width: '100%', height: 42, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Start Scan <ArrowRight size={14} />
              </button>
            </div>

            {/* Active Repair */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20, padding: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-content-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-content-text-secondary)' }}>
                    <Smartphone size={22} />
                  </div>
                  <span className="badge badge-accent">In Progress</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-content-text)', marginBottom: 6 }}>Active Repair</h3>
                <p style={{ fontSize: 12, color: 'var(--color-content-text-secondary)', marginBottom: 14 }}>iPhone 13 Pro — Logic Board Diagnostic</p>
                <div style={S.progressTrack}><div style={S.progressFill} /></div>
              </div>
              <button onClick={() => router.push('/orders')} className="btn-accent" style={{ width: '100%', height: 42, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Track Order
              </button>
            </div>

            {/* Repair Manuals */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-content-text)', marginBottom: 18 }}>Repair Manuals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'iPhone 14 Tear-down',  sub: 'Last updated 2 days ago',       Icon: BookOpen },
                  { label: 'SMD Soldering Guide',   sub: 'Standard Operating Procedure',  Icon: FileText },
                  { label: 'Legacy Device Index',   sub: 'Archive for older models',       Icon: History  },
                ].map(({ label, sub, Icon }) => (
                  <a key={label} href="#"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px', borderRadius: 10, textDecoration: 'none', transition: 'background 150ms ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-content-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--color-content-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-content-text-secondary)', flexShrink: 0 }}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-content-text)', lineHeight: 1.3 }}>{label}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-content-text-secondary)' }}>{sub}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Service Selection */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">
                <Sparkles size={16} color="var(--color-content-text-secondary)" />
                Quick Service Selection
              </span>
            </div>
            {error ? (
              <div style={{
                padding: '32px 24px',
                background: 'var(--color-content-card)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 'var(--radius-card)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                </div>
                <p style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-danger)',
                  marginBottom: 8
                }}>
                  {error}
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'var(--color-content-text-secondary)',
                  marginBottom: 20
                }}>
                  You can still start a repair by clicking the button below.
                </p>
                <button
                  onClick={handleStart}
                  className="btn-primary"
                  style={{ margin: '0 auto' }}
                >
                  Start New Repair <ArrowRight size={14} />
                </button>
              </div>
            ) : isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-card)' }} />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div style={{
                padding: '32px 24px',
                background: 'var(--color-content-card)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 'var(--radius-card)',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-content-text-secondary)',
                  marginBottom: 20
                }}>
                  No service categories available
                </p>
                <button
                  onClick={handleStart}
                  className="btn-primary"
                  style={{ margin: '0 auto' }}
                >
                  Start New Repair <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {categories.map((cat, idx) => {
                  const CatIcon = cat.icon || Smartphone;
                  return (
                    <button key={idx} onClick={() => handleCategorySelect(cat)} className="service-card">
                      <div className="service-card-icon"><CatIcon size={21} /></div>
                      <span className="service-card-label">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Popular Services */}
          <div>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">⭐ Popular Services</span>
              <button onClick={handleStart} className="section-link">View All Services</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Screen Replacement */}
              <div className="popular-card" style={{ minHeight: 220, position: 'relative' }} onClick={handleStart}>
                <Image src="/images/home-banner-top.png" alt="Screen Replacement" width={600} height={220} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                <div className="popular-card-overlay" />
                <div className="popular-card-content">
                  <span className="badge badge-accent" style={{ marginBottom: 10, display: 'inline-flex' }}>Most Requested</span>
                  <h4 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>Screen Replacement</h4>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 14 }}>Original parts with 12-month warranty.</p>
                  <button onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Book Screen <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Liquid Damage */}
              <div className="popular-card" style={{ minHeight: 220, background: 'linear-gradient(135deg,#1a0a2e,#0d1117)' }} onClick={handleStart}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a0a2e,#0d1117)' }} />
                <div className="popular-card-overlay" />
                <div className="popular-card-content">
                  <span className="badge badge-accent" style={{ marginBottom: 10, display: 'inline-flex' }}>Advanced Repair</span>
                  <h4 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>Liquid Damage</h4>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 14 }}>Ultrasonic cleaning &amp; circuit restoration.</p>
                  <button onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Diagnose Board <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE  — shown only below 1024 px via .home-mobile CSS class
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile">
        <div style={{ background: 'var(--color-content-bg)', minHeight: '100svh', display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
        {/* Main scroll content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '68px 16px 0' }}>

          {/* Search bar */}
          <div
            onClick={handleStart}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', borderRadius: 12, cursor: 'pointer' }}
          >
            <Search size={16} color="var(--color-content-text-secondary)" />
            <span style={{ fontSize: 14, color: 'var(--color-content-text-secondary)' }}>Search device or issue...</span>
          </div>

          {/* Scan Serial */}
          <button
            onClick={handleStart}
            style={{ ...S.darkCard, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div>
              <span style={{ ...S.mutedLabel, display: 'block', marginBottom: 4 }}>Auto-Detect</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-btn-cta-bg)' }}>Scan Serial</span>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--color-overlay-white-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)', flexShrink: 0 }}>
              <Scan size={20} />
            </div>
          </button>

          {/* Active Repair */}
          <div style={{ ...S.darkCard, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ ...S.mutedLabel, display: 'block', marginBottom: 4 }}>Active Repair</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-btn-cta-bg)' }}>iPhone 13 Pro</h4>
              </div>
              <span className="badge badge-accent" style={{ marginTop: 2 }}>In Progress</span>
            </div>
            <div style={S.progressTrack}><div style={S.progressFill} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <span style={{ ...S.mutedLabel, display: 'block', marginBottom: 2 }}>Estimated Completion</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-btn-cta-bg)' }}>Today, 5:00 PM</span>
              </div>
              <button onClick={() => router.push('/orders')} style={{ background: 'var(--color-btn-cta-bg)', color: 'var(--color-btn-cta-text)', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer' }}>
                Track Order
              </button>
            </div>
          </div>

          {/* Quick Repair */}
          <div>
            <h4 style={{ ...S.mutedLabel, display: 'block', marginBottom: 12 }}>Quick Repair</h4>
            {error ? (
              <div style={{
                ...S.darkCard,
                padding: '24px 20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                </div>
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-danger)',
                  marginBottom: 6
                }}>
                  {error}
                </p>
                <p style={{
                  fontSize: 11,
                  color: '#888',
                  marginBottom: 16
                }}>
                  Use the search bar or scan button above to continue.
                </p>
              </div>
            ) : isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-card)' }} />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div style={{
                ...S.darkCard,
                padding: '24px 20px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: 13,
                  color: '#888',
                  marginBottom: 16
                }}>
                  No service categories available
                </p>
                <button
                  onClick={handleStart}
                  style={{
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Start Repair
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {categories.map((cat, idx) => {
                  const CatIcon = cat.icon || Smartphone;
                  return (
                    <button key={idx} onClick={() => handleCategorySelect(cat)} className="service-card" style={{ padding: '18px 12px' }}>
                      <div className="service-card-icon"><CatIcon size={20} /></div>
                      <span className="service-card-label" style={{ fontSize: 12 }}>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Watch Live Repair */}
          <div style={{ ...S.darkCard, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)', display: 'inline-block', animation: 'pulse 1.4s infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-danger)' }}>Live</span>
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-btn-cta-bg)', marginBottom: 3 }}>Watch Live Repair</h4>
              <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Streaming Now</span>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Play size={17} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
            </div>
          </div>

          {/* Promo Banner */}
          <div style={{ ...S.darkCard, padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden' }}>
              <Image src="/images/home-banner-top.png" alt="" width={400} height={200} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ ...S.mutedLabel, display: 'block', marginBottom: 6 }}>Promo</span>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-btn-cta-bg)', marginBottom: 6 }}>Get 20% Off on First Repair</h4>
              <p style={{ fontSize: 12, color: 'var(--color-text-dim)', lineHeight: 1.55, marginBottom: 16 }}>Exclusive offer for new service registrations.</p>
              <button onClick={handleStart} style={{ background: 'var(--color-btn-cta-bg)', color: 'var(--color-btn-cta-text)', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>
                Book Now
              </button>
            </div>
          </div>

          {/* Popular Services */}
          <div style={{ paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--color-content-text-secondary)' }}>Popular Services</span>
              <button onClick={handleStart} className="section-link">View All</button>
            </div>

            {/* Horizontal scroll */}
            <div className="scrollbar-none" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x mandatory' }}>
              {[
                { title: 'Screen Replacement', sub: 'Starts from ₹1,299', bg: 'linear-gradient(135deg,#1a1a2e,#0d1117)', useImg: true },
                { title: 'Battery Replacement', sub: 'Starts from ₹999',  bg: 'linear-gradient(135deg,#0a1628,#050f1e)' },
                { title: 'Liquid Damage',       sub: 'Expert chemical wash', bg: 'linear-gradient(135deg,#1a0a2e,#0d1117)' },
              ].map(({ title, sub, bg, useImg }) => (
                <div
                  key={title}
                  onClick={handleStart}
                  style={{ flexShrink: 0, width: 155, height: 195, borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer', scrollSnapAlign: 'start', background: bg, border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {useImg && <Image src="/images/home-banner-top.png" alt={title} width={155} height={195} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 14px' }}>
                    <h5 style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-btn-cta-bg)', lineHeight: 1.3, marginBottom: 3 }}>{title}</h5>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end flex column */}

        {/* Floating CTA */}
        <button
          onClick={handleStart}
          style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 40, background: 'var(--color-accent)', color: 'var(--color-btn-cta-bg)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '12px 20px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(108,123,255,0.4)', cursor: 'pointer' }}
        >
          <Plus size={17} /> Start Repair
        </button>

        <BottomNav />
        </div>{/* end inner flex wrapper */}
      </div>{/* end .home-mobile */}

    </AppShell>
  );
}
