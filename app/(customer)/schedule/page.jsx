'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, ChevronDown } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import slotService from '@/services/slot.service'
import serviceCentreService from '@/services/serviceCentre.service'

export default function SchedulePage() {
  const router = useRouter()
  const { setSlot, slot } = useBooking()

  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(slot?.date || null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    slot?.timeSlot || null,
  )
  const [serviceCentres, setServiceCentres] = useState([])
  const [selectedServiceCentre, setSelectedServiceCentre] = useState(null)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch slots
  useEffect(() => {
    async function fetchSlots() {
      try {
        setIsLoading(true)

        // Fetch Service Centres
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

        // We'll mock the data if backend fails, but let's try the real API first
        const data = await slotService.getAvailableSlotsForNextDays(7)
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const parsedDates = Object.entries(data).map(([dateStr, slots]) => {
            return {
              date: dateStr,
              slots: slots.map((s) => ({
                time: s.startTime || s.time, // handle both backend and mock formats
                available:
                  s.isAvailable !== undefined ? s.isAvailable : s.available,
              })),
            }
          })

          parsedDates.sort((a, b) => new Date(a.date) - new Date(b.date))
          setAvailableDates(parsedDates)
          if (!selectedDate && parsedDates.length > 0) {
            setSelectedDate(parsedDates[0].date)
          }
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch available slots.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSlots()
  }, [])

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

  // Find the selected date object to render its slots
  const selectedDateObj = availableDates.find((d) => d.date === selectedDate)
  const timeSlots = selectedDateObj?.slots || []

  return (
    <div className='schedule-page-shell'>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-[100svh] relative overflow-hidden' style={{ background: 'var(--color-content-card)' }}>
        {/* Content */}
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
                // Parse date for display if it came from backend format
                let dayLabel = d.displayDay
                let dateLabel = d.displayDate
                let monthLabel = d.displayMonth
                if (!dayLabel) {
                  const dj = new Date(d.date)
                  dayLabel = dj.toLocaleDateString('en-US', {
                    weekday: 'short',
                  })
                  dateLabel = dj.toLocaleDateString('en-US', { day: '2-digit' })
                  monthLabel = dj.toLocaleDateString('en-US', {
                    month: 'short',
                  })
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(d.date)
                      setSelectedTimeSlot(null) // reset time slot on date change
                      setError('')
                    }}
                    className={`flex-shrink-0 w-[72px] py-3 rounded-2xl flex flex-col items-center justify-center transition-all ${isSelected
                      ? 'shadow-lg scale-[1.02]'
                      : 'shadow-sm'
                      }`}
                    style={{
                      background: isSelected ? 'var(--color-content-card)' : 'var(--color-content-card)',
                      border: isSelected ? '1px solid var(--color-content-text)' : '1px solid var(--color-content-border)',
                    }}
                  >
                    <span
                      className='text-[11px] font-bold'
                      style={{ color: isSelected ? 'var(--color-content-text-secondary)' : 'var(--color-content-text-secondary)' }}
                    >
                      {dayLabel}
                    </span>
                    <span
                      className='text-2xl font-black mt-0.5 mb-0.5'
                      style={{ color: isSelected ? 'var(--color-content-text)' : 'var(--color-content-text)' }}
                    >
                      {dateLabel}
                    </span>
                    <span
                      className='text-[11px] font-bold'
                      style={{ color: isSelected ? 'var(--color-content-text-secondary)' : 'var(--color-content-text-secondary)' }}
                    >
                      {monthLabel}
                    </span>
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
                <div className='col-span-2 text-center text-sm py-4' style={{ color: 'var(--color-content-text-secondary)' }}>
                  Loading slots...
                </div>
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
                      className='h-[52px] rounded-2xl text-sm font-bold transition-all'
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
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-content-border)'}
                        onMouseOut={(e) => e.currentTarget.style.background = selectedServiceCentre?._id === sc._id ? 'var(--color-content-bg)' : 'transparent'}
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
        {/* Using a simplified layout that mimics the image for desktop */}
        <div className='p-8 flex gap-12'>
          <div className='flex-1'>
            <h1 className='text-[44px] font-black tracking-tight leading-none mb-3' style={{ color: 'var(--color-content-text)' }}>
              Book Appointment
            </h1>
            <p className='text-lg mb-12' style={{ color: 'var(--color-content-text-secondary)' }}>
              Schedule a convenient time for your device restoration using our
              precision booking system.
            </p>

            {error && (
              <div className='mb-6 p-4 rounded-lg text-sm font-semibold border' style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}>
                {error}
              </div>
            )}

            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-sm font-bold uppercase tracking-wider flex items-center gap-2' style={{ color: 'var(--color-content-text)' }}>
                📅 SELECT DATE
              </h3>
              <span className='text-sm font-bold underline decoration-2 underline-offset-4' style={{ color: 'var(--color-content-text)' }}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className='flex gap-4 mb-12 overflow-x-auto p-2 -m-2'>
              {availableDates.map((d, idx) => {
                const isSelected = d.date === selectedDate
                const dateObj = new Date(d.date)
                let dayLabel =
                  d.displayDay ||
                  dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                let dateLabel =
                  d.displayDate ||
                  dateObj.toLocaleDateString('en-US', { day: '2-digit' })

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(d.date)
                      setSelectedTimeSlot(null)
                      setError('')
                    }}
                    className='w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all'
                    style={{
                      background: isSelected ? 'var(--color-content-card)' : 'var(--color-content-bg)',
                      border: isSelected ? '1px solid var(--color-content-text)' : '1px solid var(--color-content-border)',
                    }}
                  >
                    <span
                      className='text-[13px] font-bold uppercase'
                      style={{ color: isSelected ? 'var(--color-content-text-secondary)' : 'var(--color-content-text-secondary)' }}
                    >
                      {dayLabel}
                    </span>
                    <span
                      className='text-3xl font-black mt-1'
                      style={{ color: isSelected ? 'var(--color-content-text)' : 'var(--color-content-text)' }}
                    >
                      {dateLabel}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-sm font-bold uppercase tracking-wider flex items-center gap-2' style={{ color: 'var(--color-content-text)' }}>
                🕒 PREFERRED TIME SLOT
              </h3>
            </div>

            <div className='grid grid-cols-4 gap-4 mb-12'>
              {isLoading ? (
                <div className='col-span-4' style={{ color: 'var(--color-content-text-secondary)' }}>Loading slots...</div>
              ) : (
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
                      className='h-14 rounded-xl text-sm font-bold transition-all border-2'
                      style={{
                        background: !isAvailable
                          ? 'var(--color-content-bg)'
                          : isSelected
                            ? 'var(--color-content-card)'
                            : 'var(--color-content-bg)',
                        borderColor: !isAvailable
                          ? 'transparent'
                          : isSelected
                            ? 'var(--color-content-text)'
                            : 'transparent',
                        color: !isAvailable
                          ? 'var(--color-content-border)'
                          : isSelected
                            ? 'var(--color-content-text)'
                            : 'var(--color-content-text-secondary)',
                        cursor: !isAvailable ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {t.time}
                    </button>
                  )
                })
              )}
            </div>

            <button
              onClick={handleConfirm}
              className='w-full h-16 rounded-xl text-[15px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer'
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
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-content-border)'}
                          onMouseOut={(e) => e.currentTarget.style.background = selectedServiceCentre?._id === sc._id ? 'var(--color-content-bg)' : 'transparent'}
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

              <div className='w-full h-[240px] rounded-2xl overflow-hidden relative' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                {/* Static Map Background mimicking image */}
                <img
                  src='/images/service-center-placeholder.png'
                  alt='Service Center Map'
                  className='absolute inset-0 w-full h-full object-cover opacity-55 filter grayscale'
                />
                {/* Center dot */}
                <div className='absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md' style={{ background: 'var(--color-accent)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
