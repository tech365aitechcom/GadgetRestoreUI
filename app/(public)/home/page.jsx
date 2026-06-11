'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search,
  Smartphone,
  Laptop,
  BatteryCharging,
  Microscope,
  Sparkles,
  Plus,
  ChevronRight,
  Tablet,
  Watch,
} from 'lucide-react'
import catalogueService from '@/services/catalogue.service'
import { useBooking } from '@/context/BookingContext'
import customerService from '@/services/customer.service'
import { useAuth } from '@/context/AuthContext'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import {
  DEFAULT_MANUALS,
  POPULAR_SERVICES,
  getDeviceManuals,
  getDisplayStatusLabel,
  getProgressFill,
} from '@/lib/homeData'

/* ─── style helpers ─────────────────────────────────────────────────────── */
const S = {
  /* Dark card for mobile (scan, active repair, promo, live) */
  darkCard: {
    background: 'var(--color-bg-700)' /* #111111 */,
    border:
      '1px solid var(--color-bg-400)' /* #252525 → nearest is bg-400 (#222) */,
    borderRadius: 18,
  },
  /* Muted label on dark card */
  mutedLabel: {
    color: 'var(--color-text-dim)',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  /* Progress bar track */
  progressTrack: {
    height: 4,
    borderRadius: 4,
    background: 'var(--color-accent-tint-8)',
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
    width: '65%',
    background: 'var(--color-accent)',
  },
}

export default function HomePage() {
  const router = useRouter()
  const { reset, setCategory } = useBooking()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeOrder, setActiveOrder] = useState(null)
  const [manuals, setManuals] = useState(DEFAULT_MANUALS)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await catalogueService.getCategories()
        if (data && data.length > 0) {
          const mapped = data
            .map((cat) => {
              let icon = Smartphone
              const n = cat.name.toLowerCase()
              if (n.includes('phone') || n.includes('mobile')) icon = Smartphone
              else if (n.includes('laptop') || n.includes('macbook'))
                icon = Laptop
              else if (n.includes('battery') || n.includes('power'))
                icon = BatteryCharging
              else if (n.includes('diagnose') || n.includes('diagnostic'))
                icon = Microscope
              else if (n.includes('tablet') || n.includes('ipad')) icon = Tablet
              else if (n.includes('watch')) icon = Watch
              return { ...cat, icon }
            })
            .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
          setCategories(mapped)
          setError(null)
        } else {
          setError('No service categories available at the moment.')
        }
      } catch (err) {
        setError('Failed to load service categories. Please try again later.')
        console.error('Error fetching categories:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchOrders = async () => {
      try {
        const res = await customerService.getOrders({ limit: 10 })
        if (res && res.success && res.data?.orders) {
          const list = res.data.orders
          const active = list.find(
            (o) => !['DELIVERED', 'CANCELLED'].includes(o.repairStatus),
          )
          if (active) {
            setActiveOrder(active)
          }

          const latestDevice = active || list[0]
          if (latestDevice) {
            setManuals(getDeviceManuals(latestDevice))
          }
        }
      } catch (err) {
        console.error('Error fetching orders for home page:', err)
      }
    }

    fetchCategories()
    fetchOrders()
  }, [])

  // Generic CTA — no category filter, fresh start
  const handleStart = () => {
    reset()
    router.push('/select-brand')
  }

  // Category-aware CTA — sets category context so brand page filters accordingly
  const handleCategorySelect = (cat) => {
    if (cat && cat._id) {
      // API-backed category: store it so select-brand can filter brands
      setCategory({ _id: cat._id, name: cat.name })
      router.push('/select-brand')
    }
  }

  return (
    <div
      className='lg:p-8 p-0 min-h-svh pb-20'
      style={{
        background: 'var(--color-content-bg)',
      }}
    >
      <div
        className='flex flex-col lg:gap-7 gap-3'
        style={{ padding: 'var(--spacing-container, 0)' }}
      >
        {/* Welcome header - DESKTOP ONLY */}
        <div className='hidden lg:block mb-7'>
          <div className='flex items-start justify-between'>
            <div>
              <h1
                className='text-2xl font-extrabold flex items-center gap-2 mb-1.5'
                style={{ color: 'var(--color-content-text)' }}
              >
                Welcome back, {user?.name || 'Guest'}&nbsp;
                <span
                  className='inline-block'
                  style={{ animation: 'bounce 1s infinite' }}
                >
                  👋
                </span>
              </h1>
              <p
                className='text-[13px]'
                style={{ color: 'var(--color-content-text-secondary)' }}
              >
                Here is what's happening in your workshop today.
              </p>
            </div>
          </div>
        </div>

        {/* Search bar - MOBILE ONLY */}
        <div className='lg:hidden block pt-17 px-4 pb-0'>
          <div
            onClick={handleStart}
            className='flex items-center gap-2.5 py-3 px-4 rounded-xl cursor-pointer'
            style={{
              background: 'var(--color-content-card)',
              border: '1px solid var(--color-content-border)',
            }}
          >
            <Search size={16} color='var(--color-content-text-secondary)' />
            <span
              className='text-sm'
              style={{ color: 'var(--color-content-text-secondary)' }}
            >
              Search device or issue...
            </span>
          </div>
        </div>

        {/* Hero Banner - DESKTOP ONLY */}
        <div className='hidden lg:block mb-7'>
          <div
            className='relative rounded-[20px] overflow-hidden min-h-65 flex items-center'
            style={{ background: 'var(--color-bg-900)' }}
          >
            <div className='absolute inset-0'>
              <Image
                src='/images/home-banner-top.png'
                alt='Workshop'
                width={1200}
                height={260}
                className='w-full h-full object-cover opacity-45'
                priority
              />
              <div
                className='absolute inset-0'
                style={{
                  background:
                    'linear-gradient(90deg,rgba(5,5,5,0.95) 40%,rgba(5,5,5,0.25) 100%)',
                }}
              />
            </div>
            <div className='relative z-1 py-10 px-12 max-w-130'>
              <span
                className='inline-block text-white text-[9px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full mb-4'
                style={{
                  background: 'var(--color-overlay-white-10)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Special Offer
              </span>
              <h2 className='text-4xl font-extrabold text-white leading-tight mb-3'>
                Get 20% Off on First Repair
              </h2>
              <p className='text-sm leading-relaxed mb-7 text-white/75'>
                Exclusive offer for new service registrations. Boost your
                conversion rates today.
              </p>
              <button
                onClick={handleStart}
                className='bg-white text-black border-0 rounded-xl py-3.25 px-7 font-bold text-[13px] tracking-wider uppercase cursor-pointer'
              >
                Book Now
              </button>
              <div className='mt-3.5 '>
                <span className='text-[10px] bg-black border border-white py-1 px-4 text-white rounded-full font-bold tracking-widest uppercase'>
                  Limited Offer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Repair & Manuals Grid */}
        <div className='lg:px-0 px-4'>
          {/* DESKTOP: 2-column grid */}
          <div className='hidden lg:grid lg:grid-cols-2 lg:gap-5 lg:mb-7'>
            {/* Active Repair - DESKTOP */}
            <div className='card flex flex-col justify-between gap-5 p-6'>
              {activeOrder ? (
                <>
                  <div>
                    <div className='flex items-start justify-between mb-4'>
                      <div
                        className='w-11 h-11 rounded-xl flex items-center justify-center'
                        style={{
                          background: 'var(--color-content-bg)',
                          color: 'var(--color-content-text-secondary)',
                        }}
                      >
                        <Smartphone size={22} />
                      </div>
                      <span className='badge badge-accent'>
                        {getDisplayStatusLabel(activeOrder.repairStatus)}
                      </span>
                    </div>
                    <h3
                      className='font-bold text-[15px] mb-1.5'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      Active Repair
                    </h3>
                    <p
                      className='text-xs mb-3.5'
                      style={{ color: 'var(--color-content-text-secondary)' }}
                    >
                      {activeOrder.modelRef?.name || 'Device'} —{' '}
                      {activeOrder.repairTypes?.[0]?.name ||
                        activeOrder.symptoms?.[0]?.name ||
                        'Device Diagnostics'}
                    </p>
                    <div style={S.progressTrack}>
                      <div
                        style={{
                          ...S.progressFill,
                          width: getProgressFill(activeOrder.repairStatus),
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/orders/detail?ticketNumber=${activeOrder.ticketNumber}`,
                      )
                    }
                    className='btn-accent w-full h-10.5 text-xs tracking-wider uppercase'
                  >
                    Track Order
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <div className='flex items-start justify-between mb-4'>
                      <div
                        className='w-11 h-11 rounded-xl flex items-center justify-center'
                        style={{
                          background: 'var(--color-content-bg)',
                          color: 'var(--color-content-text-secondary)',
                        }}
                      >
                        <Smartphone size={22} />
                      </div>
                      <span
                        className='badge badge-accent'
                        style={{
                          background: 'var(--color-bg-500)',
                          color: 'var(--color-text-dim)',
                        }}
                      >
                        Ready
                      </span>
                    </div>
                    <h3
                      className='font-bold text-[15px] mb-1.5'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      Start a Repair
                    </h3>
                    <p
                      className='text-xs mb-3.5'
                      style={{ color: 'var(--color-content-text-secondary)' }}
                    >
                      No active repair in progress. Book a premium repair
                      service now.
                    </p>
                    <div style={S.progressTrack}>
                      <div style={{ ...S.progressFill, width: '0%' }} />
                    </div>
                  </div>
                  <button
                    onClick={handleStart}
                    className='btn-accent w-full h-10.5 text-xs tracking-wider uppercase'
                  >
                    Book Service
                  </button>
                </>
              )}
            </div>

            {/* Repair Manuals - DESKTOP ONLY */}
            <div className='card p-6'>
              <h3
                className='font-bold text-[15px] mb-4.5'
                style={{ color: 'var(--color-content-text)' }}
              >
                Repair Manuals
              </h3>
              <div className='flex flex-col gap-1.5'>
                {manuals.map(({ label, sub, Icon }) => (
                  <a
                    key={label}
                    href='#'
                    className='flex items-center gap-3 p-2.5 rounded-[10px] no-underline transition-[background] duration-150'
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        'var(--color-content-bg)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <div
                      className='w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0'
                      style={{
                        background: 'var(--color-content-bg)',
                        color: 'var(--color-content-text-secondary)',
                      }}
                    >
                      <Icon size={17} />
                    </div>
                    <div>
                      <span
                        className='block text-[13px] font-semibold leading-tight'
                        style={{ color: 'var(--color-content-text)' }}
                      >
                        {label}
                      </span>
                      <span
                        className='text-[11px]'
                        style={{ color: 'var(--color-content-text-secondary)' }}
                      >
                        {sub}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* MOBILE: Active Repair card */}
          <div className='lg:hidden flex flex-col gap-3'>
            {/* Active Repair - Mobile */}
            <div
              className='py-4.5 px-5 rounded-[18px]'
              style={{
                background: 'var(--color-bg-700)',
                border: '1px solid var(--color-bg-400)',
              }}
            >
              {activeOrder ? (
                <>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <span
                        className='block mb-1 text-[10px] font-bold uppercase tracking-widest'
                        style={{ color: 'var(--color-text-dim)' }}
                      >
                        Active Repair
                      </span>
                      <h4
                        className='text-base font-extrabold'
                        style={{ color: 'var(--color-btn-cta-bg)' }}
                      >
                        {activeOrder.modelRef?.name || 'Device'}
                      </h4>
                    </div>
                    <span className='badge badge-accent mt-0.5'>
                      {getDisplayStatusLabel(activeOrder.repairStatus)}
                    </span>
                  </div>
                  <div style={S.progressTrack}>
                    <div
                      style={{
                        ...S.progressFill,
                        width: getProgressFill(activeOrder.repairStatus),
                      }}
                    />
                  </div>
                  <div className='flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.07]'>
                    <div>
                      <span
                        className='block mb-0.5 text-[10px] font-bold uppercase tracking-widest'
                        style={{ color: 'var(--color-text-dim)' }}
                      >
                        Service Ticket
                      </span>
                      <span
                        className='text-[13px] font-bold'
                        style={{ color: 'var(--color-btn-cta-bg)' }}
                      >
                        #{activeOrder.ticketNumber}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/orders/detail?ticketNumber=${activeOrder.ticketNumber}`,
                        )
                      }
                      className='border-0 rounded-[10px] py-2.25 px-4.5 text-xs font-bold tracking-wide cursor-pointer'
                      style={{
                        background: 'var(--color-btn-cta-bg)',
                        color: 'var(--color-btn-cta-text)',
                      }}
                    >
                      Track Order
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <span
                        className='block mb-1 text-[10px] font-bold uppercase tracking-widest'
                        style={{ color: 'var(--color-text-dim)' }}
                      >
                        Repair Service
                      </span>
                      <h4
                        className='text-base font-extrabold'
                        style={{ color: 'var(--color-btn-cta-bg)' }}
                      >
                        Start a Repair
                      </h4>
                    </div>
                    <span
                      className='badge badge-accent mt-0.5'
                      style={{
                        background: 'var(--color-bg-500)',
                        color: 'var(--color-text-dim)',
                      }}
                    >
                      Ready
                    </span>
                  </div>
                  <div style={S.progressTrack}>
                    <div style={{ ...S.progressFill, width: '0%' }} />
                  </div>
                  <div className='flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.07]'>
                    <div>
                      <span
                        className='block mb-0.5 text-[10px] font-bold uppercase tracking-widest'
                        style={{ color: 'var(--color-text-dim)' }}
                      >
                        Status
                      </span>
                      <span
                        className='text-[13px] font-bold'
                        style={{ color: 'var(--color-btn-cta-bg)' }}
                      >
                        No active repair
                      </span>
                    </div>
                    <button
                      onClick={handleStart}
                      className='border-0 rounded-[10px] py-2.25 px-4.5 text-xs font-bold tracking-wide cursor-pointer'
                      style={{
                        background: 'var(--color-btn-cta-bg)',
                        color: 'var(--color-btn-cta-text)',
                      }}
                    >
                      Book Service
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Service Selection */}
        <div className='lg:px-0 px-4 mb-7'>
          <div className='section-header lg:mb-4 mb-3'>
            <span className='section-title hidden lg:flex items-center gap-1.5'>
              <Sparkles size={16} color='var(--color-content-text-secondary)' />
              Quick Service Selection
            </span>
            <h4
              className='lg:hidden block mb-0 text-[10px] font-bold uppercase tracking-widest'
              style={{ color: 'var(--color-text-dim)' }}
            >
              Quick Repair
            </h4>
          </div>
          {error ? (
            <div className='lg:block hidden'>
              <ErrorState
                title={error}
                message='You can still start a repair by clicking the button below.'
                buttonText='Start New Repair'
                onButtonClick={handleStart}
              />
            </div>
          ) : isLoading ? (
            <div className='grid lg:grid-cols-4 grid-cols-2 lg:gap-3.5 gap-2.5'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className='h-[110px] rounded-[var(--radius-card)]'
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className='lg:block hidden'>
              <ErrorState
                title='No service categories available'
                buttonText='Start New Repair'
                onButtonClick={handleStart}
              />
            </div>
          ) : (
            <div className='grid lg:grid-cols-6 grid-cols-2 lg:gap-5 gap-2.5'>
              {categories.map((cat, idx) => {
                const CatIcon = cat.icon || Smartphone
                return (
                  <button
                    key={idx}
                    onClick={() => handleCategorySelect(cat)}
                    className='service-card'
                    style={{
                      padding: 'var(--service-card-padding, 18px 12px)',
                    }}
                  >
                    <div className='service-card-icon'>
                      <CatIcon size={21} className='lg:block hidden' />
                      <CatIcon size={20} className='lg:hidden block' />
                    </div>
                    <span
                      className='service-card-label'
                      style={{
                        fontSize: 'var(--service-card-label-size, 12px)',
                      }}
                    >
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Mobile error states */}
          {error && (
            <div className='lg:hidden block'>
              <ErrorState
                title={error}
                message='Use the search bar above to continue.'
                className='bg-[var(--color-bg-700)] border border-[var(--color-bg-400)] rounded-[18px] min-h-0 py-6'
              />
            </div>
          )}

          {!error && !isLoading && categories.length === 0 && (
            <div className='lg:hidden block'>
              <ErrorState
                title='No service categories available'
                buttonText='Start Repair'
                onButtonClick={handleStart}
                className='bg-[var(--color-bg-700)] border border-[var(--color-bg-400)] rounded-[18px] min-h-0 py-6'
              />
            </div>
          )}
        </div>

        {/* Promo Banner - MOBILE ONLY */}
        <div className='lg:hidden block px-4'>
          <div
            className='p-5 relative overflow-hidden rounded-[18px]'
            style={{
              background: 'var(--color-bg-700)',
              border: '1px solid var(--color-bg-400)',
            }}
          >
            <div className='absolute inset-0 rounded-[18px] overflow-hidden'>
              <Image
                src='/images/home-banner-top.png'
                alt=''
                width={400}
                height={200}
                className='w-full h-full object-cover opacity-[0.12]'
              />
            </div>
            <div className='relative z-1'>
              <span
                className='block mb-1.5 text-[10px] font-bold uppercase tracking-widest'
                style={{ color: 'var(--color-text-dim)' }}
              >
                Promo
              </span>
              <h4
                className='text-[17px] font-extrabold mb-1.5'
                style={{ color: 'var(--color-btn-cta-bg)' }}
              >
                Get 20% Off on First Repair
              </h4>
              <p
                className='text-xs leading-relaxed mb-4'
                style={{ color: 'var(--color-text-dim)' }}
              >
                Exclusive offer for new service registrations.
              </p>
              <button
                onClick={handleStart}
                className='border-0 rounded-[10px] py-2.5 px-5 text-xs font-bold cursor-pointer tracking-wide'
                style={{
                  background: 'var(--color-btn-cta-bg)',
                  color: 'var(--color-btn-cta-text)',
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Popular Services */}
        <div className='lg:px-0 px-4 pb-2'>
          <div className='section-header lg:mb-4 mb-3'>
            <span className='section-title lg:text-base text-xs'>
              ⭐ Popular Services
            </span>
          </div>

          {/* Desktop: 2-column grid */}
          <div className='hidden lg:grid lg:grid-cols-3 lg:gap-5'>
            {/* Screen Replacement */}
            <div
              className='popular-card min-h-55 relative'
              onClick={handleStart}
            >
              <Image
                src='/images/home-banner-top.png'
                alt='Screen Replacement'
                width={600}
                height={220}
                className='absolute inset-0 w-full h-full object-cover opacity-50'
              />
              <div className='popular-card-overlay' />
              <div className='popular-card-content'>
                <span className='badge badge-accent mb-2.5 inline-flex'>
                  Most Requested
                </span>
                <h4 className='text-xl font-extrabold text-white mb-1.5'>
                  Screen Replacement
                </h4>
                <p className='text-xs text-white/75 mb-3.5'>
                  Original parts with 12-month warranty.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStart()
                  }}
                  className='bg-transparent border-0 cursor-pointer text-white/85 text-xs font-bold tracking-wide uppercase flex items-center gap-1'
                >
                  Book Screen <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Liquid Damage */}
            <div
              className='popular-card min-h-55 relative'
              onClick={handleStart}
            >
              <Image
                src='/images/dark-microchip-bg.png'
                alt='Screen Replacement'
                width={600}
                height={220}
                className='absolute inset-0 w-full h-full object-cover opacity-50'
              />
              <div className='popular-card-overlay' />
              <div className='popular-card-content'>
                <span className='badge badge-accent mb-2.5 inline-flex'>
                  Advanced Repair
                </span>
                <h4 className='text-xl font-extrabold text-white mb-1.5'>
                  Liquid Damage
                </h4>
                <p className='text-xs text-white/75 mb-3.5'>
                  Ultrasonic cleaning &amp; circuit restoration.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStart()
                  }}
                  className='bg-transparent border-0 cursor-pointer text-white/85 text-xs font-bold tracking-wide uppercase flex items-center gap-1'
                >
                  Diagnose Board <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className='lg:hidden scrollbar-none flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory'>
            {POPULAR_SERVICES.map(({ title, sub, bg, image }) => (
              <div
                key={title}
                onClick={handleStart}
                className='shrink-0 w-38.75 h-48.75 rounded-2xl overflow-hidden relative cursor-pointer snap-start border border-white/[0.07]'
                style={{ background: bg }}
              >
                {image && (
                  <Image
                    src={image}
                    alt={title}
                    width={155}
                    height={195}
                    className='absolute inset-0 w-full h-full object-cover opacity-30'
                  />
                )}
                <div
                  className='absolute inset-0'
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent)',
                  }}
                />
                <div className='absolute bottom-0 left-0 right-0 p-3.5'>
                  <h5
                    className='text-xs font-extrabold leading-tight mb-0.75'
                    style={{ color: 'var(--color-btn-cta-bg)' }}
                  >
                    {title}
                  </h5>
                  <span className='text-[10px] text-white/45'>{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating CTA - MOBILE ONLY */}
      <button
        onClick={handleStart}
        className='lg:hidden fixed right-4 z-40 rounded-full py-3 px-5 font-bold text-[13px] flex items-center gap-2 cursor-pointer border border-white/15 shadow-[0_4px_16px_rgba(108,123,255,0.4)]'
        style={{
          bottom:
            'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 16px)',
          background: 'var(--color-accent)',
          color: 'var(--color-btn-cta-bg)',
        }}
      >
        <Plus size={17} /> Start Repair
      </button>
    </div>
  )
}
