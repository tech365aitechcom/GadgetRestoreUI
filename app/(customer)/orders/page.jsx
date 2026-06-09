'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  ClipboardList,
  Plus,
  Clock,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Tag,
  CreditCard,
  Shield,
  AlertCircle,
} from 'lucide-react'
import orderService from '@/services/order.service'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'

const CLOSED_STATUSES = new Set(['DELIVERED', 'CANCELLED'])

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0'
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getDeviceIcon(deviceName) {
  const name = deviceName?.toLowerCase() || ''
  if (name.includes('phone') || name.includes('iphone')) return Smartphone
  if (name.includes('laptop') || name.includes('macbook')) return Laptop
  if (name.includes('tablet') || name.includes('ipad')) return Tablet
  if (name.includes('watch')) return Watch
  return Smartphone
}

function calculateProgress(status) {
  const progressMap = {
    ORDER_PLACED: 20,
    PICKUP_SCHEDULED: 30,
    PICKED_UP: 40,
    RECEIVED_AT_SC: 50,
    DIAGNOSIS_IN_PROGRESS: 60,
    DIAGNOSIS_COMPLETED: 65,
    REPAIR_IN_PROGRESS: 75,
    REPAIR_COMPLETED: 85,
    QUALITY_CHECK: 90,
    READY_FOR_DELIVERY: 95,
    DELIVERED: 100,
    CANCELLED: 0,
  }
  return progressMap[status] || 20
}

