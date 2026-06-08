'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  Battery,
  Zap,
  Volume2,
  Power,
  Wifi,
  Droplets,
  Layers,
  Smartphone,
  HelpCircle,
  Wrench,
  ChevronRight,
  Sparkles,
  Info,
  Check,
  BadgeCheck,
} from 'lucide-react'

import AppShell from '@/components/layout/AppShell'
import BottomNav from '@/components/ui/BottomNav'
import catalogueService from '@/services/catalogue.service'
import { useBooking } from '@/context/BookingContext'
import { getBrandLogo } from '@/lib/utils'


// Helper to determine symptom icon dynamically based on name and properties
const getSymptomIcon = (symptom) => {
  if (symptom.isOther) return <HelpCircle size={20} />

  const name = (symptom.name || '').toLowerCase()
  if (
    name.includes('screen') ||
    name.includes('display') ||
    name.includes('cracked') ||
    name.includes('broken')
  ) {
    return <Smartphone size={20} />
  }
  if (
    name.includes('battery') ||
    name.includes('drain') ||
    name.includes('swollen')
  ) {
    return <Battery size={20} />
  }
  if (
    name.includes('charging') ||
    name.includes('charge') ||
    name.includes('plug') ||
    name.includes('power issue')
  ) {
    return <Zap size={20} />
  }
  if (
    name.includes('sound') ||
    name.includes('audio') ||
    name.includes('speaker') ||
    name.includes('mic') ||
    name.includes('voice')
  ) {
    return <Volume2 size={20} />
  }
  if (
    name.includes('turn') ||
    name.includes('dead') ||
    name.includes('power') ||
    name.includes('boot')
  ) {
    return <Power size={20} />
  }
  if (
    name.includes('network') ||
    name.includes('signal') ||
    name.includes('wifi') ||
    name.includes('sim') ||
    name.includes('bluetooth')
  ) {
    return <Wifi size={20} />
  }
  if (
    name.includes('water') ||
    name.includes('liquid') ||
    name.includes('wet') ||
    name.includes('moisture') ||
    name.includes('damage')
  ) {
    return <Droplets size={20} />
  }
  if (
    name.includes('back glass') ||
    name.includes('body') ||
    name.includes('housing') ||
    name.includes('glass') ||
    name.includes('frame')
  ) {
    return <Layers size={20} />
  }
  return <Wrench size={20} />
}

