'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Shield,
  Award,
  ChevronRight,
  Check,
  Clock,
  Smartphone,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

import catalogueService from '@/services/catalogue.service'
import { useBooking } from '@/context/BookingContext'
import { useBookingGuard } from '@/hooks/useBookingGuard'

/* ─── Tier visual config (keyed by tier.tier from DB) ──────────────────────── */
const TIER_STYLE_DEFAULTS = {
  Premium: {
    accentColor: '#d97706', // amber
    accentBg: 'rgba(217,119,6,0.08)',
    badge: 'Recommended',
    icon: <Award size={22} />,
  },
  Pro: {
    accentColor: '#2563eb', // blue
    accentBg: 'rgba(37,99,235,0.08)',
    badge: null,
    icon: <Shield size={22} />,
  },
  Basic: {
    accentColor: '#6b7280', // gray
    accentBg: 'rgba(107,114,128,0.08)',
    badge: null,
    icon: <Shield size={22} />,
  },
  Enterprise: {
    accentColor: '#9333ea', // purple
    accentBg: 'rgba(147,51,234,0.08)',
    badge: null,
    icon: <Award size={22} />,
  },
  Standard: {
    accentColor: '#16a34a', // green
    accentBg: 'rgba(22,163,74,0.08)',
    badge: null,
    icon: <Shield size={22} />,
  },
}

