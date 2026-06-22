'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, ShieldCheck, Box, Compass } from 'lucide-react'
import authService from '@/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorCountdown, setErrorCountdown] = useState(null)

  // Store redirect URL from query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redirectParam = searchParams?.get('redirect')
      if (redirectParam) {
        sessionStorage.setItem('gr_redirect_after_login', redirectParam)
      }
    }
  }, [])

  useEffect(() => {
    if (errorCountdown === null || errorCountdown <= 0) return
    const timer = setInterval(() => {
      setErrorCountdown((prev) => {
        if (prev <= 1) {
          setError('')
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [errorCountdown])

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value
    // Strip everything except digits
    const numeric = rawVal.replace(/\D/g, '')
    // Limit to 10 digits
    const cleanValue = numeric.slice(0, 10)
    setPhone(cleanValue)
  }

  const getDisplayError = () => {
    if (error && errorCountdown !== null) {
      return `Please wait ${errorCountdown} seconds before requesting another OTP.`
    }
    return error
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone) {
      setError('Phone number is required')
      return
    }

    setIsLoading(true)
    setError('')
    setErrorCountdown(null)

    const cleanMobile = phone.replace(/\D/g, '')
    if (cleanMobile.length !== 10) {
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
      let redirectUrl = null
      if (typeof window !== 'undefined') {
        // Priority: query param > session storage
        redirectUrl =
          searchParams?.get('redirect') ||
          sessionStorage.getItem('gr_redirect_after_login')
      }

      const verifyUrl = redirectUrl
        ? `/verify-otp?phone=${encodeURIComponent(cleanMobile)}&redirect=${encodeURIComponent(redirectUrl)}`
        : `/verify-otp?phone=${encodeURIComponent(cleanMobile)}`
      router.push(verifyUrl)
    } catch (err) {
      const errMsg = err.message || 'Failed to send OTP. Please try again.'
      const match = errMsg.match(/Please wait (\d+) seconds/i)
      if (match) {
        setErrorCountdown(parseInt(match[1], 10))
      } else {
        setErrorCountdown(null)
      }
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/')
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-svh relative overflow-hidden bg-[#0D0E12]'>
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
              appointment and track your <br /> repair status.
            </p>

            <form onSubmit={handleSubmit}>
              <div className='mb-10'>
                <label className='block text-[10px] font-bold text-white/50 tracking-[0.08em] mb-2 uppercase'>
                  PHONE NUMBER
                </label>
                <div className='flex gap-2 items-center'>
                  <div className='flex items-center justify-center h-[52px] bg-white/[0.04] border border-white/10 rounded text-white text-base font-medium px-3.5 select-none'>
                    +91
                  </div>
                  <input
                    type='tel'
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    placeholder='Enter 10-digit number'
                    className='flex-1 h-[52px] bg-white/[0.04] border border-white/10 rounded text-white text-base font-medium px-4 outline-none focus:border-white/40 transition-colors'
                  />
                </div>
                {error && (
                  <span className='block text-xs text-red-500 mt-2 font-medium'>
                    {getDisplayError()}
                  </span>
                )}
              </div>

              <button
                type='submit'
                disabled={isLoading || errorCountdown !== null}
                className='w-full h-[52px] bg-white hover:bg-neutral-100 disabled:opacity-70 text-black rounded text-[15px] font-bold cursor-pointer flex items-center justify-center transition-all duration-200'
              >
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>

            <div className='flex justify-center mt-5'>
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
              <div className='w-4 h-4 rounded-full border border-black flex items-center justify-center'>
                <div className='w-2.5 h-2.5 rounded-full bg-black' />
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
                <div className='flex gap-2 items-center'>
                  <div className='flex items-center justify-center h-[60px] bg-[#F8F8F8] border border-[#E8E8E8] rounded text-[#111111] text-[15px] font-semibold px-4 select-none'>
                    +91
                  </div>
                  <input
                    type='tel'
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    placeholder='Enter 10-digit number'
                    className='flex-1 h-[60px] bg-[#F8F8F8] border border-[#E8E8E8] rounded text-black text-[15px] font-normal px-4 outline-none focus:border-[#D0D0D0] focus:bg-[#FEFEFE] transition-all placeholder:text-[#B0B0B0]'
                  />
                </div>
                {error && (
                  <span className='block text-xs text-red-500 mt-2 font-semibold'>
                    {getDisplayError()}
                  </span>
                )}
              </div>

              <button
                type='submit'
                disabled={isLoading || errorCountdown !== null}
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
    </>
  )
}
