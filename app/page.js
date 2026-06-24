'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import {
  Phone,
  Mail,
  Clock,
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
  Zap,
  ShieldCheck,
  Award,
  ChevronDown,
  Wrench,
  HelpCircle,
  Settings,
  RotateCcw,
  Search,
  Package,
  Send,
  User,
  Users,
  Menu,
  X,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { submitSupportContact } from '@/lib/api'

// Helper function to get progress label
function getProgressLabel(progress) {
  if (progress < 40) return 'INITIALIZING'
  if (progress < 85) return 'SECURITY SYNC'
  return 'LAUNCHING'
}

// Helper component to animate numbers
function AnimatedCounter({ target, duration = 1200, decimals = 0 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseFloat(target)
    if (isNaN(end)) return
    if (end === 0) return

    const totalSteps = 40
    const stepTime = Math.max(duration / totalSteps, 15)
    const increment = end / totalSteps

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(parseFloat(start.toFixed(decimals)))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target, duration, decimals])

  return <>{decimals > 0 ? count.toFixed(decimals) : count}</>
}

const REVIEWS_DATA = [
  {
    name: 'Kunal Sharma',
    location: 'Gurgaon',
    rating: 5,
    text: 'My iPhone 14 screen was badly damaged, and Gadget Restore fixed it within a day. The pickup and delivery service was seamless, and the phone looks as good as new.',
    initials: 'KS',
    bg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  },
  {
    name: 'Priya Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'Excellent service and very professional technicians. They kept me updated throughout the repair process and delivered exactly as promised.',
    initials: 'PM',
    bg: 'linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)',
  },
  {
    name: 'Avni Verma',
    location: 'Noida',
    rating: 5,
    text: "I was worried about my MacBook's motherboard issue, but the team diagnosed and repaired it quickly. Honest pricing and great customer support.",
    initials: 'AV',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    name: 'Yamini Kapoor',
    location: 'Faridabad',
    rating: 5,
    text: 'The doorstep pickup service saved me so much time. My phone had a charging issue, and Gadget Restore fixed it perfectly. Highly recommended!',
    initials: 'YK',
    bg: 'linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)',
  },
  {
    name: 'Nikhil Gupta',
    location: 'Ghaziabad',
    rating: 5,
    text: "Fast turnaround, transparent communication, and quality repair work. It's rare to find a repair service this reliable.",
    initials: 'NG',
    bg: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
  },
  {
    name: 'Kavita Arora',
    location: 'Delhi NCR',
    rating: 5,
    text: 'My iPhone had water damage and I thought it was beyond repair. The team recovered the device and all my important data. Extremely satisfied.',
    initials: 'KA',
    bg: 'linear-gradient(135deg, #ff007f 0%, #7f00ff 100%)',
  },
  {
    name: 'Harsh Malhotra',
    location: 'Gurgaon',
    rating: 5,
    text: 'What impressed me most was their professionalism. No hidden charges, clear diagnosis, and excellent repair quality.',
    initials: 'HM',
    bg: 'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)',
  },
  {
    name: 'Mallaica Bhatia',
    location: 'Noida',
    rating: 5,
    text: "I've used Gadget Restore twice now for phone and laptop repairs. Both experiences were smooth, affordable, and hassle-free.",
    initials: 'MB',
    bg: 'linear-gradient(135deg, #d33f49 0%, #d7c0d0 100%)',
  },
  {
    name: 'Nitish Singh',
    location: 'South Delhi',
    rating: 5,
    text: "My phone had severe network issues that multiple shops couldn't fix. Gadget Restore resolved it within 24 hours. Outstanding technical expertise.",
    initials: 'NS',
    bg: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
  },
  {
    name: 'Kashish Khanna',
    location: 'Gurugram',
    rating: 4,
    text: 'Great customer service and genuine care for customers. The repair quality exceeded my expectations, and the device has been working flawlessly ever since.',
    initials: 'KK',
    bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
  },
]

let hasShownSplashSession = false

