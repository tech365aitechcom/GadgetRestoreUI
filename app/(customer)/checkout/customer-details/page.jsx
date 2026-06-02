'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  User,
  Mail,
  Phone,
  KeySquare,
  ChevronRight,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import bookingService from '@/services/booking.service'
import toast from 'react-hot-toast'

const InputField = ({
  label,
  icon: Icon,
  name,
  type = 'text',
  placeholder,
  required,
  readOnly,
  maxLength,
  value,
  onChange,
  error,
  hint,
  showPasswordToggle,
  onTogglePassword,
}) => (
  <div className='mb-5 relative'>
    <label className='block text-[10px] font-bold tracking-[0.1em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <div className='relative'>
      <div className='absolute left-4 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-content-text-secondary)' }}>
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={maxLength}
        className={`w-full h-14 border rounded-xl pl-12 pr-4 text-[14px] outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{
          background: 'var(--color-content-card)',
          borderColor: error ? 'var(--color-danger)' : 'var(--color-content-border)',
          color: 'var(--color-content-text)',
        }}
      />
      {showPasswordToggle && value && (
        <button
          type='button'
          onClick={onTogglePassword}
          className='absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider hover:opacity-100 transition-opacity'
          style={{ color: 'var(--color-content-text-secondary)' }}
        >
          {type === 'text' ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
    {error && (
      <p className='text-red-500 text-xs mt-1.5 font-medium'>{error}</p>
    )}
    {hint && !error && (
      <p className='text-[11px] mt-1.5 leading-snug' style={{ color: 'var(--color-content-text-secondary)' }}>{hint}</p>
    )}
  </div>
)

export default function CustomerDetailsPage() {
  const router = useRouter()
  const {
    brand,
    model,
    symptoms,
    partTier,
    serviceMode,
    remarks,
    address,
    slot,
    canProceedToBook,
    reset,
  } = useBooking()

  const [isLoading, setIsLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    mobile: '',
    fullName: '',
    email: '',
    altContact: '',
    devicePassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // Initialize data
  useEffect(() => {
    if (!canProceedToBook) {
      router.replace('/home')
      return
    }

    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      // Not authenticated
      router.replace('/login')
      return
    }

    // Attempt to load from localStorage (Mock returning user)
    const storedMobile =
      typeof window !== 'undefined'
        ? localStorage.getItem('gr_authenticated_phone') ||
        sessionStorage.getItem('gr_login_phone')
        : ''
    let savedProfile = null
    try {
      savedProfile = JSON.parse(localStorage.getItem('gr_customer_profile'))
    } catch (e) { }

    setFormData((prev) => ({
      ...prev,
      mobile: storedMobile || savedProfile?.mobile || '+1 (555) 000-0000', // Prioritize authenticated phone
      fullName: savedProfile?.fullName || '',
      email: savedProfile?.email || '',
      altContact: savedProfile?.altContact || '',
    }))
  }, [canProceedToBook, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    else if (formData.fullName.length > 100)
      newErrors.fullName = 'Name too long (max 100 chars)'

    if (!formData.email.trim()) newErrors.email = 'Email ID is required'
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address'

    if (
      formData.altContact &&
      !/^\d{10}$/.test(formData.altContact.replace(/\D/g, ''))
    ) {
      newErrors.altContact = 'Alternate contact must be 10 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      // Save profile locally for MVP "returning user" pre-fill
      localStorage.setItem(
        'gr_customer_profile',
        JSON.stringify({
          mobile: formData.mobile,
          fullName: formData.fullName,
          email: formData.email,
          altContact: formData.altContact,
        }),
      )

      // Create booking via API
      const result = await bookingService.createBooking({
        brand,
        model,
        symptoms,
        partTier,
        serviceMode,
        remarks,
        address,
        slot,
      })

      console.log('Booking API Response:', result)

      const ticketNumber = result?.ticketNumber || result?.booking?.ticketNumber
      console.log('Extracted Ticket Number:', ticketNumber)

      if (!ticketNumber) {
        throw new Error('Order was created without a tracking number.')
      }

      // Redirect to order confirmation
      const redirectUrl = `/order-confirmation/${encodeURIComponent(ticketNumber)}`
      console.log('Redirecting to:', redirectUrl)
      router.push(redirectUrl)
    } catch (error) {
      console.error('Failed to create booking:', error)
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to create your order. Please try again.'
      toast.error(message)
      setIsLoading(false)
    }
  }
  return (
    <div>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-[100svh] relative pb-[140px]' style={{ background: 'var(--color-content-bg)', color: 'var(--color-content-text)' }}>
        <div className='relative z-10 pt-[60px] px-5'>
          <h1 className='text-[28px] font-black tracking-tight leading-tight mb-2'>
            Almost Done!
          </h1>
          <p className='text-[13px] mb-8' style={{ color: 'var(--color-content-text-secondary)' }}>
            Please confirm your contact details to finalize the booking.
          </p>

          <form onSubmit={handleSubmit}>
            <InputField
              label='Mobile Number'
              icon={Phone}
              name='mobile'
              value={formData.mobile}
              readOnly
            />

            <InputField
              label='Full Name'
              icon={User}
              name='fullName'
              placeholder='Enter your full name'
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
              maxLength={100}
            />

            <InputField
              label='Email Address'
              icon={Mail}
              name='email'
              type='email'
              placeholder='you@example.com'
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <InputField
              label='Alternate Contact (Optional)'
              icon={Phone}
              name='altContact'
              placeholder='10-digit number'
              value={formData.altContact}
              onChange={handleChange}
              error={errors.altContact}
            />

            <div className='h-[1px] w-full my-8' style={{ background: 'var(--color-content-border)' }}></div>

            <h2 className='text-[16px] font-black tracking-tight mb-4 flex items-center gap-2'>
              <Lock size={18} className='text-accent' /> Security Details
            </h2>

            <InputField
              label='Device Password (Optional)'
              icon={KeySquare}
              name='devicePassword'
              type={showPassword ? 'text' : 'password'}
              placeholder='PIN, Password, or Pattern details'
              value={formData.devicePassword}
              onChange={handleChange}
              maxLength={20}
              hint='Required for diagnosis. Your password is encrypted and only accessible to the repair engineer. Write-only — not readable after submission.'
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          </form>
        </div>

        <div className='fixed bottom-[50px] left-0 right-0 p-5 z-40' style={{ background: 'linear-gradient(to top, var(--color-content-bg) 60%, transparent)' }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.fullName || !formData.email}
            className='w-full h-[50px] rounded-[20px] text-[15px] font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50'
            style={{ background: 'var(--theme-btn-primary-bg)', color: 'var(--theme-btn-primary-text)' }}
          >
            {isLoading ? 'Processing...' : 'Place Order'}{' '}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop hidden lg:block min-h-[calc(100vh-var(--topbar-height))]' style={{ background: 'var(--color-content-bg)', color: 'var(--color-content-text)' }}>
        <div className='p-8 flex h-[calc(100vh-var(--topbar-height))]'>
          {/* Left Side: Summary Panel */}
          <div className='w-1/2 flex flex-col items-center justify-center p-12 relative overflow-hidden'>
            <div className="absolute inset-0 opacity-10 bg-[url('/images/dark-microchip-bg.png')] bg-cover pointer-events-none"></div>

            <div className='relative z-10 w-full max-w-md text-center'>
              <div className='w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl' style={{ background: 'var(--theme-bg)', border: '1px solid var(--color-content-border)' }}>
                <ShieldCheck size={40} className='text-accent' />
              </div>
              <h1 className='text-[36px] font-black tracking-tight leading-none mb-4'>
                Secure Checkout
              </h1>
              <p className='text-[15px] leading-relaxed mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>
                Please confirm your details to finalize the booking. Your device
                password is encrypted end-to-end and is only visible to your
                assigned engineer.
              </p>

              <div className='rounded-2xl p-6 text-left' style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-content-border)' }}>
                <div className='flex items-center gap-3 mb-4'>
                  <CheckCircle2 size={18} className='text-green-500' />
                  <span className='text-sm font-bold text-white'>
                    Genuine Quality Parts
                  </span>
                </div>
                <div className='flex items-center gap-3 mb-4'>
                  <CheckCircle2 size={18} className='text-green-500' />
                  <span className='text-sm font-bold text-white'>
                    Certified Technicians
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <CheckCircle2 size={18} className='text-green-500' />
                  <span className='text-sm font-bold text-white'>
                    Data Privacy Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className='w-1/2 p-12 overflow-y-hidden flex flex-col justify-center' style={{ borderLeft: '1px solid rgba(34,34,34,0.3)' }}>
            <div className='w-full max-w-lg mx-auto'>
              <h2 className='text-[22px] font-black uppercase tracking-wider mb-8 flex items-center gap-3'>
                Customer Details
              </h2>

              <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <InputField
                      label='Mobile Number'
                      icon={Phone}
                      name='mobile'
                      value={formData.mobile}
                      readOnly
                    />
                  </div>

                  <div className='col-span-2'>
                    <InputField
                      label='Full Name'
                      icon={User}
                      name='fullName'
                      placeholder='Enter your full name'
                      value={formData.fullName}
                      onChange={handleChange}
                      error={errors.fullName}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className='col-span-2 sm:col-span-1'>
                    <InputField
                      label='Email Address'
                      icon={Mail}
                      name='email'
                      type='email'
                      placeholder='you@example.com'
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                    />
                  </div>

                  <div className='col-span-2 sm:col-span-1'>
                    <InputField
                      label='Alternate Contact (Optional)'
                      icon={Phone}
                      name='altContact'
                      placeholder='10-digit number'
                      value={formData.altContact}
                      onChange={handleChange}
                      error={errors.altContact}
                    />
                  </div>
                </div>

                <div className='h-[1px] w-full my-8' style={{ background: 'var(--color-content-border)' }}></div>

                <h2 className='text-[22px] font-black uppercase tracking-wider mb-8 flex items-center gap-3'>
                  <Lock size={24} style={{ color: 'var(--color-content-text-secondary)' }} /> Device Security
                </h2>

                <InputField
                  label='Device Password (Optional)'
                  icon={KeySquare}
                  name='devicePassword'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='PIN, Password, or Pattern details'
                  value={formData.devicePassword}
                  onChange={handleChange}
                  maxLength={20}
                  hint='Required for diagnosis. Your password is encrypted and only accessible to the repair engineer. Write-only — not readable after submission.'
                  showPasswordToggle={true}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <div className='mt-10'>
                  <button
                    type='submit'
                    disabled={
                      isLoading || !formData.fullName || !formData.email
                    }
                    className='w-full h-[64px] rounded-[20px] text-[16px] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50 cursor-pointer'
                    style={{ background: 'var(--theme-btn-primary-bg)', color: 'var(--theme-btn-primary-text)' }}
                  >
                    {isLoading ? 'Processing...' : 'Submit Order'}{' '}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
