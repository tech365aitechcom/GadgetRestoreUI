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
  AlertCircle,
} from 'lucide-react'
import orderService from '@/services/order.service'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

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

function formatOrderId(ticketNumber) {
  // Return ticket number exactly as received from API
  return ticketNumber || 'N/A'
}

function getFallbackDeviceImage(brandName) {
  const name = brandName?.toLowerCase() || ''
  if (name.includes('apple') || name.includes('iphone')) {
    return '/images/default-apple.png'
  }
  return '/images/default-android.png'
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
  const currentOrder = activeOrders[0]

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

  return (
    <div className='min-h-[100svh] lg:min-h-[calc(100vh-var(--topbar-height))] bg-[var(--theme-bg)] pb-20 lg:pb-0 px-5 lg:px-8 pt-6 lg:pt-8'>
      {/* Page Header - Desktop Only */}
      <div className='hidden lg:flex items-end justify-between mb-8'>
        <h1 className='text-[28px] font-black text-[var(--theme-text-primary)]'>
          My Orders
        </h1>
      </div>

      {loading ? (
        <div className='flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-6'>
          {/* Active order skeleton */}
          <div className='lg:col-span-7 flex flex-col gap-3 lg:gap-6'>
            <Skeleton className='rounded-2xl h-[220px] lg:h-[340px]' />
            <Skeleton className='hidden lg:block rounded-2xl h-[220px]' />
          </div>
          {/* Sidebar skeleton - Desktop only */}
          <div className='hidden lg:flex lg:col-span-5 flex-col gap-6'>
            <Skeleton className='rounded-2xl h-[160px]' />
            <Skeleton className='rounded-2xl h-[200px]' />
          </div>
          {/* History skeleton - Mobile only */}
          <div className='lg:hidden flex flex-col gap-3'>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className='rounded-xl h-[72px]' />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load orders"
          message={error}
          buttonText="Try Again"
          onButtonClick={() => window.location.reload()}
        />
      ) : orders.length === 0 ? (
        <div className='grid place-items-center min-h-[200px] lg:min-h-[400px] rounded-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] text-center p-6 lg:p-8'>
          <ClipboardList
            size={42}
            className='lg:w-14 lg:h-14 text-[var(--theme-text-tertiary)] mb-3 lg:mb-4'
          />
          <h2 className='text-lg lg:text-2xl font-bold text-[var(--theme-text-primary)] mb-2 lg:mb-3'>
            No orders yet
          </h2>
          <p className='text-[var(--theme-text-secondary)] text-sm mb-4 lg:mb-6'>
            Book your first repair!
          </p>
          <Link href='/select-brand' className='btn-primary no-underline inline-flex items-center gap-2'>
            <Plus size={18} className='hidden lg:inline' />
            Book Repair
          </Link>
        </div>
      ) : (
        <div className='lg:grid lg:grid-cols-12 lg:gap-6'>
          {/* Main Content Area */}
          <div className='lg:col-span-7'>
            {/* Current Active Order Card */}
            {currentOrder && (
              <Link
                href={`/orders/detail?ticketNumber=${encodeURIComponent(currentOrder.ticketNumber)}`}
                className='block mb-4 lg:mb-0 no-underline group'
              >
                <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-5 lg:p-7 hover:border-[var(--theme-border-strong)] transition-colors'>
                  <div className='flex items-start justify-between mb-3 lg:mb-5'>
                    <div className='flex-1'>
                      <p className='text-[9px] lg:text-[10px] uppercase tracking-[0.12em] lg:tracking-[0.14em] text-[var(--theme-text-tertiary)] mb-1 lg:mb-2 font-bold'>
                        {formatOrderId(currentOrder.ticketNumber, currentOrder.createdAt)}
                      </p>
                      <h3 className='text-[18px] lg:text-[24px] font-extrabold lg:font-black text-[var(--theme-text-primary)] mb-0 lg:mb-2'>
                        {(() => {
                          const brandName = currentOrder.brandRef?.name || ''
                          const modelName = currentOrder.modelRef?.name || ''
                          const deviceName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
                            ? modelName
                            : `${brandName} ${modelName}`
                          return deviceName || 'Device Repair'
                        })()}
                      </h3>
                    </div>
                    <OrderStatusBadge status={currentOrder.repairStatus} />
                  </div>

                  {/* Symptoms & Repair Types */}
                  {(currentOrder.symptoms?.length > 0 || currentOrder.repairTypes?.length > 0) && (
                    <div className='mb-3 lg:mb-5 space-y-1.5 lg:space-y-2'>
                      {currentOrder.symptoms?.length > 0 && (
                        <div className='flex items-center gap-1.5 lg:gap-2 flex-wrap'>
                          <AlertCircle size={11} className='lg:w-3.5 lg:h-3.5 text-[var(--theme-text-tertiary)]' />
                          <span className='hidden lg:inline text-[11px] text-[var(--theme-text-tertiary)] font-bold'>
                            Issues:
                          </span>
                          <div className='flex gap-1.5 lg:gap-2 flex-wrap'>
                            {currentOrder.symptoms.slice(0, 2).map((symptom, idx) => (
                              <span
                                key={idx}
                                className='px-2 lg:px-2.5 py-0.5 lg:py-1 bg-red-500/10 text-red-400 text-[10px] lg:text-[11px] font-bold rounded border border-red-500/20'
                              >
                                {symptom.name}
                              </span>
                            ))}
                            {currentOrder.symptoms.length > 2 && (
                              <span className='lg:hidden text-[10px] text-[var(--theme-text-tertiary)]'>
                                +{currentOrder.symptoms.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {currentOrder.repairTypes?.length > 0 && (
                        <div className='flex items-center gap-1.5 lg:gap-2 flex-wrap'>
                          <span className='hidden lg:inline text-[11px] text-[var(--theme-text-tertiary)] font-bold ml-[30px]'>
                            Repairs:
                          </span>
                          <div className='flex gap-1.5 lg:gap-2 flex-wrap'>
                            {currentOrder.repairTypes.slice(0, 2).map((repair, idx) => (
                              <span
                                key={idx}
                                className='px-2 lg:px-2.5 py-0.5 lg:py-1 bg-blue-500/10 text-blue-400 text-[10px] lg:text-[11px] font-bold rounded border border-blue-500/20'
                              >
                                {repair.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className='mt-4 mb-0 lg:mb-5'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-[11px] lg:text-[12px] font-bold text-[var(--theme-text-secondary)]'>
                        {getStatusLabel(currentOrder.repairStatus)}
                      </span>
                      <span className='text-[13px] lg:text-[18px] font-extrabold lg:font-black text-[var(--theme-text-primary)]'>
                        {calculateProgress(currentOrder.repairStatus)}%
                      </span>
                    </div>
                    <div className='h-1 lg:h-1.5 bg-[var(--theme-border)] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-[var(--theme-text-primary)] rounded-full transition-all'
                        style={{ width: `${calculateProgress(currentOrder.repairStatus)}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer - Date & Cost */}
                  <div className='flex items-center gap-2 lg:gap-6 mt-4 pt-4 lg:pt-5 border-t border-[var(--theme-border)]'>
                    <Clock size={14} className='lg:w-4 lg:h-4 text-[var(--theme-text-tertiary)]' />
                    <div className='flex-1'>
                      <p className='text-[9px] uppercase tracking-[0.12em] lg:tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                        {currentOrder.estimatedDeliveryDate
                          ? 'EST. DELIVERY'
                          : currentOrder.slotDate
                            ? 'SCHEDULED FOR'
                            : 'BOOKED ON'}
                      </p>
                      <p className='text-[12px] lg:text-[13px] font-bold text-[var(--theme-text-primary)]'>
                        {currentOrder.estimatedDeliveryDate
                          ? formatDate(currentOrder.estimatedDeliveryDate)
                          : currentOrder.slotDate
                            ? formatDate(currentOrder.slotDate)
                            : formatDate(currentOrder.createdAt)}
                      </p>
                    </div>
                    <div className='text-right lg:flex lg:items-center lg:gap-6'>
                      <div>
                        <p className='text-[9px] uppercase tracking-[0.12em] lg:tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                          TOTAL{' '}<span className='hidden lg:inline'>COST</span>
                        </p>
                        <p className='text-[14px] lg:text-[18px] font-black text-[var(--theme-text-primary)]'>
                          {formatCurrency(currentOrder.finalCost || 0)}
                        </p>
                      </div>
                      <button className='hidden lg:block px-5 py-2.5 bg-[var(--theme-text-primary)] text-[var(--theme-bg)] rounded-xl text-[12px] font-bold tracking-wide hover:opacity-90 transition-opacity'>
                        VIEW DETAILS →
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Service History */}
            {orders.length > 1 && (
              <div className='mt-6'>
                <div className='flex items-center justify-between mb-3 lg:mb-4'>
                  <h2 className='text-[11px] lg:text-[12px] uppercase tracking-[0.12em] lg:tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                    {currentOrder ? 'HISTORY' : 'SERVICE HISTORY'}
                  </h2>
                  <Link
                    href='#'
                    className='text-[11px] lg:text-[12px] font-bold text-[var(--theme-text-primary)] no-underline hover:opacity-80'
                  >
                    View all past repairs
                  </Link>
                </div>

                {/* Mobile List View */}
                <div className='lg:hidden flex flex-col gap-3'>
                  {orders.slice(1, 4).map((order) => {
                    const brandName = order.brandRef?.name || ''
                    const modelName = order.modelRef?.name || ''
                    const deviceName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
                      ? modelName
                      : `${brandName} ${modelName}`
                    return (
                      <Link
                        key={order.ticketNumber}
                        href={`/orders/detail?ticketNumber=${encodeURIComponent(order.ticketNumber)}`}
                        className='flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl no-underline'
                      >
                        <div className='w-10 h-10 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner'>
                          <img
                            src={order.modelRef?.image || getFallbackDeviceImage(order.brandRef?.name)}
                            alt={deviceName}
                            className='w-full h-full object-contain'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-[13px] font-bold text-[var(--theme-text-primary)] mb-0.5 truncate'>
                            {deviceName || 'Device Repair'}
                          </h3>
                          <p className='text-[11px] text-[var(--theme-text-tertiary)]'>
                            {formatOrderId(order.ticketNumber, order.createdAt)} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <ChevronRight size={16} className='text-[var(--theme-text-tertiary)] shrink-0' />
                      </Link>
                    )
                  })}
                </div>

                {/* Desktop Table View */}
                <div className='hidden lg:block bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl overflow-hidden'>
                  {/* Table Header */}
                  <div className='grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--theme-surface)] border-b border-[var(--theme-border)]'>
                    <div className='col-span-3 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                      Order ID
                    </div>
                    <div className='col-span-3 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                      Device
                    </div>
                    <div className='col-span-2 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                      Status
                    </div>
                    <div className='col-span-3 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-tertiary)] font-bold'>
                      Date
                    </div>
                    <div className='col-span-1'></div>
                  </div>

                  {/* Table Rows */}
                  {orders.slice(1, 4).map((order, index) => {
                    const brandName = order.brandRef?.name || ''
                    const modelName = order.modelRef?.name || ''
                    const deviceName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
                      ? modelName
                      : `${brandName} ${modelName}`
                    return (
                      <Link
                        key={order.ticketNumber}
                        href={`/orders/detail?ticketNumber=${encodeURIComponent(order.ticketNumber)}`}
                        className='grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[var(--theme-surface)] transition-colors no-underline group border-b border-[var(--theme-border)] last:border-b-0'
                      >
                        <div className='col-span-3 flex items-center'>
                          <p className='text-[11px] text-[var(--theme-text-tertiary)] font-mono whitespace-nowrap'>
                            {formatOrderId(order.ticketNumber, order.createdAt)}
                          </p>
                        </div>
                        <div className='col-span-3 flex items-center gap-3'>
                          <div className='w-10 h-10 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner'>
                            <img
                              src={order.modelRef?.image || getFallbackDeviceImage(order.brandRef?.name)}
                              alt={deviceName}
                              className='w-full h-full object-contain'
                            />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-[13px] font-bold text-[var(--theme-text-primary)] truncate'>
                              {deviceName || 'Device'}
                            </p>
                          </div>
                        </div>
                        <div className='col-span-2 flex items-center'>
                          <OrderStatusBadge status={order.repairStatus} size='sm' />
                        </div>
                        <div className='col-span-3 flex items-center'>
                          <p className='text-[12px] text-[var(--theme-text-secondary)]'>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className='col-span-1 flex items-center justify-end'>
                          <ChevronRight size={16} className='text-[var(--theme-text-tertiary)]' />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className='hidden lg:flex lg:col-span-5 flex-col gap-6'>
            {/* Current Status Card */}
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
                  </div>
                </div>
                {/* Timeline indicators */}
                <div className='space-y-2 mt-4'>
                  {currentOrder.orderPlacedAt && (
                    <div className='flex items-center gap-2 text-[11px]'>
                      <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                      <span className='text-[var(--theme-text-tertiary)]'>Order placed:</span>
                      <span className='text-[var(--theme-text-secondary)]'>
                        {formatDate(currentOrder.orderPlacedAt)}
                      </span>
                    </div>
                  )}
                  {currentOrder.pickupCompletedAt && (
                    <div className='flex items-center gap-2 text-[11px]'>
                      <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                      <span className='text-[var(--theme-text-tertiary)]'>Picked up:</span>
                      <span className='text-[var(--theme-text-secondary)]'>
                        {formatDate(currentOrder.pickupCompletedAt)}
                      </span>
                    </div>
                  )}
                  {currentOrder.diagnosisCompletedAt && (
                    <div className='flex items-center gap-2 text-[11px]'>
                      <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                      <span className='text-[var(--theme-text-tertiary)]'>Diagnosis done:</span>
                      <span className='text-[var(--theme-text-secondary)]'>
                        {formatDate(currentOrder.diagnosisCompletedAt)}
                      </span>
                    </div>
                  )}
                  {currentOrder.repairCompletedAt && (
                    <div className='flex items-center gap-2 text-[11px]'>
                      <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                      <span className='text-[var(--theme-text-tertiary)]'>Repair done:</span>
                      <span className='text-[var(--theme-text-secondary)]'>
                        {formatDate(currentOrder.repairCompletedAt)}
                      </span>
                    </div>
                  )}
                  {currentOrder.estimatedDeliveryDate && !currentOrder.deliveredAt && (
                    <div className='flex items-center gap-2 text-[11px]'>
                      <div className='w-1.5 h-1.5 rounded-full bg-blue-500'></div>
                      <span className='text-[var(--theme-text-tertiary)]'>Est. delivery:</span>
                      <span className='text-[var(--theme-text-secondary)]'>
                        {formatDate(currentOrder.estimatedDeliveryDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary Card */}
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
                      <span className='text-[12px] text-[var(--theme-text-tertiary)]'>Booking Type:</span>
                      <span className='text-[12px] font-bold text-[var(--theme-text-primary)]'>
                        {currentOrder.bookingType}
                      </span>
                    </div>
                  )}
                  {currentOrder.subtotal && (
                    <div className='flex items-center justify-between'>
                      <span className='text-[12px] text-[var(--theme-text-tertiary)]'>Subtotal:</span>
                      <span className='text-[12px] text-[var(--theme-text-secondary)]'>
                        {formatCurrency(currentOrder.subtotal)}
                      </span>
                    </div>
                  )}
                  {currentOrder.discount > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-[12px] text-[var(--theme-text-tertiary)]'>Discount:</span>
                      <span className='text-[12px] text-green-400'>
                        -{formatCurrency(currentOrder.discount)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center justify-between pt-3 border-t border-[var(--theme-border)]'>
                    <span className='text-[13px] font-bold text-[var(--theme-text-primary)]'>Total:</span>
                    <span className='text-[16px] font-black text-[var(--theme-text-primary)]'>
                      {formatCurrency(currentOrder.finalCost || 0)}
                    </span>
                  </div>
                  {currentOrder.paidAmount > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-[11px] text-[var(--theme-text-tertiary)]'>Paid:</span>
                      <span className='text-[11px] text-green-400 font-bold'>
                        {formatCurrency(currentOrder.paidAmount)}
                      </span>
                    </div>
                  )}
                  {currentOrder.paymentStatus === 'Partially Paid' &&
                    currentOrder.finalCost &&
                    currentOrder.paidAmount && (
                      <div className='flex items-center justify-between'>
                        <span className='text-[11px] text-[var(--theme-text-tertiary)]'>Balance Due:</span>
                        <span className='text-[11px] text-red-400 font-bold'>
                          {formatCurrency(currentOrder.finalCost - currentOrder.paidAmount)}
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
  )
}
