'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Shield,
  Smartphone,
  Truck,
  Home,
  Check,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react'

import AppShell from '@/components/layout/AppShell'
import BottomNav from '@/components/ui/BottomNav'
import { useBooking } from '@/context/BookingContext'
import catalogueService from '@/services/catalogue.service'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function collectRepairTypeIds(symptoms) {
  const ids = new Set()
    ; (symptoms || []).forEach((s) => {
      ; (s.repairTypes || []).forEach((rt) => {
        const id = typeof rt === 'object' ? rt._id : rt
        if (id) ids.add(id)
      })
    })
  return [...ids]
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const router = useRouter()
  const {
    brand,
    model,
    symptoms,
    partTier,
    serviceMode,
    remarks,
    canProceedToBook,
  } = useBooking()

  const [pricingResults, setPricingResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  /* Guard */
  useEffect(() => {
    if (!brand || !model || !symptoms?.length || !partTier || !serviceMode) {
      router.replace('/select-tier')
    }
  }, [brand, model, symptoms, partTier, serviceMode, router])

  /* Fetch exact pricing breakdown */
  useEffect(() => {
    if (!brand || !model || !symptoms?.length || !partTier) return

    const repairTypeIds = collectRepairTypeIds(symptoms)
    if (!repairTypeIds.length) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    catalogueService
      .checkPricingAvailability({
        brandId: brand._id,
        modelId: model._id,
        repairTypeIds,
        partTier: partTier.tier,
      })
      .then((result) => {
        setPricingResults(result)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load technical quote. Please try again.')
      })
      .finally(() => setIsLoading(false))
  }, [brand, model, symptoms, partTier])

  if (!brand || !model || !symptoms?.length || !partTier || !serviceMode)
    return null

  // Compute Itemized Pricing per Symptom
  const hasPricingData =
    pricingResults &&
    pricingResults.results &&
    pricingResults.results.length > 0
  let grandTotal = 0
  let hasVariableSymptom = false

  const itemizedSymptoms = symptoms.map((symp) => {
    let sympParts = 0
    let sympLabour = 0
    let sympIsVariable = false

    if (hasPricingData) {
      const rTypes = symp.repairTypes || []
      rTypes.forEach((rtId) => {
        const id = typeof rtId === 'object' ? rtId._id : rtId
        // Coerce both sides to String — repairTypeId from API may be a plain string
        // while rt._id from context could be a Mongoose ObjectId-derived string
        const res = pricingResults.results.find((r) => String(r.repairTypeId) === String(id))
        if (!res || !res.available || !res.pricing) {
          sympIsVariable = true
        } else {
          sympParts += res.pricing.partsCost || 0
          sympLabour += res.pricing.labourCost || 0
        }
      })
    } else {
      sympIsVariable = true
    }

    // Fallback if total is zero
    if (sympParts + sympLabour === 0) sympIsVariable = true

    if (sympIsVariable) hasVariableSymptom = true
    else grandTotal += sympParts + sympLabour

    return {
      ...symp,
      isVariable: sympIsVariable,
      partsCost: sympParts,
      labourCost: sympLabour,
      total: sympParts + sympLabour,
    }
  })

  // Generate a mock quote ID
  const quoteId = `RC-${Math.floor(100 + Math.random() * 900)}-${brand.name.substring(0, 2).toUpperCase()}`

  /* Handlers */
  const handleConfirm = () => {
    if (!canProceedToBook) return

    // Check if user is already logged in
    const token = Cookies.get(TOKEN_COOKIE)
    if (token) {
      router.push('/schedule')
      return
    }

    // Store intended redirect URL before navigating to login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gr_redirect_after_login', '/schedule')
    }
    router.push('/login')
  }

  return (
    <AppShell>
      {/* ══════════════════════════════════════════════════════
          DESKTOP ≥1024px
          ══════════════════════════════════════════════════════ */}
      <div
        className='home-desktop'
        style={{ background: 'var(--color-content-bg)', color: 'var(--color-content-text)', minHeight: '100svh' }}
      >
        <div
          className='p-8'
          style={{ paddingBottom: 60, maxWidth: 1200 }}
        >
          <div style={{ marginBottom: 40, paddingTop: 20 }}>
            <button
              onClick={() => router.push('/select-mode')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-content-text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 24,
                padding: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              <ArrowLeft size={14} /> Back to Service Mode
            </button>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--color-content-text)',
                marginBottom: 12,
              }}
            >
              Review & Quote
            </h1>
            <p
              style={{
                fontSize: 16,
                color: 'var(--color-content-text-secondary)',
                lineHeight: 1.6,
                maxWidth: 640,
              }}
            >
              Please review your selection before finalizing the booking.{' '}
              <span style={{ color: 'var(--color-content-text)', fontWeight: 600 }}>
                Quote ID: {quoteId}
              </span>
            </p>
          </div>

          {isLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 32,
                alignItems: 'start',
              }}
            >
              {/* Left column skeleton */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Device card skeleton */}
                <div className="skeleton" style={{ borderRadius: 'var(--radius-card)', height: 200 }} />
                {/* Diagnostic summary skeleton */}
                <div
                  className="skeleton"
                  style={{ borderRadius: 'var(--radius-card)', height: 180 }}
                />
              </div>
              {/* Right column skeleton (sticky quote card) */}
              <div className="skeleton" style={{ borderRadius: 'var(--radius-card)', height: 420 }} />
            </div>
          ) : error ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: 'var(--color-danger)',
              }}
            >
              {error}
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: 32,
                  alignItems: 'start',
                }}
              >
                {/* Left Column */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                >
                  {/* Device Card */}
                  <div
                    style={{
                      background: 'var(--color-content-card)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--color-content-border)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '32px 32px 24px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                      }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 120,
                          background: 'var(--theme-bg)',
                          borderRadius: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Smartphone
                          size={48}
                          color='var(--color-accent)'
                          strokeWidth={1}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            display: 'inline-block',
                            background: 'var(--color-content-border)',
                            color: 'var(--color-content-text)',
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: 999,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: 12,
                          }}
                        >
                          {partTier.tier} Quality Parts
                        </div>
                        <h2
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: 'var(--color-content-text)',
                            marginBottom: 6,
                          }}
                        >
                          {brand.name} {model.name}
                        </h2>
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--color-content-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <FileText size={14} /> Model Details: Verified
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 1,
                        background: 'var(--color-content-border)',
                        borderTop: '1px solid var(--color-content-border)',
                      }}
                    >
                      <div
                        style={{ background: 'var(--color-content-card)', padding: '20px 24px' }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--color-content-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Truck size={12} /> Repair Mode
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--color-content-text)',
                          }}
                        >
                          {serviceMode === 'lab'
                            ? 'Pick and Drop'
                            : 'Doorstep Repair'}
                        </div>
                      </div>
                      <div
                        style={{ background: 'var(--color-content-card)', padding: '20px 24px' }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--color-content-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Clock size={12} /> Est. Time
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--color-content-text)',
                          }}
                        >
                          {serviceMode === 'lab' ? '48 Hours' : 'Today'}
                        </div>
                      </div>
                      <div
                        style={{ background: 'var(--color-content-card)', padding: '20px 24px' }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--color-content-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Shield size={12} /> Warranty
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--color-content-text)',
                          }}
                        >
                          {partTier.defaultWarrantyMonths} Months
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Summary */}
                  <div
                    style={{
                      background: 'var(--color-content-card)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--color-content-border)',
                      padding: 32,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: 'var(--color-content-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: 24,
                      }}
                    >
                      Diagnostic Summary
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      {symptoms.map((symp, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: 16,
                            borderBottom:
                              i < symptoms.length - 1
                                ? '1px solid var(--color-content-border)'
                                : 'none',
                          }}
                        >
                          <span style={{ fontSize: 14, color: 'var(--color-content-text)' }}>
                            {symp.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: 'var(--color-danger)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              padding: '4px 10px',
                              borderRadius: 999,
                            }}
                          >
                            REQUIRES ATTENTION
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Quote */}
                <div
                  style={{
                    background: 'var(--color-content-card)',
                    borderRadius: 'var(--radius-card)',
                    padding: 40,
                    border: '1px solid var(--color-content-border)',
                    position: 'sticky',
                    top: 40,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 32,
                    }}
                  >
                    <FileText size={20} color='var(--color-accent)' />
                    <h3
                      style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-content-text)' }}
                    >
                      Technical Quote
                    </h3>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 24,
                      paddingBottom: 32,
                      borderBottom: '1px solid var(--color-content-border)',
                    }}
                  >
                    {itemizedSymptoms.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          paddingBottom:
                            idx < itemizedSymptoms.length - 1 ? 24 : 0,
                          borderBottom:
                            idx < itemizedSymptoms.length - 1
                              ? '1px dashed var(--color-content-border)'
                              : 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: 'var(--color-content-text)',
                                marginBottom: 6,
                              }}
                            >
                              {item.name}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 8,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 800,
                                  color: '#111',
                                  background: '#F2F2F2',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                {partTier.tier} Quality
                              </span>
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 800,
                                  color: 'var(--color-accent)',
                                  background: 'rgba(108,123,255,0.1)',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                {partTier.defaultWarrantyMonths} Mo Warranty
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: 'var(--color-content-text)',
                            }}
                          >
                            {item.isVariable
                              ? 'Ask Admin'
                              : `₹${item.total.toLocaleString('en-IN')}`}
                          </div>
                        </div>

                        {!item.isVariable && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 12,
                              color: 'var(--color-content-text-secondary)',
                            }}
                          >
                            <span>
                              Part: ₹{item.partsCost.toLocaleString('en-IN')}
                            </span>
                            <span>
                              Labour: ₹{item.labourCost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {hasVariableSymptom && (
                    <div
                      style={{
                        padding: '24px 0',
                        borderBottom: '1px solid var(--color-content-border)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          background: 'rgba(245,158,11,0.1)',
                          padding: 16,
                          borderRadius: 12,
                        }}
                      >
                        <AlertCircle
                          size={18}
                          color='var(--color-warning)'
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: 'var(--color-warning)',
                              marginBottom: 4,
                            }}
                          >
                            Post-diagnosis estimate required
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: 'var(--color-content-text-secondary)',
                              lineHeight: 1.5,
                            }}
                          >
                            Final cost confirmed after diagnosis. One or more
                            selected repairs require inspection before a quote
                            can be provided.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ paddingTop: 32, paddingBottom: 40 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--color-content-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: 8,
                      }}
                    >
                      Grand Total
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 48,
                          fontWeight: 900,
                          color: 'var(--color-content-text)',
                          letterSpacing: '-0.02em',
                          lineHeight: 1,
                        }}
                      >
                        {hasVariableSymptom && grandTotal === 0 ? (
                          'Ask Admin'
                        ) : (
                          <span>
                            {hasVariableSymptom ? (
                              <span
                                style={{
                                  fontSize: 24,
                                  fontWeight: 600,
                                  color: 'var(--color-content-text-secondary)',
                                  marginRight: 8,
                                }}
                              >
                                Starting from
                              </span>
                            ) : (
                              ''
                            )}
                            ₹{grandTotal.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Bottom Action Bar */}
              <div
                style={{
                  marginTop: 24,
                  background: 'var(--theme-btn-primary-bg)',
                  borderRadius: 'var(--radius-card)',
                  padding: '24px 32px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: 'var(--theme-btn-primary-text)',
                  }}
                >
                  <AlertCircle size={20} color='var(--theme-btn-primary-text)' />
                  <span
                    style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}
                  >
                    By continuing, you agree to our Service Terms & Genuine
                    <br />
                    Part Policy.
                  </span>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!canProceedToBook}
                  style={{
                    height: 56,
                    padding: '0 40px',
                    background: 'var(--theme-btn-primary-text)',
                    color: 'var(--theme-btn-primary-bg)',
                    border: 'none',
                    borderRadius: 'var(--radius-btn)',
                    fontWeight: 800,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: canProceedToBook ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    transition: 'all 0.2s ease',
                    opacity: canProceedToBook ? 1 : 0.5,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow =
                      '0 8px 24px rgba(0,0,0,0.2)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Confirm & Continue <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE <1024px
          ══════════════════════════════════════════════════════ */}
      <div
        className='home-mobile'
        style={{
          background: 'var(--color-content-bg)',
          color: 'var(--color-content-text)',
          minHeight: '100svh',
          paddingBottom: 160,
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* heading placeholder */}
            <div>
              <div className="skeleton" style={{ height: 32, width: '60%', borderRadius: 8, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 6 }} />
            </div>
            {/* Device summary card skeleton */}
            <div className="skeleton" style={{ borderRadius: 'var(--radius-card)', height: 200 }} />
            {/* Quote card skeleton */}
            <div className="skeleton" style={{ borderRadius: 'var(--radius-card)', height: 320 }} />
          </div>
        ) : error ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--color-danger)',
            }}
          >
            {error}
          </div>
        ) : (
          <div
            style={{
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-content-text)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Review & Quote
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-mid)', lineHeight: 1.5 }}>
                Please review your selection before finalizing the booking.
              </p>
            </div>

            {/* Device Summary Card */}
            <div
              style={{
                background: 'var(--color-content-card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-content-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderBottom: '1px solid var(--color-content-border)',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 74,
                    background: 'var(--color-content-bg)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Smartphone
                    size={32}
                    color='var(--color-accent)'
                    strokeWidth={1}
                  />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--color-content-text)',
                      marginBottom: 4,
                    }}
                  >
                    {brand.name} {model.name}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--color-content-text-secondary)' }}>
                    {symptoms.length} Selected Symptoms
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-content-text-secondary)' }}>
                    Part Type
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-content-text)' }}
                  >
                    {partTier.tier}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-content-text-secondary)' }}>
                    Repair Mode
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-content-text)' }}
                  >
                    {serviceMode === 'lab' ? 'Pick & Drop' : 'Doorstep Repair'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-content-text-secondary)' }}>
                    Estimated Time
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-content-text)' }}
                  >
                    {serviceMode === 'lab' ? '48 Hours' : 'Today'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-content-text-secondary)' }}>
                    Warranty
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-content-text)' }}
                  >
                    {partTier.defaultWarrantyMonths} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div
              style={{
                background: 'var(--color-content-card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-content-border)',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  borderBottom: '1px solid var(--color-content-border)',
                  paddingBottom: 24,
                  marginBottom: 24,
                }}
              >
                {itemizedSymptoms.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--color-content-text)',
                          flex: 1,
                          paddingRight: 16,
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-content-text)' }}
                      >
                        {item.isVariable
                          ? 'Ask Admin'
                          : `₹${item.total.toLocaleString('en-IN')}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#111',
                          background: '#F2F2F2',
                          padding: '3px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {partTier.tier}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: 'var(--color-accent)',
                          background: 'rgba(108,123,255,0.1)',
                          padding: '3px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {partTier.defaultWarrantyMonths} Mo Warranty
                      </span>
                    </div>
                    {!item.isVariable && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          fontSize: 11,
                          color: 'var(--color-content-text-secondary)',
                          marginTop: 4,
                        }}
                      >
                        <span>
                          Part: ₹{item.partsCost.toLocaleString('en-IN')}
                        </span>
                        <span>
                          Labour: ₹{item.labourCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {hasVariableSymptom && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    background: 'rgba(245,158,11,0.1)',
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 24,
                  }}
                >
                  <AlertCircle
                    size={16}
                    color='var(--color-warning)'
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div
                    style={{ fontSize: 12, color: 'var(--color-content-text)', lineHeight: 1.5 }}
                  >
                    <strong
                      style={{
                        color: 'var(--color-warning)',
                        display: 'block',
                        marginBottom: 2,
                      }}
                    >
                      Post-diagnosis estimate required
                    </strong>
                    Final cost confirmed after diagnosis.
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-content-text)' }}>
                  Total Amount
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: 'var(--color-content-text)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    textAlign: 'right',
                  }}
                >
                  {hasVariableSymptom && grandTotal === 0 ? (
                    'Ask Admin'
                  ) : (
                    <>
                      {hasVariableSymptom && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--color-content-text-secondary)',
                            marginBottom: 4,
                          }}
                        >
                          Starting from
                        </span>
                      )}
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </>
                  )}
                </span>
              </div>

              {!hasVariableSymptom && (
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--color-content-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textAlign: 'right',
                    marginBottom: 24,
                  }}
                >
                  * FINAL PRICE MAY VARY AFTER DIAGNOSIS
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <AlertCircle
                  size={14}
                  color='var(--color-content-text-secondary)'
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ fontSize: 11, color: 'var(--color-content-text-secondary)', lineHeight: 1.4 }}>
                  By continuing, you agree to our Service Terms & Genuine Part
                  Policy.
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!canProceedToBook}
                style={{
                  width: '100%',
                  height: 56,
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-btn)',
                  fontWeight: 800,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: canProceedToBook ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: canProceedToBook ? 1 : 0.5,
                }}
              >
                Confirm & Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </AppShell>
  )
}
