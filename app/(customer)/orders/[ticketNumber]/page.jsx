'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Check, User, Truck, RefreshCw, ClipboardCheck,
  ShieldCheck, Smartphone, Headphones
} from 'lucide-react'
import bookingService from '@/services/booking.service'
import orderService from '@/services/order.service'
import DiagnosisApprovalCard from '@/components/orders/DiagnosisApprovalCard'
import InvoiceCard from '@/components/orders/InvoiceCard'
import WarrantyCard from '@/components/orders/WarrantyCard'
import PartnerCard from '@/components/orders/PartnerCard'

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0'
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₹${numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function formatDate(value) {
  if (!value) return 'To be confirmed'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// 6 major milestone definitions from UI Mockup
const milestones = [
  {
    title: 'Booking Confirmed',
    description: 'System validated order details and booking has been registered successfully.',
    icon: Check,
    statuses: ['ORDER_PLACED', 'CS_CONFIRMED']
  },
  {
    title: 'Technician Assigned',
    description: 'A technician has been allocated to your device.',
    icon: User,
    statuses: ['PICKUP_ASSIGNED', 'PICKUP_IN_PROGRESS']
  },
  {
    title: 'Device Picked Up',
    description: 'Your device is in transit or has safely arrived at our service centre.',
    icon: PICKUP_COMPLETED => ['PICKUP_COMPLETED', 'DEVICE_PICKED_UP', 'DEVICE_AT_CENTRE', 'RECEIVED_AT_CENTRE']
  },
  {
    title: 'Repair in Progress',
    description: 'The technician is diagnosing or executing the repairs on your device.',
    icon: RefreshCw,
    statuses: ['DIAGNOSIS_PENDING', 'DIAGNOSIS_IN_PROGRESS', 'DIAGNOSIS_COMPLETE', 'CUSTOMER_APPROVED', 'REPAIR_IN_PROGRESS']
  },
  {
    title: 'Repair Completed',
    description: 'Repair has been successfully finished and passed the quality assurance check.',
    icon: ClipboardCheck,
    statuses: ['REPAIR_COMPLETED', 'QC_PASSED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED']
  },
  {
    title: 'Delivered',
    description: 'Your device has been delivered back to you.',
    icon: ShieldCheck,
    statuses: ['DELIVERY_ASSIGNED', 'DELIVERY_IN_PROGRESS', 'DELIVERED']
  }
]

export default function OrderDetailPage() {
  const { ticketNumber } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [approval, setApproval] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [warranty, setWarranty] = useState(null)
  const [error, setError] = useState('')
  const [reloadVersion, setReloadVersion] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadOrder = async () => {
      try {
        const nextOrder = await bookingService.getCustomerOrder(ticketNumber)
        if (isMounted) {
          setOrder(nextOrder)
          setError('')
        }

        if (nextOrder.repairStatus === 'CUSTOMER_APPROVAL_PENDING') {
          const nextApproval = await orderService.getApproval(ticketNumber)
          if (isMounted) setApproval(nextApproval)
        } else if (isMounted) {
          setApproval(null)
        }

        if (nextOrder.repairStatus === 'DELIVERED') {
          const [nextInvoice, nextWarranty] = await Promise.all([
            orderService.getInvoice(ticketNumber),
            orderService.getWarranty(ticketNumber),
          ])
          if (isMounted) {
            setInvoice(nextInvoice)
            setWarranty(nextWarranty)
          }
        } else if (isMounted) {
          setInvoice(null)
          setWarranty(null)
        }
      } catch (_) {
        if (isMounted) setError('Unable to load this order.')
      }
    }

    loadOrder()

    // Dynamically adjust polling frequency:
    // Near real-time location mapping updates every 5 seconds during active transits.
    const activeTracking = nextOrder => {
      const status = nextOrder?.repairStatus || order?.repairStatus;
      return ['PICKUP_IN_PROGRESS', 'PICKUP_EN_ROUTE', 'DELIVERY_IN_PROGRESS', 'OUT_FOR_DELIVERY'].includes(status);
    };

    const delay = activeTracking() ? 5000 : 30000;
    const intervalId = window.setInterval(loadOrder, delay);

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [reloadVersion, ticketNumber, order?.repairStatus])

  if (error) {
    return (
      <main className="min-h-[100svh] px-4 pt-20 text-[var(--theme-text-primary)] bg-[var(--theme-bg)] flex flex-col items-center justify-center">
        <p className="text-red-400 font-bold mb-4">{error}</p>
        <button onClick={() => router.back()} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </main>
    )
  }

  if (!order) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="lg:hidden min-h-[100svh] bg-[var(--theme-bg)] pt-6 px-5 pb-24">
          <div className="mb-6">
            <div className="skeleton h-8 w-40 rounded-lg mb-3" />
            <div className="skeleton h-6 w-56 rounded-md mb-2" />
            <div className="skeleton h-4 w-32 rounded" />
          </div>
          {/* Device card */}
          <div className="skeleton rounded-2xl mb-8" style={{ height: 88 }} />
          {/* Timeline card */}
          <div className="skeleton rounded-3xl" style={{ height: 380 }} />
        </div>

        {/* Desktop skeleton */}
        <div className="hidden lg:block bg-[var(--theme-bg)] min-h-[calc(100vh-var(--topbar-height))] py-10 px-8">
          <div className="skeleton h-4 w-48 rounded mb-6" />
          <div className="flex items-start justify-between gap-6 border-b border-[var(--theme-border)] pb-8 mb-8">
            <div>
              <div className="skeleton h-9 w-80 rounded-lg mb-3" />
              <div className="skeleton h-5 w-56 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_360px] gap-10">
            <div className="skeleton rounded-3xl" style={{ height: 500 }} />
            <div className="flex flex-col gap-6">
              <div className="skeleton rounded-3xl" style={{ height: 160 }} />
              <div className="skeleton rounded-3xl" style={{ height: 120 }} />
              <div className="skeleton rounded-3xl" style={{ height: 140 }} />
            </div>
          </div>
        </div>
      </>
    )
  }

  const deviceName = [order.brandRef?.name, order.modelRef?.name].filter(Boolean).join(' ') || 'Repair Device'
  const repairType = order.repairTypes?.map((repair) => repair.name).join(' + ') || 'Inspection and Diagnosis'

  // Map backend status to active milestone index (0 to 5)
  const getActiveStageIndex = (status) => {
    const mapping = {
      ORDER_PLACED: 0,
      CS_CONFIRMED: 0,

      PICKUP_ASSIGNED: 1,
      PICKUP_IN_PROGRESS: 1,

      PICKUP_COMPLETED: 2,
      DEVICE_PICKED_UP: 2,
      DEVICE_AT_CENTRE: 2,
      RECEIVED_AT_CENTRE: 2,

      DIAGNOSIS_PENDING: 3,
      DIAGNOSIS_IN_PROGRESS: 3,
      DIAGNOSIS_COMPLETE: 3,
      CUSTOMER_APPROVED: 3,
      REPAIR_IN_PROGRESS: 3,

      REPAIR_COMPLETED: 4,
      QC_PASSED: 4,
      PAYMENT_PENDING: 4,
      PAYMENT_COMPLETED: 4,

      DELIVERY_ASSIGNED: 5,
      DELIVERY_IN_PROGRESS: 5,
      DELIVERED: 5
    }
    return mapping[status] !== undefined ? mapping[status] : 0
  }

  const activeStageIndex = getActiveStageIndex(order.repairStatus)

  // Helper to extract stage timestamps from status history
  const getStageTimestamp = (stageIndex) => {
    if (!order.repairStatusHistory) return null
    const targetStatuses = stageIndex === 2
      ? ['PICKUP_COMPLETED', 'DEVICE_PICKED_UP', 'DEVICE_AT_CENTRE', 'RECEIVED_AT_CENTRE']
      : milestones[stageIndex].statuses

    const entry = [...order.repairStatusHistory]
      .reverse()
      .find(h => targetStatuses.includes(h.status))

    if (entry) {
      return new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    if (stageIndex === 0 && order.createdAt) {
      return new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    return null
  }

  // Formatting display status
  const getDisplayStatusLabel = (status) => {
    const labels = {
      ORDER_PLACED: 'Order Placed',
      CS_CONFIRMED: 'Confirmed',
      PICKUP_ASSIGNED: 'Pickup Scheduled',
      PICKUP_IN_PROGRESS: 'Pickup En Route',
      DEVICE_PICKED_UP: 'Device Picked Up',
      RECEIVED_AT_CENTRE: 'Received at Service Centre',
      DIAGNOSIS_IN_PROGRESS: 'Under Diagnosis',
      DIAGNOSIS_COMPLETE: 'Diagnosis Complete',
      CUSTOMER_APPROVED: 'Approved for Repair',
      REPAIR_IN_PROGRESS: 'Repair in Progress',
      REPAIR_COMPLETED: 'Repair Completed',
      QC_PASSED: 'Quality Checked',
      PAYMENT_PENDING: 'Awaiting Payment',
      PAYMENT_COMPLETED: 'Payment Received',
      DELIVERY_ASSIGNED: 'Delivery Scheduled',
      DELIVERY_IN_PROGRESS: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    }
    return labels[status] || 'Processing'
  }

  return (
    <>
      {/* 📱 MOBILE VIEW (<1024px) */}
      <div className="lg:hidden min-h-[100svh] bg-[var(--theme-bg)] py-24 px-4 pb-24 text-[var(--theme-text-primary)]">
        {/* TRACK ORDER heading */}
        <div className="mb-6">
          <h1 className="text-[26px] font-black tracking-tight mb-2 text-white">TRACK ORDER</h1>
          <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-[var(--theme-card-darker)] border border-[var(--theme-border)] text-[var(--theme-text-tertiary)] inline-block mb-3">
            CURRENT STATUS
          </span>
          <h2 className="text-[22px] font-black text-white leading-tight mb-1">
            {getDisplayStatusLabel(order.repairStatus)}
          </h2>
          <p className="text-[12px] font-mono text-[var(--theme-text-tertiary)]">
            Order ID: {order.ticketNumber}
          </p>
        </div>

        {/* Device Information Card */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 mb-8 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-[64px] h-[64px] bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1.5 shadow-inner">
              {order.modelRef?.images?.[0] ? (
                <img src={order.modelRef.images[0]} alt={deviceName} className="w-full h-full object-contain" />
              ) : (
                <Smartphone className="w-6 h-6 text-[var(--theme-text-tertiary)]" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-[14px] font-extrabold text-white leading-tight truncate">
                {deviceName}
              </h3>
              <p className="text-[11px] text-[var(--theme-text-secondary)] mt-0.5 truncate">
                {repairType}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {order.finalCost ? (
              <p className="text-[14px] font-black text-white">
                {formatCurrency(order.finalCost)}
              </p>
            ) : (
              <p className="text-[12px] font-bold text-[var(--theme-text-tertiary)]">TBD</p>
            )}
            <p className="text-[9px] uppercase tracking-wider text-[var(--theme-text-tertiary)] font-bold mt-0.5">
              ESTIMATE
            </p>
          </div>
        </div>

        {/* Status Alerts (Approval / Cancellation) */}
        {order.repairStatus === 'CUSTOMER_APPROVAL_PENDING' && (
          <div className="mb-6">
            <DiagnosisApprovalCard
              ticketNumber={ticketNumber}
              approval={approval}
              onUpdated={() => setReloadVersion((current) => current + 1)}
            />
          </div>
        )}

        {order.repairStatus === 'CANCELLED' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            <p className="text-red-400 text-sm font-semibold">This booking has been cancelled.</p>
            {order.cancellationReason && (
              <p className="text-red-300/80 text-xs mt-1">Reason: {order.cancellationReason}</p>
            )}
          </div>
        )}

        {/* Mobile Vertical Timeline */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-8 relative">
            {milestones.map((m, idx) => {
              const isCompleted = idx < activeStageIndex || order.repairStatus === 'DELIVERED'
              const isActive = idx === activeStageIndex && order.repairStatus !== 'DELIVERED' && order.repairStatus !== 'CANCELLED'
              const isFuture = idx > activeStageIndex && order.repairStatus !== 'DELIVERED'
              const timestamp = getStageTimestamp(idx)

              const StepIcon = idx === 2 ? Truck : m.icon

              return (
                <div key={idx} className="flex gap-4 relative min-h-[48px]">
                  {/* Timeline vertical bar */}
                  {idx < milestones.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-8 bottom-[-32px] w-[2.5px] rounded-full transition-colors duration-300 ${idx < activeStageIndex ? 'bg-green-500' : 'bg-[var(--theme-border)]'
                        }`}
                    ></div>
                  )}

                  {/* Bullet indicator */}
                  <div className="relative z-10 shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/10 text-white">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-md animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--theme-card-darker)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-tertiary)]">
                        <StepIcon size={14} className="opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <h4 className={`text-[14px] font-extrabold ${isFuture ? 'text-[var(--theme-text-tertiary)]' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      {isActive && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white text-black leading-none">
                          ACTIVE NOW
                        </span>
                      )}
                    </div>

                    {/* Show timestamp on completed or active */}
                    {(isCompleted || isActive) && timestamp && (
                      <p className="text-[10px] text-[var(--theme-text-tertiary)] font-semibold uppercase tracking-wider mb-1.5">
                        {timestamp}
                      </p>
                    )}

                    {/* Detailed info only for active or completed */}
                    {!isFuture && (
                      <p className="text-[12px] text-[var(--theme-text-secondary)] leading-relaxed font-medium">
                        {m.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Partner Cards on Mobile */}
        {['PICKUP_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKUP_EN_ROUTE'].includes(order.repairStatus) && (
          <div className="mb-6">
            <PartnerCard
              title="Pickup Partner"
              partner={order.pickupPartner ? { ...order.pickupPartner, eta: order.pickupEta } : null}
              showMap={['PICKUP_IN_PROGRESS', 'PICKUP_EN_ROUTE'].includes(order.repairStatus)}
            />
          </div>
        )}
        {['DELIVERY_ASSIGNED', 'DELIVERY_IN_PROGRESS', 'OUT_FOR_DELIVERY'].includes(order.repairStatus) && (
          <div className="mb-6">
            <PartnerCard
              title="Delivery Partner"
              partner={order.deliveryPartner ? { ...order.deliveryPartner, eta: order.deliveryEta } : null}
              showMap={['DELIVERY_IN_PROGRESS', 'OUT_FOR_DELIVERY'].includes(order.repairStatus)}
            />
          </div>
        )}

        {/* Invoice & Warranty Documents on Mobile */}
        <InvoiceCard ticketNumber={ticketNumber} invoice={invoice} />
        {order.repairStatus === 'DELIVERED' && (
          <WarrantyCard ticketNumber={ticketNumber} warranty={warranty} />
        )}

        {/* Mobile Help CTA */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--theme-text-tertiary)]">
            AVAILABLE 24/7 FOR SUPPORT
          </p>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="w-full h-12 bg-white text-black font-black rounded-2xl text-[12px] uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Headphones size={15} />
            Need Help?
          </a>
        </div>
      </div>


      {/* 🖥️ DESKTOP VIEW (≥1024px) */}
      <div className="hidden lg:block bg-[var(--theme-bg)] min-h-[calc(100vh-var(--topbar-height))] py-10 px-8 text-[var(--theme-text-primary)]">
        <div className="w-full">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--theme-text-tertiary)]">
              ACTIVE REPAIRS
            </span>
            <span className="text-[10px] text-[var(--theme-text-tertiary)]">/</span>
            <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-white">
              {order.ticketNumber}
            </span>
          </div>

          {/* Large Title Row */}
          <div className="flex items-start justify-between gap-6 border-b border-[var(--theme-border)] pb-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-[34px] font-black text-white tracking-tight leading-none">
                  {order.repairTypes?.[0]?.name ? `Repairing ${order.repairTypes[0].name}` : 'Repairing Device'}
                </h1>
                <span className="bg-green-500 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                  LIVE
                </span>
              </div>
              <p className="text-[15px] font-bold text-[var(--theme-text-secondary)]">
                {deviceName} — {repairType}
              </p>
            </div>

            {/* Estimated Completion Card - renders only when dynamic estimatedDeliveryDate is available */}
            {order.estimatedDeliveryDate && (
              <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl px-6 py-4 text-right shadow-sm shrink-0 flex items-center gap-4">
                <div className="w-[1.5px] h-10 bg-[var(--theme-border)]"></div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-[var(--theme-text-tertiary)] font-black leading-none mb-1.5">
                    ESTIMATED COMPLETION
                  </p>
                  <p className="text-[16px] font-black text-white leading-none">
                    {formatDate(order.estimatedDeliveryDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Alerts (Approval / Cancellation) on Desktop */}
          {order.repairStatus === 'CUSTOMER_APPROVAL_PENDING' && (
            <div className="mb-8">
              <DiagnosisApprovalCard
                ticketNumber={ticketNumber}
                approval={approval}
                onUpdated={() => setReloadVersion((current) => current + 1)}
              />
            </div>
          )}


          {order.repairStatus === 'CANCELLED' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 mb-8 flex items-center justify-between">
              <div>
                <h4 className="text-red-400 font-extrabold text-base">Booking Cancelled</h4>
                <p className="text-red-300/80 text-sm mt-1">cancellation reason: {order.cancellationReason || 'Requested by support/customer'}</p>
              </div>
              <button onClick={() => router.back()} className="btn-secondary !h-10 !px-4">
                Back to Orders
              </button>
            </div>
          )}

          {/* Main 2-Column Grid Layout */}
          <div className="grid grid-cols-[1fr_360px] gap-10">

            {/* Left Column: Vertical Milestones Timeline */}
            <div className="flex flex-col gap-10">
              <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-3xl p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-white mb-8 border-b border-[var(--theme-border)] pb-4">
                  REPAIR MILESTONES & TIMELINE
                </h3>

                <div className="flex flex-col gap-10 relative">
                  {milestones.map((m, idx) => {
                    const isCompleted = idx < activeStageIndex || order.repairStatus === 'DELIVERED'
                    const isActive = idx === activeStageIndex && order.repairStatus !== 'DELIVERED' && order.repairStatus !== 'CANCELLED'
                    const isFuture = idx > activeStageIndex && order.repairStatus !== 'DELIVERED'
                    const timestamp = getStageTimestamp(idx)
                    const StepIcon = idx === 2 ? Truck : m.icon

                    return (
                      <div key={idx} className="flex gap-6 relative min-h-[56px]">
                        {/* Timeline vertical bar */}
                        {idx < milestones.length - 1 && (
                          <div
                            className={`absolute left-[17px] top-9 bottom-[-40px] w-[2.5px] rounded-full transition-colors duration-300 ${idx < activeStageIndex ? 'bg-green-500' : 'bg-[var(--theme-border)]'
                              }`}
                          ></div>
                        )}

                        {/* Bullet indicator */}
                        <div className="relative z-10 shrink-0">
                          {isCompleted ? (
                            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/10 text-white">
                              <Check size={18} className="stroke-[3]" />
                            </div>
                          ) : isActive ? (
                            <div className="w-9 h-9 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-md animate-pulse">
                              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[var(--theme-card-darker)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-tertiary)]">
                              <StepIcon size={15} className="opacity-40" />
                            </div>
                          )}
                        </div>

                        {/* Detailed Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <h4 className={`text-[15px] font-black tracking-tight ${isFuture ? 'text-[var(--theme-text-tertiary)]' : 'text-white'}`}>
                              {m.title}
                            </h4>
                            {isActive && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-white text-black leading-none shrink-0">
                                ACTIVE NOW
                              </span>
                            )}
                          </div>

                          {(isCompleted || isActive) && timestamp && (
                            <p className="text-[10px] text-[var(--theme-text-tertiary)] font-bold uppercase tracking-wider mb-2">
                              {timestamp}
                            </p>
                          )}

                          {!isFuture && (
                            <p className="text-[13px] text-[var(--theme-text-secondary)] leading-relaxed font-medium max-w-[560px]">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Stacked Action/Document Cards */}
            <div className="flex flex-col gap-6">

              {/* Partner Cards on Desktop */}
              {['PICKUP_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKUP_EN_ROUTE'].includes(order.repairStatus) && (
                <PartnerCard
                  title="Pickup Partner Assigned"
                  partner={order.pickupPartner ? { ...order.pickupPartner, eta: order.pickupEta } : null}
                  showMap={['PICKUP_IN_PROGRESS', 'PICKUP_EN_ROUTE'].includes(order.repairStatus)}
                />
              )}
              {['DELIVERY_ASSIGNED', 'DELIVERY_IN_PROGRESS', 'OUT_FOR_DELIVERY'].includes(order.repairStatus) && (
                <PartnerCard
                  title="Delivery Partner Assigned"
                  partner={order.deliveryPartner ? { ...order.deliveryPartner, eta: order.deliveryEta } : null}
                  showMap={['DELIVERY_IN_PROGRESS', 'OUT_FOR_DELIVERY'].includes(order.repairStatus)}
                />
              )}

              {/* Invoice & Warranty Documents on Desktop */}
              <InvoiceCard ticketNumber={ticketNumber} invoice={invoice} />
              {order.repairStatus === 'DELIVERED' && (
                <WarrantyCard ticketNumber={ticketNumber} warranty={warranty} />
              )}

              {/* Dynamic Support CTA */}
              <div className="bg-black border border-[var(--theme-border)] rounded-3xl p-6 shadow-lg">
                <h4 className="text-[16px] font-black text-white leading-tight mb-2">Need Help?</h4>
                <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed font-medium mb-5">
                  Speak directly with our support lead or operations team about this repair.
                </p>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-white text-black py-3 rounded-xl text-[11px] font-black uppercase tracking-wider text-center hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Headphones size={13} className="stroke-[2.5]" />
                  CHAT SUPPORT
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  )
}
