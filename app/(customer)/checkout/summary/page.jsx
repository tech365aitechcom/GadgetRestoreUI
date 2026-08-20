'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Edit2,
  Calendar,
  MapPin,
  Truck,
  Shield,
  AlertCircle,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import catalogueService from '@/services/catalogue.service'
import PropTypes from 'prop-types'

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

// Helper: check if any required booking field is missing
function isBookingIncomplete({ brand, model, symptoms, partTier, address, slot }) {
  return !brand || !model || !symptoms?.length || !partTier || !address || !slot
}

// Helper: compute per-symptom pricing breakdown
function computeItemizedSymptoms(symptoms, hasPricingData, pricingResults) {
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
        const res = pricingResults.results.find((r) => r.repairTypeId === id)
        if (res?.available && res?.pricing) {
          sympParts += res.pricing.partsCost || 0
          sympLabour += res.pricing.labourCost || 0
        }
      })
    } else {
      sympIsVariable = true
    }

    // Mark as variable only if total is zero (no pricing found for any repair type)
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

  return { itemizedSymptoms, grandTotal, hasVariableSymptom }
}

// Helper: determine device image based on brand
function getDeviceImage(brand, model) {
  const isApple = brand?.name?.toLowerCase() === 'apple'
  const defaultImage = isApple ? '/images/default-apple.png' : '/images/default-android.png'
  return model?.image || defaultImage
}

const SummarySection = ({ title, onEdit, children }) => (
  <div
    className='rounded-[24px] p-5 mb-4 relative overflow-hidden group'
    style={{
      background: 'var(--color-content-card)',
      border: '1px solid var(--color-content-border)',
    }}
  >
    <div
      className='flex justify-between items-center mb-4 pb-3'
      style={{ borderBottom: '1px solid var(--color-content-border)' }}
    >
      <h3
        className='text-xs font-black uppercase tracking-[0.1em]'
        style={{ color: 'var(--color-content-text-secondary)' }}
      >
        {title}
      </h3>
      {onEdit && (
        <button
          type='button'
          onClick={onEdit}
          className='flex items-center gap-1.5 text-xs font-bold hover:opacity-100 opacity-60 transition-opacity'
          style={{ color: 'var(--color-content-text)' }}
        >
          <Edit2 size={12} /> Edit
        </button>
      )}
    </div>
    <div>{children}</div>
  </div>
)

SummarySection.propTypes = {
  title: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  children: PropTypes.node.isRequired,
}

// Helper: derive CTA button label from loading/submitting state
function getCtaLabel(isLoading, isSubmitting) {
  if (isLoading) return 'Calculating...'
  if (isSubmitting) return 'Processing...'
  return 'Proceed to Details'
}

