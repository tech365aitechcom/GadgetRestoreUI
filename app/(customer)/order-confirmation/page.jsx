'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Clock, Mail, QrCode, ArrowRight, Truck, Share2, MapPin } from 'lucide-react'
import orderService from '@/services/order.service'
import { useBooking } from '@/context/BookingContext'
import toast from 'react-hot-toast'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0'
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₹${numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function formatAddress(address) {
  if (!address) return ''
  const parts = []
  if (address.line1) parts.push(address.line1)
  if (address.line2) parts.push(address.line2)
  if (address.city) parts.push(address.city)
  if (address.pincode) parts.push(address.pincode)
  return parts.join(', ')
}

function formatDateTime(slotDate, slotTime) {
  if (!slotDate) return ''
  const date = new Date(slotDate)
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  return slotTime ? `${dateStr} • ${slotTime}` : dateStr
}

function getStatusLabel(status) {
  const statusLabels = {
    ORDER_PLACED: 'Processing',
    CS_CONFIRMATION_PENDING: 'Awaiting Confirmation',
    CS_CONFIRMED: 'Confirmed',
    PICKUP_ASSIGNED: 'Pickup Assigned',
    PICKUP_EN_ROUTE: 'Pickup En Route',
    PICKUP_COMPLETED: 'Picked Up',
    DEVICE_PICKED_UP: 'Device Picked Up',
    DEVICE_AT_CENTRE: 'At Service Center',
    DIAGNOSIS_PENDING: 'Diagnosis Pending',
    DIAGNOSIS_COMPLETED: 'Diagnosis Complete',
    PENDING_ADVANCE_PAYMENT: 'Payment Pending',
    CUSTOMER_APPROVAL_PENDING: 'Awaiting Approval',
    CUSTOMER_APPROVED: 'Approved',
    REPAIR_IN_PROGRESS: 'Repairing',
    REPAIR_COMPLETED: 'Repair Complete',
    FQC_PENDING: 'Quality Check Pending',
    FQC_PASSED: 'Quality Check Passed',
    PAYMENT_PENDING: 'Payment Pending',
    PAYMENT_COMPLETED: 'Payment Complete',
    DELIVERY_ASSIGNED: 'Delivery Assigned',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RECEIVED_AT_CENTRE: 'At Service Center',
    REFUND_PROCESSED: 'Refund Processed',
    ESCALATED: 'Escalated',
    PARTS_ORDERED: 'Parts Ordered',
    UNREPAIRABLE: 'Unrepairable',
  }
  return statusLabels[status] || status?.replace(/_/g, ' ') || 'Processing'
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const ticketNumber = searchParams.get('ticketNumber')
  const router = useRouter()
  const { reset } = useBooking()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    const loadOrder = async () => {
      if (!ticketNumber) return
      try {
        const response = await orderService.getOrderDetails(ticketNumber)
        setOrder(response)
        setError('')
      } catch (err) {
        setError('Unable to load order details')
      } finally {
        setLoading(false)
      }
    }

    if (ticketNumber) {
      loadOrder()
    } else {
      setLoading(false)
    }
  }, [ticketNumber])

  useEffect(() => {
    const askPermission = async () => {
      try {
        const { default: pushService } = await import('@/services/push-notification.service')
        if (await pushService.isSupported()) {
          const currentPerm = pushService.getPermission()
          if (currentPerm === 'default') {
            await pushService.requestAndRegister()
            toast.success('Order tracking alerts enabled!')
          }
        }
      } catch (error) {
        // Auto-request notifications failed silently
      }
    }

    if (!loading && order) {
      const timer = setTimeout(askPermission, 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, order])

  const handleTrackOrder = () => {
    router.push(`/orders/detail?ticketNumber=${encodeURIComponent(ticketNumber)}`)
  }

  const handleGoHome = () => {
    reset()
    router.push('/home')
  }

  const handleShareOrderId = async () => {
    try {
      await navigator.clipboard.writeText(ticketNumber)
      toast.success('Order ID copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy Order ID')
    }
  }

  if (loading) {
    return (
      <>
        {/* ── Mobile Skeleton ── */}
        <div className="lg:hidden min-h-[100svh] bg-[var(--theme-bg)] pt-6 px-5 pb-24 flex flex-col">
          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="w-16 h-16 rounded-2xl mb-5" />
            <Skeleton className="h-7 w-52 rounded-lg mb-3" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          {/* Reference card */}
          <Skeleton className="rounded-2xl mb-4 h-24" />
          {/* Device card */}
          <Skeleton className="rounded-2xl mb-6 h-22" />
          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>

        {/* ── Desktop Skeleton ── */}
        <div className="hidden lg:flex bg-[var(--theme-bg)] min-h-[calc(100vh-var(--topbar-height))] py-12 px-8 flex-col items-center">
          <div className="max-w-[900px] w-full flex flex-col items-center">
            <Skeleton className="w-[72px] h-[72px] rounded-2xl mb-5" />
            <Skeleton className="h-8 w-72 rounded-lg mb-3" />
            <Skeleton className="h-4 w-96 rounded-md mb-10" />
            <div className="grid grid-cols-2 gap-6 w-full mb-8">
              <Skeleton className="rounded-3xl h-[220px]" />
              <Skeleton className="rounded-3xl h-[220px]" />
            </div>
            <Skeleton className="w-full rounded-2xl mb-8 h-[160px]" />
            <div className="grid grid-cols-2 gap-4 w-full">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <ErrorState
        title={error || 'Order not found'}
        message="We couldn't load your order confirmation. Please try again or check your orders page."
        buttonText="Go to Orders"
        onButtonClick={() => router.push('/orders')}
        fullScreen={true}
      />
    )
  }

  const getFallbackDeviceImage = () => {
    const brandName = order.brandRef?.name?.toLowerCase() || ''
    if (brandName.includes('apple') || brandName.includes('iphone')) {
      return '/images/default-apple.png'
    }
    return '/images/default-android.png'
  }

  // Fix duplicated brand name issue
  const brandName = order.brandRef?.name || ''
  const modelName = order.modelRef?.name || ''
  const deviceName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
    ? modelName
    : `${brandName} ${modelName}`

  const repairType = order.repairTypes?.map(r => r.name).join(' + ') || ''
  const pickupDateTime = formatDateTime(order.slotDate, order.slotTime)
  const pickupAddress = formatAddress(order.address)
  const dynamicStatus = (order.repairStatus ? getStatusLabel(order.repairStatus) : '').toUpperCase()

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-[100svh] bg-[var(--theme-bg)] pt-6 px-5 pb-24 flex flex-col justify-start">
        {/* Success Icon + Heading */}
        <div className="flex flex-col items-center mb-8 relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[var(--color-success-tint)] rounded-full blur-xl pointer-events-none"></div>

          {/* Icon Container */}
          <div className="relative w-16 h-16 bg-[var(--color-success-tint)] border border-[var(--color-success)]/20 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(34,197,94,0.15)] animate-[bounce_0.6s_ease-in-out]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-success)] flex items-center justify-center animate-[scale-in_0.4s_ease-out]">
              <Check className="w-5 h-5 text-white stroke-[3.5] animate-[draw-check_0.5s_ease-out_0.2s_both]" />
            </div>
          </div>

          <h1 className="text-[24px] font-black text-[var(--theme-text-primary)] mb-2 tracking-tight">
            BOOKING CONFIRMED!
          </h1>
          <p className="text-center text-[11px] text-[var(--theme-text-secondary)] max-w-[280px] leading-relaxed">
            Your request has been successfully placed. Our technician will review your case shortly.
          </p>
        </div>

        {/* Reference Number Card - Glassmorphic */}
        <div className="bg-[var(--theme-card-darker)] border border-[var(--theme-border)] rounded-2xl p-5 mb-4 shadow-xl">
          <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold mb-2">
            ORDER IDENTIFICATION
          </p>
          <p className="text-[20px] font-extrabold text-[var(--theme-text-primary)] mb-4 tracking-wide font-sans">
            {ticketNumber}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border)] px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></div>
              <span className="text-[9px] text-[var(--theme-text-primary)] uppercase tracking-wider font-bold">
                {dynamicStatus}
              </span>
            </div>
            <button
              onClick={handleShareOrderId}
              className="inline-flex items-center gap-1.5 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border)] px-3 py-1.5 rounded-full hover:bg-[var(--theme-btn-secondary-hover)] transition-all active:scale-95"
            >
              <Share2 size={11} className="text-[var(--theme-text-secondary)]" />
              <span className="text-[9px] text-[var(--theme-text-secondary)] uppercase tracking-wider font-bold">
                Share
              </span>
            </button>
          </div>
        </div>

        {/* Device & Price Details Card */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Device Image / Mockup */}
              <div className="w-[64px] h-[64px] bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                <img
                  src={order.modelRef?.image || getFallbackDeviceImage()}
                  alt={deviceName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Device Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-[14px] font-extrabold text-[var(--theme-text-primary)] leading-tight truncate">
                  {deviceName}
                </h3>
                <p className="text-[11px] text-[var(--theme-text-secondary)] mt-0.5 truncate">
                  {repairType}
                </p>
              </div>
            </div>

            {/* Price side */}
            {order.finalCost && (
              <div className="text-right shrink-0">
                <p className="text-[14px] font-black text-[var(--theme-text-primary)]">
                  {formatCurrency(order.finalCost)}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mt-0.5">
                  TOTAL
                </p>
              </div>
            )}
          </div>

          {/* Pickup Details */}
          <div className="border-t border-[var(--theme-border)] pt-3 space-y-2">
            {pickupDateTime && (
              <div className="flex items-start gap-2">
                <Clock size={13} className="text-[var(--theme-text-tertiary)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold">
                    Pickup Time
                  </p>
                  <p className="text-[11px] text-[var(--theme-text-secondary)] mt-0.5">
                    {pickupDateTime}
                  </p>
                </div>
              </div>
            )}
            {pickupAddress && (
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-[var(--theme-text-tertiary)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold">
                    Pickup Address
                  </p>
                  <p className="text-[11px] text-[var(--theme-text-secondary)] mt-0.5 line-clamp-2">
                    {pickupAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleTrackOrder}
            className="w-full h-12 bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold rounded-xl text-[12px] tracking-wide hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            TRACK ORDER
            <Truck size={16} className="stroke-[2.5]" />
          </button>

          <button
            onClick={handleGoHome}
            className="w-full h-12 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-btn-secondary-border)] text-[var(--theme-btn-secondary-text)] font-bold rounded-xl text-[12px] tracking-wide hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            BOOK ANOTHER REPAIR
          </button>
        </div>

        {/* CS Message */}
        <p className="text-center text-[9px] text-[var(--theme-text-tertiary)] tracking-wider leading-relaxed max-w-[280px] mx-auto uppercase">
          Our customer support team will call you to confirm your order.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-[var(--theme-bg)] min-h-[calc(100vh-var(--topbar-height))] py-12 px-8">
        <div className="max-w-[900px] w-full mx-auto flex flex-col items-center">

          {/* Central Success Checkmark & Typography */}
          <div className="flex flex-col items-center mb-10 text-center">
            {/* Dark Rounded Square Icon */}
            <div className="w-[72px] h-[72px] bg-[var(--color-success-tint)] border border-[var(--color-success)]/20 rounded-2xl flex items-center justify-center mb-5 shadow-lg animate-[bounce_0.6s_ease-in-out]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-success)] flex items-center justify-center animate-[scale-in_0.4s_ease-out]">
                <Check className="w-5 h-5 text-white stroke-[3.5] animate-[draw-check_0.5s_ease-out_0.2s_both]" />
              </div>
            </div>

            <h1 className="text-[32px] font-black text-[var(--theme-text-primary)] tracking-tight leading-none mb-3 uppercase">
              BOOKING CONFIRMED!
            </h1>
            <p className="text-[13px] text-[var(--theme-text-secondary)] font-medium max-w-[400px]">
              Your repair request has been meticulously logged into our system.
            </p>
          </div>

          {/* Reference + Device Details Horizontal Cards Grid */}
          <div className="grid grid-cols-2 gap-6 w-full mb-8">

            {/* Reference Number Card - Dark/Contrast */}
            <div className="bg-[var(--theme-card-darker)] border border-[var(--theme-border)] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[220px]">
              {/* QR Pattern Watermark */}
              <div className="absolute right-6 bottom-6 opacity-10 text-[var(--theme-text-primary)]">
                <QrCode size={110} className="stroke-[1.5]" />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold mb-3">
                  ORDER ID
                </p>
                <p className="text-[26px] font-black text-[var(--theme-text-primary)] font-mono tracking-tight leading-tight">
                  {ticketNumber}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></div>
                  <span className="text-[9px] text-[var(--theme-text-secondary)] uppercase tracking-wider font-bold">
                    {dynamicStatus}
                  </span>
                </div>
                <button
                  onClick={handleShareOrderId}
                  className="inline-flex items-center gap-1.5 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border)] px-3 py-1.5 rounded-full hover:bg-[var(--theme-btn-secondary-hover)] transition-all active:scale-95"
                >
                  <Share2 size={12} className="text-[var(--theme-text-secondary)]" />
                  <span className="text-[9px] text-[var(--theme-text-secondary)] uppercase tracking-wider font-bold">
                    Share
                  </span>
                </button>
              </div>
            </div>

            {/* Device Details Card - Main Card Surface */}
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-3xl p-8 shadow-sm min-h-[220px] flex flex-col">
              <div className="flex items-center gap-6 mb-6">
                {/* Device Image Box */}
                <div className="w-[120px] h-[120px] bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden p-2.5 shadow-inner">
                  <img
                    src={order.modelRef?.image || getFallbackDeviceImage()}
                    alt={deviceName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Stack of Information */}
                <div className="flex-1 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mb-1">
                      DEVICE MODEL
                    </p>
                    <h3 className="text-[16px] font-black text-[var(--theme-text-primary)] leading-tight truncate max-w-[240px]">
                      {deviceName}
                    </h3>
                  </div>

                  <div className="my-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mb-1">
                      SERVICE TYPE
                    </p>
                    <p className="text-[13px] font-bold text-[var(--theme-text-secondary)] leading-tight truncate max-w-[240px]">
                      {repairType}
                    </p>
                  </div>

                  {order.finalCost && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mb-1">
                        TOTAL COST
                      </p>
                      <p className="text-[16px] font-black text-[var(--theme-text-primary)] leading-none">
                        {formatCurrency(order.finalCost)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pickup Details */}
              <div className="border-t border-[var(--theme-border)] pt-4 grid grid-cols-2 gap-4">
                {pickupDateTime && (
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-[var(--theme-text-tertiary)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mb-1">
                        Pickup Time
                      </p>
                      <p className="text-[12px] text-[var(--theme-text-secondary)]">
                        {pickupDateTime}
                      </p>
                    </div>
                  </div>
                )}
                {pickupAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[var(--theme-text-tertiary)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mb-1">
                        Pickup Address
                      </p>
                      <p className="text-[12px] text-[var(--theme-text-secondary)] line-clamp-2">
                        {pickupAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Next Steps Container */}
          <div className="w-full bg-[var(--theme-card-darker)] border border-[var(--theme-border)] rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-[var(--theme-border)] pb-3">
              <h3 className="text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-extrabold">
                Next Steps
              </h3>
              {/* Dot Indicators */}
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-text-primary)]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-border-strong)]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-border-strong)]"></div>
              </div>
            </div>

            {/* Horizontal Timeline Row */}
            <div className="grid grid-cols-3 gap-6">

              {/* Step 1 - Active */}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--theme-text-primary)] text-[var(--theme-bg)] flex items-center justify-center text-[12px] font-black">
                    01
                  </div>
                  <h4 className="text-[13px] font-extrabold text-[var(--theme-text-primary)]">
                    Diagnostic Check
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed pl-1">
                  Our technicians will perform a full scan of your hardware.
                </p>
              </div>

              {/* Step 2 - Inactive */}
              <div className="flex flex-col items-start opacity-45">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--theme-border-strong)] text-[var(--theme-text-tertiary)] flex items-center justify-center text-[12px] font-black">
                    02
                  </div>
                  <h4 className="text-[13px] font-extrabold text-[var(--theme-text-primary)]">
                    Component Prep
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed pl-1">
                  Precision OEM parts are selected from the inventory.
                </p>
              </div>

              {/* Step 3 - Inactive */}
              <div className="flex flex-col items-start opacity-45">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--theme-border-strong)] text-[var(--theme-text-tertiary)] flex items-center justify-center text-[12px] font-black">
                    03
                  </div>
                  <h4 className="text-[13px] font-extrabold text-[var(--theme-text-primary)]">
                    Final Calibration
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed pl-1">
                  Post-repair testing to ensure factory-standard performance.
                </p>
              </div>

            </div>
          </div>

          {/* Action Buttons Horizontal */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <button
              onClick={handleTrackOrder}
              className="h-12 bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold rounded-xl text-[12px] tracking-wide hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Truck size={16} className="stroke-[2.5]" />
              TRACK ORDER
            </button>

            <button
              onClick={handleGoHome}
              className="h-12 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-btn-secondary-border)] text-[var(--theme-btn-secondary-text)] font-bold rounded-xl text-[12px] tracking-wide hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight size={14} className="stroke-[2.5]" />
              BOOK ANOTHER REPAIR
            </button>
          </div>

          {/* CS Message notice badge */}
          <div className="border border-[var(--theme-border)] bg-[var(--theme-card-darker)] px-4 py-2.5 rounded-full inline-flex items-center gap-2">
            <Mail size={12} className="text-[var(--theme-text-tertiary)]" />
            <span className="text-[9px] font-extrabold text-[var(--theme-text-secondary)] tracking-wider uppercase">
              Our customer support team will call you to confirm your order.
            </span>
          </div>

        </div>
      </div>
    </>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100svh] bg-[var(--theme-bg)] pt-6 px-5 pb-24 flex flex-col lg:hidden">
        <div className="flex flex-col items-center mb-8">
          <div className="skeleton w-16 h-16 rounded-2xl mb-5" />
          <div className="skeleton h-7 w-52 rounded-lg mb-3" />
          <div className="skeleton h-4 w-64 rounded-md" />
        </div>
        <div className="skeleton rounded-2xl mb-4" style={{ height: 96 }} />
        <div className="skeleton rounded-2xl mb-6" style={{ height: 88 }} />
        <div className="flex flex-col gap-3">
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