// Helper to get tier style (fallback to Pro style if tier not found)
function getTierStyle(tierName) {
  return (
    TIER_STYLE_DEFAULTS[tierName] || {
      accentColor: '#6366f1', // indigo
      accentBg: 'rgba(99,102,241,0.08)',
      badge: null,
      icon: <Shield size={22} />,
    }
  )
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function collectRepairTypeIds(symptoms) {
  const ids = new Set()
  ;(symptoms || []).forEach((s) => {
    ;(s.repairTypes || []).forEach((rt) => {
      const id = typeof rt === 'object' ? rt._id : rt
      if (id) ids.add(id)
    })
  })
  return [...ids]
}

/* ─── TierCard ──────────────────────────────────────────────────────────────── */
function TierCard({
  tier,
  isSelected,
  availability,
  onSelect,
  compact = false,
}) {
  const avail = availability[tier.tier]

  // Compute price first
  const totalPartsCost = avail?.totalPartsCost ?? null
  const totalLabourCost = avail?.totalLabourCost ?? null
  const hasPrice =
    totalPartsCost !== null && totalPartsCost + totalLabourCost > 0

  const displayPriceText = (() => {
    if (hasPrice) {
      return `₹${(totalPartsCost + totalLabourCost).toLocaleString('en-IN')}`
    }
    return 'Not Configured'
  })()

  const FALLBACK_IMAGES = {
    Original: '/images/tier-original.png',
    Premium: '/images/tier-premium.png',
    Compatible: '/images/tier-compatible.png',
  }

  const TIER_SUBTITLES = {
    Original: 'OEM CERTIFIED',
    Premium: 'A+++ GRADE',
    Compatible: 'ECONOMIC GRADE',
  }

  const isOriginal = tier.tier === 'Original'
  const warrantyMonths = tier.defaultWarrantyMonths || 0
  const warrantyText =
    warrantyMonths > 0
      ? `${warrantyMonths}-MONTH WARRANTY`
      : 'WARRANTY INCLUDED'

  return (
    <button
      onClick={() => onSelect(tier)}
      aria-pressed={isSelected}
      className={`tier-card-btn ${isSelected ? 'selected' : ''}`}
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 18,
        background: '#121212',
        cursor: 'pointer',
        textAlign: 'left',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: isSelected
          ? '2px solid #0088ff'
          : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isSelected ? '0 8px 25px rgba(0, 136, 255, 0.25)' : 'none',
        padding: 0,
      }}
    >
      {/* Card Image Header */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: compact ? 160 : 220,
          overflow: 'hidden',
          background: '#f5f5f7',
        }}
      >
        <img
          src={tier.image || FALLBACK_IMAGES[tier.tier]}
          alt={tier.tier}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Recommended Badge on top right (if Original) */}
        {isOriginal && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: '#ffffff',
              color: '#000000',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            Recommended
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div
        style={{
          padding: compact ? '16px 18px 20px 18px' : '22px 24px 26px 24px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Title & Subtitle & Price row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
            width: '100%',
          }}
        >
          <div>
            <div
              style={{
                fontSize: compact ? 18 : 22,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
              }}
            >
              {tier.tier}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 5,
              }}
            >
              {TIER_SUBTITLES[tier.tier] || `${tier.tier.toUpperCase()} GRADE`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: compact ? 18 : 22,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
              }}
            >
              {displayPriceText}
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: compact ? 12 : 13,
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.6,
            margin: '0 0 20px 0',
          }}
        >
          {tier.description}
        </p>

        {/* Footer Icon and Text */}
        <div
          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}
        >
          {isOriginal ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='3.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              >
                <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                <polyline points='22 4 12 14.01 9 11.01' />
              </svg>
              GENUINE SOURCING
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              <Shield
                size={14}
                strokeWidth={2}
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              />
              {warrantyText}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function SelectTierPage() {
  const router = useRouter()
  const {
    brand,
    model,
    symptoms,
    partTier: contextTier,
    setPartTier,
    category,
  } = useBooking()

  const [tiers, setTiers] = useState([])
  const [selectedTier, setSelectedTier] = useState(null)
  const [availability, setAvailability] = useState({})
  const [isLoadingTiers, setIsLoadingTiers] = useState(true)
  const [isCheckingPricing, setIsCheckingPricing] = useState(false)
  const [error, setError] = useState(null)

  /* Guard */
  const { isReady } = useBookingGuard({
    brand: true,
    model: true,
    symptoms: true,
  })

  /* Restore context state */
  useEffect(() => {
    if (contextTier) setSelectedTier(contextTier)
  }, [contextTier])

  /* Fetch part tiers from backend */
  useEffect(() => {
    catalogueService
      .getPartTiers()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
        )
        setTiers(sorted)
      })
      .catch(() => setError('Failed to load part tiers. Please try again.'))
      .finally(() => setIsLoadingTiers(false))
  }, [])

  /* Check pricing availability once tiers + symptoms are ready */
  useEffect(() => {
    if (!tiers.length || !symptoms?.length || !brand || !model) return
    const repairTypeIds = collectRepairTypeIds(symptoms)
    if (!repairTypeIds.length) return

    setIsCheckingPricing(true)
    Promise.all(
      tiers.map((tier) =>
        catalogueService
          .checkPricingAvailability({
            brandId: brand._id,
            modelId: model._id,
            repairTypeIds,
            partTier: tier.tier,
          })
          .then((result) => ({ tier: tier.tier, result }))
          .catch(() => ({ tier: tier.tier, result: null })),
      ),
    )
      .then((results) => {
        const avail = {}
        results.forEach(({ tier: tierName, result }) => {
          if (result?.results) {
            avail[tierName] = {
              available: result.allAvailable,
              totalPartsCost: result.results.reduce(
                (s, r) => s + (r.pricing?.partsCost || 0),
                0,
              ),
              totalLabourCost: result.results.reduce(
                (s, r) => s + (r.pricing?.labourCost || 0),
                0,
              ),
            }
          } else {
            avail[tierName] = null
          }
        })
        setAvailability(avail)
      })
      .finally(() => setIsCheckingPricing(false))
  }, [tiers, symptoms, brand, model])

  /* Continue handler — routes to /select-mode */
  const handleContinue = () => {
    if (!selectedTier) return
    setPartTier(selectedTier)
    router.push('/select-mode')
  }

  if (!isReady) return null

  const categoryName = category?.name || model?.categoryId?.name || 'Device'
  const canContinue = !!selectedTier

  const MATRIX_ROWS = [
    {
      feature: 'Display & Panel Type',
      original: 'OEM Retina / OLED',
      premium: 'High-grade OLED / LCD',
      compatible: 'Standard LCD',
    },
    {
      feature: 'Color Gamut & Contrast',
      original: '100% (Factory standard)',
      premium: '90-95% (Vibrant colors)',
      compatible: '80% (Standard color range)',
    },
    {
      feature: 'Touch Response & Refresh Rate',
      original: 'Super Smooth (120Hz/60Hz)',
      premium: 'Smooth & Responsive',
      compatible: 'Standard Touch',
    },
    {
      feature: 'Glass Durability',
      original: 'Corning Gorilla Glass',
      premium: 'Tempered / High-hardness Glass',
      compatible: 'Standard Glass',
    },
    {
      feature: 'Warranty Coverage',
      original: '24 Months Warranty',
      premium: '12 Months Warranty',
      compatible: '6 Months Warranty',
    },
  ]

  return (
    <>
      <style>{`
        .tier-card-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .tier-card-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .tier-card-btn.selected {
          border-color: #0088ff !important;
          box-shadow: 0 8px 25px rgba(0, 136, 255, 0.25) !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          DESKTOP ≥1024px
          ══════════════════════════════════════════════════════ */}
      <div className='home-desktop'>
        <div className='p-8' style={{ paddingBottom: 140 }}>
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#ffffff',
                textTransform: 'uppercase',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              SELECT PART QUALITY
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-content-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              Identify the component grade for high-precision restoration. Each
              grade is verified for structural integrity.
            </p>
          </div>

          {/* Cards Grid */}
          <div>
            {isLoadingTiers && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 20,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className='skeleton'
                    style={{ height: 360, borderRadius: 18 }}
                  />
                ))}
              </div>
            )}
            {!isLoadingTiers && error && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
            {!isLoadingTiers && !error && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${tiers.length || 3}, 1fr)`,
                  gap: 20,
                }}
              >
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
          </div>

          {/* Comparative Performance Matrix */}
          {!isLoadingTiers && !error && (
            <div
              style={{
                marginTop: 48,
                background: '#0d0d0f',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.05)',
                padding: 24,
                boxSizing: 'border-box',
              }}
            >
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  letterSpacing: '0.1em',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                >
                  <rect x='3' y='3' width='18' height='18' rx='2' />
                  <line x1='9' y1='3' x2='9' y2='21' />
                  <line x1='15' y1='3' x2='15' y2='21' />
                  <line x1='3' y1='9' x2='21' y2='9' />
                  <line x1='3' y1='15' x2='21' y2='15' />
                </svg>
                Comparative Performance Matrix
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <th
                        style={{
                          padding: '12px 16px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Attributes
                      </th>
                      <th
                        style={{
                          padding: '12px 16px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Original
                      </th>
                      <th
                        style={{
                          padding: '12px 16px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Premium
                      </th>
                      <th
                        style={{
                          padding: '12px 16px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Compatible
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX_ROWS.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom:
                            idx === MATRIX_ROWS.length - 1
                              ? 'none'
                              : '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <td
                          style={{
                            padding: '16px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#ffffff',
                          }}
                        >
                          {row.feature}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          {row.original}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          {row.premium}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          {row.compatible}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Sticky Bottom Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 'var(--sidebar-width)',
            right: 0,
            height: 90,
            background: '#0d0d0f',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '0 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
            boxShadow: '0 -8px 20px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Selected Quality
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                {selectedTier
                  ? `OEM Certified ${selectedTier.tier}`
                  : 'Select a part quality'}
              </span>
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Estimated Total
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                {(() => {
                  if (!selectedTier) return '—'
                  const avail = availability[selectedTier.tier]
                  const totalPartsCost = avail?.totalPartsCost ?? null
                  const totalLabourCost = avail?.totalLabourCost ?? null
                  const hasPrice =
                    totalPartsCost !== null &&
                    totalPartsCost + totalLabourCost > 0
                  if (hasPrice) {
                    return `₹${(totalPartsCost + totalLabourCost).toLocaleString('en-IN')}`
                  }
                  return 'Not Configured'
                })()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <button
              onClick={() => router.push('/select-symptoms')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseOver={(e) => (e.target.style.color = '#ffffff')}
              onMouseOut={(e) =>
                (e.target.style.color = 'rgba(255, 255, 255, 0.6)')
              }
            >
              Back to Diagnostics
            </button>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              style={{
                background: canContinue
                  ? '#ffffff'
                  : 'rgba(255, 255, 255, 0.1)',
                color: canContinue ? '#000000' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 28px',
                fontSize: 13,
                fontWeight: 800,
                cursor: canContinue ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              CONFIRM & PROCEED
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE <1024px
          ══════════════════════════════════════════════════════ */}
      <div
        className='home-mobile'
        style={{
          background: '#050505',
          minHeight: '100svh',
          paddingBottom: 160,
        }}
      >
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Mobile header */}
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#ffffff',
                marginBottom: 4,
              }}
            >
              SELECT PART TYPE
            </h1>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.6,
              }}
            >
              Choose the quality you prefer
            </p>
          </div>

          {/* List layout of row items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isLoadingTiers && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className='skeleton'
                    style={{ height: 80, borderRadius: 14 }}
                  />
                ))}
              </div>
            )}
            {!isLoadingTiers && error && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 24,
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
            {!isLoadingTiers && !error && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {tiers.map((tier) => {
                  const isSelected = selectedTier?._id === tier._id
                  const avail = availability[tier.tier]
                  const totalPartsCost = avail?.totalPartsCost ?? null
                  const totalLabourCost = avail?.totalLabourCost ?? null
                  const hasPrice =
                    totalPartsCost !== null &&
                    totalPartsCost + totalLabourCost > 0

                  const displayPriceText = (() => {
                    if (hasPrice) {
                      return `₹${(totalPartsCost + totalLabourCost).toLocaleString('en-IN')}`
                    }
                    return 'Market Price'
                  })()

                  const subtitleText = tier.description

                  return (
                    <button
                      key={tier._id}
                      onClick={() => setSelectedTier(tier)}
                      style={{
                        width: '100%',
                        background: '#121212',
                        border: isSelected
                          ? '1.5px solid #ffffff'
                          : '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        outline: 'none',
                        textAlign: 'left',
                        position: 'relative',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                        }}
                      >
                        {/* Custom Radio Button */}
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: isSelected
                              ? '2px solid #ffffff'
                              : '2px solid rgba(255,255,255,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: '#ffffff',
                              }}
                            />
                          )}
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: '#ffffff',
                            }}
                          >
                            {tier.tier}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.5)',
                              marginTop: 2,
                            }}
                          >
                            {subtitleText}
                          </div>
                          {tier.tier === 'Original' && (
                            <div
                              style={{
                                background: 'rgba(108,123,255,0.15)',
                                color: 'var(--color-accent)',
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                padding: '3px 8px',
                                borderRadius: 4,
                                marginTop: 6,
                                width: 'fit-content',
                              }}
                            >
                              Recommended
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        {displayPriceText && (
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: '#ffffff',
                            }}
                          >
                            {displayPriceText}
                          </span>
                        )}
                        {isSelected && (
                          <div style={{ color: '#ffffff' }}>
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='3.5'
                            >
                              <polyline points='20 6 9 17 4 12' />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div
            style={{
              textAlign: 'center',
              margin: '24px 0 16px 0',
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              fontStyle: 'italic',
            }}
          >
            * Price may vary after diagnosis
          </div>
        </div>

        {/* Mobile Sticky Bottom CTA */}
        <div
          style={{
            position: 'fixed',
            bottom:
              'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
            left: 0,
            right: 0,
            background: '#0d0d0f',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '16px 20px',
            zIndex: 90,
            boxShadow: '0 -4px 10px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            style={{
              width: '100%',
              height: 48,
              background: canContinue ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              color: canContinue ? '#000000' : 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 13,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            CONTINUE <span style={{ fontSize: 14 }}>→</span>
          </button>
        </div>
      </div>
    </>
  )
}