// Extracted: remarks edit/view block (used in both mobile and desktop)
const RemarksEditor = ({ isEditingRemarks, localRemarks, setLocalRemarks, remarks, onCancel, onSave, textareaStyle, saveLabel, variant }) => {
  const isDesktop = variant === 'desktop'
  if (isEditingRemarks) {
    return (
      <div className={isDesktop ? 'flex flex-col gap-3' : 'flex flex-col gap-2'}>
        <textarea
          value={localRemarks}
          onChange={(e) => setLocalRemarks(e.target.value)}
          className={isDesktop ? 'w-full rounded-xl p-4 text-sm resize-none h-24 outline-none' : 'w-full rounded-xl p-3 text-sm resize-none h-24 outline-none'}
          style={textareaStyle}
          placeholder='Add delivery instructions or device notes...'
        />
        <div className={isDesktop ? 'flex justify-end gap-3' : 'flex justify-end gap-2 mt-2'}>
          <button
            type='button'
            onClick={onCancel}
            className={isDesktop ? 'px-5 py-2.5 text-xs font-bold hover:opacity-100 transition-opacity' : 'px-4 py-2 text-xs font-bold'}
            style={{ color: 'var(--color-content-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onSave}
            className={isDesktop ? 'px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors' : 'px-4 py-2 text-xs font-bold rounded-lg'}
            style={{ background: 'var(--theme-btn-primary-bg)', color: 'var(--theme-btn-primary-text)' }}
          >
            {saveLabel || 'Save'}
          </button>
        </div>
      </div>
    )
  }
  if (isDesktop) {
    return (
      <div
        className='text-sm p-4 rounded-xl'
        style={{
          color: 'var(--color-content-text-secondary)',
          background: 'var(--theme-bg)',
          border: '1px solid var(--color-content-border)',
        }}
      >
        {remarks || 'No special remarks added. Click Edit to add instructions.'}
      </div>
    )
  }
  return (
    <div className='text-sm' style={{ color: 'var(--color-content-text-secondary)' }}>
      {remarks || 'No special remarks added.'}
    </div>
  )
}

RemarksEditor.propTypes = {
  isEditingRemarks: PropTypes.bool.isRequired,
  localRemarks: PropTypes.string.isRequired,
  setLocalRemarks: PropTypes.func.isRequired,
  remarks: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  textareaStyle: PropTypes.object,
  saveLabel: PropTypes.string,
  variant: PropTypes.oneOf(['mobile', 'desktop']),
}

const PRICING_STYLES = {
  mobile: {
    itemListClass: 'flex flex-col gap-4 pb-6 mb-6',
    itemPrClass: 'pr-4',
    itemNameClass: 'text-sm font-bold mb-1',
    itemTierClass: 'text-[10px] uppercase',
    itemPriceClass: 'text-sm font-black whitespace-nowrap',
    alertClass: 'flex items-start gap-3 bg-[rgba(245,158,11,0.1)] p-4 rounded-xl mb-6',
    alertIconSize: 16,
    alertIconClass: 'mt-0.5',
    alertTextClass: 'text-xs leading-snug',
    AlertTitleTag: 'span',
    alertBodyText: 'Final cost confirmed after diagnosis for some items.',
    subtotalLabelClass: 'text-sm font-semibold',
    subtotalAmountClass: 'text-sm font-bold',
    totalTextClass: 'text-[28px] font-black leading-none tracking-tight',
    totalLabelClass: 'text-[15px] font-black uppercase',
    startingFromClass: 'block text-[10px] font-bold mb-1 text-right',
    gapClass: 'flex flex-col gap-3',
  },
  desktop: {
    itemListClass: 'flex flex-col gap-5 pb-8 mb-8',
    itemPrClass: 'pr-6',
    itemNameClass: 'text-base font-bold mb-1',
    itemTierClass: 'text-[11px] font-bold tracking-wider uppercase',
    itemPriceClass: 'text-lg font-black whitespace-nowrap',
    alertClass: 'flex items-start gap-3 bg-[rgba(245,158,11,0.1)] p-5 rounded-2xl mb-8 border border-[rgba(245,158,11,0.2)]',
    alertIconSize: 20,
    alertIconClass: 'flex-shrink-0',
    alertTextClass: 'text-sm leading-snug',
    AlertTitleTag: 'strong',
    alertBodyText: 'Final cost will be confirmed after physical inspection of the device.',
    subtotalLabelClass: 'text-sm font-bold uppercase tracking-wider',
    subtotalAmountClass: 'text-lg font-extrabold',
    totalTextClass: 'text-[42px] font-black leading-none tracking-tight',
    totalLabelClass: 'text-base font-black uppercase tracking-wider',
    startingFromClass: 'block text-[12px] font-bold mb-2 text-right',
    gapClass: 'flex flex-col gap-4 mb-10',
  },
}

// Extracted: pricing breakdown panel (used in both mobile and desktop)
const PricingPanel = ({ itemizedSymptoms, hasVariableSymptom, subtotal, gstAmount, totalAmount, partTier, variant }) => {
  const styles = PRICING_STYLES[variant] || PRICING_STYLES.mobile
  const { AlertTitleTag } = styles

  return (
    <>
      <div className={styles.itemListClass} style={{ borderBottom: '1px solid var(--color-content-border)' }}>
        {itemizedSymptoms.map((item) => (
          <div key={item.id || item.name} className='flex justify-between items-start'>
            <div className={styles.itemPrClass}>
              <div className={styles.itemNameClass} style={{ color: 'var(--color-content-text)' }}>
                {item.name}
              </div>
              <div className={styles.itemTierClass} style={{ color: 'var(--color-content-text-secondary)' }}>
                {partTier.tier} Quality
              </div>
            </div>
            <div className={styles.itemPriceClass} style={{ color: 'var(--color-content-text)' }}>
              {item.isVariable ? 'Estimate Required' : `₹${item.total.toLocaleString('en-IN')}`}
            </div>
          </div>
        ))}
      </div>

      {hasVariableSymptom && (
        <div className={styles.alertClass}>
          <AlertCircle size={styles.alertIconSize} color='var(--color-warning)' className={styles.alertIconClass} />
          <div className={styles.alertTextClass} style={{ color: 'var(--color-content-text)' }}>
            <AlertTitleTag className='text-warning font-bold block mb-1'>Post-diagnosis estimate required</AlertTitleTag>
            {' '}{styles.alertBodyText}
          </div>
        </div>
      )}

      <div className={styles.gapClass}>
        <div className='flex justify-between items-center'>
          <span className={styles.subtotalLabelClass} style={{ color: 'var(--color-content-text-secondary)' }}>Subtotal</span>
          <span className={styles.subtotalAmountClass} style={{ color: 'var(--color-content-text)' }}>
            {hasVariableSymptom && subtotal === 0
              ? 'Estimate Required'
              : <>{hasVariableSymptom && 'Starting from '}₹{subtotal.toLocaleString('en-IN')}</>}
          </span>
        </div>

        {(!hasVariableSymptom || subtotal > 0) && (
          <div className='flex justify-between items-center'>
            <span className={styles.subtotalLabelClass} style={{ color: 'var(--color-content-text-secondary)' }}>GST</span>
            <span className={styles.subtotalAmountClass} style={{ color: 'var(--color-content-text)' }}>
              {hasVariableSymptom && 'Starting from '}₹{gstAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className='my-2 border-t border-dashed' style={{ borderColor: 'var(--color-content-border)' }} />

        <div className='flex justify-between items-end'>
          <span className={styles.totalLabelClass} style={{ color: 'var(--color-content-text)' }}>Total</span>
          <span className={styles.totalTextClass} style={{ color: 'var(--color-content-text)' }}>
            {hasVariableSymptom && subtotal === 0
              ? 'Estimate Required'
              : (
                <>
                  {hasVariableSymptom && (
                    <span className={styles.startingFromClass} style={{ color: 'var(--color-content-text-secondary)' }}>
                      Starting from
                    </span>
                  )}
                  ₹{totalAmount.toLocaleString('en-IN')}
                </>
              )}
          </span>
        </div>
      </div>
    </>
  )
}

PricingPanel.propTypes = {
  itemizedSymptoms: PropTypes.array.isRequired,
  hasVariableSymptom: PropTypes.bool.isRequired,
  subtotal: PropTypes.number.isRequired,
  gstAmount: PropTypes.number.isRequired,
  totalAmount: PropTypes.number.isRequired,
  partTier: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['mobile', 'desktop']),
}

export default function OrderSummaryPage() {
  const router = useRouter()
  const {
    brand,
    model,
    symptoms,
    partTier,
    serviceMode,
    remarks,
    setRemarks,
    address,
    slot,
  } = useBooking()

  const [pricingResults, setPricingResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting] = useState(false)

  // Local edit state for remarks
  const [isEditingRemarks, setIsEditingRemarks] = useState(false)
  const [localRemarks, setLocalRemarks] = useState(remarks || '')

  /* Guard */
  useEffect(() => {
    if (isBookingIncomplete({ brand, model, symptoms, partTier, address, slot })) {
      router.replace('/')
    }
  }, [brand, model, symptoms, partTier, address, slot, router])

  /* Fetch pricing breakdown */
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
      .then((result) => setPricingResults(result))
      .catch((err) => {
        console.error(err)
      })
      .finally(() => setIsLoading(false))
  }, [brand, model, symptoms, partTier])

  if (isBookingIncomplete({ brand, model, symptoms, partTier, address, slot }))
    return null

  // Determine device image
  const modelImage = getDeviceImage(brand, model)

  // Compute Itemized Pricing per Symptom
  const hasPricingData = (pricingResults?.results?.length ?? 0) > 0

  const { itemizedSymptoms, grandTotal, hasVariableSymptom } = computeItemizedSymptoms(
    symptoms,
    hasPricingData,
    pricingResults
  )

  const subtotal = grandTotal
  const gstAmount = Math.round(subtotal * 0.18)
  const totalAmount = subtotal + gstAmount

  const handleSaveRemarks = () => {
    setRemarks(localRemarks)
    setIsEditingRemarks(false)
  }

  const handlePlaceOrder = async () => {
    // Phase 1 implementation proceeds to 4.2 logic / backend creation later
    router.push('/checkout/customer-details') // Mock route for 4.2
  }

  return (
    <div>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div
        className='home-mobile lg:hidden min-h-[100svh] relative pb-[160px]'
        style={{
          background: 'var(--color-content-bg)',
          color: 'var(--color-content-text)',
        }}
      >
        <div className='relative z-10 pt-6 px-5'>
          <h1
            className='text-[28px] font-black tracking-tight uppercase leading-tight mb-6'
            style={{ color: 'var(--color-content-text)' }}
          >
            Order Summary
          </h1>

          <div className='flex flex-col gap-4'>
            <SummarySection
              title='Device & Symptoms'
              onEdit={() => router.push('/select-symptoms')}
            >
              <div className='flex items-center gap-4 mb-4'>
                <div
                  className='w-14 h-16 rounded-xl flex items-center justify-center overflow-hidden'
                  style={{ background: 'var(--color-content-bg)' }}
                >
                  <img
                    src={modelImage}
                    alt={`${brand.name} ${model.name}`}
                    className='w-full h-full object-contain'
                  />
                </div>
                <div>
                  <h2
                    className='text-lg font-extrabold mb-0.5'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    {model.name}
                  </h2>
                  <div
                    className='text-xs font-bold'
                    style={{ color: 'var(--color-content-text-secondary)' }}
                  >
                    {symptoms.length} selected issues
                  </div>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {symptoms.map((s) => (
                  <span
                    key={s.id || s.name}
                    className='text-[11px] font-bold px-3 py-1.5 rounded-full'
                    style={{
                      color: 'var(--color-content-text)',
                      background: 'var(--color-content-border)',
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </SummarySection>

            <SummarySection
              title='Repair Mode & Quality'
              onEdit={() => router.push('/select-tier')}
            >
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div
                    className='text-[10px] font-bold uppercase tracking-wider mb-1'
                    style={{ color: 'var(--color-content-text-secondary)' }}
                  >
                    Service
                  </div>
                  <div
                    className='text-sm font-bold flex items-center gap-1.5'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    <Truck size={14} />{' '}
                    {serviceMode === 'lab' ? 'Pick & Drop' : 'Doorstep'}
                  </div>
                </div>
                <div>
                  <div
                    className='text-[10px] font-bold uppercase tracking-wider mb-1'
                    style={{ color: 'var(--color-content-text-secondary)' }}
                  >
                    Part Tier
                  </div>
                  <div
                    className='text-sm font-bold flex items-center gap-1.5'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    <Shield size={14} /> {partTier.tier} Quality
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection
              title='Schedule'
              onEdit={() => router.push('/schedule')}
            >
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center'
                  style={{ background: 'var(--color-content-border)' }}
                >
                  <Calendar size={18} color='var(--color-content-text)' />
                </div>
                <div>
                  <div
                    className='text-sm font-bold'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className='text-xs font-bold text-accent'>
                    {slot.timeSlot}
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection
              title='Address'
              onEdit={() => router.push('/address')}
            >
              <div className='flex items-start gap-3'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0'
                  style={{ background: 'var(--color-content-border)' }}
                >
                  <MapPin size={18} color='var(--color-content-text)' />
                </div>
                <div>
                  <div
                    className='text-sm font-bold mb-0.5'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    {address.label}
                  </div>
                  <div
                    className='text-[13px] leading-tight'
                    style={{ color: 'var(--color-content-text-secondary)' }}
                  >
                    {address.line1}, {address.line2}
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection
              title='Remarks'
              onEdit={() => setIsEditingRemarks(true)}
            >
              <RemarksEditor
                isEditingRemarks={isEditingRemarks}
                localRemarks={localRemarks}
                setLocalRemarks={setLocalRemarks}
                remarks={remarks}
                onCancel={() => setIsEditingRemarks(false)}
                onSave={handleSaveRemarks}
                textareaStyle={{
                  background: 'var(--color-content-bg)',
                  border: '1px solid var(--color-content-border)',
                  color: 'var(--color-content-text)',
                }}
              />
            </SummarySection>

            {/* Pricing Summary */}
            <div
              className='rounded-[24px] p-6 mt-4 mb-10'
              style={{
                background: 'var(--color-content-card)',
                border: '1px solid var(--color-content-border)',
              }}
            >
              <h3
                className='text-[18px] font-black mb-4'
                style={{ color: 'var(--color-content-text)' }}
              >
                Total Estimate
              </h3>
              <PricingPanel
                itemizedSymptoms={itemizedSymptoms}
                hasVariableSymptom={hasVariableSymptom}
                subtotal={subtotal}
                gstAmount={gstAmount}
                totalAmount={totalAmount}
                partTier={partTier}
                variant='mobile'
              />
            </div>
          </div>
        </div>

        <div
          className='fixed left-0 right-0 p-5 z-40'
          style={{
            bottom:
              'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
            background:
              'linear-gradient(to top, var(--color-content-bg) 60%, transparent)',
          }}
        >
          <button
            type='button'
            onClick={handlePlaceOrder}
            disabled={isSubmitting || isLoading}
            className='w-full h-[50px] rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform uppercase tracking-wider disabled:opacity-50 cursor-pointer'
            style={{
              background: 'var(--theme-btn-primary-bg)',
              color: 'var(--theme-btn-primary-text)',
            }}
          >
            {getCtaLabel(isLoading, isSubmitting)}{' '}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div
        className='home-desktop hidden lg:block min-h-[100svh]'
        style={{
          background: 'var(--color-content-bg)',
          color: 'var(--color-content-text)',
        }}
      >
        <div className='p-8'>
          <div className='mb-10'>
            <h1 className='text-[44px] font-black tracking-tight leading-none mb-3'>
              Order Summary
            </h1>
            <p
              className='text-[16px]'
              style={{ color: 'var(--color-content-text-secondary)' }}
            >
              Please review your repair details before confirming.
            </p>
          </div>

          <div className='flex gap-10'>
            {/* Left Column - Details */}
            <div className='w-[60%] flex flex-col gap-6'>
              <SummarySection
                title='Device & Symptoms'
                onEdit={() => router.push('/select-symptoms')}
              >
                <div className='flex items-center gap-6 mb-5'>
                  <div
                    className='w-20 h-24 rounded-[16px] flex items-center justify-center overflow-hidden'
                    style={{
                      background: 'var(--theme-bg)',
                      border: '1px solid var(--color-content-border)',
                    }}
                  >
                    <img
                      src={modelImage}
                      alt={`${brand.name} ${model.name}`}
                      className='w-full h-full object-contain p-2'
                    />
                  </div>
                  <div>
                    <h2
                      className='text-[28px] font-extrabold mb-1'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      {model.name}
                    </h2>
                    <div
                      className='text-sm font-bold uppercase tracking-wider'
                      style={{ color: 'var(--color-content-text-secondary)' }}
                    >
                      {symptoms.length} Issues Selected
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {symptoms.map((s) => (
                    <span
                      key={s.id || s.name}
                      className='text-xs font-bold px-4 py-2 rounded-full'
                      style={{
                        color: 'var(--color-content-text)',
                        background: 'var(--color-content-border)',
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </SummarySection>

              <div className='grid grid-cols-2 gap-6'>
                <SummarySection
                  title='Schedule'
                  onEdit={() => router.push('/schedule')}
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className='w-12 h-12 rounded-full flex items-center justify-center'
                      style={{
                        background: 'var(--theme-bg)',
                        border: '1px solid var(--color-content-border)',
                      }}
                    >
                      <Calendar size={20} color='var(--color-content-text)' />
                    </div>
                    <div>
                      <div
                        className='text-base font-bold'
                        style={{ color: 'var(--color-content-text)' }}
                      >
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className='text-sm font-bold text-accent'>
                        {slot.timeSlot}
                      </div>
                    </div>
                  </div>
                </SummarySection>

                <SummarySection
                  title='Repair Details'
                  onEdit={() => router.push('/select-tier')}
                >
                  <div className='flex flex-col gap-3'>
                    <div className='flex justify-between items-center'>
                      <span
                        className='text-xs font-bold uppercase'
                        style={{ color: 'var(--color-content-text-secondary)' }}
                      >
                        Mode
                      </span>
                      <span
                        className='text-sm font-bold'
                        style={{ color: 'var(--color-content-text)' }}
                      >
                        {serviceMode === 'lab' ? 'Pick & Drop' : 'Doorstep'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span
                        className='text-xs font-bold uppercase'
                        style={{ color: 'var(--color-content-text-secondary)' }}
                      >
                        Part Tier
                      </span>
                      <span
                        className='text-sm font-bold'
                        style={{ color: 'var(--color-content-text)' }}
                      >
                        {partTier.tier} Quality
                      </span>
                    </div>
                  </div>
                </SummarySection>
              </div>

              <SummarySection
                title='Pickup & Delivery Address'
                onEdit={() => router.push('/address')}
              >
                <div className='flex items-start gap-4'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0'
                    style={{
                      background: 'var(--theme-bg)',
                      border: '1px solid var(--color-content-border)',
                    }}
                  >
                    <MapPin size={20} color='var(--color-content-text)' />
                  </div>
                  <div>
                    <div
                      className='text-base font-bold mb-1'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      {address.label}
                    </div>
                    <div
                      className='text-sm leading-relaxed'
                      style={{ color: 'var(--color-content-text-secondary)' }}
                    >
                      {address.line1}
                      <br />
                      {address.line2}
                    </div>
                  </div>
                </div>
              </SummarySection>

              <SummarySection
                title='Remarks'
                onEdit={() => setIsEditingRemarks(true)}
              >
                <RemarksEditor
                  isEditingRemarks={isEditingRemarks}
                  localRemarks={localRemarks}
                  setLocalRemarks={setLocalRemarks}
                  remarks={remarks}
                  onCancel={() => setIsEditingRemarks(false)}
                  onSave={handleSaveRemarks}
                  textareaStyle={{
                    background: 'var(--theme-bg)',
                    border: '1px solid var(--color-content-border)',
                    color: 'var(--color-content-text)',
                  }}
                  saveLabel='Save Remarks'
                />
              </SummarySection>
            </div>

            {/* Right Column - Pricing */}
            <div className='w-[40%]'>
              <div
                className='rounded-[32px] p-8 sticky top-[100px] shadow-2xl'
                style={{
                  background: 'var(--color-content-card)',
                  border: '1px solid var(--color-content-border)',
                }}
              >
                <h3
                  className='text-[24px] font-black mb-8'
                  style={{ color: 'var(--color-content-text)' }}
                >
                  Technical Quote
                </h3>

                <PricingPanel
                  itemizedSymptoms={itemizedSymptoms}
                  hasVariableSymptom={hasVariableSymptom}
                  subtotal={subtotal}
                  gstAmount={gstAmount}
                  totalAmount={totalAmount}
                  partTier={partTier}
                  variant='desktop'
                />

                <button
                  type='button'
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || isLoading}
                  className='w-full h-[64px] rounded-[20px] text-[16px] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50 cursor-pointer'
                  style={{
                    background: 'var(--theme-btn-primary-bg)',
                    color: 'var(--theme-btn-primary-text)',
                  }}
                >
                  {getCtaLabel(isLoading, isSubmitting)}{' '}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
