'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ClipboardList, Plus } from 'lucide-react'
import orderService from '@/services/order.service'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'

const CLOSED_STATUSES = new Set(['DELIVERED', 'CANCELLED'])

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const activeCount = orders.filter(
    (order) => !CLOSED_STATUSES.has(order.repairStatus),
  ).length

  return (
    <main className='min-h-[100svh] bg-[var(--theme-bg)] text-[var(--theme-text-primary)] px-4 pt-8 pb-[40px]'>
      <section style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            gap: 18,
            marginBottom: 28,
          }}
        >
          <div>
            <p className='text-[11px] uppercase tracking-[0.12em] text-[var(--theme-text-tertiary)] mb-2'>
              Repairs
            </p>
            <h1 style={{ fontSize: 31, fontWeight: 800 }}>Your Orders</h1>
            {!loading && orders.length > 0 && (
              <p className='text-[var(--theme-text-secondary)] text-[13px] mt-2'>
                {activeCount} active {activeCount === 1 ? 'repair' : 'repairs'}
              </p>
            )}
          </div>
          <Link
            href='/select-brand'
            className='btn-secondary !h-[42px] !px-[15px] no-underline font-bold text-[13px]'
          >
            <Plus size={16} /> New
          </Link>
        </div>

        {loading ? (
          <div className='grid place-items-center min-h-[150px] p-6 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] text-[var(--theme-text-secondary)] text-center'>
            Loading your orders...
          </div>
        ) : error ? (
          <div className='grid place-items-center min-h-[150px] p-6 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] text-red-400 text-center'>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className='grid place-items-center min-h-[150px] py-[54px] px-6 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] text-[var(--theme-text-secondary)] text-center'>
            <ClipboardList
              size={42}
              className='text-[var(--theme-text-tertiary)] mb-4'
            />
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>No orders yet</h2>
            <p className='text-[var(--theme-text-secondary)] mb-6'>
              Book your first repair!
            </p>
            <Link href='/select-brand' className='btn-primary no-underline'>
              Book Repair
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => {
              const device =
                [order.brandRef?.name, order.modelRef?.name]
                  .filter(Boolean)
                  .join(' ') || 'Device Repair'
              return (
                <Link
                  key={order.ticketNumber}
                  href={`/orders/${encodeURIComponent(order.ticketNumber)}`}
                  className='flex items-center gap-4 p-5 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-card)] text-[var(--theme-text-primary)] no-underline hover:border-[var(--theme-border-strong)] transition-colors'
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <span className='text-[var(--theme-text-secondary)] text-xs font-semibold'>
                        {order.ticketNumber}
                      </span>
                      <OrderStatusBadge status={order.repairStatus} />
                    </div>
                    <h2
                      style={{ fontSize: 16, fontWeight: 700, marginBottom: 7 }}
                    >
                      {device}
                    </h2>
                    <p className='text-[13px] text-[var(--theme-text-tertiary)]'>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className='text-[var(--theme-text-tertiary)]'
                  />
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