function getStatusLabel(status) {
  const statusLabels = {
    ORDER_PLACED: 'Order Placed',
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
  return statusLabels[status] || status.replace(/_/g, ' ')
}

function getPaymentStatusBadge(paymentStatus) {
  const badges = {
    Paid: {
      text: 'Paid',
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    'Partially Paid': {
      text: 'Partial',
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    Unpaid: {
      text: 'Unpaid',
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  }
  return (
    badges[paymentStatus] || {
      text: 'Pending',
      color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    }
  )
}

function calculateServiceStats(orders) {
  if (!orders || orders.length === 0) {
    return {
      accuracy: 0,
      turnaroundHours: 0,
      turnaroundDisplay: '0 Hrs',
      totalCompleted: 0,
    }
  }

  // Calculate Service Accuracy
  const completedOrders = orders.filter(
    (order) =>
      order.repairStatus === 'DELIVERED' || order.repairStatus === 'CANCELLED',
  )
  const successfulOrders = orders.filter(
    (order) => order.repairStatus === 'DELIVERED',
  )
  const accuracy =
    completedOrders.length > 0
      ? (successfulOrders.length / completedOrders.length) * 100
      : 0

  // Calculate Average Turnaround Time
  const deliveredOrders = orders.filter(
    (order) =>
      order.repairStatus === 'DELIVERED' &&
      order.orderPlacedAt &&
      order.deliveredAt,
  )

  let turnaroundHours = 0
  if (deliveredOrders.length > 0) {
    const totalHours = deliveredOrders.reduce((sum, order) => {
      const start = new Date(order.orderPlacedAt)
      const end = new Date(order.deliveredAt)
      const hours = (end - start) / (1000 * 60 * 60) // Convert ms to hours
      return sum + hours
    }, 0)
    turnaroundHours = totalHours / deliveredOrders.length
  }

  // Format turnaround display
  let turnaroundDisplay = '0 Hrs'
  if (turnaroundHours > 0) {
    if (turnaroundHours < 24) {
      turnaroundDisplay = `${turnaroundHours.toFixed(1)} Hrs`
    } else {
      const days = turnaroundHours / 24
      turnaroundDisplay = `${days.toFixed(1)} Days`
    }
  }

  return {
    accuracy: accuracy.toFixed(1),
    turnaroundHours,
    turnaroundDisplay,
    totalCompleted: completedOrders.length,
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      try {
        const nextOrders = await orderService.getOrders()
        if (isMounted) {
          setOrders(nextOrders)
          setError('')
        }
      } catch (_) {
        if (isMounted) setError('Unable to load your orders right now.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadOrders()
    const intervalId = window.setInterval(loadOrders, 30000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const activeOrders = orders.filter(
    (order) => !CLOSED_STATUSES.has(order.repairStatus),
  )
  const currentOrder = activeOrders[0] // Priority/current ticket

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const device = [order.brandRef?.name, order.modelRef?.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return (
      order.ticketNumber?.toLowerCase().includes(query) ||
      device.includes(query) ||
      order.repairStatus?.toLowerCase().includes(query)
    )
  })

  // Calculate service statistics
  const stats = calculateServiceStats(orders)

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='lg:hidden min-h-[100svh] bg-[var(--theme-bg)] pb-20 px-5 pt-6'>
        {loading ? (
          <div className='flex flex-col gap-3'>
            {/* Active order card skeleton */}
            <div className='skeleton rounded-2xl' style={{ height: 220 }} />
            {/* History skeleton rows */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='skeleton rounded-xl'
                style={{ height: 72 }}
              />
            ))}
          </div>
        ) : error ? (
          <div className='grid place-items-center min-h-[200px] rounded-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] text-red-400'>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className='grid place-items-center min-h-[200px] rounded-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] text-center p-6'>
            <ClipboardList
              size={42}
              className='text-[var(--theme-text-tertiary)] mb-3'
            />
            <h2 className='text-lg font-bold text-[var(--theme-text-primary)] mb-2'>
              No orders yet
            </h2>
            <p className='text-[var(--theme-text-secondary)] text-sm mb-4'>
              Book your first repair!
            </p>
            <Link href='/select-brand' className='btn-primary no-underline'>
              Book Repair
            </Link>
          </div>
        ) : (
          <>
            {/* Current Active Repair Card */}
            {currentOrder && (
              <Link
                href={`/orders/detail?ticketNumber=${encodeURIComponent(currentOrder.ticketNumber)}`}
                className='block mb-4 no-underline'
              >
                <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-5'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <p className='text-[9px] uppercase tracking-[0.12em] text-[var(--theme-text-tertiary)] mb-1 font-bold'>
                        CURRENT TICKET #
                        {currentOrder.ticketNumber?.split('-').pop()}
                      </p>
                      <h3 className='text-[18px] font-extrabold text-[var(--theme-text-primary)]'>
                        {[currentOrder.modelRef?.name]
                          .filter(Boolean)
                          .join(' ') || 'Device Repair'}
                      </h3>
                      <p className='text-[11px] text-[var(--theme-text-secondary)] mt-1'>
                        Service Center:{' '}
                        {currentOrder.serviceCentre?.name || 'Assigned'}
                      </p>
                      {currentOrder.trackingCode && (
                        <div className='flex items-center gap-1.5 mt-2'>
                          <Tag
                            size={10}
                            className='text-[var(--theme-text-tertiary)]'
                          />
                          <p className='text-[10px] text-[var(--theme-text-tertiary)] font-mono'>
                            {currentOrder.trackingCode}
                          </p>
                        </div>
                      )}
                    </div>
                    <OrderStatusBadge status={currentOrder.repairStatus} />
                  </div>

                  {/* Symptoms & Repair Types */}
                  {(currentOrder.symptoms?.length > 0 ||
                    currentOrder.repairTypes?.length > 0) && (
                    <div className='mb-3 space-y-1.5'>
                      {currentOrder.symptoms?.length > 0 && (
                        <div className='flex items-center gap-1.5 flex-wrap'>
                          <AlertCircle
                            size={11}
                            className='text-[var(--theme-text-tertiary)]'
                          />
                          <div className='flex gap-1.5 flex-wrap'>
                            {currentOrder.symptoms
                              .slice(0, 2)
                              .map((symptom, idx) => (
                                <span
                                  key={idx}
                                  className='px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded border border-red-500/20'
                                >
                                  {symptom.name}
                                </span>
                              ))}
                            {currentOrder.symptoms.length > 2 && (
                              <span className='text-[10px] text-[var(--theme-text-tertiary)]'>
                                +{currentOrder.symptoms.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {currentOrder.repairTypes?.length > 0 && (
                        <div className='flex items-center gap-1.5 flex-wrap'>
                          <div className='flex gap-1.5 flex-wrap'>
                            {currentOrder.repairTypes
                              .slice(0, 2)
                              .map((repair, idx) => (
                                <span
                                  key={idx}
                                  className='px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20'
                                >
                                  {repair.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment & Warranty Info */}
                  {(currentOrder.paymentStatus ||
                    currentOrder.warrantyMonths ||
                    currentOrder.partTier) && (
                    <div className='flex items-center gap-2 mb-3 flex-wrap'>
                      {currentOrder.paymentStatus && (
                        <div className='flex items-center gap-1.5'>
                          <CreditCard
                            size={11}
                            className='text-[var(--theme-text-tertiary)]'
                          />
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getPaymentStatusBadge(currentOrder.paymentStatus).color}`}
                          >
                            {
                              getPaymentStatusBadge(currentOrder.paymentStatus)
                                .text
                            }
                          </span>
                        </div>
                      )}
                      {currentOrder.warrantyMonths && (
                        <div className='flex items-center gap-1.5'>
                          <Shield
                            size={11}
                            className='text-[var(--theme-text-tertiary)]'
                          />
                          <span className='text-[10px] text-[var(--theme-text-tertiary)] font-bold'>
                            {currentOrder.warrantyMonths}M Warranty
                          </span>
                        </div>
                      )}
                      {currentOrder.partTier && (
                        <span className='px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded border border-purple-500/20'>
                          {currentOrder.partTier.tier} Parts
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className='mt-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-[11px] font-bold text-[var(--theme-text-secondary)]'>
                        {getStatusLabel(currentOrder.repairStatus)}
                      </span>
                      <span className='text-[13px] font-extrabold text-[var(--theme-text-primary)]'>
                        {calculateProgress(currentOrder.repairStatus)}%
                      </span>
                    </div>
                    <div className='h-1 bg-[var(--theme-border)] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-[var(--theme-text-primary)] rounded-full'
                        style={{
                          width: `${calculateProgress(currentOrder.repairStatus)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Est. Completion & Cost */}
                  <div className='flex items-center gap-2 mt-4 pt-4 border-t border-[var(--theme-border)]'>
                    <Clock
                      size={14}
                      className='text-[var(--theme-text-tertiary)]'
                    />
                    <div className='flex-1'>
                      <p className='text-[9px] uppercase tracking-[0.12em] text-[var(--theme-text-tertiary)] font-bold'>
                        {currentOrder.estimatedDeliveryDate
                          ? 'EST. DELIVERY'
                          : currentOrder.slotDate
                            ? 'SCHEDULED FOR'
                            : 'BOOKED ON'}
                      </p>
                      <p className='text-[12px] font-bold text-[var(--theme-text-primary)]'>
                        {currentOrder.estimatedDeliveryDate
                          ? formatDate(currentOrder.estimatedDeliveryDate)
                          : currentOrder.slotDate
                            ? formatDate(currentOrder.slotDate)
                            : formatDate(currentOrder.createdAt)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-[9px] uppercase tracking-[0.12em] text-[var(--theme-text-tertiary)] font-bold'>
                        TOTAL
                      </p>
                      <p className='text-[14px] font-black text-[var(--theme-text-primary)]'>
                        {formatCurrency(currentOrder.finalCost || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Past Repairs */}
            {orders.length > 1 && (
              <div className='mt-6'>
                <div className='flex items-center justify-between mb-3'>
                  <h2 className='text-[11px] uppercase tracking-[0.12em] text-[var(--theme-text-tertiary)] font-bold'>
                    HISTORY
                  </h2>
                  <Link
                    href='#'
                    className='text-[11px] font-bold text-[var(--theme-text-primary)] no-underline'
                  >
                    View all past repairs
                  </Link>
                </div>

                <div className='flex flex-col gap-3'>
                  {orders.slice(1, 4).map((order) => {
                    const DeviceIcon = getDeviceIcon(order.modelRef?.name)
                    return (
                      <Link
                        key={order.ticketNumber}
                        href={`/orders/detail?ticketNumber=${encodeURIComponent(order.ticketNumber)}`}
                        className='flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl no-underline'
                      >
                        <div className='w-10 h-10 rounded-lg bg-[var(--theme-surface)] flex items-center justify-center flex-shrink-0'>
                          <DeviceIcon
                            size={20}
                            className='text-[var(--theme-text-secondary)]'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-[13px] font-bold text-[var(--theme-text-primary)] mb-0.5 truncate'>
                            {[order.brandRef?.name, order.modelRef?.name]
                              .filter(Boolean)
                              .join(' ') || 'Device Repair'}
                          </h3>
                          <p className='text-[11px] text-[var(--theme-text-tertiary)]'>
                            {order.ticketNumber} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className='text-[var(--theme-text-tertiary)] flex-shrink-0'
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='hidden lg:block min-h-[calc(100vh-var(--topbar-height))] bg-[var(--theme-bg)]'>
        <div className='p-8'>
          {/* Header */}
          <div className='flex items-end justify-between mb-8'>
            <div>
              <h1 className='text-[28px] font-black text-[var(--theme-text-primary)]'>
                My Orders
              </h1>
            </div>
          </div>

          {loading ? (
            <div className='grid grid-cols-12 gap-6'>
              {/* Left column — active order card */}
              <div className='col-span-7 flex flex-col gap-6'>
                <div className='skeleton rounded-2xl' style={{ height: 340 }} />
                {/* History table */}
                <div className='skeleton rounded-2xl' style={{ height: 220 }} />
              </div>
              {/* Right column — stats */}
              <div className='col-span-5 flex flex-col gap-6'>
                <div className='skeleton rounded-2xl' style={{ height: 160 }} />
                <div className='skeleton rounded-2xl' style={{ height: 200 }} />
              </div>
            </div>
          ) : error ? (
            <div className='grid place-items-center min-h-[400px] rounded-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] text-red-400'>
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className='grid place-items-center min-h-[400px] rounded-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] text-center p-8'>
              <ClipboardList
                size={56}
                className='text-[var(--theme-text-tertiary)] mb-4'
              />
              <h2 className='text-2xl font-bold text-[var(--theme-text-primary)] mb-3'>
                No orders yet
              </h2>
              <p className='text-[var(--theme-text-secondary)] mb-6'>
                Book your first repair!
              </p>
              <Link href='/select-brand' className='btn-primary no-underline'>
                <Plus size={18} />
                Book Repair
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-12 gap-6'>
              {/* Left Column - Current Active Repair */}
              <div className='col-span-7'>
                {currentOrder ? (
                  <Link
                    href={`/orders/detail?ticketNumber=${encodeURIComponent(currentOrder.ticketNumber)}`}
                    className='block no-underline group'
                  >
                    <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-7 hover:border-[var(--theme-border-strong)] transition-colors'>
                      <div className='flex items-start justify-between mb-5'>
                        <div className='flex-1'>
                          <p className='text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] mb-2 font-bold'>
                            CURRENT TICKET #
                            {currentOrder.ticketNumber?.split('-').pop()}
                          </p>
                          <h2 className='text-[24px] font-black text-[var(--theme-text-primary)] mb-2'>
                            {[currentOrder.modelRef?.name]
                              .filter(Boolean)
                              .join(' ') || 'Device Repair'}
                          </h2>
                          <p className='text-[13px] text-[var(--theme-text-secondary)]'>
                            Service Center:{' '}
                            {currentOrder.serviceCentre?.name || 'Assigned'}
                          </p>
                          {currentOrder.trackingCode && (
                            <div className='flex items-center gap-2 mt-2'>
                              <Tag
                                size={12}
                                className='text-[var(--theme-text-tertiary)]'
                              />
                              <p className='text-[11px] text-[var(--theme-text-tertiary)] font-mono'>
                                Tracking: {currentOrder.trackingCode}
                              </p>
                            </div>
                          )}
                        </div>
                        <OrderStatusBadge status={currentOrder.repairStatus} />
                      </div>

                      {/* Symptoms & Repair Types */}
                      {(currentOrder.symptoms?.length > 0 ||
                        currentOrder.repairTypes?.length > 0) && (
                        <div className='mb-5 space-y-2'>
                          {currentOrder.symptoms?.length > 0 && (
                            <div className='flex items-center gap-2 flex-wrap'>
                              <AlertCircle
                                size={14}
                                className='text-[var(--theme-text-tertiary)]'
                              />
                              <span className='text-[11px] text-[var(--theme-text-tertiary)] font-bold'>
                                Issues:
                              </span>
                              <div className='flex gap-2 flex-wrap'>
                                {currentOrder.symptoms.map((symptom, idx) => (
                                  <span
                                    key={idx}
                                    className='px-2.5 py-1 bg-red-500/10 text-red-400 text-[11px] font-bold rounded border border-red-500/20'
                                  >
                                    {symptom.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {currentOrder.repairTypes?.length > 0 && (
                            <div className='flex items-center gap-2 flex-wrap'>
                              <span className='text-[11px] text-[var(--theme-text-tertiary)] font-bold ml-[30px]'>
                                Repairs:
                              </span>
                              <div className='flex gap-2 flex-wrap'>
                                {currentOrder.repairTypes.map((repair, idx) => (
                                  <span
                                    key={idx}
                                    className='px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[11px] font-bold rounded border border-blue-500/20'
                                  >
                                    {repair.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment & Warranty Info */}
                      {(currentOrder.paymentStatus ||
                        currentOrder.warrantyMonths ||
                        currentOrder.partTier) && (
                        <div className='flex items-center gap-4 mb-5 flex-wrap'>
                          {currentOrder.paymentStatus && (
                            <div className='flex items-center gap-2'>
                              <CreditCard
                                size={14}
                                className='text-[var(--theme-text-tertiary)]'
                              />
                              <span
                                className={`px-3 py-1 text-[11px] font-bold rounded border ${getPaymentStatusBadge(currentOrder.paymentStatus).color}`}
                              >
                                {
                                  getPaymentStatusBadge(
                                    currentOrder.paymentStatus,
                                  ).text
                                }
                              </span>
                              {currentOrder.paidAmount > 0 && (
                                <span className='text-[11px] text-[var(--theme-text-tertiary)]'>
                                  ({formatCurrency(currentOrder.paidAmount)}{' '}
                                  paid)
                                </span>
                              )}
                            </div>
                          )}
                          {currentOrder.warrantyMonths && (
                            <div className='flex items-center gap-2'>
                              <Shield
                                size={14}
                                className='text-[var(--theme-text-tertiary)]'
                              />
                              <span className='text-[11px] text-[var(--theme-text-secondary)] font-bold'>
                                {currentOrder.warrantyMonths} Months Warranty
                              </span>
                            </div>
                          )}
                          {currentOrder.partTier && (
                            <span className='px-3 py-1 bg-purple-500/10 text-purple-400 text-[11px] font-bold rounded border border-purple-500/20'>
                              {currentOrder.partTier.tier} Quality Parts
                            </span>
                          )}
                        </div>
                      )}

                      {/* Progress */}
                      <div className='mb-5'>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-[12px] font-bold text-[var(--theme-text-secondary)]'>
                            {getStatusLabel(currentOrder.repairStatus)}
                          </span>
                          <span className='text-[18px] font-black text-[var(--theme-text-primary)]'>
                            {calculateProgress(currentOrder.repairStatus)}%
                          </span>
                        </div>
                        <div className='h-1.5 bg-[var(--theme-border)] rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-[var(--theme-text-primary)] rounded-full'
                            style={{
                              width: `${calculateProgress(currentOrder.repairStatus)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className='flex items-center justify-between pt-5 border-t border-[var(--theme-border)]'>
                        <div className='flex items-center gap-2'>
                          <Clock
                            size={16}
                            className='text-[var(--theme-text-tertiary)]'
                          />
                          <div>
                            <p className='text-[9px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                              {currentOrder.estimatedDeliveryDate
                                ? 'EST. DELIVERY'
                                : currentOrder.slotDate
                                  ? 'SCHEDULED FOR'
                                  : 'BOOKED ON'}
                            </p>
                            <p className='text-[13px] font-bold text-[var(--theme-text-primary)]'>
                              {currentOrder.estimatedDeliveryDate
                                ? formatDate(currentOrder.estimatedDeliveryDate)
                                : currentOrder.slotDate
                                  ? formatDate(currentOrder.slotDate)
                                  : formatDate(currentOrder.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-6'>
                          <div className='text-right'>
                            <p className='text-[9px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                              TOTAL COST
                            </p>
                            <p className='text-[18px] font-black text-[var(--theme-text-primary)]'>
                              {formatCurrency(currentOrder.finalCost || 0)}
                            </p>
                          </div>
                          <button className='px-5 py-2.5 bg-[var(--theme-text-primary)] text-[var(--theme-bg)] rounded-xl text-[12px] font-bold tracking-wide hover:opacity-90 transition-opacity'>
                            VIEW DETAILS →
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-7 text-center'>
                    <ClipboardList
                      size={48}
                      className='text-[var(--theme-text-tertiary)] mx-auto mb-3'
                    />
                    <p className='text-[var(--theme-text-secondary)]'>
                      No active repairs
                    </p>
                  </div>
                )}

                {/* Service History Table */}
                {orders.length > 1 && (
                  <div className='mt-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-[12px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                        Service History
                      </h3>
                      <Link
                        href='#'
                        className='text-[12px] font-bold text-[var(--theme-text-primary)] no-underline hover:opacity-80'
                      >
                        View all past repairs
                      </Link>
                    </div>

                    <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl overflow-hidden'>
                      {/* Table Header */}
                      <div className='grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--theme-surface)] border-b border-[var(--theme-border)]'>
                        <div className='col-span-3 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                          Device / Model
                        </div>
                        <div className='col-span-3 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                          Status & Repairs
                        </div>
                        <div className='col-span-2 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                          Date
                        </div>
                        <div className='col-span-2 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                          Payment
                        </div>
                        <div className='col-span-1 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                          Total
                        </div>
                        <div className='col-span-1'></div>
                      </div>

                      {/* Table Rows */}
                      {orders.slice(1, 4).map((order, index) => {
                        const DeviceIcon = getDeviceIcon(order.modelRef?.name)
                        const paymentBadge = getPaymentStatusBadge(
                          order.paymentStatus,
                        )
                        return (
                          <Link
                            key={order.ticketNumber}
                            href={`/orders/detail?ticketNumber=${encodeURIComponent(order.ticketNumber)}`}
                            className='grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[var(--theme-surface)] transition-colors no-underline group'
                            style={{
                              borderBottom:
                                index < 2
                                  ? '1px solid var(--theme-border)'
                                  : 'none',
                            }}
                          >
                            <div className='col-span-3 flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-lg bg-[var(--theme-surface)] flex items-center justify-center shrink-0'>
                                <DeviceIcon
                                  size={20}
                                  className='text-[var(--theme-text-secondary)]'
                                />
                              </div>
                              <div className='min-w-0'>
                                <p className='text-[13px] font-bold text-[var(--theme-text-primary)] truncate'>
                                  {[order.brandRef?.name, order.modelRef?.name]
                                    .filter(Boolean)
                                    .join(' ') || 'Device'}
                                </p>
                                <p className='text-[11px] text-[var(--theme-text-tertiary)]'>
                                  #{order.ticketNumber?.split('-').pop()}
                                </p>
                              </div>
                            </div>
                            <div className='col-span-3 flex flex-col justify-center gap-1'>
                              <OrderStatusBadge
                                status={order.repairStatus}
                                size='sm'
                              />
                              {order.repairTypes?.length > 0 && (
                                <p className='text-[11px] text-[var(--theme-text-tertiary)] truncate'>
                                  {order.repairTypes
                                    .map((r) => r.name)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                            <div className='col-span-2 flex items-center'>
                              <p className='text-[12px] text-[var(--theme-text-secondary)]'>
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className='col-span-2 flex items-center'>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${paymentBadge.color}`}
                              >
                                {paymentBadge.text}
                              </span>
                            </div>
                            <div className='col-span-1 flex items-center'>
                              <p className='text-[13px] font-bold text-[var(--theme-text-primary)]'>
                                {formatCurrency(order.finalCost || 0)}
                              </p>
                            </div>
                            <div className='col-span-1 flex items-center justify-end'>
                              <ChevronRight
                                size={16}
                                className='text-[var(--theme-text-tertiary)]'
                              />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Stats & Info */}
              <div className='col-span-5 space-y-6'>
                {/* Current Order Status Update Card */}
                {currentOrder && (
                  <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <p className='text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] mb-1 font-bold'>
                          CURRENT STATUS
                        </p>
                        <h3 className='text-[16px] font-bold text-[var(--theme-text-primary)]'>
                          {getStatusLabel(currentOrder.repairStatus)}
                        </h3>
                        {currentOrder.serviceCentre && (
                          <p className='text-[11px] text-[var(--theme-text-secondary)] mt-2'>
                            {currentOrder.serviceCentre.name}
                            {currentOrder.serviceCentre.city &&
                              ` • ${currentOrder.serviceCentre.city}`}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Timeline indicators */}
                    <div className='space-y-2 mt-4'>
                      {currentOrder.orderPlacedAt && (
                        <div className='flex items-center gap-2 text-[11px]'>
                          <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                          <span className='text-[var(--theme-text-tertiary)]'>
                            Order placed:
                          </span>
                          <span className='text-[var(--theme-text-secondary)]'>
                            {formatDate(currentOrder.orderPlacedAt)}
                          </span>
                        </div>
                      )}
                      {currentOrder.pickupCompletedAt && (
                        <div className='flex items-center gap-2 text-[11px]'>
                          <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                          <span className='text-[var(--theme-text-tertiary)]'>
                            Picked up:
                          </span>
                          <span className='text-[var(--theme-text-secondary)]'>
                            {formatDate(currentOrder.pickupCompletedAt)}
                          </span>
                        </div>
                      )}
                      {currentOrder.diagnosisCompletedAt && (
                        <div className='flex items-center gap-2 text-[11px]'>
                          <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                          <span className='text-[var(--theme-text-tertiary)]'>
                            Diagnosis done:
                          </span>
                          <span className='text-[var(--theme-text-secondary)]'>
                            {formatDate(currentOrder.diagnosisCompletedAt)}
                          </span>
                        </div>
                      )}
                      {currentOrder.repairCompletedAt && (
                        <div className='flex items-center gap-2 text-[11px]'>
                          <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                          <span className='text-[var(--theme-text-tertiary)]'>
                            Repair done:
                          </span>
                          <span className='text-[var(--theme-text-secondary)]'>
                            {formatDate(currentOrder.repairCompletedAt)}
                          </span>
                        </div>
                      )}
                      {currentOrder.estimatedDeliveryDate &&
                        !currentOrder.deliveredAt && (
                          <div className='flex items-center gap-2 text-[11px]'>
                            <div className='w-1.5 h-1.5 rounded-full bg-blue-500'></div>
                            <span className='text-[var(--theme-text-tertiary)]'>
                              Est. delivery:
                            </span>
                            <span className='text-[var(--theme-text-secondary)]'>
                              {formatDate(currentOrder.estimatedDeliveryDate)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-5'>
                    <p className='text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] mb-2 font-bold'>
                      Service Accuracy
                    </p>
                    <p className='text-[28px] font-black text-[var(--theme-text-primary)]'>
                      {stats.totalCompleted > 0 ? `${stats.accuracy}%` : 'N/A'}
                    </p>
                    <p className='text-[10px] text-[var(--theme-text-tertiary)] mt-1'>
                      {stats.totalCompleted > 0
                        ? `Based on ${stats.totalCompleted} completed repair${stats.totalCompleted !== 1 ? 's' : ''}`
                        : 'Complete repairs to see stats'}
                    </p>
                  </div>
                  <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-5'>
                    <p className='text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] mb-2 font-bold'>
                      Average Turnaround
                    </p>
                    <p className='text-[28px] font-black text-[var(--theme-text-primary)]'>
                      {stats.turnaroundHours > 0
                        ? stats.turnaroundDisplay
                        : 'N/A'}
                    </p>
                    <p className='text-[10px] text-[var(--theme-text-tertiary)] mt-1'>
                      {stats.turnaroundHours > 0
                        ? stats.turnaroundHours < 24
                          ? 'Same-day service level'
                          : 'Multi-day service'
                        : 'Complete repairs to see stats'}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                {currentOrder && (
                  <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                        Order Summary
                      </h3>
                    </div>
                    <div className='space-y-3'>
                      {currentOrder.bookingType && (
                        <div className='flex items-center justify-between'>
                          <span className='text-[12px] text-[var(--theme-text-tertiary)]'>
                            Booking Type:
                          </span>
                          <span className='text-[12px] font-bold text-[var(--theme-text-primary)]'>
                            {currentOrder.bookingType}
                          </span>
                        </div>
                      )}
                      {currentOrder.subtotal && (
                        <div className='flex items-center justify-between'>
                          <span className='text-[12px] text-[var(--theme-text-tertiary)]'>
                            Subtotal:
                          </span>
                          <span className='text-[12px] text-[var(--theme-text-secondary)]'>
                            {formatCurrency(currentOrder.subtotal)}
                          </span>
                        </div>
                      )}
                      {currentOrder.discount > 0 && (
                        <div className='flex items-center justify-between'>
                          <span className='text-[12px] text-[var(--theme-text-tertiary)]'>
                            Discount:
                          </span>
                          <span className='text-[12px] text-green-400'>
                            -{formatCurrency(currentOrder.discount)}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center justify-between pt-3 border-t border-[var(--theme-border)]'>
                        <span className='text-[13px] font-bold text-[var(--theme-text-primary)]'>
                          Total:
                        </span>
                        <span className='text-[16px] font-black text-[var(--theme-text-primary)]'>
                          {formatCurrency(currentOrder.finalCost || 0)}
                        </span>
                      </div>
                      {currentOrder.paidAmount > 0 && (
                        <div className='flex items-center justify-between'>
                          <span className='text-[11px] text-[var(--theme-text-tertiary)]'>
                            Paid:
                          </span>
                          <span className='text-[11px] text-green-400 font-bold'>
                            {formatCurrency(currentOrder.paidAmount)}
                          </span>
                        </div>
                      )}
                      {currentOrder.paymentStatus === 'Partially Paid' &&
                        currentOrder.finalCost &&
                        currentOrder.paidAmount && (
                          <div className='flex items-center justify-between'>
                            <span className='text-[11px] text-[var(--theme-text-tertiary)]'>
                              Balance Due:
                            </span>
                            <span className='text-[11px] text-red-400 font-bold'>
                              {formatCurrency(
                                currentOrder.finalCost -
                                  currentOrder.paidAmount,
                              )}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
