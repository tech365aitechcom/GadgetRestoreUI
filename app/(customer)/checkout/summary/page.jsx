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
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local edit state for remarks
  const [isEditingRemarks, setIsEditingRemarks] = useState(false)
  const [localRemarks, setLocalRemarks] = useState(remarks || '')

  /* Guard */
  useEffect(() => {
    if (
      !brand ||
      !model ||
      !symptoms?.length ||
      !partTier ||
      !address ||
      !slot
    ) {
      router.replace('/home')
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
        setError('Failed to load pricing for summary.')
      })
      .finally(() => setIsLoading(false))
  }, [brand, model, symptoms, partTier])

  if (!brand || !model || !symptoms?.length || !partTier || !address || !slot)
    return null

  // Determine device image
  const isApple = brand?.name?.toLowerCase() === 'apple'
  const defaultImage = isApple
    ? '/images/default-apple.png'
    : '/images/default-android.png'
  const modelImage = model?.image || defaultImage

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
        const res = pricingResults.results.find((r) => r.repairTypeId === id)
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
                {symptoms.map((s, i) => (
                  <span
                    key={i}
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
              {isEditingRemarks ? (
                <div className='flex flex-col gap-2'>
                  <textarea
                    value={localRemarks}
                    onChange={(e) => setLocalRemarks(e.target.value)}
                    className='w-full rounded-xl p-3 text-sm resize-none h-24 outline-none'
                    style={{
                      background: 'var(--color-content-bg)',
                      border: '1px solid var(--color-content-border)',
                      color: 'var(--color-content-text)',
                    }}
                    placeholder='Add delivery instructions or device notes...'
                  />
                  <div className='flex justify-end gap-2 mt-2'>
                    <button
                      onClick={() => setIsEditingRemarks(false)}
                      className='px-4 py-2 text-xs font-bold'
                      style={{ color: 'var(--color-content-text-secondary)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRemarks}
                      className='px-4 py-2 text-xs font-bold rounded-lg'
                      style={{
                        background: 'var(--theme-btn-primary-bg)',
                        color: 'var(--theme-btn-primary-text)',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className='text-sm'
                  style={{ color: 'var(--color-content-text-secondary)' }}
                >
                  {remarks || 'No special remarks added.'}
                </div>
              )}
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

              <div
                className='flex flex-col gap-4 pb-6 mb-6'
                style={{
                  borderBottom: '1px solid var(--color-content-border)',
                }}
              >
                {itemizedSymptoms.map((item, idx) => (
                  <div key={idx} className='flex justify-between items-start'>
                    <div className='pr-4'>
                      <div
                        className='text-sm font-bold mb-1'
                        style={{ color: 'var(--color-content-text)' }}
                      >
                        {item.name}
                      </div>
                      <div
                        className='text-[10px] uppercase'
                        style={{ color: 'var(--color-content-text-secondary)' }}
                      >
                        {partTier.tier} Quality
                      </div>
                    </div>
                    <div
                      className='text-sm font-black whitespace-nowrap'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      {item.isVariable
                        ? 'Estimate Required'
                        : `₹${item.total.toLocaleString('en-IN')}`}
                    </div>
                  </div>
                ))}
              </div>

              {hasVariableSymptom && (
                <div className='flex items-start gap-3 bg-[rgba(245,158,11,0.1)] p-4 rounded-xl mb-6'>
                  <AlertCircle
                    size={16}
                    color='var(--color-warning)'
                    className='mt-0.5'
                  />
                  <div
                    className='text-xs leading-snug'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    <span className='text-warning font-bold block mb-1'>
                      Post-diagnosis estimate required
                    </span>
                    Final cost confirmed after diagnosis for some items.
                  </div>
                </div>
              )}

              <div className='flex justify-between items-end'>
                <span
                  className='text-[15px] font-bold'
                  style={{ color: 'var(--color-content-text-secondary)' }}
                >
                  Subtotal
                </span>
                <span
                  className='text-[28px] font-black leading-none tracking-tight'
                  style={{ color: 'var(--color-content-text)' }}
                >
                  {hasVariableSymptom && grandTotal === 0 ? (
                    'Estimate Required'
                  ) : (
                    <>
                      {hasVariableSymptom && (
                        <span
                          className='block text-[10px] font-bold mb-1 text-right'
                          style={{
                            color: 'var(--color-content-text-secondary)',
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
            onClick={handlePlaceOrder}
            disabled={isSubmitting || isLoading}
            className='w-full h-[50px] rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform uppercase tracking-wider disabled:opacity-50 cursor-pointer'
            style={{
              background: 'var(--theme-btn-primary-bg)',
              color: 'var(--theme-btn-primary-text)',
            }}
          >
            {isLoading
              ? 'Calculating...'
              : isSubmitting
                ? 'Processing...'
                : 'Proceed to Details'}{' '}
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
                  {symptoms.map((s, i) => (
                    <span
                      key={i}
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
                {isEditingRemarks ? (
                  <div className='flex flex-col gap-3'>
                    <textarea
                      value={localRemarks}
                      onChange={(e) => setLocalRemarks(e.target.value)}
                      className='w-full rounded-xl p-4 text-sm resize-none h-24 outline-none'
                      style={{
                        background: 'var(--theme-bg)',
                        border: '1px solid var(--color-content-border)',
                        color: 'var(--color-content-text)',
                      }}
                      placeholder='Add delivery instructions or device notes...'
                    />
                    <div className='flex justify-end gap-3'>
                      <button
                        onClick={() => setIsEditingRemarks(false)}
                        className='px-5 py-2.5 text-xs font-bold hover:opacity-100 transition-opacity'
                        style={{ color: 'var(--color-content-text-secondary)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRemarks}
                        className='px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors'
                        style={{
                          background: 'var(--theme-btn-primary-bg)',
                          color: 'var(--theme-btn-primary-text)',
                        }}
                      >
                        Save Remarks
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className='text-sm p-4 rounded-xl'
                    style={{
                      color: 'var(--color-content-text-secondary)',
                      background: 'var(--theme-bg)',
                      border: '1px solid var(--color-content-border)',
                    }}
                  >
                    {remarks ||
                      'No special remarks added. Click Edit to add instructions.'}
                  </div>
                )}
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

                <div
                  className='flex flex-col gap-5 pb-8 mb-8'
                  style={{
                    borderBottom: '1px solid var(--color-content-border)',
                  }}
                >
                  {itemizedSymptoms.map((item, idx) => (
                    <div key={idx} className='flex justify-between items-start'>
                      <div className='pr-6'>
                        <div
                          className='text-base font-bold mb-1'
                          style={{ color: 'var(--color-content-text)' }}
                        >
                          {item.name}
                        </div>
                        <div
                          className='text-[11px] font-bold tracking-wider uppercase'
                          style={{
                            color: 'var(--color-content-text-secondary)',
                          }}
                        >
                          {partTier.tier} Quality
                        </div>
                      </div>
                      <div
                        className='text-lg font-black whitespace-nowrap'
                        style={{ color: 'var(--color-content-text)' }}
                      >
                        {item.isVariable
                          ? 'Estimate Required'
                          : `₹${item.total.toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  ))}
                </div>

                {hasVariableSymptom && (
                  <div className='flex items-start gap-3 bg-[rgba(245,158,11,0.1)] p-5 rounded-2xl mb-8 border border-[rgba(245,158,11,0.2)]'>
                    <AlertCircle
                      size={20}
                      color='var(--color-warning)'
                      className='flex-shrink-0'
                    />
                    <div
                      className='text-sm leading-snug'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      <strong className='text-warning font-bold block mb-1'>
                        Post-diagnosis estimate required
                      </strong>
                      Final cost will be confirmed after physical inspection of
                      the device.
                    </div>
                  </div>
                )}

                <div className='flex justify-between items-end mb-10'>
                  <span
                    className='text-sm font-bold uppercase tracking-wider'
                    style={{ color: 'var(--color-content-text-secondary)' }}
                  >
                    Subtotal
                  </span>
                  <span
                    className='text-[42px] font-black leading-none tracking-tight'
                    style={{ color: 'var(--color-content-text)' }}
                  >
                    {hasVariableSymptom && grandTotal === 0 ? (
                      'Estimate Required'
                    ) : (
                      <>
                        {hasVariableSymptom && (
                          <span
                            className='block text-[12px] font-bold mb-2 text-right'
                            style={{
                              color: 'var(--color-content-text-secondary)',
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

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || isLoading}
                  className='w-full h-[64px] rounded-[20px] text-[16px] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50 cursor-pointer'
                  style={{
                    background: 'var(--theme-btn-primary-bg)',
                    color: 'var(--theme-btn-primary-text)',
                  }}
                >
                  {isLoading
                    ? 'Calculating...'
                    : isSubmitting
                      ? 'Processing...'
                      : 'Proceed to Details'}{' '}
                  <ChevronRight size={20} />
                </button>

                <p
                  className='text-[11px] text-center mt-6 font-medium'
                  style={{ color: 'var(--color-content-text-secondary)' }}
                >
                  By proceeding, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
