'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import {
  Phone,
  Mail,
  Clock,
  ChevronRight,
  ArrowRight,
  Check,
  Star,
  Smartphone,
  Laptop,
  Tablet,
  Gamepad,
  Headphones,
  Monitor,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  ChevronDown,
  Wrench,
  HelpCircle,
  Play,
  Settings,
  RotateCcw,
  Search,
  Package,
  Send,
  Users,
  Menu,
  X,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'

export default function SplashOrLandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isNativeApp, setIsNativeApp] = useState(false)
  const [progress, setProgress] = useState(0)

  // Web Landing Page state
  const [activeFaq, setActiveFaq] = useState(0) // Open first one by default as shown in Figma
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const [timeDropdownRect, setTimeDropdownRect] = useState(null)
  const timeButtonRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
  })

  // Booking Context
  const { reset, setCategory, setBrand } = useBooking()

  // Capacitor platform detection
  useEffect(() => {
    const isApp = Capacitor.isNativePlatform()
    setIsNativeApp(isApp)
    setMounted(true)
  }, [])

  // Smooth progress animation for Native Mobile Splash Page
  useEffect(() => {
    if (!mounted || !isNativeApp) return

    const duration = 2200 // 2.2 seconds
    const intervalTime = 20
    const step = 100 / (duration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + step
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [mounted, isNativeApp])

  // Navigate native app after splash completes
  useEffect(() => {
    if (isNativeApp && progress >= 100) {
      const decideRoute = async () => {
        let hasSeen = 'false'
        try {
          const { value } = await Preferences.get({
            key: 'has_seen_onboarding',
          })
          hasSeen = value || 'false'
          console.log('[SPLASH] Onboarding status:', hasSeen)
        } catch (e) {
          console.error('[SPLASH] Error reading preferences:', e)
          hasSeen = 'false'
        }

        // Use Next.js router for client-side navigation in Capacitor
        // This avoids protocol/CORS issues with static exports
        const targetRoute = hasSeen === 'true' ? '/home' : '/onboarding'
        console.log('[SPLASH] Navigating to:', targetRoute)

        setTimeout(() => {
          router.push(targetRoute)
        }, 300)
      }
      decideRoute()
    }
  }, [progress, isNativeApp, router])

  // Handlers for Web Landing Page
  const handleFaqToggle = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookNowCTA = (customBrand = null) => {
    reset() // start with clean slate
    if (customBrand) {
      const appleBrand = {
        _id: '65f8c8577adcd9e5c544d673',
        name: 'Apple',
        logo: '/images/apple-logo.png',
      }
      setCategory({ _id: '65f8c8577adcd9e5c544d671', name: 'Mobile' })
      setBrand(appleBrand)
      router.push('/select-model')
    } else {
      router.push('/select-brand')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('gr_authenticated_phone', formData.phone)
      sessionStorage.setItem('gr_login_phone', formData.phone)
    }
    handleBookNowCTA()
  }

  if (!mounted) return null

  // ── RENDER NATIVE APP SPLASH PAGE ───────────────────────────────────────────
  if (isNativeApp) {
    const activeDotIndex = Math.min(2, Math.floor(progress / 33.3))
    return (
      <div
        className='min-h-screen w-screen text-white flex flex-col overflow-hidden relative'
        style={{ background: 'var(--color-bg)' }}
      >
        {/* 💻 DESKTOP SPLASH VIEW */}
        <div
          className='hidden lg:flex flex-col justify-between w-full h-screen p-10 box-border z-10'
          style={{
            background:
              'radial-gradient(circle at 75% 25%, var(--color-accent-tint-8) 0%, transparent 55%), linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-900) 50%, var(--color-bg-600) 100%)',
          }}
        >
          <header className='flex justify-between items-center w-full'>
            <div className='flex gap-1.5 text-zinc-700 font-mono text-[10px] select-none'>
              <span>——</span>
              <span>——</span>
              <span>——</span>
            </div>
            <div className='flex items-center gap-8 text-[10px] tracking-[0.18em] font-extrabold text-zinc-500 font-sans select-none'>
              <div>
                STATUS: <span className='text-emerald-400'>ONLINE</span>
              </div>
              <div>
                DIAGNOSTIC_MODE: <span className='text-blue-400'>ACTIVE</span>
              </div>
            </div>
          </header>

          <main className='flex-1 flex flex-col items-center justify-center text-center'>
            <div className='mb-3'>
              <img
                src='/gadget-restore-logo.svg'
                alt='Gadget Restore Logo'
                className='h-16 w-auto object-contain animate-pulse'
              />
            </div>
            <div className='text-[10px] tracking-[0.8em] text-zinc-400 font-bold leading-relaxed mr-[-0.8em] select-none'>
              TECHNICAL PRECISION
            </div>
            <div className='flex items-center justify-center gap-2 mt-16 mb-4 select-none'>
              <div className='w-[18px] h-[18px] rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center'>
                <svg
                  className='w-2.5 h-2.5 text-emerald-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth='3'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <span className='text-[10.5px] tracking-[0.2em] font-extrabold text-zinc-300 uppercase'>
                INITIALIZING SYSTEMS
              </span>
            </div>
            <div className='w-[280px] h-[1px] bg-zinc-800/80 relative overflow-hidden rounded-full'>
              <div
                className='h-full bg-white transition-all duration-75 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
          </main>

          <footer className='flex justify-between items-center w-full text-zinc-600 font-sans text-[9px] tracking-[0.12em] font-bold select-none'>
            <div>© 2026 GADGET RESTORE. TECHNICAL PRECISION.</div>
            <div className='flex items-center gap-6'>
              <span className='flex items-center gap-2'>
                <span className='w-1 h-1 rounded-full bg-zinc-700' />
                SYSTEM V1.0.2
              </span>
              <span className='flex items-center gap-2'>
                <span className='w-1 h-1 rounded-full bg-zinc-700' />
                ENCRYPTED CONNECTION
              </span>
            </div>
          </footer>
        </div>

        {/* 📱 MOBILE SPLASH VIEW */}
        <div
          className='flex lg:hidden flex-col justify-between w-full h-[100svh] px-6 py-10 box-border z-10 overflow-hidden'
          style={{
            background:
              'radial-gradient(circle at 50% 30%, var(--color-accent-tint-4) 0%, transparent 60%), var(--color-bg-900)',
          }}
        >
          <div className='h-4' />
          <div className='flex-1 flex flex-col items-center justify-center text-center'>
            <div className='relative mb-9 select-none animate-pulse duration-[3000ms]'>
              <img
                src='/images/Logo Container.png'
                alt='System Hardware'
                className='w-28 h-28 object-contain'
              />
            </div>
            <div className='mb-2'>
              <img
                src='/gadget-restore-logo.svg'
                alt='Gadget Restore Logo'
                className='h-9 w-auto object-contain'
              />
            </div>
            <div className='text-[9px] tracking-[0.65em] text-zinc-500 font-bold mr-[-0.65em] select-none'>
              TECHNICAL PRECISION
            </div>
            <div className='w-[190px] h-[1px] bg-zinc-800/80 relative overflow-hidden mt-12 mb-5 rounded-full'>
              <div
                className='h-full bg-white transition-all duration-75 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className='flex justify-center gap-2 mb-3.5 select-none'>
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeDotIndex ? 'bg-white scale-110' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
            <div className='text-[10px] tracking-[0.2em] font-extrabold text-zinc-400 select-none'>
              {progress < 40
                ? 'INITIALIZING'
                : progress < 85
                  ? 'SECURITY SYNC'
                  : 'LAUNCHING'}
            </div>
          </div>

          <footer className='flex justify-center gap-10 text-zinc-500 pb-2'>
            <div className='w-[42px] h-[42px] rounded-full border border-zinc-800 bg-zinc-900/10 flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-zinc-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>
            <div className='w-[42px] h-[42px] rounded-full border border-zinc-800 bg-zinc-900/10 flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-zinc-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3.6 9h16.8M3.6 15h16.8'
                />
              </svg>
            </div>
            <div className='w-[42px] h-[42px] rounded-full border border-zinc-800 bg-zinc-900/10 flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-zinc-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  // ── RENDER WEB HIGH-FIDELITY FIGMA LIGHT-THEME LANDING PAGE ──────────────────
  return (
    <div className='min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-[var(--color-accent)] selection:text-white overflow-x-hidden'>
      {/* ────────────────────────────────────────────────────────────────────────
          PROMOTIONAL TOP INFO HEADER BAR (Figma Header - Desktop only)
          ──────────────────────────────────────────────────────────────────────── */}
      <div className='hidden md:flex bg-[#FAF9FF] border-b border-zinc-100 py-4 px-6 lg:px-20 justify-between items-center gap-4 text-xs'>
        <div className='flex items-center'>
          <img
            src='images/logo-light.png'
            alt='Gadget Restore Logo'
            className='h-10 w-auto object-contain cursor-pointer'
            onClick={() => router.push('/')}
          />
        </div>
        <div className='flex items-center gap-8 text-zinc-500'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-accent)]'>
              <Clock size={14} />
            </div>
            <div>
              <div className='font-extrabold text-zinc-800 text-[11px] tracking-wider'>
                Opening Time
              </div>
              <div className='text-[11px] font-medium'>
                Mon - Sat 10:00 - 19:00
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-accent)]'>
              <Mail size={14} />
            </div>
            <div>
              <div className='font-extrabold text-zinc-800 text-[11px] tracking-wider'>
                Email Us
              </div>
              <a
                href='mailto:support@gadgetrestore.in'
                className='text-[11px] font-medium hover:text-[var(--color-accent)] transition-colors'
              >
                support@gadgetrestore.in
              </a>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-accent)]'>
              <Phone size={14} className='animate-bounce' />
            </div>
            <div>
              <div className='font-extrabold text-zinc-800 text-[11px] tracking-wider'>
                Call Us Now
              </div>
              <a
                href='tel:8800003785'
                className='text-[11px] font-black text-[var(--color-accent)] tracking-wide hover:underline'
              >
                +91 8800003785
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          MAIN NAVIGATION ROW (Fully Responsive Sticky Nav)
          ──────────────────────────────────────────────────────────────────────── */}
      <nav className='bg-white border-b border-zinc-100 py-4 px-6 lg:px-20 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 flex justify-between items-center shadow-sm'>
        {/* Left Side: Brand Logo (Sticky on mobile, hidden on desktop to avoid double logo) */}
        <div className='flex items-center lg:hidden'>
          <img
            src='images/logo-light.png'
            alt='Gadget Restore Logo'
            className='h-9 w-auto object-contain cursor-pointer'
            onClick={() => router.push('/')}
          />
        </div>

        {/* Center: Desktop-only Navigation Links */}
        <div className='hidden lg:flex items-center gap-8 font-black text-xs tracking-widest text-zinc-500'>
          <a
            href='#hero'
            className='text-zinc-900 border-b-2 border-[var(--color-accent)] pb-1 hover:text-zinc-900 transition-colors cursor-pointer'
          >
            Home
          </a>
          <a
            href='#expertise'
            className='hover:text-zinc-900 transition-colors cursor-pointer'
          >
            Services
          </a>
          <a
            href='#why-choose-us'
            className='hover:text-zinc-900 transition-colors cursor-pointer'
          >
            About
          </a>
          <a
            href='#faq'
            className='hover:text-zinc-900 transition-colors cursor-pointer'
          >
            FAQs
          </a>
          <a
            href='#contact'
            className='hover:text-zinc-900 transition-colors cursor-pointer'
          >
            Contact
          </a>
        </div>

        {/* Right Side: Desktop CTA or Hamburger button */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => handleBookNowCTA()}
            className='hidden sm:inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-black tracking-widest cursor-pointer hover:scale-[1.03] transition-all duration-200'
          >
            BOOK NOW
          </button>

          {/* Hamburger Icon for Mobile Viewports */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='lg:hidden p-2 text-zinc-900 hover:text-black focus:outline-none cursor-pointer'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 📱 Mobile Menu Sliding Drawer Overlay */}
      {mobileMenuOpen && (
        <div className='lg:hidden fixed inset-x-0 top-[73px] z-50 bg-white/98 backdrop-blur-md flex flex-col justify-between px-6 py-10 border-t border-zinc-100 shadow-2xl h-[calc(100vh-73px)]'>
          <div className='flex flex-col gap-6 font-black text-sm tracking-widest text-zinc-500'>
            <a
              href='#hero'
              onClick={() => setMobileMenuOpen(false)}
              className='hover:text-zinc-900 py-3 border-b border-zinc-100/50 cursor-pointer'
            >
              Home
            </a>
            <a
              href='#services'
              onClick={() => setMobileMenuOpen(false)}
              className='hover:text-zinc-900 py-3 border-b border-zinc-100/50 cursor-pointer'
            >
              Services
            </a>
            <a
              href='#why-choose-us'
              onClick={() => setMobileMenuOpen(false)}
              className='hover:text-zinc-900 py-3 border-b border-zinc-100/50 cursor-pointer'
            >
              About
            </a>
            <a
              href='#faq'
              onClick={() => setMobileMenuOpen(false)}
              className='hover:text-zinc-900 py-3 border-b border-zinc-100/50 cursor-pointer'
            >
              FAQs
            </a>
            <a
              href='#contact'
              onClick={() => setMobileMenuOpen(false)}
              className='hover:text-zinc-900 py-3 border-b border-zinc-100/50 cursor-pointer'
            >
              Contact
            </a>
          </div>

          <div className='flex flex-col gap-6'>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleBookNowCTA()
              }}
              className='bg-black text-white w-full py-4 rounded-full text-xs font-black tracking-widest cursor-pointer shadow-lg hover:scale-[1.01] transition-transform duration-200'
            >
              BOOK NOW
            </button>

            <div className='flex items-center gap-4 bg-[#FAF9FF] p-4 rounded-2xl border border-zinc-100'>
              <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-accent)] shrink-0'>
                <Phone size={16} className='animate-bounce' />
              </div>
              <div>
                <div className='font-extrabold text-zinc-800 text-[10px] tracking-wider uppercase'>
                  Call Us Now
                </div>
                <a
                  href='tel:8800003785'
                  className='text-xs font-black text-[var(--color-accent)] tracking-wide hover:underline'
                >
                  +91 8800003785
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          1. HERO HEADER SECTION (Prinstine matching landing-banner.png)
          ──────────────────────────────────────────────────────────────────────── */}
      <section
        id='hero'
        className='relative min-h-[90vh] flex items-center px-6 lg:px-20 py-24 overflow-hidden bg-cover bg-center'
        style={{
          backgroundImage:
            "linear-gradient(rgba(11, 12, 22, 0.02), rgba(11, 12, 22, 0.02)), url('/images/landing-banner.png')",
        }}
      >
        <div className='max-w-[750px] relative z-10 text-white'>
          <h1 className='text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6'>
            Fast & Reliable <br />
            Repair Services
          </h1>
          <p className='text-sm lg:text-base text-zinc-300 leading-relaxed mb-10 max-w-[620px]'>
            Mobile, Laptop, Computer & Electronics Repair. We bring your
            essential devices back to life with surgical precision and certified
            expertise.
          </p>

          <div className='flex flex-wrap gap-4'>
            <button
              onClick={() => router.push('/home')}
              className='bg-white text-black font-black tracking-wider text-xs px-8 py-4 rounded-none shadow-xl hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer'
            >
              EXPLORE MORE
            </button>
            <a
              href='#contact'
              className='border border-white/40 hover:border-white text-white font-black tracking-wider text-xs px-8 py-4 rounded-none flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all cursor-pointer'
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          2. OUR EXPERTISE SECTION (Light pristine off-white theme)
          ──────────────────────────────────────────────────────────────────────── */}
      <section id='expertise' className='py-24 px-6 lg:px-20 bg-white relative'>
        <div className='text-center max-w-[600px] mx-auto mb-16'>
          <h2 className='text-3xl font-black tracking-wider text-zinc-900 mb-4'>
            Our Expertise
          </h2>
          <div className='w-16 h-1 bg-[var(--color-accent)] mx-auto rounded-full'></div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
          {[
            {
              title: 'Phone Repair',
              desc: 'Expert screen and battery services for all major smartphone models.',
              icon: <Smartphone size={22} />,
            },
            {
              title: 'Desktop Repair',
              desc: 'Custom builds, hardware upgrades, and performance troubleshooting.',
              icon: <Monitor size={22} />,
            },
            {
              title: 'Tablet Repair',
              desc: 'Professional iPad and Android tablet repairs including screen swaps.',
              icon: <Tablet size={22} />,
            },
            {
              title: 'Console Repair',
              desc: 'Fixes for PlayStation, Xbox, and Nintendo Switch systems.',
              icon: <Gamepad size={22} />,
            },
            {
              title: 'Phone Accessory',
              desc: 'Custom cases, chargers, and audio gear for your mobile lifestyle.',
              icon: <Headphones size={22} />,
            },
            {
              title: 'Laptop Repair',
              desc: 'MacBook and PC laptop hardware maintenance and software fixes.',
              icon: <Laptop size={22} />,
            },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() =>
                handleBookNowCTA(item.title === 'Phone Repair' ? 'Apple' : null)
              }
              className='bg-[#FAF9FF] border border-zinc-100/50 p-8 rounded-3xl group hover:border-[var(--color-accent)]/20 hover:bg-[#F2EFFD] transition-all duration-300 cursor-pointer'
            >
              <div className='w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-600 mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300'>
                {item.icon}
              </div>
              <h3 className='text-md font-extrabold tracking-wide text-zinc-900 mb-3'>
                {item.title}
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed'>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          3. OUR SERVICES IMAGE CARDS SECTION (Off-white pattern)
          ──────────────────────────────────────────────────────────────────────── */}
      <section
        id='services'
        className='py-24 px-6 lg:px-20 relative border-t border-zinc-100 bg-cover bg-center'
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), url('/images/landing-banner.png')",
        }}
      >
        <div className='text-center max-w-[600px] mx-auto mb-16'>
          <h2 className='text-3xl font-black tracking-wider text-zinc-900 mb-2'>
            Our Services
          </h2>
          <div className='flex justify-center items-center gap-2 mb-4'>
            <span className='w-8 h-[1px] bg-zinc-300'></span>
            <Wrench size={14} className='text-zinc-400' />
            <span className='w-8 h-[1px] bg-zinc-300'></span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto'>
          {[
            {
              title: 'Smart Phone Repair',
              img: '/images/service-smartphone-repair.png',
            },
            {
              title: 'Tablet & iPad Repair',
              img: '/images/service-tablet-repair.png',
            },
            {
              title: 'Mac & PC Repair',
              img: '/images/service-laptop-repair.png',
            },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() =>
                handleBookNowCTA(item.title.includes('Phone') ? 'Apple' : null)
              }
              className='bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between'
            >
              <div className='h-60 relative overflow-hidden bg-zinc-100 flex items-center justify-center'>
                <img
                  src={item.img}
                  alt={item.title}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
              </div>
              <div className='p-4 flex flex-col justify-center flex-1'>
                <div>
                  <h3 className='font-extrabold tracking-wider text-center text-sm text-zinc-900 mb-3 group-hover:text-[var(--color-accent)] transition-colors'>
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          4. EXPERT TECHNICIANS SECTION (Exact image & overlapping black badge)
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-24 px-6 lg:px-20 bg-white relative'>
        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16'>
          {/* Left Column: Rounded Image + Overlapping Experience Badge */}
          <div className='w-full lg:w-1/2 relative pr-4 pb-4'>
            <div className='relative overflow-hidden rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-100'>
              <img
                src='/images/expert-technicians.png'
                alt='Expert Technicians'
                className='w-full h-auto object-cover max-h-[420px]'
              />
              {/* Overlapping Badge inside bottom right */}
              <div className='absolute bottom-0 right-6 bg-black text-white px-6 py-5 rounded-2xl shadow-2xl flex flex-col justify-center min-w-[160px]'>
                <span className='text-3xl font-black tracking-tight leading-none text-white'>
                  15+
                </span>
                <span className='text-[9px] uppercase font-black text-zinc-400 mt-1 tracking-wider leading-tight'>
                  Years of Experience
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Copy, Bullets */}
          <div className='w-full lg:w-1/2'>
            <h2 className='text-3xl lg:text-4xl font-black text-zinc-900 mb-6'>
              Expert Technicians You Can Trust
            </h2>
            <p className='text-sm text-zinc-500 leading-relaxed mb-8'>
              At TechFix Pro, we understand how vital your devices are to your
              daily life and business. Our team of certified specialists brings
              a combined 15 years of technical expertise to every diagnostic and
              repair.
            </p>

            <div className='flex flex-col gap-6'>
              {[
                {
                  text: 'Certified Technicians with specialized training.',
                  icon: (
                    <ShieldCheck size={20} className='text-zinc-950 shrink-0' />
                  ),
                },
                {
                  text: 'Fast Service with many same-day repair options.',
                  icon: <Clock size={20} className='text-zinc-950 shrink-0' />,
                },
                {
                  text: 'Affordable Pricing with no hidden diagnostics fees.',
                  icon: <Award size={20} className='text-zinc-950 shrink-0' />,
                },
              ].map((bullet, idx) => (
                <div key={idx} className='flex items-center gap-4'>
                  <div className='mt-0.5 text-zinc-950'>{bullet.icon}</div>
                  <span className='text-xs font-black text-zinc-800 leading-tight'>
                    {bullet.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          5. CORE VALUES STATS ROW (Vertical Centered Cards Layout)
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-24 px-6 lg:px-20 bg-[#FAF9FF] border-t border-zinc-100'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto'>
          {[
            {
              title: 'Same Day Repair',
              desc: 'Most repairs completed within hours of drop-off.',
              icon: <Clock size={22} />,
            },
            {
              title: '90-Day Warranty',
              desc: 'Peace of mind with our extensive parts and labor warranty.',
              icon: <Award size={22} />,
            },
            {
              title: 'Expert Team',
              desc: 'Certified professionals for every electronic niche.',
              icon: <Users size={22} />,
            },
            {
              title: 'Data Privacy',
              desc: 'Strict protocols to keep your personal data secure.',
              icon: <ShieldCheck size={22} />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className='bg-white border border-zinc-100 p-8 rounded-[24px] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 group min-h-[260px] justify-center'
            >
              <div className='w-14 h-14 rounded-full bg-[#FAF9FF] border border-zinc-50 flex items-center justify-center text-zinc-700 mb-6 shrink-0 group-hover:bg-zinc-950 group-hover:text-white transition-colors duration-300'>
                {item.icon}
              </div>
              <h4 className='text-sm font-black text-zinc-900 mb-3'>
                {item.title}
              </h4>
              <p className='text-xs text-zinc-500 leading-relaxed max-w-[220px]'>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          6. WHY CHOOSE US? SECTION (Exactly matching landing.png)
          ──────────────────────────────────────────────────────────────────────── */}
      <section
        id='why-choose-us'
        className='pt-12 px-6 lg:px-20 bg-white relative overflow-hidden'
      >
        <div className='text-center max-w-[600px] mx-auto mb-10'>
          <h2 className='text-3xl font-black tracking-wider text-zinc-900 mb-2'>
            Why Choose Us?
          </h2>
          <div className='flex justify-center items-center gap-2 mb-4'>
            <span className='w-8 h-[1px] bg-zinc-300'></span>
            <Wrench size={14} className='text-zinc-400' />
            <span className='w-8 h-[1px] bg-zinc-300'></span>
          </div>
        </div>

        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12'>
          {/* Left Columns */}
          <div className='w-full lg:w-1/3 flex flex-col gap-12 lg:text-right'>
            <div>
              <div className='w-12 h-12 rounded-full bg-[#FAF9FF] border border-zinc-100 flex items-center justify-center text-[var(--color-accent)] mb-4 lg:ml-auto'>
                <Zap size={20} />
              </div>
              <h3 className='text-md font-extrabold tracking-wider text-zinc-900 mb-3'>
                Low Cost
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed'>
                Competitive pricing on all repairs and parts without
                compromising on quality standards.
              </p>
            </div>

            <div>
              <div className='w-12 h-12 rounded-full bg-[#FAF9FF] border border-zinc-100 flex items-center justify-center text-[var(--color-accent)] mb-4 lg:ml-auto'>
                <ShieldCheck size={20} />
              </div>
              <h3 className='text-md font-extrabold tracking-wider text-zinc-900 mb-3'>
                Best Materials
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed'>
                We use only high-grade OEM or premium aftermarket components for
                every single device repair.
              </p>
            </div>
          </div>

          {/* Center 3D Masterpiece Model Illustration */}
          <div className='w-full lg:w-1/3 flex justify-center py-6 relative'>
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none'></div>
            <img
              src='/images/Overlay+Border+Shadow.png'
              alt='Expert Technician 3D Model Masterpiece'
              className='w-full max-w-[380px] h-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-2xl'
            />
          </div>

          {/* Right Columns */}
          <div className='w-full lg:w-1/3 flex flex-col gap-12'>
            <div>
              <div className='w-12 h-12 rounded-full bg-[#FAF9FF] border border-zinc-100 flex items-center justify-center text-[var(--color-accent)] mb-4'>
                <Award size={20} />
              </div>
              <h3 className='text-md font-extrabold tracking-wider text-zinc-900 mb-3'>
                Best Professionals
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed'>
                Our technicians undergo rigorous training and certification to
                handle the most complex hardware issues.
              </p>
            </div>

            <div>
              <div className='w-12 h-12 rounded-full bg-[#FAF9FF] border border-zinc-100 flex items-center justify-center text-[var(--color-accent)] mb-4'>
                <Star size={20} />
              </div>
              <h3 className='text-md font-extrabold tracking-wider text-zinc-900 mb-3'>
                Low Cost
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed'>
                Transparent diagnostic fees and upfront quotes so you always
                know exactly what you are paying for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          7. HOW IT WORKS SECTION
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='pt-23 md:pt-6 pb-24 px-6 lg:px-20 bg-white'>
        <div className='text-center mx-auto mb-20'>
          <h2 className='text-3xl font-black text-zinc-900 mb-2'>
            How It Works
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-12 relative'>
          {/* Desktop visual continuous solid thin connector line */}
          <div className='hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[1px] bg-zinc-200 z-0 pointer-events-none'></div>

          {[
            {
              icon: <Calendar size={22} className='text-zinc-900' />,
              title: 'Book Service',
              desc: 'Schedule online or drop by our store for an instant intake.',
            },
            {
              icon: <Search size={22} className='text-zinc-900' />,
              title: 'Diagnose',
              desc: 'We perform a deep technical audit and provide a clear quote.',
            },
            {
              icon: <Wrench size={22} className='text-zinc-900' />,
              title: 'Repair',
              desc: 'Our experts fix the issue using high-quality components.',
            },
            {
              icon: <Package size={22} className='text-zinc-900' />,
              title: 'Deliver',
              desc: 'Quality check completed and your device is ready for pickup.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className='flex flex-col items-center text-center relative z-10'
            >
              <div className='w-[88px] h-[88px] rounded-full border-[3px] border-zinc-900 bg-white flex items-center justify-center relative z-10 transition-transform duration-300 hover:scale-105 cursor-pointer'>
                {item.icon}
              </div>
              <h3 className='font-extrabold text-sm text-zinc-900 mt-6 mb-2'>
                {item.title}
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed max-w-[240px]'>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          8. INTERACTIVE BOOKING SCHEDULER SECTION (Dark Keyboard BG)
          ──────────────────────────────────────────────────────────────────────── */}
      <section
        id='contact'
        className='grid grid-cols-1 lg:grid-cols-2 bg-[#05060f] overflow-hidden border-t border-zinc-900'
      >
        {/* Left Side: Tech Hand Photograph Full Height */}
        <div className='w-full h-full min-h-[450px] lg:min-h-[640px] relative overflow-hidden'>
          <img
            src='/images/Left Side_ Image.png'
            alt='Make a Schedule Tech Hands Typing'
            className='w-full h-full object-cover absolute inset-0'
          />
        </div>

        {/* Right Side: Clean Dark Scheduler Panel */}
        <div className='py-24 px-8 lg:px-24 bg-[#07080e] flex flex-col justify-center text-white relative'>
          <div className='max-w-[480px]'>
            <span className='text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 block mb-2'>
              WANT TO
            </span>
            <h2 className='text-3xl lg:text-5xl font-black tracking-tight mb-8'>
              Make a Schedule
            </h2>

            <form onSubmit={handleFormSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <input
                  type='text'
                  name='name'
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Your Name'
                  className='w-full h-14 bg-transparent border border-white/10 px-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors'
                />
                <input
                  type='email'
                  name='email'
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Email'
                  className='w-full h-14 bg-transparent border border-white/10 px-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <input
                  type='tel'
                  name='phone'
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='Phone'
                  pattern='\d{10}'
                  className='w-full h-14 bg-transparent border border-white/10 px-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors'
                />
                <div className='relative'>
                  <input
                    type='date'
                    name='date'
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className='w-full h-14 bg-transparent border border-white/10 px-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors [color-scheme:dark] cursor-pointer'
                  />
                  <Calendar
                    size={16}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='relative'>
                  {/* Custom time slot dropdown — avoids native select overflow on mobile */}
                  <button
                    ref={timeButtonRef}
                    type='button'
                    onClick={() => {
                      if (timeButtonRef.current) {
                        const r = timeButtonRef.current.getBoundingClientRect()
                        setTimeDropdownRect(r)
                      }
                      setTimeDropdownOpen((v) => !v)
                    }}
                    className='w-full h-14 bg-transparent border border-white/10 px-4 text-xs text-left outline-none focus:border-white transition-colors cursor-pointer flex items-center justify-between'
                    style={{ color: formData.time ? '#fff' : '#71717a' }}
                  >
                    <span>{formData.time || 'Time Slot'}</span>
                    <Clock size={16} className='text-zinc-500 shrink-0' />
                  </button>

                  {timeDropdownOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className='fixed inset-0 z-40'
                        onClick={() => setTimeDropdownOpen(false)}
                      />
                      {/* Scrollable panel — anchored directly below the trigger button */}
                      <div
                        className='fixed z-50 bg-[#07080e] border border-white/10 overflow-y-auto'
                        style={{
                          maxHeight: '240px',
                          width: timeDropdownRect
                            ? timeDropdownRect.width
                            : 220,
                          top: timeDropdownRect
                            ? timeDropdownRect.bottom + 4
                            : 0,
                          left: timeDropdownRect ? timeDropdownRect.left : 0,
                        }}
                      >
                        {[
                          '09:00 AM',
                          '09:30 AM',
                          '10:00 AM',
                          '10:30 AM',
                          '11:00 AM',
                          '11:30 AM',
                          '12:00 PM',
                          '12:30 PM',
                          '01:00 PM',
                          '01:30 PM',
                          '02:00 PM',
                          '02:30 PM',
                          '03:00 PM',
                          '03:30 PM',
                          '04:00 PM',
                          '04:30 PM',
                          '05:00 PM',
                          '05:30 PM',
                          '06:00 PM',
                        ].map((slot) => (
                          <button
                            key={slot}
                            type='button'
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, time: slot }))
                              setTimeDropdownOpen(false)
                            }}
                            className='w-full px-4 py-3 text-xs text-left transition-colors cursor-pointer'
                            style={{
                              color:
                                formData.time === slot ? '#fff' : '#a1a1aa',
                              background:
                                formData.time === slot
                                  ? 'rgba(255,255,255,0.08)'
                                  : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                'rgba(255,255,255,0.06)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                formData.time === slot
                                  ? 'rgba(255,255,255,0.08)'
                                  : 'transparent')
                            }
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className='relative'>
                  <select
                    name='service'
                    value={formData.service}
                    onChange={handleInputChange}
                    className='w-full h-14 bg-[#07080e] border border-white/10 px-4 text-xs text-white outline-none focus:border-white transition-colors appearance-none cursor-pointer'
                  >
                    <option value='' disabled>
                      Select Service
                    </option>
                    <option value='Mobile Repair'>Mobile Repair</option>
                    <option value='iPad/Tablet Repair'>
                      iPad/Tablet Repair
                    </option>
                    <option value='MacBook/Laptop Repair'>
                      MacBook/Laptop Repair
                    </option>
                    <option value='Console Repair'>Console Repair</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none'
                  />
                </div>
              </div>

              <div className='pt-2'>
                <button
                  type='submit'
                  className='w-48 h-12 bg-white text-black font-extrabold tracking-wider text-xs uppercase hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center'
                >
                  APPOINTMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          9. WORKING PROCESS SECTION (Pure Coded Visual Timeline)
          ──────────────────────────────────────────────────────────────────────── */}
      <section
        id='process'
        className='py-28 px-6 lg:px-20 relative overflow-hidden flex flex-col items-center justify-center bg-cover bg-center'
        style={{
          backgroundImage:
            "linear-gradient(rgba(11, 12, 22, 0.92), rgba(11, 12, 22, 0.92)), url('/images/service-tablet-repair.png')",
        }}
      >
        <div className='text-center max-w-[600px] mx-auto mb-20 relative z-10'>
          <h2 className='text-3xl font-black text-white'>Working Process</h2>
          {/* Centered Wrench Divider */}
          <div className='flex justify-center items-center gap-2 mt-4'>
            <span className='w-8 h-[1px] bg-white/20'></span>
            <Wrench size={12} className='text-zinc-400' />
            <span className='w-8 h-[1px] bg-white/20'></span>
          </div>
        </div>

        <div className='w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10'>
          {[
            {
              step: '1',
              icon: <Monitor size={22} className='text-white' />,
              title: 'Damage Device',
            },
            {
              step: '2',
              icon: <Send size={22} className='text-white' />,
              title: 'Send it to Us',
            },
            {
              step: '3',
              icon: <Settings size={22} className='text-white' />,
              title: 'Repair Device',
            },
            {
              step: '4',
              icon: <RotateCcw size={22} className='text-white' />,
              title: 'Quick Return',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className='flex flex-col items-center text-center group'
            >
              {/* Outer circle wrapper with 9 o'clock left-aligned overlapping numeric badge */}
              <div className='relative mb-6'>
                {/* Large Transparent Circle with Thin White Border */}
                <div className='w-[110px] h-[110px] rounded-full border border-white/60 bg-transparent flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105 group-hover:border-white cursor-pointer'>
                  {item.icon}
                </div>
                {/* Overlapping Badge at 9 o'clock */}
                <div className='absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-lg'>
                  {item.step}
                </div>
              </div>
              <h3 className='font-extrabold text-sm text-white tracking-wide mt-2'>
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          10. TRUSTED CLIENTS & FAQ ACCORDION SECTION
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-24 px-6 lg:px-20 bg-white border-t border-zinc-100'>
        <div className='flex flex-col lg:flex-row gap-16'>
          {/* Left Column: Testimonial card */}
          <div className='w-full lg:w-1/2'>
            <h2 className='text-2xl font-black tracking-wider text-zinc-900 mb-8 flex items-center gap-3'>
              Trusted Clients
              <div className='w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500'>
                <Check size={10} strokeWidth={4} />
              </div>
            </h2>

            <div className='bg-[#FAF9FF] border border-zinc-100 rounded-[32px] p-8 lg:p-10 shadow-sm relative overflow-hidden'>
              <div className='flex items-center gap-4 mb-6'>
                <img
                  src='/images/pragya.png'
                  alt='Julia Robertson'
                  className='w-12 h-12 rounded-full object-cover border border-zinc-100'
                />
                <div>
                  <h4 className='font-extrabold tracking-wide text-zinc-900 text-xs'>
                    Julia Robertson
                  </h4>
                  <p className='text-[10px] text-zinc-400 font-bold tracking-wider mt-0.5'>
                    Happy Clients
                  </p>
                </div>
              </div>
              <p className='text-xs text-zinc-600 italic leading-relaxed mb-6'>
                "The level of professionalism and technical skill at TechFix Pro
                is unmatched. They fixed my iPad screen in under two hours, and
                it looks brand new. I highly recommend them to anyone looking
                for quality repairs."
              </p>
              <div className='flex gap-1 text-amber-400'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill='currentColor' />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: FAQ accordions */}
          <div id='faq' className='w-full lg:w-1/2'>
            <h2 className='text-2xl font-black tracking-wider text-zinc-900 mb-8 flex items-center gap-3'>
              FAQ
              <div className='w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500'>
                <HelpCircle size={10} strokeWidth={4} />
              </div>
            </h2>

            <div className='flex flex-col gap-4'>
              {[
                {
                  q: 'How long does a typical repair take?',
                  a: 'Most repairs, like screen or battery replacements, are completed within 1 to 2 hours. More complex issues involving motherboard repair or data recovery may take 24–48 hours depending on the damage.',
                },
                {
                  q: 'Do you provide a warranty?',
                  a: 'Yes, every repair is covered under our structural 90-day warranty, guarding against any defect in materials and craftsmanship.',
                },
                {
                  q: 'Do I need an appointment?',
                  a: 'No, you can simply drop by our workshop during business hours, but booking online guarantees priority check-in.',
                },
                {
                  q: 'What devices do you repair?',
                  a: 'We repair all models of smart phones, iPads/tablets, MacBooks/PCs, gaming consoles, and various phone accessories.',
                },
              ].map((faq, idx) => {
                const isOpen = activeFaq === idx
                return (
                  <div
                    key={idx}
                    className='bg-white border border-zinc-100 rounded-2xl overflow-hidden transition-all duration-300'
                  >
                    <button
                      onClick={() => handleFaqToggle(idx)}
                      className='w-full p-5 text-left flex justify-between items-center font-extrabold text-xs tracking-wider text-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer'
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={14}
                        className={`text-zinc-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className='p-5 pt-0 text-xs text-zinc-500 leading-relaxed border-t border-zinc-50 bg-[#FAF9FF] animate-fadeIn'>
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          11. TECH TIPS & NEWS SECTION
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-24 px-6 lg:px-20 bg-[#FAF9FF] border-t border-zinc-100'>
        <div className='mb-16'>
          <h2 className='text-3xl font-black tracking-wider text-zinc-900 mb-2'>
            Tech Tips & News
          </h2>
          <p className='text-xs text-zinc-400 font-bold tracking-wider'>
            Insights from our repair lab to keep your tech healthy.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 '>
          {[
            {
              title: "5 Ways to Extend Your Laptop's Battery Life",
              img: '/images/Background.png',
              desc: 'Learn the professional habits that will keep your battery healthy for years...',
            },
            {
              title: 'LCD vs OLED: Which Screen Should You Choose?',
              img: '/images/blog-lcd-vs-oled.png',
              desc: 'Understanding the technical differences when getting a screen replacement...',
            },
            {
              title: 'Why Cloud Backup is Your Best Friend',
              img: '/images/blog-cloud-backup.png',
              desc: 'A technical guide on setting up fail-safe data redundancy for home users...',
            },
          ].map((post, idx) => (
            <div
              key={idx}
              className='bg-white rounded-xl overflow-hidden border border-zinc-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group'
            >
              <div className='h-48 bg-zinc-100 overflow-hidden relative'>
                <img
                  src={post.img}
                  alt={post.title}
                  className='w-full h-full object-cover group-hover:scale-102 transition-transform duration-500'
                />
              </div>
              <div className='p-6 flex-1 flex flex-col justify-between'>
                <div>
                  <h3 className='font-extrabold text-sm tracking-wide text-zinc-900 mb-3 leading-snug group-hover:text-[var(--color-accent)] transition-colors'>
                    {post.title}
                  </h3>
                  <p className='text-xs text-zinc-500 leading-relaxed mb-6'>
                    {post.desc}
                  </p>
                </div>
                <a
                  onClick={() => handleBookNowCTA()}
                  className='text-[10px] font-black tracking-widest text-zinc-950 group-hover:text-[var(--color-accent)] flex items-center gap-1 cursor-pointer'
                >
                  READ MORE <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          12. FOOTER QUOTE CAROUSEL SECTION (Dark)
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-20 px-6 lg:px-20 bg-black text-center relative overflow-hidden border-t border-white/5'>
        <div className='max-w-[800px] mx-auto relative z-10 text-white'>
          <div className='text-[var(--color-accent)] text-6xl font-black mb-6 select-none'>
            “
          </div>
          <p className='text-base lg:text-xl font-medium italic text-zinc-200 leading-relaxed mb-8'>
            "TechFix Pro saved my business laptop after a coffee spill. They
            recovered all my sensitive data and had me back up and running
            within 24 hours. Professional, transparent, and absolutely worth
            every penny."
          </p>
          <div className='flex justify-center gap-1 mb-4 text-amber-400'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill='currentColor' />
            ))}
          </div>
          <h4 className='font-extrabold tracking-widest text-xs text-white'>
            Sarah Jenkins
          </h4>
          <span className='text-[10px] text-zinc-500 tracking-wider block mt-1'>
            Managing Director, Studio J
          </span>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          MAIN SYSTEM FOOTER
          ──────────────────────────────────────────────────────────────────────── */}
      <footer className='bg-black border-t border-white/5 py-12 px-6 lg:px-20 text-center text-xs text-zinc-600 font-sans'>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6'>
          <img
            src='/gadget-restore-logo.svg'
            alt='Gadget Restore Logo'
            className='h-8 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity'
          />
          <p className='tracking-widest text-[9px] font-bold'>
            © 2026 GADGET RESTORE INC. TECHNICAL PRECISION. ALL RIGHTS RESERVED.
          </p>
          <div className='flex gap-6 text-[10px] font-black tracking-widest text-zinc-500'>
            <span
              className='hover:text-white transition-colors cursor-pointer'
              onClick={() => router.push('/privacy')}
            >
              Privacy
            </span>
            <span
              className='hover:text-white transition-colors cursor-pointer'
              onClick={() => router.push('/terms')}
            >
              Terms
            </span>
          </div>
        </div>
      </footer>

      {/* Embedded slide-in animation rules */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