export default function SplashOrLandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isNativeApp, setIsNativeApp] = useState(false)
  const [showSplash, setShowSplash] = useState(!hasShownSplashSession)
  const [progress, setProgress] = useState(0)

  // Web Landing Page state
  const [activeFaq, setActiveFaq] = useState(0) // Open first one by default as shown in Figma
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  useEffect(() => {
    if (!mounted || isNativeApp) return
    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [mounted, isNativeApp])
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)

  // Booking Context
  const { reset, setCategory, setBrand } = useBooking()

  const [isScrolled, setIsScrolled] = useState(false)

  // Capacitor platform detection
  useEffect(() => {
    const isApp = Capacitor.isNativePlatform()
    setIsNativeApp(isApp)
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth progress animation for Native Mobile Splash Page
  useEffect(() => {
    if (!mounted || !isNativeApp || !showSplash) return

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
  }, [mounted, isNativeApp, showSplash])

  // Navigate native app after splash completes
  useEffect(() => {
    if (isNativeApp && progress >= 100 && showSplash) {
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
        const targetRoute = hasSeen === 'true' ? '/' : '/onboarding'
        console.log('[SPLASH] Navigating to:', targetRoute)

        setTimeout(() => {
          hasShownSplashSession = true
          if (targetRoute === '/') {
            setShowSplash(false)
          } else {
            router.push(targetRoute)
          }
        }, 300)
      }
      decideRoute()
    }
  }, [progress, isNativeApp, router, showSplash])

  // Handlers for Web Landing Page
  const handleFaqToggle = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const LANDING_SLOTS = {
    mobile: {
      brand: {
        _id: '68b175cf10113c5d55976da5',
        name: 'Apple',
        logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912095817-apple.svg',
      },
      category: { _id: '67b46b938ffdfd20a19c9da9', name: 'Mobile' },
    },
    ipad: {
      brand: {
        _id: '68b175a710113c5d55975eac',
        name: 'Apple',
        logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912547229-apple.svg',
      },
      category: { _id: '67b483a0a7c6cc25c6864445', name: 'iPad' },
    },
    laptop: {
      brand: {
        _id: '68b175b310113c5d5597624e',
        name: 'Apple',
        logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912570555-apple.svg',
      },
      category: { _id: '6790c19283c3aeebf3dba734', name: 'Laptop' },
    },
    desktop: {
      brand: {
        _id: '68b175b310113c5d5597624e',
        name: 'Apple',
        logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912570555-apple.svg',
      },
      category: { _id: '6790c19283c3aeebf3dba734', name: 'Laptop' },
    },
  }

  const handleCategorySelect = (slotKey) => {
    const slot = LANDING_SLOTS[slotKey]
    if (!slot) {
      router.push('/select-category')
      return
    }
    reset()
    setTimeout(() => {
      setBrand(slot.brand)
      router.push(
        `/select-model?catId=${slot.category._id}&catName=${encodeURIComponent(slot.category.name)}`,
      )
    }, 0)
  }

  const handleBookNowCTA = () => {
    reset() // start with clean slate
    const appleBrand = {
      _id: '65f8c8577adcd9e5c544d673',
      name: 'Apple',
      logo: '/images/apple-logo.png',
    }
    setBrand(appleBrand)
    router.push('/select-category')
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const result = await submitSupportContact(formData)

      // Show success message
      setSubmitMessage({
        type: 'success',
        text: result.data?.message || 'Thank you! Our support team will call you back shortly.',
      })

      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        service: '',
      })

      // Auto-hide success message after 8 seconds
      setTimeout(() => {
        setSubmitMessage(null)
      }, 8000)
    } catch (error) {
      // Show error message
      setSubmitMessage({
        type: 'error',
        text: error.message || 'Failed to submit. Please try again or call us directly.',
      })

      // Auto-hide error message after 6 seconds
      setTimeout(() => {
        setSubmitMessage(null)
      }, 6000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  // ── RENDER NATIVE APP SPLASH PAGE ───────────────────────────────────────────
  if (isNativeApp && showSplash) {
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
                <span>SYSTEM V1.0.2</span>
              </span>
              <span className='flex items-center gap-2'>
                <span className='w-1 h-1 rounded-full bg-zinc-700' />
                <span>ENCRYPTED CONNECTION</span>
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
              {[0, 1, 2].map((dotIdx) => (
                <div
                  key={`dot-${dotIdx}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${dotIdx === activeDotIndex ? 'bg-white scale-110' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
            <div className='text-[10px] tracking-[0.2em] font-extrabold text-zinc-400 select-none'>
              {getProgressLabel(progress)}
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
          STICKY HEADER WRAPPER
          ──────────────────────────────────────────────────────────────────────── */}
      <header className='fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-sm transition-all duration-300 landing-header'>
        {/* PROMOTIONAL TOP INFO HEADER BAR (Figma Header - Desktop only) */}
        <div className={`hidden md:flex bg-[#FAF9FF] border-b border-zinc-100 py-4 px-6 lg:px-20 justify-between items-center gap-4 text-xs transition-all duration-300 ${isScrolled ? 'h-0 py-0 overflow-hidden opacity-0 border-b-0' : 'h-auto opacity-100'}`}>
          <div className='flex items-center'>
            <button
              type='button'
              onClick={() => router.push('/')}
              className='bg-transparent border-0 p-0 cursor-pointer'
              aria-label='Go to home page'
            >
              <img
                src='images/logo-light.png'
                alt='Gadget Restore Logo'
                className='h-10 w-auto object-contain'
              />
            </button>
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

            <a
              href='https://www.instagram.com/gadget.restore.in'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 hover:opacity-85 transition-opacity'
              title='Follow us on Instagram'
            >
              <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-pink-600 hover:bg-pink-50 transition-colors'>
                <svg
                  className='w-3.5 h-3.5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect>
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path>
                  <line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line>
                </svg>
              </div>
              <div>
                <div className='font-extrabold text-zinc-800 text-[11px] tracking-wider'>
                  Instagram
                </div>
                <div className='text-[11px] font-medium'>
                  @gadget.restore.in
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* MAIN NAVIGATION ROW (Fully Responsive Sticky Nav) */}
        <nav className='bg-white py-4 px-6 lg:px-20 flex justify-between items-center transition-all duration-300'>
          {/* Left Side: Brand Logo (Sticky on mobile, hidden on desktop to avoid double logo except when scrolled) */}
          <div className={`flex items-center ${isScrolled ? 'lg:flex' : 'lg:hidden'}`}>
            <button
              type='button'
              onClick={() => router.push('/')}
              className='bg-transparent border-0 p-0 cursor-pointer'
              aria-label='Go to home page'
            >
              <img
                src='images/logo-light.png'
                alt='Gadget Restore Logo'
                className='h-9 w-auto object-contain'
              />
            </button>
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
      </header>
      <div className='h-[73px] md:h-[144px] shrink-0 landing-spacer' />

      {/* 📱 Mobile Menu Sliding Drawer Overlay */}
      {mobileMenuOpen && (
        <div className='lg:hidden fixed inset-x-0 top-[73px] z-50 bg-white/98 backdrop-blur-md flex flex-col justify-between px-6 py-10 border-t border-zinc-100 shadow-2xl h-[calc(100vh-73px)] landing-mobile-menu'>
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
          backgroundImage: "url('/images/landing-banner2.png')",
        }}
      >
        <div
          className='max-w-[650px] relative z-10 text-zinc-950 bg-white/70 border border-white/30 p-8 lg:p-12 rounded-2xl shadow-2xl'
          style={{
            backdropFilter: 'blur(12px) saturate(160%)',
            WebkitBackdropFilter: 'blur(12px) saturate(160%)',
          }}
        >
          <h1 className='text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6 text-zinc-950'>
            Fast & Reliable <br />
            Repair Services
          </h1>
          <p className='text-sm lg:text-base text-zinc-800 leading-relaxed mb-10 max-w-[620px] font-medium'>
            Mobile, Laptop, Computer & Electronics Repair. We bring your
            essential devices back to life with surgical precision and certified
            expertise.
          </p>

          <div className='flex flex-wrap gap-4'>
            <a
              href='#contact'
              className='border border-black/30 hover:border-black text-black font-black tracking-wider text-xs px-8 py-4 rounded-none flex items-center justify-center gap-2 hover:bg-black/5 active:scale-95 transition-all cursor-pointer'
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

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto'>
          {[
            {
              title: 'Phone Repair',
              desc: 'Expert screen and battery services for all major smartphone models.',
              image: '/images/phone repair bg.png',
              slotKey: 'mobile',
            },
            {
              title: 'Desktop Repair',
              desc: 'Custom builds, hardware upgrades, and performance troubleshooting.',
              image: '/images/desktop repair bg.png',
              slotKey: 'desktop',
            },
            {
              title: 'Tablet Repair',
              desc: 'Professional iPad and Android tablet repairs including screen swaps.',
              image: '/images/tab repair bg.png',
              slotKey: 'ipad',
            },
            {
              title: 'Laptop Repair',
              desc: 'MacBook and PC laptop hardware maintenance and software fixes.',
              image: '/images/laptop reapir bg.png',
              slotKey: 'laptop',
            },
          ].map((item) => (
            <button
              key={item.title}
              type='button'
              onClick={() => handleCategorySelect(item.slotKey)}
              className='bg-[#FAF9FF] border border-zinc-100/50 p-8 rounded-3xl group hover:border-[var(--color-accent)]/20 hover:bg-[#F2EFFD] transition-all duration-300 cursor-pointer w-full text-center'
            >
              <div className='w-62 h-62 rounded-2xl overflow-hidden mb-6 mx-auto flex items-center justify-center bg-white shadow-sm'>
                <img
                  src={item.image}
                  alt={item.title}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out'
                />
              </div>
              <h3 className='text-md font-extrabold tracking-wide text-zinc-900 mb-3'>
                {item.title}
              </h3>
              <p className='text-xs text-zinc-500 leading-relaxed'>
                {item.desc}
              </p>
            </button>
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
              img: '/images/pcb3.png',
              slotKey: 'mobile',
            },
            {
              title: 'Tablet & iPad Repair',
              img: '/images/pcb1.png',
              slotKey: 'ipad',
            },
            {
              title: 'Mac & PC Repair',
              img: '/images/pcb2.png',
              slotKey: 'laptop',
            },
          ].map((item) => (
            <button
              key={item.title}
              type='button'
              onClick={() => handleCategorySelect(item.slotKey)}
              className='bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between w-full text-left'
            >
              <div className='h-60 relative overflow-hidden bg-white flex items-center justify-center'>
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
            </button>
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
                src='/images/expert technician.png'
                alt='Expert Technicians'
                className='w-full h-auto object-cover max-h-[420px]'
              />
              {/* Overlapping Badge inside bottom right */}
              {/* <div className='absolute bottom-0 right-0 bg-black text-white px-6 py-5 rounded-2xl shadow-2xl flex flex-col justify-center min-w-[160px]'>
                <span className='text-3xl font-black tracking-tight leading-none text-white'>
                  9+
                </span>
                <span className='text-[9px] uppercase font-black text-zinc-400 mt-1 tracking-wider leading-tight'>
                  Years of Experience
                </span>
              </div> */}
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
              ].map((bullet) => (
                <div key={bullet.text} className='flex items-center gap-4'>
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
              image: '/images/same day bg.png',
            },
            {
              title: '90-Day Warranty',
              desc: 'Peace of mind with our extensive parts and labor warranty.',
              image: '/images/3 month bg.png',
            },
            {
              title: 'Expert Team',
              desc: 'Certified professionals for every electronic niche.',
              image: '/images/expert team bg.png',
            },
            {
              title: 'Data Privacy',
              desc: 'Strict protocols to keep your personal data secure.',
              image: '/images/data privacy bg.png',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='bg-white border border-zinc-100 p-8 rounded-[24px] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 group min-h-[280px] justify-center'
            >
              <div className='w-32 h-32 rounded-2xl overflow-hidden mb-6 shrink-0 flex items-center justify-center'>
                <img
                  src={item.image}
                  alt={item.title}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out'
                />
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
        <div className='text-center max-w-[680px] mx-auto mb-16'>
          <h2 className='text-3xl font-black tracking-wider text-zinc-900 mb-2'>
            Why Choose Us?
          </h2>
          <div className='flex justify-center items-center gap-2 mb-4'>
            <span className='w-8 h-[1px] bg-zinc-300'></span>
            <Wrench size={14} className='text-zinc-400' />
            <span className='w-8 h-[1px] bg-zinc-300'></span>
          </div>
          <p className='text-xs lg:text-sm text-zinc-500 leading-relaxed font-medium mt-6 max-w-[600px] mx-auto'>
            Gadget Restore is a trusted repair platform for iPhones, iPads, MacBooks, and all other Apple accessories. We combine expert technicians, advanced repair technology, and convenient service to bring your devices back to life.
          </p>
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
                We use only high-grade premium aftermarket components for every
                single device repair.
              </p>
            </div>
          </div>

          {/* Center 3D Masterpiece Model Illustration */}
          <div className='w-full lg:w-1/3 flex justify-center py-6 relative'>
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none'></div>
            <img
              src='/images/why choose us phone.png'
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
                Transparent Pricing
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
          7. STATS / MILESTONES SECTION (Full Width Theme matched)
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-20 px-6 lg:px-20 bg-[#FAF9FF] border-t border-b border-zinc-100/50 relative overflow-hidden'>
        <div className='max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-y-8 md:gap-y-0 text-center divide-zinc-200/60 md:divide-x'>
          {/* Stat 1 */}
          <div className='flex flex-col items-center justify-center p-2'>
            <span className='text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight'>
              {mounted ? <AnimatedCounter target={9} /> : '9'}+
            </span>
            <span className='text-[10px] lg:text-[11px] uppercase tracking-widest text-zinc-400 font-extrabold mt-2'>Years of Experience</span>
          </div>

          {/* Stat 2 */}
          <div className='flex flex-col items-center justify-center p-2'>
            <span className='text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight'>
              {mounted ? <AnimatedCounter target={20} /> : '20'}k+
            </span>
            <span className='text-[10px] lg:text-[11px] uppercase tracking-widest text-zinc-400 font-extrabold mt-2'>Happy Customers</span>
          </div>

          {/* Stat 3 */}
          <div className='flex flex-col items-center justify-center p-2'>
            <span className='text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight'>
              {mounted ? <AnimatedCounter target={20} /> : '20'}+
            </span>
            <span className='text-[10px] lg:text-[11px] uppercase tracking-widest text-zinc-400 font-extrabold mt-2'>Expert Technicians</span>
          </div>

          {/* Stat 4 */}
          <div className='flex flex-col items-center justify-center p-2'>
            <span className='text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight'>
              {mounted ? <AnimatedCounter target={25} /> : '25'}k+
            </span>
            <span className='text-[10px] lg:text-[11px] uppercase tracking-widest text-zinc-400 font-extrabold mt-2'>Total Works Done</span>
          </div>

          {/* Stat 5 */}
          <div className='flex flex-col items-center justify-center p-2 col-span-2 md:col-span-1'>
            <div className='flex items-center justify-center gap-1.5'>
              <span className='text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight'>
                {mounted ? <AnimatedCounter target={4.8} decimals={1} /> : '4.8'}
              </span>
              <Star size={24} className='text-amber-500 fill-amber-500 shrink-0' />
            </div>
            <span className='text-[10px] lg:text-[11px] uppercase tracking-widest text-zinc-400 font-extrabold mt-2'>Tech Rating</span>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          8. HOW IT WORKS SECTION
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
          ].map((item) => (
            <div
              key={item.title}
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
          9. TRUSTED CLIENTS & FAQ ACCORDION SECTION
          ──────────────────────────────────────────────────────────────────────── */}

      <section className='py-24 px-6 lg:px-20 bg-[#FAF9FF] border-t border-zinc-100'>
        <div className='flex flex-col lg:flex-row gap-16'>
          {/* Left Column: Testimonial card */}
          <div className='w-full lg:w-1/2'>
            <h2 className='text-2xl font-black tracking-wider text-zinc-900 mb-8 flex items-center gap-3'>
              Trusted Clients
              <div className='w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500'>
                <Check size={10} strokeWidth={4} />
              </div>
            </h2>

            <div className='bg-[#FAF9FF] border border-zinc-100 rounded-[32px] p-8 lg:p-10 shadow-sm relative overflow-hidden min-h-[340px] flex flex-col justify-between transition-all duration-300'>
              <div>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shadow-sm shrink-0'>
                      <User size={18} className='text-zinc-600' />
                    </div>
                    <div>
                      <h4 className='font-extrabold tracking-wide text-zinc-900 text-xs'>
                        {REVIEWS_DATA[currentReviewIndex].name}
                      </h4>
                      <p className='text-[10px] text-zinc-400 font-bold tracking-wider mt-0.5'>
                        {REVIEWS_DATA[currentReviewIndex].location}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-0.5 text-amber-400'>
                    {Array.from({ length: REVIEWS_DATA[currentReviewIndex].rating }, (_, i) => `star-${i}`).map((key) => (
                      <Star key={key} size={14} fill='currentColor' className='fill-amber-400 text-amber-400' />
                    ))}
                    {REVIEWS_DATA[currentReviewIndex].rating < 5 && (
                      <Star size={14} className='text-zinc-200' />
                    )}
                  </div>
                </div>
                <div className='min-h-[120px] flex items-center mb-4'>
                  <p
                    key={currentReviewIndex}
                    className='text-sm text-zinc-600 italic leading-relaxed animate-fadeIn'
                  >
                    "{REVIEWS_DATA[currentReviewIndex].text}"
                  </p>
                </div>
              </div>

              {/* Slider Dots & Arrow Navigation */}
              <div className='flex items-center justify-between pt-4 border-t border-zinc-100'>
                <div className='flex gap-1.5 overflow-x-auto max-w-[70%] py-1'>
                  {REVIEWS_DATA.map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      type='button'
                      onClick={() => setCurrentReviewIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${idx === currentReviewIndex ? 'bg-black w-4' : 'bg-zinc-200 hover:bg-zinc-300'
                        }`}
                      aria-label={`Go to review ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    onClick={() =>
                      setCurrentReviewIndex(
                        (prev) => (prev - 1 + REVIEWS_DATA.length) % REVIEWS_DATA.length
                      )
                    }
                    className='w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-black hover:border-zinc-400 active:scale-90 transition-all cursor-pointer'
                    aria-label='Previous review'
                  >
                    <ChevronDown size={14} className='rotate-90' />
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length)
                    }
                    className='w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-black hover:border-zinc-400 active:scale-90 transition-all cursor-pointer'
                    aria-label='Next review'
                  >
                    <ChevronDown size={14} className='-rotate-90' />
                  </button>
                </div>
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
                  a: 'We specialize in the repair and service of the entire Apple product ecosystem, including iPhones, iPads, MacBooks, iMacs, and Apple Watches.',
                },
              ].map((faq, idx) => {
                const isOpen = activeFaq === idx
                return (
                  <div
                    key={faq.q}
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
          10. WORKING PROCESS SECTION (Pure Coded Visual Timeline)
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
              key={item.title}
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
          11. INTERACTIVE BOOKING SCHEDULER SECTION (Dark Keyboard BG)
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
              NEED HELP?
            </span>
            <h2 className='text-3xl lg:text-5xl font-black tracking-tight mb-8'>
              Contact Support
            </h2>
            <p className='text-xs text-zinc-400 leading-relaxed mb-6'>
              Fill out the form below and our support team will call you back at <span className='text-white font-bold'>+91 8800003785</span>
            </p>

            <form onSubmit={handleFormSubmit} className='space-y-6'>
              {/* Success/Error Message */}
              {submitMessage && (
                <div
                  className={`p-4 rounded-lg border ${submitMessage.type === 'success'
                    ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-900/20 border-red-500/30 text-red-300'
                    } text-xs leading-relaxed animate-fadeIn`}
                >
                  {submitMessage.text}
                </div>
              )}

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
                      <button
                        type='button'
                        className='fixed inset-0 z-40 bg-transparent border-0 cursor-default'
                        onClick={() => setTimeDropdownOpen(false)}
                        aria-label='Close time dropdown'
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
                  disabled={isSubmitting}
                  className='w-56 h-12 bg-white text-black font-extrabold tracking-wider text-xs uppercase hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? (
                    <>
                      <div className='w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin' />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      <Phone size={16} />
                      REQUEST CALLBACK
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          12. TECH TIPS & NEWS SECTION
          ──────────────────────────────────────────────────────────────────────── */}
      {/* <section className='py-24 px-6 lg:px-20 bg-[#FAF9FF] border-t border-zinc-100'>
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
          ].map((post) => (
            <div
              key={post.title}
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
                <button
                  type='button'
                  onClick={() => handleBookNowCTA()}
                  className='text-[10px] font-black tracking-widest text-zinc-950 group-hover:text-[var(--color-accent)] flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0'
                >
                  READ MORE <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* ────────────────────────────────────────────────────────────────────────
          13. FOOTER QUOTE CAROUSEL SECTION (Dark)
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-20 px-6 lg:px-20 bg-black text-center relative overflow-hidden border-t border-white/5'>
        <div className='max-w-[800px] mx-auto relative z-10 text-white'>
          <div className='text-[var(--color-accent)] text-6xl font-black mb-6 select-none'>
            “
          </div>
          <p className='text-base lg:text-xl font-medium italic text-zinc-200 leading-relaxed mb-8'>
            "Trusted, professional, and incredibly convenient. Gadget Restore repaired my iPhone within a day and delivered it back looking brand new. The entire process was transparent and hassle-free."
          </p>
          <div className='flex justify-center gap-1 mb-4 text-amber-400'>
            {Array.from({ length: 5 }, (_, i) => `footer-star-${i}`).map(
              (key) => (
                <Star key={key} size={14} fill='currentColor' className='fill-amber-400 text-amber-400' />
              ),
            )}
          </div>
          <h4 className='font-extrabold tracking-widest text-xs text-white'>
            Aditya Sharma
          </h4>
          <span className='text-[10px] text-zinc-500 tracking-wider block mt-1'>
            Gurgaon
          </span>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          MAIN SYSTEM FOOTER
          ──────────────────────────────────────────────────────────────────────── */}
      <footer className='bg-black border-t border-white/5 py-12 px-4 lg:px-20 text-xs text-zinc-600 font-sans'>
        {/* Contact Info Row */}
        <div className='max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pb-4 lg:pb-10 mb-4 lg:mb-10 border-b border-white/5 text-zinc-400 text-[11px]'>
          <div className='flex items-center justify-start md:justify-start gap-3'>
            <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]'>
              <Clock size={14} />
            </div>
            <div className='text-left'>
              <div className='font-extrabold text-white text-[11px] tracking-wider'>
                Opening Time
              </div>
              <div className='text-[11px] font-medium text-zinc-400'>
                Mon - Sat 10:00 - 19:00
              </div>
            </div>
          </div>

          <div className='flex items-center justify-start md:justify-start gap-3'>
            <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]'>
              <Mail size={14} />
            </div>
            <div className='text-left'>
              <div className='font-extrabold text-white text-[11px] tracking-wider'>
                Email Us
              </div>
              <a
                href='mailto:support@gadgetrestore.in'
                className='text-[11px] font-medium text-zinc-400 hover:text-white transition-colors'
              >
                support@gadgetrestore.in
              </a>
            </div>
          </div>

          <div className='flex items-center justify-start md:justify-start gap-3'>
            <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]'>
              <Phone size={14} />
            </div>
            <div className='text-left'>
              <div className='font-extrabold text-white text-[11px] tracking-wider'>
                Call Us Now
              </div>
              <a
                href='tel:8800003785'
                className='text-[11px] font-medium text-zinc-400 hover:text-white transition-colors'
              >
                +91 8800003785
              </a>
            </div>
          </div>

          <div className='flex items-center justify-start md:justify-start gap-3'>
            <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]'>
              <svg
                className='w-3.5 h-3.5'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect>
                <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path>
                <line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line>
              </svg>
            </div>
            <div className='text-left'>
              <div className='font-extrabold text-white text-[11px] tracking-wider'>
                Follow Us
              </div>
              <a
                href='https://www.instagram.com/gadget.restore.in'
                target='_blank'
                rel='noopener noreferrer'
                className='text-[11px] font-medium text-zinc-400 hover:text-white transition-colors'
              >
                @gadget.restore.in
              </a>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6'>
          <img
            src='/gadget-restore-logo.svg'
            alt='Gadget Restore Logo'
            className='h-8 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity'
          />
          <p className='tracking-widest text-[9px] font-bold text-center md:text-left'>
            © 2026 GADGET RESTORE INC. TECHNICAL PRECISION. ALL RIGHTS RESERVED.
          </p>
          <div className='flex gap-6 text-[10px] font-black tracking-widest text-zinc-500'>
            <button
              type='button'
              className='hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0'
              onClick={() => router.push('/privacy')}
            >
              Privacy
            </button>
            <button
              type='button'
              className='hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0'
              onClick={() => router.push('/terms')}
            >
              Terms
            </button>
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
