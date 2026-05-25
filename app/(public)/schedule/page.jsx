'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import { useBooking } from '@/context/BookingContext';
import slotService from '@/services/slot.service';

export default function SchedulePage() {
  const router = useRouter();
  const { setSlot, slot } = useBooking();
  
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(slot?.date || null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(slot?.timeSlot || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch slots
  useEffect(() => {
    async function fetchSlots() {
      try {
        setIsLoading(true);
        // We'll mock the data if backend fails, but let's try the real API first
        const data = await slotService.getAvailableSlotsForNextDays(7);
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
           const parsedDates = Object.entries(data).map(([dateStr, slots]) => {
             return {
               date: dateStr,
               slots: slots.map(s => ({ 
                 time: s.startTime || s.time, // handle both backend and mock formats
                 available: s.isAvailable !== undefined ? s.isAvailable : s.available 
               }))
             };
           });
           
           parsedDates.sort((a,b) => new Date(a.date) - new Date(b.date));
           setAvailableDates(parsedDates);
           if (!selectedDate && parsedDates.length > 0) {
             setSelectedDate(parsedDates[0].date);
           }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch available slots.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlots();
  }, []);



  const handleConfirm = () => {
    if (selectedDate && selectedTimeSlot) {
      setSlot({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        centreId: 'default-lab'
      });
      router.push('/address');
    } else {
      setError('Please select both a date and a time slot.');
    }
  };

  // Find the selected date object to render its slots
  const selectedDateObj = availableDates.find(d => d.date === selectedDate);
  const timeSlots = selectedDateObj?.slots || [];

  return (
    <AppShell className="schedule-page-shell">
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile lg:hidden min-h-[100svh] relative overflow-hidden bg-[#222222]">
        
        {/* Mobile Top Bar */}
        <div className="top-bar flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50 bg-[#222222]">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 flex justify-center">
            <img
              src="/gadget-restore-logo.svg"
              alt="Gadget Restore"
              className="h-6 object-contain"
            />
          </div>

          <button
            className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-[72px] pb-[100px] bg-[#EBEBEB] min-h-[100svh] mt-[-20px] rounded-t-[30px]">
          <div className="px-5 pt-6 pb-4">
            <h1 className="text-2xl font-black text-black tracking-tight uppercase leading-tight mb-1">
              BOOK APPOINTMENT
            </h1>
            <p className="text-[#666666] text-sm">
              Choose a convenient time for your repair.
            </p>
          </div>

          {error && (
            <div className="px-5 mb-4">
               <span className="text-red-500 text-sm font-semibold">{error}</span>
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="px-5 text-sm font-bold text-[#1A1A1E] mb-3">Select Date</h3>
            <div className="flex overflow-x-auto gap-3 px-5 pb-2 scrollbar-hide">
              {availableDates.map((d, idx) => {
                const isSelected = d.date === selectedDate;
                // Parse date for display if it came from backend format
                let dayLabel = d.displayDay;
                let dateLabel = d.displayDate;
                let monthLabel = d.displayMonth;
                if (!dayLabel) {
                   const dj = new Date(d.date);
                   dayLabel = dj.toLocaleDateString('en-US', { weekday: 'short' });
                   dateLabel = dj.toLocaleDateString('en-US', { day: '2-digit' });
                   monthLabel = dj.toLocaleDateString('en-US', { month: 'short' });
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                       setSelectedDate(d.date);
                       setSelectedTimeSlot(null); // reset time slot on date change
                       setError('');
                    }}
                    className={`flex-shrink-0 w-[72px] py-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-black text-white shadow-lg scale-[1.02]' 
                        : 'bg-white text-black shadow-sm'
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-white/80' : 'text-[#666]'}`}>{dayLabel}</span>
                    <span className="text-2xl font-black mt-0.5 mb-0.5">{dateLabel}</span>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-white/80' : 'text-[#666]'}`}>{monthLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="mb-8 px-5">
            <h3 className="text-sm font-bold text-[#1A1A1E] mb-3">Select Time Slot</h3>
            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                <div className="col-span-2 text-center text-sm text-[#666] py-4">Loading slots...</div>
              ) : timeSlots.length > 0 ? (
                timeSlots.map((t, idx) => {
                  const isSelected = selectedTimeSlot === t.time;
                  const isAvailable = t.available !== false;
                  return (
                    <button
                      key={idx}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedTimeSlot(t.time);
                        setError('');
                      }}
                      className={`h-[52px] rounded-2xl text-sm font-bold transition-all ${
                        !isAvailable 
                          ? 'bg-black/5 text-black/30 cursor-not-allowed'
                          : isSelected
                            ? 'bg-black text-white shadow-md'
                            : 'bg-white text-black shadow-sm hover:bg-gray-50'
                      }`}
                    >
                      {t.time}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-sm text-[#666] py-4">No slots available for this date.</div>
              )}
            </div>
          </div>

          {/* Service Center (Placeholder as per Phase 1 UI) */}
          <div className="mb-8 px-5">
            <h3 className="text-sm font-bold text-[#1A1A1E] mb-3">Shop / Service Center</h3>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-[#E4E4E7]">
               <div>
                  <h4 className="text-sm font-extrabold text-[#111]">Gadget Restore - Default Lab</h4>
                  <p className="text-xs text-[#666] mt-1">Pick & Drop Facility</p>
               </div>
               <ChevronDown size={18} color="#999" />
            </div>
          </div>

          {/* Confirm Button */}
          <div className="px-5 mt-10 mb-8">
            <button
              onClick={handleConfirm}
              className="w-full h-14 bg-black text-white rounded-[20px] text-sm font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Confirm Booking <ArrowLeft className="rotate-180" size={16} />
            </button>
          </div>
        </div>

        <BottomNav />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-desktop hidden lg:block bg-white min-h-[calc(100vh-var(--topbar-height))]">
         {/* Using a simplified layout that mimics the image for desktop */}
         <div className="max-w-6xl mx-auto p-10 flex gap-12">
            
            <div className="flex-1">
               <h1 className="text-[44px] font-black text-black tracking-tight leading-none mb-3">
                 Book Appointment
               </h1>
               <p className="text-lg text-[#666] mb-12">
                 Schedule a convenient time for your device restoration using our precision booking system.
               </p>

               {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">
                     {error}
                  </div>
               )}

               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider flex items-center gap-2">
                   📅 SELECT DATE
                 </h3>
                 <span className="text-sm font-bold underline decoration-2 underline-offset-4">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
               </div>

               <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
                  {availableDates.map((d, idx) => {
                    const isSelected = d.date === selectedDate;
                    const dateObj = new Date(d.date);
                    let dayLabel = d.displayDay || dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    let dateLabel = d.displayDate || dateObj.toLocaleDateString('en-US', { day: '2-digit' });
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDate(d.date);
                          setSelectedTimeSlot(null);
                          setError('');
                        }}
                        className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-black text-white shadow-xl scale-105' 
                            : 'bg-[#F4F4F5] text-black hover:bg-[#EAEAEF]'
                        }`}
                      >
                        <span className={`text-[13px] font-bold uppercase ${isSelected ? 'text-white/80' : 'text-[#666]'}`}>{dayLabel}</span>
                        <span className="text-3xl font-black mt-1">{dateLabel}</span>
                      </button>
                    );
                  })}
               </div>

               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider flex items-center gap-2">
                   🕒 PREFERRED TIME SLOT
                 </h3>
               </div>

               <div className="grid grid-cols-4 gap-4 mb-12">
                  {isLoading ? (
                    <div className="col-span-4 text-[#666]">Loading slots...</div>
                  ) : timeSlots.map((t, idx) => {
                    const isSelected = selectedTimeSlot === t.time;
                    const isAvailable = t.available !== false;
                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedTimeSlot(t.time);
                          setError('');
                        }}
                        className={`h-14 rounded-xl text-sm font-bold transition-all border-2 ${
                          !isAvailable 
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : isSelected
                              ? 'border-black text-black'
                              : 'bg-[#F4F4F5] border-transparent text-[#666] hover:bg-[#EAEAEF]'
                        }`}
                      >
                        {t.time}
                      </button>
                    );
                  })}
               </div>

               <button
                  onClick={handleConfirm}
                  className="w-full h-16 bg-[#EBEBEB] hover:bg-[#E0E0E0] text-black rounded-xl text-[15px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
               >
                  CONFIRM BOOKING <ArrowLeft className="rotate-180" size={18} />
               </button>
            </div>

            {/* Right column - Service Center map preview */}
            <div className="w-[400px]">
               <div className="bg-[#F8F8F8] rounded-[24px] p-6 h-full border border-gray-100">
                  <h3 className="text-xs font-black text-[#888] uppercase tracking-wider mb-4">SERVICE CENTER</h3>
                  
                  <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-[#F0F0F0] mb-6">
                     <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">GR</span>
                     </div>
                     <div className="flex-1">
                        <h4 className="text-sm font-extrabold text-[#111]">Gadget Restore</h4>
                        <p className="text-[11px] text-[#666] mt-0.5">Central Processing Lab</p>
                     </div>
                     <ChevronDown size={20} color="#999" />
                  </div>

                  <div className="w-full h-[240px] bg-[#EBEBEB] rounded-2xl overflow-hidden relative border border-[#E0E0E0]">
                     {/* Static Map Background mimicking image */}
                     <img src="/images/service-center-placeholder.png" alt="Service Center Map" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply filter grayscale" />
                     {/* Center dot */}
                     <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md"></div>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </AppShell>
  );
}