export default function SelectSymptomsPage() {
  const router = useRouter()
  const {
    brand,
    model,
    symptoms: contextSymptoms,
    remarks: contextRemarks,
    setSymptoms,
    setRemarks,
    category,
  } = useBooking()

  const isApple = brand?.name?.toLowerCase() === 'apple'
  const defaultImage = isApple ? '/images/default-apple.png' : '/images/default-android.png'
  const logoUrl = getBrandLogo(brand?.name, brand?.logo)


  const [symptomsList, setSymptomsList] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [otherText, setOtherText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Guard: If brand or model is not selected, send back to appropriate step
  useEffect(() => {
    if (!brand) {
      router.replace('/select-brand')
    } else if (!model) {
      router.replace('/select-model')
    }
  }, [brand, model, router])

  // Fetch symptoms from backend on mount (or if model category resolved changes)
  useEffect(() => {
    if (!model) return

    // Resolve category name resiliently (either from context category or from populated model category object)
    const categoryName = category?.name || model?.categoryId?.name || 'Mobile'

    setIsLoading(true)
    setError(null)

    catalogueService
      .getSymptoms(categoryName)
      .then((data) => {
        // Filter out inactive ones
        const activeSymptoms = (data || []).filter((s) => s.isActive !== false)
        setSymptomsList(activeSymptoms)

        // Restore selection state from BookingContext if present
        if (contextSymptoms && contextSymptoms.length > 0) {
          const restoredIds = contextSymptoms.map((s) => s._id)
          setSelectedIds(restoredIds)
        }
        if (contextRemarks) {
          setOtherText(contextRemarks)
        }
      })
      .catch((err) => {
        console.error('Error loading symptoms from backend:', err)
        setError('Failed to load symptoms. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [model, category, contextSymptoms, contextRemarks])

  // Check if "Other" symptom is selected
  const isOtherSelected = useMemo(() => {
    const otherSymptom = symptomsList.find((s) => s.isOther)
    return otherSymptom && selectedIds.includes(otherSymptom._id)
  }, [symptomsList, selectedIds])

  // Filter symptoms list based on search query
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return symptomsList
    const query = searchQuery.toLowerCase()
    return symptomsList.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query)),
    )
  }, [symptomsList, searchQuery])

  // Handle toggling of a symptom item
  const handleToggleSymptom = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id)
        // If unselecting "Other", clear the remarks as well
        const symptom = symptomsList.find((s) => s._id === id)
        if (symptom?.isOther) {
          setOtherText('')
        }
        return next
      } else {
        return [...prev, id]
      }
    })
  }

  // Process and save choices, then navigate
  const handleContinue = () => {
    if (selectedIds.length === 0) return

    // Filter full symptom objects corresponding to selected IDs
    const selectedObjects = symptomsList.filter((s) =>
      selectedIds.includes(s._id),
    )

    // Save choices to context
    setSymptoms(selectedObjects)
    if (isOtherSelected) {
      setRemarks(otherText)
    } else {
      setRemarks('')
    }

    // Go to next step: Part Type Selection (Pro vs Premium Comparison)
    router.push('/select-tier')
  }

  if (!brand || !model) return null

  return (
    <AppShell>
      {/* ════════════════════════════════════════════════════════════════
          DESKTOP  ≥1024px
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop'>
        <div className='p-8' style={{ paddingBottom: 48 }}>
          {/* Header & Back Link */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 24,
              marginBottom: 28,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-content-text)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Select Symptoms
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--color-content-text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: 600,
                }}
              >
                Identify the issues affecting your {model.name}. Select multiple
                symptoms if applicable.
              </p>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* Left Column: Symptoms List & Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Device Info Card */}
              <div
                className="device-info-card"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  background: 'var(--color-content-card)',
                  border: '1px solid var(--color-content-border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  minHeight: 220,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                {/* Left Section - Info and Actions */}
                <div
                  style={{
                    flex: 1,
                    padding: '28px 36px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Top: Device Details */}
                  <div>
                    {/* Badge */}
                    <div
                      style={{
                        display: 'inline-flex',
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        background: '#000000',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: 999,
                        marginBottom: 16,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      ACTIVE INTAKE
                    </div>
                    {/* Model Name */}
                    <h2
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: 'var(--color-content-text)',
                        marginBottom: 6,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {model.name}
                    </h2>
                    {/* Subtitle */}
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--color-content-text-secondary)',
                        marginBottom: 0,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{brand.name}</span>
                      <span style={{ opacity: 0.5 }}>•</span>
                      <span>{model?.ramRom?.[0] || (model?.year ? `${model.year}` : '256GB')}</span>
                    </p>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                      onClick={() => router.push('/select-model')}
                      style={{
                        padding: '12px 24px',
                        background: '#e4e4e7',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#000000',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                      className="change-device-btn"
                    >
                      Change Device
                    </button>
                  </div>
                </div>

                {/* Right Section - Device Image with Gradient Background */}
                <div
                  style={{
                    width: 320,
                    background: 'linear-gradient(135deg, #1e2d29 0%, #0d1311 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    borderLeft: '1px solid var(--color-content-border)',
                  }}
                  className="device-image-container"
                >
                  <img
                    src={model?.image || defaultImage}
                    alt={model?.name || 'Device'}
                    style={{
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6))',
                    }}
                    className="device-card-image"
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + defaultImage) {
                        e.target.src = defaultImage;
                      }
                    }}
                  />
                </div>
              </div>

              {/* Search Bar */}
              <div className='search-input-row'>
                <Search size={18} color='var(--color-content-text-secondary)' />
                <input
                  type='text'
                  placeholder='Search symptom or issue (e.g., screen, battery)...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete='off'
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--color-content-text)',
                    fontSize: 14,
                    padding: '8px 4px',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-content-text-secondary)',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className='skeleton'
                      style={{
                        height: 100,
                        borderRadius: 'var(--radius-card)',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Symptoms Grid */}
              {!isLoading && error && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--color-danger)',
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}

              {!isLoading && !error && (
                <>
                  {/* 3-column grid per implementation plan (Desktop: responsive 3-col) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 16,
                    }}
                  >
                    {filteredSymptoms.map((symptom) => {
                      const isSelected = selectedIds.includes(symptom._id)
                      return (
                        <button
                          key={symptom._id}
                          onClick={() => handleToggleSymptom(symptom._id)}
                          aria-pressed={isSelected}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'left',
                            justifyContent: 'space-between',
                            padding: '10px',
                            background: isSelected
                              ? 'rgba(108,123,255,0.08)'
                              : 'var(--color-content-card)',
                            border: isSelected
                              ? '2px solid var(--color-accent)'
                              : '1px solid var(--color-content-border)',
                            borderRadius: 'var(--radius-card)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            boxShadow: isSelected
                              ? '0 4px 12px rgba(108,123,255,0.1)'
                              : '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 14,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 120,
                                height: 120,
                                borderRadius: 12,
                                background: isSelected
                                  ? 'rgba(108,123,255,0.15)'
                                  : 'var(--color-content-bg)',
                                color: isSelected
                                  ? 'var(--color-accent)'
                                  : 'var(--color-content-text-secondary)',
                                flexShrink: 0,
                                overflow: 'hidden',
                              }}
                            >
                              {symptom.icon ? (
                                <img
                                  src={symptom.icon}
                                  alt={symptom.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              ) : (
                                getSymptomIcon(symptom)
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: isSelected
                                    ? 'var(--color-accent)'
                                    : 'var(--color-content-text)',
                                  marginBottom: 2,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {symptom.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: 'var(--color-content-text-secondary)',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.3,
                                }}
                              >
                                {symptom.description ||
                                  'Common hardware repair requirement'}
                              </div>
                            </div>
                          </div>

                          {/* Custom Checkbox circle */}
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              border: isSelected
                                ? 'none'
                                : '2px solid var(--color-content-border)',
                              background: isSelected
                                ? 'var(--color-accent)'
                                : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              flexShrink: 0,
                              marginLeft: 12,
                            }}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {filteredSymptoms.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '48px 16px',
                        color: 'var(--color-content-text-secondary)',
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        No issues found
                      </div>
                      <div style={{ fontSize: 13 }}>
                        We can still help! Type your issue using the "Other"
                        option or search again.
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Expandable Textarea block for "Other" descriptions */}
              {isOtherSelected && (
                <div
                  style={{
                    background: 'var(--color-content-card)',
                    border: '1px solid var(--color-content-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: 24,
                    marginTop: 8,
                    animation: 'fadeIn 0.25s ease-out',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--color-content-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Please describe the custom issue
                    </label>
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          otherText.length >= 200
                            ? 'var(--color-danger)'
                            : 'var(--color-content-text-secondary)',
                      }}
                    >
                      {otherText.length} / 200
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder='Provide additional details here (e.g., screen flashes green, back panel loose, mic crackling)...'
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value.slice(0, 200))}
                    style={{
                      width: '100%',
                      padding: 16,
                      background: 'var(--color-content-bg)',
                      border: '1px solid var(--color-content-border)',
                      borderRadius: 'var(--radius-input)',
                      color: 'var(--color-content-text)',
                      fontSize: 14,
                      outline: 'none',
                      resize: 'none',
                      lineHeight: 1.5,
                    }}
                  />
                  {otherText.length === 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 8,
                        color: 'var(--color-warning)',
                        fontSize: 12,
                      }}
                    >
                      <Info size={14} />
                      <span>
                        Writing a brief description helps our engineers prepare
                        the diagnosis tools.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* OEM Quality Standards Banner */}
              <div
                style={{
                  background: '#1E2024',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '40px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 32,
                  marginTop: 24,
                }}
                className="oem-standards-banner flex-col md:flex-row"
              >
                {/* Left Content */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                  <div
                    style={{
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <BadgeCheck size={24} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: '0 0 6px 0',
                      }}
                    >
                      OEM Quality Standards
                    </h4>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#9CA3AF',
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      GADGET Restore exclusively utilizes OEM-grade components. All repairs are executed using specialized precision tools and calibrated to manufacturer specifications to ensure structural integrity and original performance.
                    </p>
                  </div>
                </div>

                {/* Right stats */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 36,
                    flexShrink: 0,
                  }}
                  className="w-full md:w-auto justify-around md:justify-end"
                >
                  {/* Stat 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1,
                      }}
                    >
                      90-Day
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Warranty Included
                    </span>
                  </div>

                  {/* Divider line between stats */}
                  <div
                    style={{
                      height: 32,
                      width: 1,
                      background: 'rgba(255, 255, 255, 0.12)',
                    }}
                  />

                  {/* Stat 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1,
                      }}
                    >
                      4.9/5
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Tech Rating
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Summary Panel */}
            <div style={{ position: 'sticky', top: 96 }}>
              <div
                style={{
                  background: 'var(--color-content-card)',
                  border: '1px solid var(--color-content-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--color-content-text)',
                    marginBottom: 16,
                    borderBottom: '1px solid var(--color-content-divider)',
                    paddingBottom: 12,
                  }}
                >
                  Repair Ticket
                </h3>

                {/* Selected Issues List */}
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-content-text-secondary)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    Selected Issues ({selectedIds.length})
                  </span>

                  {selectedIds.length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        background: 'var(--color-content-bg)',
                        borderRadius: 10,
                        textAlign: 'center',
                        fontSize: 13,
                        color: 'var(--color-content-text-secondary)',
                      }}
                    >
                      No symptoms selected. Tap cards on the left to add issues.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxHeight: 200,
                        overflowY: 'auto',
                        paddingRight: 4,
                      }}
                    >
                      {symptomsList
                        .filter((s) => selectedIds.includes(s._id))
                        .map((s) => (
                          <div
                            key={s._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 12px',
                              background: 'var(--color-content-bg)',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            <div
                              style={{
                                color: 'var(--color-accent)',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Check size={14} strokeWidth={3} />
                            </div>
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                              }}
                            >
                              {s.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleContinue}
                  disabled={selectedIds.length === 0}
                  style={{
                    width: '100%',
                    height: 'var(--btn-height-primary)',
                    background:
                      selectedIds.length > 0
                        ? 'var(--color-accent)'
                        : 'var(--color-content-divider)',
                    color:
                      selectedIds.length > 0
                        ? '#fff'
                        : 'var(--color-content-text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-btn)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    boxShadow:
                      selectedIds.length > 0
                        ? '0 4px 16px rgba(108,123,255,0.25)'
                        : 'none',
                  }}
                >
                  Continue to Pricing <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE  <1024px
          ════════════════════════════════════════════════════════════════ */}
      <div
        className='home-mobile'
        style={{
          background: 'var(--color-content-bg)',
          minHeight: '100svh',
          paddingBottom: 160,
        }}
      >
        {/* Core Mobile content */}
        <div
          style={{
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Header info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  color: 'var(--color-content-text)',
                  marginBottom: 8,
                }}
              >
                Select Issues
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-content-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                Select one or more symptoms that best describe the issue with your{' '}
                {model.name}.
              </p>
            </div>

            {/* Device Info Card */}
            <div
              onClick={() => router.push('/select-model')}
              className="mobile-device-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'var(--color-content-card)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Left Section: Device Image */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={model.image || defaultImage}
                  alt={model.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    if (e.target.src !== window.location.origin + defaultImage) {
                      e.target.src = defaultImage;
                    }
                  }}
                />
              </div>

              {/* Center Section: Name and Brand */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: 'var(--color-content-text)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {model.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-content-text-secondary)',
                    margin: 0,
                  }}
                >
                  Selected Brand: {brand.name}
                </p>
              </div>

              {/* Right Section: Brand Logo */}
              {logoUrl && (
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <img
                    src={logoUrl}
                    alt={brand.name}
                    style={{
                      height: 22,
                      width: 'auto',
                      objectFit: 'contain',
                      filter: ['google', 'realme'].includes(brand.name.toLowerCase())
                        ? 'none'
                        : 'var(--brand-logo-filter)',
                    }}
                    className="mobile-device-brand-logo"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search input */}
          <div className='search-input-row' style={{ marginTop: 4 }}>
            <Search size={17} color='var(--color-content-text-secondary)' />
            <input
              type='text'
              placeholder='Search screen, battery, lock...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete='off'
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-content-text)',
                fontSize: 13,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-content-text-secondary)',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='skeleton'
                  style={{ height: 72, borderRadius: 'var(--radius-card)' }}
                />
              ))}
            </div>
          )}

          {/* Mobile checklist results */}
          {!isLoading && error && (
            <div
              style={{
                textAlign: 'center',
                padding: '32px',
                color: 'var(--color-danger)',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className='grid grid-cols-2 gap-4'>
              {filteredSymptoms.map((symptom) => {
                const isSelected = selectedIds.includes(symptom._id)
                return (
                  <button
                    key={symptom._id}
                    onClick={() => handleToggleSymptom(symptom._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      padding: '2px',
                      background: isSelected
                        ? 'rgba(108,123,255,0.08)'
                        : 'var(--color-content-card)',
                      border: isSelected
                        ? '2px solid var(--color-accent)'
                        : '1px solid var(--color-content-border)',
                      borderRadius: 'var(--radius-card)',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 70,
                          height: 70,
                          borderRadius: 10,
                          background: isSelected
                            ? 'rgba(108,123,255,0.12)'
                            : 'var(--color-content-bg)',
                          color: isSelected
                            ? 'var(--color-accent)'
                            : 'var(--color-content-text-secondary)',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {symptom.icon ? (
                          <img
                            src={symptom.icon}
                            alt={symptom.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          getSymptomIcon(symptom)
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: 'block',
                            fontWeight: 700,
                            fontSize: 13,
                            color: isSelected
                              ? 'var(--color-accent)'
                              : 'var(--color-content-text)',
                            marginBottom: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {symptom.name}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}

              {filteredSymptoms.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: 'var(--color-content-text-secondary)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                  <div
                    style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}
                  >
                    No results found
                  </div>
                  <div style={{ fontSize: 12 }}>
                    Check spelling or select "Other" to describe your issue.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile expandable description field */}
          {isOtherSelected && (
            <div
              style={{
                background: 'var(--color-content-card)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 'var(--radius-card)',
                padding: 16,
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-content-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Describe issue details
                </label>
                <span
                  style={{
                    fontSize: 11,
                    color:
                      otherText.length >= 200
                        ? 'var(--color-danger)'
                        : 'var(--color-content-text-secondary)',
                  }}
                >
                  {otherText.length} / 200
                </span>
              </div>
              <textarea
                rows={3}
                placeholder='Tell us what is wrong with the device...'
                value={otherText}
                onChange={(e) => setOtherText(e.target.value.slice(0, 200))}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'var(--color-content-bg)',
                  border: '1px solid var(--color-content-border)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--color-content-text)',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.4,
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile Bottom Sticky Action CTA bar (floating above standard bottom nav) */}
        <div
          style={{
            position: 'fixed',
            bottom:
              'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))', // Floating just above standard BottomNav
            left: 0,
            right: 0,
            background: 'var(--color-content-surface)',
            borderTop: '1px solid var(--color-content-border)',
            padding: '12px 16px',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 -4px 10px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <span
              style={{
                display: 'block',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--color-content-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {selectedIds.length > 0
                ? `${selectedIds.length} symptom${selectedIds.length === 1 ? '' : 's'} selected`
                : 'No symptoms selected'}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color:
                  selectedIds.length > 0
                    ? 'var(--color-accent)'
                    : 'var(--color-content-text)',
              }}
            >
              {selectedIds.length > 0
                ? 'Ready to continue ✓'
                : 'Select at least one issue'}
            </span>
          </div>
          <button
            onClick={handleContinue}
            disabled={selectedIds.length === 0}
            style={{
              height: 44,
              padding: '0 24px',
              background:
                selectedIds.length > 0
                  ? 'var(--color-accent)'
                  : 'var(--color-content-divider)',
              color:
                selectedIds.length > 0
                  ? '#fff'
                  : 'var(--color-content-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              fontWeight: 700,
              fontSize: 13,
              cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            Continue <ChevronRight size={14} />
          </button>
        </div>

        <BottomNav />
      </div>

      {/* Styles for simple keyframe animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .device-info-card {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .device-info-card:hover {
          border-color: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }
        .device-card-image {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
        }
        .device-info-card:hover .device-card-image {
          transform: scale(1.06) rotate(-2deg);
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.7)) !important;
        }
        .diagnose-btn:not(:disabled):hover {
          background-color: #18181b !important;
          transform: translateY(-1px);
        }
        .change-device-btn:hover {
          background-color: #ffffff !important;
          transform: translateY(-1px);
        }
        .mobile-device-card {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .mobile-device-card:active {
          transform: scale(0.97);
          background-color: var(--color-bg-600) !important;
        }
        .mobile-device-brand-logo {
          filter: grayscale(100%) opacity(0.6) brightness(0) invert(1);
          transition: opacity 0.2s ease;
        }
        [data-theme='light'] .mobile-device-brand-logo {
          filter: grayscale(100%) opacity(0.6) brightness(0);
        }
      `}</style>
    </AppShell>
  )
}
