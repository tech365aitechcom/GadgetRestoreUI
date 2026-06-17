'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle } from 'lucide-react'
import TopBar from '@/components/ui/TopBar'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import toast from 'react-hot-toast'
import customerService from '@/services/customer.service'
import { useAuth } from '@/context/AuthContext'
import Skeleton from '@/components/ui/Skeleton'

export default function PersonalInfoPage() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Check if user is authenticated
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      router.push('/login')
      return
    }

    fetchUserData()
  }, [router])

  const fetchUserData = async () => {
    try {
      setIsFetching(true)
      const profile = await customerService.getProfile()
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
      })
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setIsFetching(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    setIsLoading(true)

    try {
      const updateData = {
        fullName: formData.fullName,
      }

      // Only include email if it's provided
      if (formData.email) {
        updateData.email = formData.email
      }

      await customerService.updateProfile(updateData)

      // Update auth context with new user data
      updateUser({
        name: formData.fullName,
        email: formData.email,
      })

      toast.success('Personal information updated successfully')
      router.push('/profile')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(
        error.message || 'Failed to update information. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  if (isFetching) {
    return (
      <>
        {/* ── Mobile Skeleton ── */}
        <div className='lg:hidden min-h-screen bg-[var(--theme-bg)] pb-24'>
          <TopBar title='Personal Information' />
          <div className='p-5 space-y-6'>
            {/* Info Alert skeleton */}
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4 flex gap-3'>
              <Skeleton circle className='w-5 h-5' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-4/5' />
              </div>
            </div>

            {/* Form Fields skeletons */}
            <div className='space-y-5'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-3 w-24 rounded' />
                  <Skeleton className='h-[52px] w-full rounded-lg' />
                </div>
              ))}
              <Skeleton className='h-[52px] w-full rounded-lg mt-8' />
            </div>
          </div>
        </div>

        {/* ── Desktop Skeleton ── */}
        <div className='hidden lg:block min-h-[calc(100vh-var(--topbar-height))] bg-[var(--theme-bg)]'>
          <div className='px-12 py-8'>
            {/* Breadcrumb skeleton */}
            <div className='flex items-center gap-2 mb-6'>
              <Skeleton className='h-4 w-12 rounded' />
              <span className='text-[var(--theme-placeholder)]'>/</span>
              <Skeleton className='h-4 w-32 rounded' />
            </div>

            {/* Card skeleton */}
            <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-sm space-y-6'>
              <div className='space-y-2'>
                <Skeleton className='h-7 w-48 rounded-lg' />
                <Skeleton className='h-4 w-64 rounded-md' />
              </div>

              {/* Info Alert skeleton */}
              <div className='bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4 flex gap-3'>
                <Skeleton circle className='w-5 h-5' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-5/6' />
                </div>
              </div>

              {/* Form Fields skeletons */}
              <div className='space-y-6'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='space-y-2'>
                    <Skeleton className='h-3 w-28 rounded' />
                    <Skeleton className='h-[54px] w-full rounded-lg' />
                  </div>
                ))}

                {/* Buttons skeleton */}
                <div className='flex gap-3 pt-4'>
                  <Skeleton className='h-[54px] flex-1 rounded-lg' />
                  <Skeleton className='h-[54px] flex-1 rounded-lg' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='lg:hidden min-h-screen bg-[var(--theme-bg)]'>
        <TopBar title='Personal Information' />

        <div className='p-5'>
          {/* Info Alert */}
          <div className='bg-[var(--theme-info-bg)] border border-[var(--theme-info-border)] rounded-xl p-4 mb-6 flex gap-3'>
            <AlertCircle
              size={20}
              className='text-[var(--theme-info-icon)] flex-shrink-0 mt-0.5'
            />
            <div className='flex-1'>
              <p className='text-[13px] text-[var(--theme-info-text)] leading-relaxed'>
                Your phone number is read-only for security. Contact support to
                update it.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Name Field */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                FULL NAME
              </label>
              <input
                type='text'
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full h-[52px] bg-[var(--theme-input-bg)] border ${
                  errors.fullName
                    ? 'border-red-500/50'
                    : 'border-[var(--theme-border-strong)]'
                } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors`}
                placeholder='Enter your full name'
              />
              {errors.fullName && (
                <span className='block text-xs text-red-400 mt-2'>
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                EMAIL ADDRESS
              </label>
              <input
                type='email'
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full h-[52px] bg-[var(--theme-input-bg)] border ${
                  errors.email
                    ? 'border-red-500/50'
                    : 'border-[var(--theme-border-strong)]'
                } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors`}
                placeholder='your.email@example.com'
              />
              {errors.email && (
                <span className='block text-xs text-red-400 mt-2'>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Phone Field (Read-only) */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                PHONE NUMBER (READ-ONLY)
              </label>
              <input
                type='text'
                value={formData.mobile}
                disabled
                className='w-full h-[52px] bg-white/[0.02] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text-disabled)] text-[15px] font-medium px-4 cursor-not-allowed'
              />
              <p className='text-[11px] text-[var(--theme-text-disabled)] mt-2'>
                Contact support to update your phone number
              </p>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full h-[52px] bg-[var(--theme-btn-primary-bg)] hover:bg-neutral-100 disabled:opacity-70 disabled:cursor-not-allowed text-[var(--theme-btn-primary-text)] rounded-lg text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 mt-8'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='hidden lg:block min-h-[calc(100vh-var(--topbar-height))] bg-[var(--theme-bg)]'>
        <div className=' px-12 py-8'>
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 mb-6'>
            <button
              onClick={() => router.push('/profile')}
              className='text-[13px] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors'
            >
              Profile
            </button>
            <span className='text-[var(--theme-placeholder)]'>/</span>
            <span className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
              Personal Information
            </span>
          </div>

          {/* Card */}
          <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-sm'>
            <h1 className='text-[24px] font-extrabold text-[var(--theme-text-primary)] mb-2'>
              Personal Information
            </h1>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-8'>
              Manage your name and email address
            </p>

            {/* Info Alert */}
            <div className='bg-[var(--theme-info-bg)] border border-[var(--theme-info-border)] rounded-xl p-4 mb-8 flex gap-3'>
              <AlertCircle
                size={20}
                className='text-[var(--theme-info-icon)] flex-shrink-0 mt-0.5'
              />
              <div className='flex-1'>
                <p className='text-[13px] text-[var(--theme-info-text)] leading-relaxed'>
                  Your phone number is read-only for security purposes. Please
                  contact support if you need to update it.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Name Field */}
              <div>
                <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                  FULL NAME
                </label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full h-[54px] bg-[var(--theme-input-bg)] border ${
                    errors.fullName
                      ? 'border-red-500/50'
                      : 'border-[var(--theme-border-strong)]'
                  } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]`}
                  placeholder='Enter your full name'
                />
                {errors.fullName && (
                  <span className='block text-xs text-red-400 mt-2 font-medium'>
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                  EMAIL ADDRESS
                </label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full h-[54px] bg-[var(--theme-input-bg)] border ${
                    errors.email
                      ? 'border-red-500/50'
                      : 'border-[var(--theme-border-strong)]'
                  } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]`}
                  placeholder='your.email@example.com'
                />
                {errors.email && (
                  <span className='block text-xs text-red-400 mt-2 font-medium'>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Phone Field (Read-only) */}
              <div>
                <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                  PHONE NUMBER (READ-ONLY)
                </label>
                <input
                  type='text'
                  value={formData.mobile}
                  disabled
                  className='w-full h-[54px] bg-white/[0.02] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text-disabled)] text-[15px] font-normal px-4 cursor-not-allowed'
                />
                <p className='text-[11px] text-[var(--theme-text-disabled)] mt-2'>
                  Contact support to update your phone number
                </p>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => router.push('/profile')}
                  className='flex-1 h-[54px] bg-transparent border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase cursor-pointer flex items-center justify-center hover:bg-[var(--theme-btn-secondary-hover)] transition-all'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='flex-1 h-[54px] bg-[var(--theme-btn-primary-bg)] hover:bg-[var(--theme-btn-primary-hover)] disabled:opacity-75 disabled:cursor-not-allowed text-[var(--theme-btn-primary-text)] rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase cursor-pointer flex items-center justify-center gap-2 transition-all'
                >
                  {isLoading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
