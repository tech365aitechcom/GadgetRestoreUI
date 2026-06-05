'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Bell, Lock, Shield } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import authService from '@/services/auth.service'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get phone from query params or fallback to session storage
  const [phone, setPhone] = useState('')
  useEffect(() => {
    const queryPhone = searchParams.get('phone')
    if (queryPhone) {
      setPhone(queryPhone)
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('gr_login_phone')
      if (stored) {
        setPhone(stored)
      } else {
        // If no phone found, redirect to login
        router.replace('/login')
      }
    }
  }, [searchParams, router])

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(119) // 01:59 = 119 seconds
  const [focusedIndex, setFocusedIndex] = useState(0)

  const inputRefs = useRef([])

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Resend Timer Countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    // Only allow single digit numeric input
    const cleanValue = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = cleanValue
    setOtp(newOtp)

    // Auto-focus next input if we typed a digit
    if (cleanValue && index < 5) {
      // Use setTimeout to ensure the focus happens after the state update
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (pasteData.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasteData[i] || ''
      }
      setOtp(newOtp)

      // Focus the last filled box or the 6th box
      const focusIndex = Math.min(pasteData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits of the code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authService.verifyOtp(phone, code)
      // Save authenticated phone for checkout flow
      if (typeof window !== 'undefined') {
        localStorage.setItem('gr_authenticated_phone', phone)
      }

      // Determine redirect URL with priority: URL param > session storage > default
      let redirectUrl = '/home'

      // First check URL params (highest priority)
      const redirectParam = searchParams.get('redirect')
      if (redirectParam) {
        redirectUrl = redirectParam
      } else if (typeof window !== 'undefined') {
        // Then check session storage
        const storedRedirect = sessionStorage.getItem('gr_redirect_after_login')
        if (storedRedirect) {
          redirectUrl = storedRedirect
          sessionStorage.removeItem('gr_redirect_after_login')
        }
        sessionStorage.removeItem('gr_login_phone')

        // Check if there is an active booking state
        const bookingStateStr = localStorage.getItem('gr_booking_state')
        if (bookingStateStr) {
          try {
            const bookingState = JSON.parse(bookingStateStr)
            if (bookingState.brand && bookingState.model) {
              router.push('/schedule')
              return
            }
          } catch (e) {}
        }
      }

      // Successfully authenticated, route to intended page
      router.push(redirectUrl)
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setIsLoading(true)
    setError('')

    try {
      const result = await authService.sendOtp(phone)
      setResendTimer(119) // reset timer
      setOtp(['', '', '', '', '', '']) // clear OTP boxes
      inputRefs.current[0]?.focus()
      alert(
        result.mock
          ? 'A development verification code has been sent. Use 123456.'
          : 'A new verification code has been sent.',
      )
    } catch (err) {
      setError('Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppShell className='auth-page-shell'>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-[100svh] relative overflow-hidden bg-[#0D0E12]'>
        {/* Backdrop elements */}
        <div className='auth-bg-mobile absolute inset-0 z-0'>
          <img
            src='/images/dark-microchip-bg.png'
            alt=''
            className='w-full h-full object-cover opacity-28 blur-[1px] contrast-115 brightness-85 scale-102 pointer-events-none'
          />
        </div>

        {/* Content container */}
        <div className='relative z-10 flex flex-col items-center justify-between min-h-[100svh] px-5 pb-8 pt-[calc(60px+env(safe-area-inset-top,24px))] box-border'>
          {/* Spacer */}
          <div />

          {/* Glassmorphism Card */}
          <div className='auth-card-mobile bg-[#121216]/88 border border-white/10 backdrop-blur-[32px] rounded-3xl pt-9 pb-7 px-6 w-full max-w-[400px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] my-auto box-border text-center'>
            <h2 className='text-[26px] font-extrabold text-white tracking-tight mb-2.5'>
              Verify Number
            </h2>
            <p className='text-[13px] text-white/65 leading-relaxed mb-6'>
              Enter the 6-digit verification code sent to your device for{' '}
              <strong className='text-white font-semibold'>
                {phone || '+1 (555) 012-3456'}
              </strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div
                className='flex justify-between gap-2 mb-6 ltr'
                onPaste={handlePaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type='text'
                    pattern='[0-9]*'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onFocus={(e) => {
                      setFocusedIndex(idx)
                      e.target.select()
                    }}
                    className='otp-box-mobile w-11 h-12 bg-white/[0.04] border border-white/10 rounded text-white text-center text-xl font-bold outline-none focus:border-white/40 transition-colors'
                    style={{
                      borderBottom:
                        focusedIndex === idx ? '2px solid #ffffff' : 'none',
                    }}
                  />
                ))}
              </div>

              {error && (
                <span className='block text-xs text-red-500 mb-5 font-medium'>
                  {error}
                </span>
              )}

              <button
                type='submit'
                disabled={isLoading}
                className='w-full h-[52px] bg-white/[0.04] hover:bg-white/8 disabled:opacity-70 text-white border border-white/20 rounded text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center transition-all duration-200'
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className='mt-7'>
              <p className='text-xs text-white/50 m-0 mb-1.5'>
                Didn't receive the code?
              </p>
              {resendTimer > 0 ? (
                <span className='text-[13px] text-white/80 font-semibold'>
                  Resend Code in {formatTimer(resendTimer)}
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className='bg-transparent border-0 cursor-pointer text-white text-[13px] font-bold underline px-2 py-1'
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>

          {/* Secure indicator */}
          <div className='flex items-center gap-1.5 z-10 mb-5'>
            <Lock size={12} color='rgba(255,255,255,0.4)' />
            <span className='text-[9px] font-bold text-white/40 tracking-wider uppercase'>
              Secure Authentication
            </span>
          </div>

          {/* Footer info */}
          <div className='text-center w-full z-10'>
            <p className='text-[9px] font-semibold text-white/35 tracking-[0.15em] uppercase leading-relaxed m-0'>
              CERTIFIED TECHNICIANS • GENUINE PARTS • PRECISION ENGINEERING
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop hidden lg:block bg-[#F5F5F7] min-h-[calc(100vh-var(--topbar-height))]'>
        <div className='flex flex-col items-center justify-center min-h-[calc(100vh-var(--topbar-height))] p-6 pb-10'>
          {/* Shield Icon container */}
          <div className='w-[72px] h-[72px] bg-[#EAEAEF] rounded-2xl flex items-center justify-center mb-6'>
            <div className='w-12 h-12 bg-black rounded-[10px] flex items-center justify-center'>
              <Shield size={22} color='#ffffff' fill='#ffffff' />
            </div>
          </div>

          <h2 className='text-[32px] font-[900] text-[#111111] tracking-tight mb-2 text-center'>
            Verify Your Identity
          </h2>

          <p className='text-sm text-[#6B6B6B] leading-relaxed mb-10 text-center max-w-[420px]'>
            Enter the 6-digit verification code sent to your registered mobile
            number.
          </p>

          {/* Card */}
          <div className='auth-card-desktop w-full max-w-[440px] bg-white border border-[#E4E4E7] rounded-[20px] px-10 pt-[35px] pb-[35px] shadow-[0_12px_36px_rgba(0,0,0,0.03)] mb-10 box-border'>
            <form onSubmit={handleSubmit}>
              <div
                className='flex justify-between gap-2 mb-[30px] ltr'
                onPaste={handlePaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type='text'
                    pattern='[0-9]*'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onFocus={(e) => e.target.select()}
                    placeholder='·'
                    className='otp-box-desktop w-12 h-[60px] bg-[#F2F2F5] border-0 rounded text-center text-xl font-bold text-[#111111] outline-none focus:bg-[#EAEAEF] transition-colors'
                  />
                ))}
              </div>

              {error && (
                <span className='block text-xs text-red-500 mb-6 font-semibold text-center'>
                  {error}
                </span>
              )}

              <button
                type='submit'
                disabled={isLoading}
                className='w-full h-[52px] bg-[#1A1A1E] hover:bg-black disabled:opacity-70 text-white rounded text-sm font-extrabold cursor-pointer flex items-center justify-center transition-colors'
              >
                {isLoading ? 'Verifying...' : 'Verify Account \u2192'}
              </button>
            </form>

            <div className='mt-7 text-center'>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className='bg-transparent border-0 cursor-pointer disabled:cursor-default text-black hover:opacity-85 text-[13px] font-extrabold block mx-auto mb-2 px-2 py-1 transition-opacity'
              >
                Resend Code
              </button>
              <span className='text-xs text-[#71717A] font-medium'>
                {resendTimer > 0
                  ? `Request a new code in ${formatTimer(resendTimer)}`
                  : 'You can now request a new code'}
              </span>
            </div>
          </div>

          {/* Lock indicator */}
          <div className='flex items-center gap-1.5'>
            <Lock size={12} color='#71717A' />
            <span className='text-[9px] font-bold text-[#71717A] tracking-wider uppercase'>
              Secure End-to-End Encryption
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className='min-h-[100svh] bg-[#0D0E12]' />}>
      <VerifyOtpContent />
    </Suspense>
  )
}
