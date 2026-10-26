'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import slotService from '@/services/slot.service'
import serviceCentreService from '@/services/serviceCentre.service'

// ── Custom Desktop Calendar Picker ───────────────────────────────────────────
function DesktopCalendar({ selectedDate, setSelectedDate, availableDates, setSelectedTimeSlot, setError, isLoading }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Today's date string for past-date detection
  const todayStr = (() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })()

  const GAP = 8

  return (
    <div className='w-full flex justify-start'>
      <div
        className='w-full rounded-[24px] overflow-hidden'
        style={{
          background: 'var(--color-content-card)',
          border: '1px solid var(--theme-border-strong)',
          maxWidth: '560px'
        }}
      >
        {/* Month navigation */}
        <div className='flex items-center justify-between px-6 py-4' style={{ borderBottom: '1px solid var(--theme-border-strong)' }}>
          <button
            type='button'
            onClick={handlePrevMonth}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--theme-bg-400)', border: 'none',
              color: 'var(--theme-text-mid)', fontSize: 14, cursor: 'pointer',
            }}
          >←</button>
          <h4 style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-content-text)' }}>
            {monthName}
          </h4>
          <button
            type='button'
            onClick={handleNextMonth}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--theme-bg-400)', border: 'none',
              color: 'var(--theme-text-mid)', fontSize: 14, cursor: 'pointer',
            }}
          >→</button>
        </div>

        {/* Calendar body — fully responsive aspect-ratio grid */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: GAP, marginBottom: 12, width: '100%' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0', color: 'var(--theme-text-muted)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Date cells — responsive aspect-ratio squares */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: GAP, width: '100%' }}>
            {isLoading ? (
              Array.from({ length: 35 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className='animate-pulse'
                  style={{ width: '100%', aspectRatio: '1', borderRadius: 7, background: 'var(--theme-bg-400)', opacity: 0.35 }}
                />
              ))
            ) : (
              days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} style={{ width: '100%', aspectRatio: '1' }} />

                const year = day.getFullYear()
                const month = String(day.getMonth() + 1).padStart(2, '0')
                const date = String(day.getDate()).padStart(2, '0')
                const dateStr = `${year}-${month}-${date}`

                const isPast = dateStr < todayStr
                const isToday = dateStr === todayStr
                const dateData = availableDates.find(d => d.date === dateStr)
                const hasSlots = !!dateData && dateData.slots.some(s => s.available)
                const isSelected = selectedDate === dateStr
                const isDisabled = isPast || !hasSlots

                let bg = 'transparent'
                let color = 'var(--theme-text-muted)'
                let border = '1px solid transparent'
                let opacity = 1
                let cursor = 'default'

                if (isSelected) {
                  bg = 'var(--color-content-text)'
                  color = 'var(--color-content-bg)'
                  border = '1px solid var(--color-content-text)'
                  cursor = 'pointer'
                } else if (isPast) {
                  color = 'var(--theme-text-muted)'
                  opacity = 0.35
                } else if (hasSlots) {
                  bg = 'var(--theme-bg-300)'
                  color = 'var(--theme-text-near-white)'
                  border = '1px solid var(--theme-bg-200)'
                  cursor = 'pointer'
                } else {
                  opacity = 0.4
                }

                if (isToday && !isSelected) {
                  border = '1px solid var(--theme-text-mid)'
                  if (!hasSlots) color = 'var(--theme-text-mid)'
                }

                return (
                  <button
                    key={dateStr}
                    type='button'
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedDate(dateStr)
                        setSelectedTimeSlot(null)
                        setError('')
                      }
                    }}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 7,
                      background: bg,
                      color,
                      border,
                      opacity,
                      cursor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      transition: 'background 0.12s, color 0.12s',
                      position: 'relative',
                      padding: 0,
                    }}
                  >
                    {day.getDate()}
                    {hasSlots && !isSelected && !isPast && (
                      <span style={{
                        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                        width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)',
                      }} />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function SchedulePage() {
  const router = useRouter()
  const { setSlot, slot } = useBooking()

  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(slot?.date || null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(slot?.timeSlot || null)
  const [serviceCentres, setServiceCentres] = useState([])
  const [selectedServiceCentre, setSelectedServiceCentre] = useState(null)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 1. Fetch Service Centres on mount
  useEffect(() => {
    async function fetchCentres() {
      try {
        const scData = await serviceCentreService.getAllServiceCentres({ limit: 100 })
        if (scData?.serviceCentres?.length > 0) {
          setServiceCentres(scData.serviceCentres)
          const existingCentre = scData.serviceCentres.find(sc => sc._id === slot?.centreId)
          setSelectedServiceCentre(existingCentre || scData.serviceCentres[0])
        }
      } catch (scErr) {
        console.error('Failed to fetch service centres:', scErr)
      }
    }
    fetchCentres()
  }, [])

  // 2. Fetch Slots when selected service center changes
  useEffect(() => {
    if (!selectedServiceCentre) return

    async function fetchSlots() {
      try {
        setIsLoading(true)
        setError('')

        const data = await slotService.getAvailableSlotsForNextDays(30, selectedServiceCentre._id)
        if (data && typeof data === 'object') {
          const parsedDates = Object.entries(data).map(([dateStr, slots]) => {
            return {
              date: dateStr,
              slots: slots.map((s) => ({
                time: s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : (s.startTime || s.time),
                available: s.isAvailable !== undefined ? s.isAvailable : s.available,
              })),
            }
          })

          parsedDates.sort((a, b) => new Date(a.date) - new Date(b.date))
          setAvailableDates(parsedDates)

          if (!parsedDates.some(d => d.date === selectedDate)) {
            if (parsedDates.length > 0) {
              setSelectedDate(parsedDates[0].date)
            } else {
              setSelectedDate(null)
            }
            setSelectedTimeSlot(null)
          }
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err)
        setError('Failed to fetch available slots.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [selectedServiceCentre])

  const handleConfirm = () => {
    if (selectedDate && selectedTimeSlot && selectedServiceCentre) {
      setSlot({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        centreId: selectedServiceCentre._id,
      })
      router.push('/address')
    } else {
      setError('Please select a date, time slot, and service center.')
    }
  }

  const selectedDateObj = availableDates.find((d) => d.date === selectedDate)
  const timeSlots = selectedDateObj?.slots || []

  return (
    <div className='schedule-page-shell'>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-[100svh] relative overflow-hidden' style={{ background: 'var(--color-content-card)' }}>
        <div className='relative z-10 pb-[100px]' style={{ background: 'var(--color-content-bg)' }}>
          <div className='px-5 pt-6 pb-4'>
            <h1 className='text-2xl font-black tracking-tight uppercase leading-tight mb-1' style={{ color: 'var(--color-content-text)' }}>
              BOOK APPOINTMENT
            </h1>
            <p className='text-sm' style={{ color: 'var(--color-content-text-secondary)' }}>
              Choose a convenient time for your repair.
            </p>
          </div>

          {error && (
            <div className='px-5 mb-4'>
              <span className='text-red-500 text-sm font-semibold'>
                {error}
              </span>
            </div>
          )}

          {/* Date Selection */}
          <div className='mb-8'>
            <h3 className='px-5 text-sm font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>
              Select Date
            </h3>
            <div className='flex overflow-x-auto gap-3 px-5 p-2 -m-2 pb-2 scrollbar-hide'>
              {availableDates.map((d, idx) => {
                const isSelected = d.date === selectedDate
                const dj = new Date(d.date)
                const dayLabel = dj.toLocaleDateString('en-US', { weekday: 'short' })
                const dateLabel = dj.toLocaleDateString('en-US', { day: '2-digit' })
                const monthLabel = dj.toLocaleDateString('en-US', { month: 'short' })

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(d.date)
                      setSelectedTimeSlot(null)
                      setError('')
                    }}
                    className={`flex-shrink-0 w-[72px] py-3 rounded-2xl flex flex-col items-center justify-center transition-all ${isSelected
                      ? 'shadow-lg scale-[1.02]'
                      : 'shadow-sm'
                      }`}
                    style={{
                      background: 'var(--color-content-card)',
                      border: isSelected ? '1px solid var(--color-content-text)' : '1px solid var(--color-content-border)',
                    }}
                  >
                    <span className='text-[11px] font-bold' style={{ color: 'var(--color-content-text-secondary)' }}>{dayLabel}</span>
                    <span className='text-2xl font-black mt-0.5 mb-0.5' style={{ color: 'var(--color-content-text)' }}>{dateLabel}</span>
                    <span className='text-[11px] font-bold' style={{ color: 'var(--color-content-text-secondary)' }}>{monthLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className='mb-8 px-5'>
            <h3 className='text-sm font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>
              Select Time Slot
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              {isLoading ? (
                <>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-[52px] rounded-2xl animate-pulse bg-gray-200" />
                  ))}
                </>
              ) : timeSlots.length > 0 ? (
                timeSlots.map((t, idx) => {
                  const isSelected = selectedTimeSlot === t.time
                  const isAvailable = t.available !== false
                  return (
                    <button
                      key={idx}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedTimeSlot(t.time)
                        setError('')
                      }}
                      className='h-[52px] rounded-2xl text-xs font-bold transition-all'
                      style={{
                        border: '1px solid var(--color-content-border)',
                        background: !isAvailable
                          ? 'var(--color-content-bg)'
                          : isSelected
                            ? 'var(--color-content-card)'
                            : 'var(--color-content-card)',
                        borderColor: !isAvailable
                          ? 'transparent'
                          : isSelected
                            ? 'var(--color-content-text)'
                            : 'var(--color-content-border)',
                        color: !isAvailable
                          ? 'var(--color-content-border)'
                          : isSelected
                            ? 'var(--color-content-text)'
                            : 'var(--color-content-text-secondary)',
                        cursor: !isAvailable ? 'not-allowed' : 'pointer',
                        opacity: !isAvailable ? 0.4 : 1,
                      }}
                    >
                      {t.time}
                    </button>
                  )
                })
              ) : (
                <div className='col-span-2 text-center text-sm py-4' style={{ color: 'var(--color-content-text-secondary)' }}>
                  No slots available for this date.
                </div>
              )}
            </div>
          </div>

          {/* Service Center */}
          <div className='mb-8 px-5'>
            <h3 className='text-sm font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>
              Shop / Service Center
            </h3>
            <div className='relative'>
              <div
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className='rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer'
                style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}
              >
                <div>
                  <h4 className='text-sm font-extrabold' style={{ color: 'var(--color-content-text)' }}>
                    {selectedServiceCentre ? selectedServiceCentre.name : 'Loading...'}
                  </h4>
                  <p className='text-xs mt-1' style={{ color: 'var(--color-content-text-secondary)' }}>
                    {selectedServiceCentre?.address?.city || 'Pick & Drop Facility'}
                  </p>
                </div>
                <ChevronDown size={18} color='#999' className={`transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isMobileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMobileDropdownOpen(false)} />
                  <div className="absolute top-full left-0 w-full mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[240px] overflow-y-auto" style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                    {serviceCentres.map((sc) => (
                      <div
                        key={sc._id}
                        onClick={() => {
                          setSelectedServiceCentre(sc)
                          setIsMobileDropdownOpen(false)
                        }}
                        className='p-4 last:border-none cursor-pointer transition-colors'
                        style={{
                          borderBottom: '1px solid var(--color-content-border)',
                          background: selectedServiceCentre?._id === sc._id ? 'var(--color-content-bg)' : 'transparent',
                        }}
                      >
                        <h4 className='text-sm font-extrabold' style={{ color: 'var(--color-content-text)' }}>
                          {sc.name}
                        </h4>
                        <p className='text-xs mt-1' style={{ color: 'var(--color-content-text-secondary)' }}>
                          {sc.address?.city || 'Service Center'}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Confirm Button */}
          <div className='px-5 mt-10 mb-8'>
            <button
              onClick={handleConfirm}
              className='w-full h-14 rounded-[20px] text-sm font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform'
              style={{ background: 'var(--theme-btn-primary-bg)', color: 'var(--theme-btn-primary-text)' }}
            >
              Confirm Booking <ArrowLeft className='rotate-180' size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop hidden lg:block min-h-[calc(100vh-var(--topbar-height))]' style={{ background: 'var(--theme-bg)' }}>
        <div className='p-8 flex gap-12'>
          <div className='flex-1'>
            <h1 className='text-[44px] font-black tracking-tight leading-none mb-3' style={{ color: 'var(--color-content-text)' }}>
              Book Appointment
            </h1>
            <p className='text-lg mb-12' style={{ color: 'var(--color-content-text-secondary)' }}>
              Schedule a convenient time for your device restoration using our precision booking system.
            </p>

            {error && (
              <div className='mb-6 p-4 rounded-lg text-sm font-semibold border' style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}>
                {error}
              </div>
            )}

            {/* Combined Calendar and Time Slots Wrapper Centered to Use Space Balancedly */}
            <div className='flex flex-col xl:flex-row gap-6 items-start mb-12 w-full'>

              {/* Calendar Column */}
              <div className='w-full max-w-[580px]'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-bold uppercase tracking-wider flex items-center gap-2' style={{ color: 'var(--color-content-text)' }}>
                    📅 SELECT DATE
                  </h3>
                </div>
                <DesktopCalendar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  availableDates={availableDates}
                  setSelectedTimeSlot={setSelectedTimeSlot}
                  setError={setError}
                  isLoading={isLoading}
                />
              </div>

              {/* Time Slots Column */}
              <div className='w-full max-w-[580px]'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-bold uppercase tracking-wider flex items-center gap-2' style={{ color: 'var(--color-content-text)' }}>
                    🕒 PREFERRED TIME SLOT
                  </h3>
                </div>

                {/* Styled Card Container wrapping the slot grid */}
                <div
                  className='w-full rounded-[24px] p-6 max-w-[580px] xl:max-w-[580px]'
                  style={{
                    background: 'var(--color-content-card)',
                    border: '1px solid var(--theme-border-strong)'
                  }}
                >
                  <div className='grid grid-cols-4 gap-3 w-full'>
                    {isLoading ? (
                      <>
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className="skeleton h-14 rounded-xl animate-pulse bg-gray-200" />
                        ))}
                      </>
                    ) : timeSlots.length > 0 ? (
                      timeSlots.map((t, idx) => {
                        const isSelected = selectedTimeSlot === t.time
                        const isAvailable = t.available !== false
                        return (
                          <button
                            key={idx}
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedTimeSlot(t.time)
                              setError('')
                            }}
                            className='h-14 rounded-xl text-xs font-bold transition-all border-2'
                            style={{
                              background: !isAvailable
                                ? 'var(--color-content-bg)'
                                : isSelected
                                  ? 'var(--color-content-text)'
                                  : 'var(--theme-bg-300)',
                              borderColor: !isAvailable
                                ? 'transparent'
                                : isSelected
                                  ? 'var(--color-content-text)'
                                  : 'transparent',
                              color: !isAvailable
                                ? 'var(--color-content-border)'
                                : isSelected
                                  ? 'var(--color-content-bg)'
                                  : 'var(--color-content-text-secondary)',
                              cursor: !isAvailable ? 'not-allowed' : 'pointer',
                              opacity: !isAvailable ? 0.4 : 1,
                            }}
                          >
                            {t.time}
                          </button>
                        )
                      })
                    ) : (
                      <div className='col-span-2 text-left text-sm py-4' style={{ color: 'var(--color-content-text-secondary)' }}>
                        No slots available for this date.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className='w-full h-16 rounded-xl text-[15px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer animate-fade-in'
              style={{ background: 'var(--theme-btn-primary-bg)', color: 'var(--theme-btn-primary-text)' }}
            >
              CONFIRM BOOKING <ArrowLeft className='rotate-180' size={18} />
            </button>
          </div>

          {/* Right column - Service Center map preview */}
          <div className='w-[400px]'>
            <div className='rounded-[24px] p-6 h-full' style={{ background: 'var(--color-content-bg)', border: '1px solid var(--color-content-border)' }}>
              <h3 className='text-xs font-black uppercase tracking-wider mb-4' style={{ color: 'var(--color-content-text-secondary)' }}>
                SERVICE CENTER
              </h3>

              <div className='relative mb-6'>
                <div
                  onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
                  className='rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer transition-colors'
                  style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}
                >
                  <div className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: 'var(--color-content-bg)' }}>
                    <span style={{ color: 'var(--color-content-text)' }} className='font-bold text-xs'>GR</span>
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-sm font-extrabold' style={{ color: 'var(--color-content-text)' }}>
                      {selectedServiceCentre ? selectedServiceCentre.name : 'Loading...'}
                    </h4>
                    <p className='text-[11px] mt-0.5' style={{ color: 'var(--color-content-text-secondary)' }}>
                      {selectedServiceCentre?.address?.city || 'Central Processing Lab'}
                    </p>
                  </div>
                  <ChevronDown size={20} color='var(--color-content-text-secondary)' className={`transition-transform ${isDesktopDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDesktopDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDesktopDropdownOpen(false)} />
                    <div className="absolute top-full left-0 w-full mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px] overflow-y-auto" style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                      {serviceCentres.map((sc) => (
                        <div
                          key={sc._id}
                          onClick={() => {
                            setSelectedServiceCentre(sc)
                            setIsDesktopDropdownOpen(false)
                          }}
                          className='p-4 last:border-none cursor-pointer transition-colors flex items-center gap-4'
                          style={{
                            borderBottom: '1px solid var(--color-content-border)',
                            background: selectedServiceCentre?._id === sc._id ? 'var(--color-content-bg)' : 'transparent',
                          }}
                        >
                          <div className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: 'var(--color-content-bg)' }}>
                            <span style={{ color: 'var(--color-content-text)' }} className='font-bold text-[10px]'>GR</span>
                          </div>
                          <div className='flex-1'>
                            <h4 className='text-sm font-extrabold' style={{ color: 'var(--color-content-text)' }}>
                              {sc.name}
                            </h4>
                            <p className='text-[11px] mt-0.5' style={{ color: 'var(--color-content-text-secondary)' }}>
                              {sc.address?.city || 'Service Center'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}