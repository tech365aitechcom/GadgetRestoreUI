'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  Truck,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react'

import { useBooking } from '@/context/BookingContext'
import catalogueService from '@/services/catalogue.service'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

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
    let sympWarrantyMonths = 0

    if (hasPricingData) {
      const rTypes = symp.repairTypes || []
      rTypes.forEach((rtId) => {
        const id = typeof rtId === 'object' ? rtId._id : rtId
        const res = pricingResults.results.find(
          (r) => String(r.repairTypeId) === String(id),
        )
        if (!res || !res.available || !res.pricing) {
          sympIsVariable = true
        } else {
          sympParts += res.pricing.partsCost || 0
          sympLabour += res.pricing.labourCost || 0
          // Get warranty from pricing matrix (use maximum if multiple repairs)
          sympWarrantyMonths = Math.max(
            sympWarrantyMonths,
            res.pricing.warrantyMonths || 0,
          )
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
      warrantyMonths: sympWarrantyMonths,
    }
  })

  // Generate a mock quote ID
  const quoteId = `RC-${Math.floor(100 + Math.random() * 900)}-${brand.name
    .substring(0, 2)
    .toUpperCase()}`

  const partsCost = itemizedSymptoms.reduce(
    (sum, item) => sum + (item.isVariable ? 0 : item.partsCost),
    0,
  )
  const labourCost = itemizedSymptoms.reduce(
    (sum, item) => sum + (item.isVariable ? 0 : item.labourCost),
    0,
  )
  const subtotal = partsCost + labourCost
  const gstAmount = Math.round(subtotal * 0.18)
  const totalAmount = subtotal + gstAmount

  // Calculate warranty (use default warranty from part tier to match select-tier page)
  const warrantyMonths = partTier.defaultWarrantyMonths || 0

  const brandName = (brand?.name || '').toLowerCase()
  const isApple =
    brandName.includes('apple') ||
    brandName.includes('iphone') ||
    brandName.includes('ipad')
  const defaultDeviceImg = isApple
    ? '/images/default-apple.png'
    : '/images/default-android.png'
  const modelImg = model.image || defaultDeviceImg

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

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black text-white w-full max-w-full'>
        <div className='p-4 sm:p-6 lg:p-8 pb-36 lg:pb-16 w-full max-w-7xl'>
          {/* Header Skeleton */}
          <div className='mb-8 lg:mb-10 pt-4 lg:pt-5'>
            <Skeleton className='hidden md:block mb-6 w-[120px] h-3' />
            <Skeleton className='mb-2 lg:mb-3 w-3/5 h-8 lg:h-12' />
            <Skeleton className='w-4/5 lg:w-1/2 h-4' />
          </div>

          {/* Responsive Layout Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8'>
            {/* Left Column Skeletons */}
            <div className='flex flex-col gap-6'>
              {/* Device Card Skeleton */}
              <Skeleton className='h-[280px] lg:h-80 rounded-3xl' />
              {/* Diagnostic Summary Skeleton (Desktop only) */}
              <Skeleton className='hidden lg:block h-60 rounded-3xl' />
            </div>

            {/* Right Column Quote Card Skeleton */}
            <Skeleton className='h-[360px] lg:h-96 rounded-3xl' />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        fullScreen
        title='Quote Generation Failed'
        message={error}
        buttonText='Go Back'
        onButtonClick={() => router.push('/select-mode')}
        icon={<AlertCircle size={48} className='text-red-500' />}
      />
    )
  }

  return (
    <div className='min-h-screen bg-black text-white w-full max-w-full'>
      {/* Main Content Area */}
      <div className='p-4 sm:p-6 lg:p-8 pb-36 lg:pb-16 w-full max-w-7xl'>
        {/* Back link & Header */}
        <div className='mb-8 lg:mb-10 pt-4 lg:pt-5'>
          <button
            onClick={() => router.push('/select-mode')}
            className='hidden md:inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-gray-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-6 p-0 transition-colors'
          >
            <ArrowLeft size={14} /> Back to Service Mode
          </button>
          <h1 className='text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white mb-2 lg:mb-3 uppercase lg:normal-case'>
            Review & Quote
          </h1>
          <p className='text-xs sm:text-sm lg:text-base text-gray-400 leading-relaxed max-w-2xl m-0'>
            <span className='lg:inline hidden'>
              Please review your selection before finalizing the booking.{' '}
            </span>
            <span className='lg:hidden inline'>
              Please review your selection
            </span>
            <span className='text-white font-semibold block sm:inline mt-1 sm:mt-0 lg:ml-1'>
              Quote ID: {quoteId}
            </span>
          </p>
        </div>

        {/* Responsive Layout Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8'>
          {/* Left Column (Device Card & Diagnostic Summary) */}
          <div className='flex flex-col gap-6'>
            {/* Device Card */}
            <div className='bg-[#16171B] rounded-3xl border border-white/5 overflow-hidden'>
              {/* Mobile Device Header (Horizontal) */}
              <div className='flex items-center gap-4 p-5 border-b border-white/5 lg:hidden'>
                <div className='w-16 h-[74px] bg-[#1F222A] rounded-xl flex items-center justify-center shrink-0'>
                  <img
                    src={modelImg}
                    alt={model.name}
                    className='w-full h-full object-cover rounded-xl'
                  />
                </div>
                <div>
                  <h2 className='text-lg font-extrabold text-white mb-1'>
                    {brand.name} {model.name}
                  </h2>
                  {symptoms.length > 0 && (
                    <div className='text-xs text-gray-400'>
                      {symptoms[0].name}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Device Header (Hero Image) */}
              <div className='hidden lg:flex bg-[#1F222A] h-60 relative items-center justify-center border-b border-white/5'>
                <div className='absolute top-4 left-4 bg-black text-white text-[9px] font-extrabold px-2.5 py-1 rounded tracking-wider uppercase'>
                  Priority Service
                </div>
                <img
                  src={modelImg}
                  alt={model.name}
                  className='w-full h-full object-contain'
                />
              </div>

              {/* Desktop Details Body */}
              <div className='p-6 hidden lg:block'>
                <div className='flex justify-between items-start mb-6'>
                  <div>
                    <h2 className='text-2xl font-extrabold text-white mb-1.5'>
                      {model.name}
                    </h2>
                  </div>
                </div>

                <div className='h-px bg-white/5 -mx-6 mb-5' />

                {/* Desktop 3-column Grid Parameters */}
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <div className='text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <Truck size={12} className='text-gray-400' /> Repair Mode
                    </div>
                    <div className='text-sm font-bold text-white'>
                      {serviceMode === 'lab'
                        ? 'Pick & Drop'
                        : 'Doorstep Repair'}
                    </div>
                  </div>
                  <div>
                    <div className='text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <Clock size={12} className='text-gray-400' /> Est. Repair
                      Time
                    </div>
                    <div className='text-sm font-bold text-white'>Same Day</div>
                  </div>
                  <div>
                    <div className='text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <Shield size={12} className='text-gray-400' /> Warranty
                    </div>
                    <div className='text-sm font-bold text-white'>
                      {warrantyMonths} Months
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Details Body */}
              <div className='p-5 lg:hidden flex flex-col gap-3.5'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-400'>Part Type</span>
                  <span className='text-sm font-bold text-white'>
                    {partTier.tier}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-400'>Repair Mode</span>
                  <span className='text-sm font-bold text-white'>
                    {serviceMode === 'lab' ? 'Pick & Drop' : 'Doorstep Repair'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-400'>Warranty</span>
                  <span className='text-sm font-bold text-white'>
                    {warrantyMonths} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Diagnostic Summary Card */}
            <div className='bg-[#16171B] rounded-3xl border border-white/5 p-8 hidden lg:block'>
              <h3 className='text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-5'>
                Diagnostic Summary
              </h3>
              <div className='flex flex-col gap-4'>
                {symptoms.map((symp, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center pb-4 ${
                      i < symptoms.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <span className='text-sm text-white'>{symp.name}</span>
                    <span className='text-[10px] font-extrabold text-[#EF4444] tracking-wider uppercase'>
                      FAIL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Quote Details) */}
          <div className='bg-[#16171B] rounded-3xl border border-white/5 p-5 lg:p-8 lg:sticky lg:top-10 flex flex-col justify-between lg:h-full'>
            <div>
              {/* Quote Header (Desktop only) */}
              <div className='hidden lg:flex items-center gap-3 mb-8'>
                <FileText size={20} style={{ color: 'var(--color-accent)' }} />
                <h3 className='text-base font-extrabold text-white uppercase tracking-wider'>
                  Technical Quote
                </h3>
              </div>

              {/* Quote Breakdowns - Itemized per Symptom/Repair */}
              <div className='flex flex-col gap-5 lg:gap-6 pb-5 lg:pb-6 border-b border-white/5'>
                {itemizedSymptoms.map((symptom, index) => {
                  const sympServiceCharge =
                    symptom.partsCost + symptom.labourCost
                  const sympGst = Math.round(sympServiceCharge * 0.18)

                  return (
                    <div key={index} className='flex flex-col gap-3'>
                      {/* Symptom Name Header */}
                      {itemizedSymptoms.length > 1 && (
                        <div className='text-[10px] font-bold text-gray-500 uppercase tracking-wider'>
                          {symptom.name}
                        </div>
                      )}

                      {/* Service Charge */}
                      {!symptom.isVariable && sympServiceCharge > 0 && (
                        <div>
                          <div className='text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 hidden lg:block'>
                            SERVICE CHARGE
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-xs lg:text-sm font-semibold text-gray-400 lg:text-white'>
                              <span className='lg:hidden'>Service Charge</span>
                              <span className='hidden lg:inline'>
                                Service Charge
                              </span>
                            </span>
                            <span className='text-sm lg:text-base font-bold lg:font-extrabold text-white'>
                              ₹{sympServiceCharge.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* GST (18%) */}
                      {!symptom.isVariable && sympGst > 0 && (
                        <div className='flex justify-between items-center'>
                          <span className='text-xs lg:text-sm font-semibold text-gray-400 lg:text-white'>
                            GST
                          </span>
                          <span className='text-sm lg:text-base font-bold lg:font-extrabold text-white'>
                            ₹{sympGst.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {/* Variable Pricing Indicator */}
                      {symptom.isVariable && (
                        <div>
                          <div className='text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 hidden lg:block'>
                            SERVICE CHARGE
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-xs lg:text-sm font-semibold text-gray-400 lg:text-white'>
                              {symptom.name}
                            </span>
                            <span className='text-xs lg:text-sm font-semibold text-yellow-500'>
                              Estimate Required
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Subtotal & GST Summary */}
            <div className='pt-5 lg:pt-6 flex flex-col gap-3'>
              {/* Grand Total (Labeled as Subtotal) */}
              <div className='flex justify-between items-end'>
                <span className='text-sm lg:text-base font-extrabold text-white'>
                  Subtotal
                </span>
                <div className='flex flex-col items-end'>
                  <span className='text-2xl lg:text-4xl font-black text-white tracking-tight leading-none'>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className='text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1'>
                    Incl. 18% GST
                  </span>
                </div>
              </div>

              {/* Mobile price disclaimer */}
              <div className='text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right mb-5 lg:hidden'>
                * FINAL PRICE MAY VARY AFTER DIAGNOSIS
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Bottom Action Bar */}
        <div className='mt-8 bg-white rounded-3xl p-6 lg:p-8 justify-end items-center hidden lg:flex'>
          <button
            onClick={handleConfirm}
            disabled={!canProceedToBook}
            className={`h-14 px-10 bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-[var(--radius-btn)] flex items-center justify-center gap-3 transition-opacity ${
              canProceedToBook
                ? 'cursor-pointer hover:opacity-90'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            Confirm & Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div
        className='fixed left-0 right-0 p-4 z-40 lg:hidden'
        style={{
          bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, #000000 70%, transparent)',
        }}
      >
        <button
          onClick={handleConfirm}
          disabled={!canProceedToBook}
          className={`w-full h-14 bg-white text-black font-extrabold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-opacity ${
            canProceedToBook
              ? 'cursor-pointer hover:opacity-90'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          Confirm & Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
