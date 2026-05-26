'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, ShieldCheck, Box, Compass } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import authService from '@/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Store redirect URL from query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redirectParam = searchParams?.get('redirect')
      if (redirectParam) {
        sessionStorage.setItem('gr_redirect_after_login', redirectParam)
      }
    }
  }, [])

  const formatPhoneNumber = (value) => {
    // Keep only numbers
    const cleanValue = value.replace(/\D/g, '')

    // Format as US number +1 (555) 000-0000 or general format
    if (cleanValue.length <= 3) {
      return cleanValue
    } else if (cleanValue.length <= 6) {
      return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`
    } else if (cleanValue.length <= 10) {
      return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`
    } else {
      // If user inputs country code too
      const countryCode =
        cleanValue.length > 10
          ? `+${cleanValue.slice(0, cleanValue.length - 10)} `
          : ''
      const mainNumber = cleanValue.slice(cleanValue.length - 10)
      return `${countryCode}(${mainNumber.slice(0, 3)}) ${mainNumber.slice(3, 6)}-${mainNumber.slice(6)}`
    }
  }

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value
    // Strip everything except digits and "+"
    const numeric = rawVal.replace(/[^\d+]/g, '')

    // Format for display
    if (numeric.startsWith('+1')) {
      const main = numeric.slice(2)
      setPhone('+1 ' + formatPhoneNumber(main))
    } else if (numeric.startsWith('1') && numeric.length > 1) {
      setPhone('+1 ' + formatPhoneNumber(numeric.slice(1)))
    } else {
      // If it doesn't have +1, automatically prepend or format as typed
      setPhone(formatPhoneNumber(numeric))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone) {
      setError('Phone number is required')
      return
    }

    setIsLoading(true)
    setError('')

    // Normalize phone number (digits only)
    const normalizedPhone = phone.replace(/\D/g, '')
    const cleanMobile =
      normalizedPhone.length > 10 ? normalizedPhone.slice(-10) : normalizedPhone
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      setIsLoading(false)
      return
    }

    try {
      await authService.sendOtp(cleanMobile)
      // Store phone in session storage for the OTP page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gr_login_phone', cleanMobile)
      }

      // Check if there's a redirect URL from query params or session storage
      let redirectUrl = null;
      if (typeof window !== 'undefined') {
        // Priority: query param > session storage
        redirectUrl = searchParams?.get('redirect') || sessionStorage.getItem('gr_redirect_after_login');
      }

      const verifyUrl = redirectUrl
        ? `/verify-otp?phone=${encodeURIComponent(cleanMobile)}&redirect=${encodeURIComponent(redirectUrl)}`
        : `/verify-otp?phone=${encodeURIComponent(cleanMobile)}`;
      router.push(verifyUrl)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/home')
  }

  return (
    <AppShell className='auth-page-shell'>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-svh relative overflow-hidden bg-[#0D0E12]'>
        {/* Mobile Top Bar */}
        <div
          className='top-bar flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50'
          style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
        >
          <button
            onClick={() => router.back()}
            className='w-9 h-9 rounded-full text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all'
            style={{ backgroundColor: 'rgba(28, 29, 34, 0.75)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            aria-label='Go back'
          >
            <ArrowLeft size={16} />
          </button>

          <div className='flex-1 flex justify-center'>
            <img
              src='/gadget-restore-logo.svg'
              alt='Gadget Restore'
              className='h-7 object-contain'
            />
          </div>

          <button
            className='w-9 h-9 rounded-full text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all'
            style={{ backgroundColor: 'rgba(28, 29, 34, 0.75)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            aria-label='Notifications'
          >
            <Bell size={16} />
          </button>
        </div>

        {/* Backdrop elements */}
        <div className='auth-bg-mobile absolute inset-0 z-0'>
          <img
            src='/images/dark-microchip-bg.png'
            alt=''
            className='w-full h-full object-cover opacity-28 blur-[1px] contrast-115 brightness-85 scale-102 pointer-events-none'
          />
        </div>

        {/* Content container */}
        <div className='relative z-10 flex flex-col items-center justify-center min-h-svh px-5 pb-8 pt-[calc(60px+env(safe-area-inset-top,24px))] box-border'>
          {/* Glassmorphism Card */}
          <div className='auth-card-mobile bg-[#121216]/88 border border-white/10 backdrop-blur-[32px] rounded-lg pt-9 pb-7 px-6 w-full max-w-[400px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] box-border'>
            <h2 className='text-[28px] font-extrabold text-white tracking-tight mb-2.5'>
              Continue to Book
            </h2>
            <p className='text-[13px] text-white/65 leading-relaxed mb-6'>
              Please enter your phone number to secure <br /> your technical
              appointment and track your  <br />  repair status.
            </p>

            <form onSubmit={handleSubmit}>
              <div className='mb-10'>
                <label className='block text-[10px] font-bold text-white/50 tracking-[0.08em] mb-2 uppercase'>
                  PHONE NUMBER
                </label>
                <input
                  type='text'
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder='+1 (555) 000-0000'
                  className='w-full h-[52px] bg-white/[0.04] border border-white/10 rounded text-white text-base font-medium px-4 outline-none focus:border-white/40 transition-colors'
                />
                {error && (
                  <span className='block text-xs text-red-500 mt-2 font-medium'>
                    {error}
                  </span>
                )}
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='w-full h-[52px] bg-white hover:bg-neutral-100 disabled:opacity-70 text-black rounded text-[15px] font-bold cursor-pointer flex items-center justify-center transition-all duration-200'
              >
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>

            <div className="flex justify-center mt-5">
              <button
                onClick={handleSkip}
                className='bg-transparent border-0 cursor-pointer text-white/65 hover:text-white text-[13px] font-semibold px-2 py-1 transition-colors'
              >
                Skip for now
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className='text-center w-full z-10 absolute bottom-8 left-0 right-0 px-5'>
            <p className='text-[9px] font-inter font-semibold text-white/35 tracking-[0.15em] uppercase leading-relaxed m-0'>
              CERTIFIED TECHNICIANS • GENUINE PARTS • PRECISION ENGINEERING
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop hidden lg:block min-h-[calc(100vh-var(--topbar-height))] bg-[#F5F5F7]'>
        <div className='flex flex-col items-center justify-center min-h-[calc(100vh-var(--topbar-height))]'>
          {/* Stepper progress */}
          <div className='stepper-container flex items-center justify-center mb-12 gap-3'>
            {/* Details State */}
            <div className='step-item flex flex-col items-center w-[70px] relative'>
              {/* Top Black Dot */}
              <div className='w-2.5 h-2.5 rounded-full bg-black mb-2' />

              <div className='step-dot active-dot w-2.5 h-2.5 rounded-full bg-black' />

              <span className='step-label active-label text-[10px] font-extrabold tracking-wider mt-2 text-black'>
                DETAILS
              </span>
            </div>

            <div className='step-line w-24 h-[1px] bg-[#E4E4E7]' />

            {/* Auth State */}
            <div className='step-item flex flex-col items-center w-[70px] relative'>
              {/* Top Black Dot */}
              <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
              </div>

              <div className='step-dot active-dot w-2.5 h-2.5 rounded-full bg-black' />

              <span className='step-label active-label text-[10px] font-extrabold tracking-wider mt-2 text-black'>
                AUTH
              </span>
            </div>

            <div className='step-line w-24 h-[1px] bg-[#E4E4E7]' />

            {/* Confirm State */}
            <div className='step-item flex flex-col items-center w-[70px] relative'>
              {/* Top Black Dot */}
              <div className='w-2.5 h-2.5 rounded-full bg-[#71717A] mb-2' />


              <div className='step-dot w-2.5 h-2.5 rounded-full bg-neutral-300' />

              <span className='step-label text-[10px] font-extrabold tracking-wider mt-2 text-[#71717A]'>
                CONFIRM
              </span>
            </div>
          </div>

          {/* Card */}
          <div className='auth-card-desktop w-full max-w-[460px] bg-white border-0 rounded-lg px-10 pt-[50px] pb-[45px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] box-border'>
            <h2 className='text-[29px] font-black text-black tracking-tight leading-[1.2] mb-3'>
              Continue to Book
            </h2>
            <p className='text-[13.5px] text-[#6B6B6B] leading-[1.65] mb-7'>
              Please enter your phone number to secure your technical
              appointment and track your repair status.
            </p>

            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <label className='block text-[9.5px] font-bold text-[#000000] tracking-[0.12em] mb-2 uppercase'>
                  PHONE NUMBER
                </label>
                <input
                  type='text'
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder='+1 (555) 000-0000'
                  className='w-full h-[60px] bg-[#F8F8F8] border border-[#E8E8E8] rounded text-black text-[15px] font-normal px-4 outline-none focus:border-[#D0D0D0] focus:bg-[#FEFEFE] transition-all placeholder:text-[#B0B0B0]'
                />
                {error && (
                  <span className='block text-xs text-red-500 mt-2 font-semibold'>
                    {error}
                  </span>
                )}
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='w-full h-[60px] bg-black hover:bg-[#222] disabled:opacity-75 text-white rounded text-[13px] font-bold tracking-[0.05em] uppercase cursor-pointer flex items-center justify-center transition-all'
              >
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>

            <button
              onClick={handleSkip}
              className='bg-transparent border-0 cursor-pointer text-[#A0A0A0] hover:text-black text-[10.5px] font-bold tracking-[0.12em] uppercase block mx-auto mt-6 px-2 py-1 transition-colors'
            >
              Skip for now
            </button>
          </div>

          {/* Desktop features list */}
          <div className='flex items-center gap-28 mt-16'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-9 h-9 rounded-full bg-black/5 flex items-center justify-center'>
                <ShieldCheck size={17} color='#333333' strokeWidth={2.2} />
              </div>
              <span className='text-[9px] font-inter font-bold text-[#888] tracking-[0.08em] uppercase text-center leading-[1.5]'>
                Certified
                <br />
                Technicians
              </span>
            </div>


            <div className='flex flex-col items-center gap-3'>
              <div className='w-9 h-9 rounded-full bg-black/5 flex items-center justify-center'>
                <Box size={17} color='#333333' strokeWidth={2.2} />
              </div>
              <span className='text-[9px] font-inter font-bold text-[#888] tracking-[0.08em] uppercase text-center leading-[1.5]'>
                Genuine
                <br />
                Parts
              </span>
            </div>


            <div className='flex flex-col items-center gap-3'>
              <div className='w-9 h-9 rounded-full bg-black/5 flex items-center justify-center'>
                <Compass size={17} color='#333333' strokeWidth={2.2} />
              </div>
              <span className='text-[9px] font-inter font-bold text-[#888] tracking-[0.08em] uppercase text-center leading-[1.5]'>
                Precision
                <br />
                Engineering
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
