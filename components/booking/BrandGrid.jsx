'use client'

import { useState, useMemo } from 'react'
import { Search, ScanLine } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { getBrandLogo } from '@/lib/utils'

/* ── Gear SVG (reusable decoration) ─────────────────────────────────────── */
const GearDecoration = () => (
  <svg
    viewBox='0 0 150 140'
    fill='white'
    xmlns='http://www.w3.org/2000/svg'
    style={{ width: '100%', height: '100%' }}
  >
    <path d='M133.589 52.8842L125.224 34.8074L107.147 26.4421L125.224 18.0768L133.589 0L141.955 18.0768L160.031 26.4421L141.955 34.8074L133.589 52.8842ZM45.6089 159.775L43.2691 141.474C41.7603 140.872 40.1438 140.07 38.4195 139.068C36.6952 138.065 35.2454 136.976 34.0702 135.801L17.019 143.237L0 113.397L14.7435 102.532C14.5298 100.887 14.423 99.1345 14.423 97.2754C14.423 95.4164 14.5298 93.6642 14.7435 92.0189L0 81.1536L17.019 51.3143L34.0702 58.7502C35.2454 57.5749 36.6952 56.486 38.4195 55.4833C40.1438 54.4806 41.7603 53.6785 43.2691 53.0769L45.6089 34.7757H79.9032L82.2429 53.0769C83.7517 53.6785 85.3682 54.4806 87.0925 55.4833C88.8168 56.486 90.2666 57.5749 91.4419 58.7502L108.493 51.3143L125.512 81.1536L110.769 92.0189C110.982 93.6642 111.089 95.4164 111.089 97.2754C111.089 99.1345 110.982 100.887 110.769 102.532L125.512 113.397L108.493 143.237L91.4419 135.801C90.2666 136.976 88.8168 138.065 87.0925 139.068C85.3682 140.07 83.7517 140.872 82.2429 141.474L79.9032 159.775H45.6089Z' />
  </svg>
)

/* ── "Can't Find" dark banner ─────────────────────────────────────────────── */
export function CantFindBanner({ desktop = false }) {
  return (
    <div
      className={`cant-find-banner${desktop ? ' cant-find-banner-desktop' : ''}`}
    >
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <div className='cant-find-title'>Can't find your model?</div>
        <p className='cant-find-desc'>
          Our technicians can repair older legacy devices. Contact support for a
          custom quote.
        </p>
        <a href='tel:+918800003785' className='cant-find-cta'>
          Connect with Specialist <span style={{ fontSize: 15 }}>↗</span>
        </a>
      </div>
      <div className='cant-find-gear' style={{ width: 220, height: 220 }}>
        <GearDecoration />
      </div>
    </div>
  )
}

/* ── Trust badges (desktop only) ──────────────────────────────────────────── */
export function TrustBadges() {
  const items = [
    {
      icon: '🛡️',
      title: 'Certified Technicians',
      sub: 'Expert repair professionals',
    },
    { icon: '🔧', title: 'Warranty on Repairs', sub: 'Upto 6 months warranty' },
    { icon: '⚡', title: 'Quick & Reliable', sub: 'On-time service delivery' },
    { icon: '🔒', title: 'Secure & Safe', sub: 'Your device is in safe hands' },
  ]
  return (
    <div className='trust-row'>
      {items.map(({ icon, title, sub }) => (
        <div key={title} className='trust-item'>
          <div
            className='trust-icon'
            style={{ background: '#1a1a1a', fontSize: 18 }}
          >
            {icon}
          </div>
          <div>
            <span className='trust-text-title'>{title}</span>
            <span className='trust-text-sub'>{sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Scan Serial Button ────────────────────────────────────────────────────── */
export function ScanSerialButton({ compact = false }) {
  return (
    <button
      className='scan-serial-card'
      style={compact ? { minWidth: 200 } : { width: '100%' }}
      aria-label='Scan serial number'
    >
      <div>
        <span className='scan-serial-card-label'>Auto-Detect</span>
        <span className='scan-serial-card-title'>Scan Serial</span>
        {!compact && (
          <div
            style={{
              marginTop: 6,
              height: 3,
              width: 60,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '40%',
                background: '#6C7BFF',
                borderRadius: 3,
              }}
            />
          </div>
        )}
      </div>
      <div className='scan-serial-icon'>
        <ScanLine size={20} />
      </div>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   BRAND GRID
   ══════════════════════════════════════════════════════════════════════════ */
export default function BrandGrid({
  brands = [],
  isLoading,
  onSelectBrand,
  selectedBrandId,
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return brands
    const q = search.toLowerCase()
    return brands.filter((b) => b.name.toLowerCase().includes(q))
  }, [brands, search])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
      }}
    >
      {/* Search */}
      <div className='search-input-row'>
        <Search size={17} color='var(--color-content-text-secondary)' />
        <input
          type='text'
          placeholder='Search your brand...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete='off'
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-content-text-secondary)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='skeleton brand-grid-skeleton' />
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
          /* Override for desktop: 4 columns via the page layout */
          className='brand-grid-inner'
        >
          {filtered.map((brand) => {
            const isSelected = selectedBrandId === brand._id
            const logoUrl = getBrandLogo(brand.name, brand.logo)
            return (
              <button
                key={brand._id}
                className={`brand-card${isSelected ? ' selected' : ''}`}
                onClick={() => onSelectBrand(brand)}
                aria-pressed={isSelected}
              >
                <div className='brand-card-logo'>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: ['google', 'realme'].includes(
                          brand.name.toLowerCase(),
                        )
                          ? 'none'
                          : 'var(--brand-logo-filter)',
                      }}
                      loading='lazy'
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      display: logoUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      fontSize: 22,
                      fontWeight: 900,
                      color: 'var(--color-content-text-secondary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {brand.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className='brand-card-name'>{brand.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: 'var(--color-content-text-secondary)',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            No brands found
          </div>
          <div style={{ fontSize: 13 }}>No results for "{search}"</div>
        </div>
      )}
    </div>
  )
}
