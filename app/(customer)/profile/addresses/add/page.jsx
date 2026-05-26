'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import TopBar from '@/components/ui/TopBar'
import toast from 'react-hot-toast'
import customerService from '@/services/customer.service'

export default function AddAddressPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    addressType: 'Home',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    setAsDefault: false,
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.addressLine1 || formData.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address line 1 must be at least 5 characters'
    }

    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits'
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'City is required'
    }

    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = 'State is required'
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
      const addressData = {
        address: {
          addressType: formData.addressType,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          landmark: formData.landmark || undefined,
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
        },
        setAsDefault: formData.setAsDefault,
      }

      await customerService.addAddress(addressData)
      toast.success('Address added successfully')
      router.push('/profile/addresses')
    } catch (error) {
      console.error('Failed to add address:', error)
      toast.error(error.message || 'Failed to add address. Please try again.')
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

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='lg:hidden min-h-screen bg-[var(--theme-bg)]'>
        <TopBar title='Add Address' />

        <div className='p-5'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Address Type */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                ADDRESS TYPE
              </label>
              <div className='flex gap-2'>
                {['Home', 'Work', 'Other'].map((type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => handleChange('addressType', type)}
                    className={`flex-1 h-[44px] rounded-lg text-[13px] font-semibold transition-all ${
                      formData.addressType === type
                        ? 'bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)]'
                        : 'bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] hover:bg-[var(--theme-btn-secondary-hover)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                ADDRESS LINE 1 *
              </label>
              <input
                type='text'
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                className={`w-full h-[52px] bg-[var(--theme-input-bg)] border ${
                  errors.addressLine1
                    ? 'border-red-500/50'
                    : 'border-[var(--theme-border-strong)]'
                } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors`}
                placeholder='House/Flat no., Building name'
              />
              {errors.addressLine1 && (
                <span className='block text-xs text-red-400 mt-2'>
                  {errors.addressLine1}
                </span>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                ADDRESS LINE 2
              </label>
              <input
                type='text'
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                className='w-full h-[52px] bg-[var(--theme-input-bg)] border border-[var(--theme-border-strong)] rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors'
                placeholder='Road name, Area, Colony'
              />
            </div>

            {/* Landmark */}
            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                LANDMARK
              </label>
              <input
                type='text'
                value={formData.landmark}
                onChange={(e) => handleChange('landmark', e.target.value)}
                className='w-full h-[52px] bg-[var(--theme-input-bg)] border border-[var(--theme-border-strong)] rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors'
                placeholder='Nearby landmark (optional)'
              />
            </div>

            {/* Pincode, City, State */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                  PINCODE *
                </label>
                <input
                  type='text'
                  value={formData.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    handleChange('pincode', value)
                  }}
                  className={`w-full h-[52px] bg-[var(--theme-input-bg)] border ${
                    errors.pincode
                      ? 'border-red-500/50'
                      : 'border-[var(--theme-border-strong)]'
                  } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors`}
                  placeholder='000000'
                  maxLength={6}
                />
                {errors.pincode && (
                  <span className='block text-xs text-red-400 mt-2'>
                    {errors.pincode}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                  CITY *
                </label>
                <input
                  type='text'
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full h-[52px] bg-[var(--theme-input-bg)] border ${
                    errors.city
                      ? 'border-red-500/50'
                      : 'border-[var(--theme-border-strong)]'
                  } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors`}
                  placeholder='City'
                />
                {errors.city && (
                  <span className='block text-xs text-red-400 mt-2'>
                    {errors.city}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className='block text-[10px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                STATE *
              </label>
              <input
                type='text'
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={`w-full h-[52px] bg-[var(--theme-input-bg)] border ${
                  errors.state
                    ? 'border-red-500/50'
                    : 'border-[var(--theme-border-strong)]'
                } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-medium px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-colors`}
                placeholder='State'
              />
              {errors.state && (
                <span className='block text-xs text-red-400 mt-2'>
                  {errors.state}
                </span>
              )}
            </div>

            {/* Set as Default */}
            <div className='flex items-center gap-3 p-4 bg-white/5 border border-[var(--theme-border-strong)] rounded-xl'>
              <input
                type='checkbox'
                id='setAsDefault'
                checked={formData.setAsDefault}
                onChange={(e) => handleChange('setAsDefault', e.target.checked)}
                className='w-5 h-5 rounded bg-white/10 border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] focus:ring-2 focus:ring-white/40'
              />
              <label
                htmlFor='setAsDefault'
                className='flex-1 text-[13px] font-medium text-[var(--theme-text-primary)] cursor-pointer'
              >
                Set as default address
              </label>
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
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Add Address</span>
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
        <div className='px-12 py-8'>
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 mb-6'>
            <button
              onClick={() => router.push('/profile')}
              className='text-[13px] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors'
            >
              Profile
            </button>
            <span className='text-[var(--theme-placeholder)]'>/</span>
            <button
              onClick={() => router.push('/profile/addresses')}
              className='text-[13px] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors'
            >
              Addresses
            </button>
            <span className='text-[var(--theme-placeholder)]'>/</span>
            <span className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
              Add Address
            </span>
          </div>

          {/* Card */}
          <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-sm'>
            <h1 className='text-[24px] font-extrabold text-[var(--theme-text-primary)] mb-2'>
              Add New Address
            </h1>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-8'>
              Add a new address for faster pickup and delivery
            </p>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Address Type */}
              <div>
                <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                  ADDRESS TYPE
                </label>
                <div className='flex gap-2'>
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      key={type}
                      type='button'
                      onClick={() => handleChange('addressType', type)}
                      className={`flex-1 h-[48px] rounded-lg text-[13px] font-semibold transition-all ${
                        formData.addressType === type
                          ? 'bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)]'
                          : 'bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] hover:bg-[var(--theme-btn-secondary-hover)]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                {/* Address Line 1 */}
                <div>
                  <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                    ADDRESS LINE 1 *
                  </label>
                  <input
                    type='text'
                    value={formData.addressLine1}
                    onChange={(e) =>
                      handleChange('addressLine1', e.target.value)
                    }
                    className={`w-full h-[54px] bg-[var(--theme-input-bg)] border ${
                      errors.addressLine1
                        ? 'border-red-500/50'
                        : 'border-[var(--theme-border-strong)]'
                    } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]`}
                    placeholder='House/Flat no., Building name'
                  />
                  {errors.addressLine1 && (
                    <span className='block text-xs text-red-400 mt-2 font-medium'>
                      {errors.addressLine1}
                    </span>
                  )}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                    ADDRESS LINE 2
                  </label>
                  <input
                    type='text'
                    value={formData.addressLine2}
                    onChange={(e) =>
                      handleChange('addressLine2', e.target.value)
                    }
                    className='w-full h-[54px] bg-[var(--theme-input-bg)] border border-[var(--theme-border-strong)] rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]'
                    placeholder='Road name, Area, Colony'
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                    LANDMARK
                  </label>
                  <input
                    type='text'
                    value={formData.landmark}
                    onChange={(e) => handleChange('landmark', e.target.value)}
                    className='w-full h-[54px] bg-[var(--theme-input-bg)] border border-[var(--theme-border-strong)] rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]'
                    placeholder='Nearby landmark (optional)'
                  />
                </div>
                <div>
                  <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                    PINCODE *
                  </label>
                  <input
                    type='text'
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                      handleChange('pincode', value)
                    }}
                    className={`w-full h-[54px] bg-[var(--theme-input-bg)] border ${
                      errors.pincode
                        ? 'border-red-500/50'
                        : 'border-[var(--theme-border-strong)]'
                    } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]`}
                    placeholder='000000'
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <span className='block text-xs text-red-400 mt-2 font-medium'>
                      {errors.pincode}
                    </span>
                  )}
                </div>

                {/* Pincode and City */}

                <div>
                  <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                    CITY *
                  </label>
                  <input
                    type='text'
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={`w-full h-[54px] bg-[var(--theme-input-bg)] border ${
                      errors.city
                        ? 'border-red-500/50'
                        : 'border-[var(--theme-border-strong)]'
                    } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]`}
                    placeholder='City'
                  />
                  {errors.city && (
                    <span className='block text-xs text-red-400 mt-2 font-medium'>
                      {errors.city}
                    </span>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className='block text-[11px] font-bold text-[var(--theme-text-tertiary)] tracking-[0.08em] mb-2 uppercase'>
                    STATE *
                  </label>
                  <input
                    type='text'
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={`w-full h-[54px] bg-[var(--theme-input-bg)] border ${
                      errors.state
                        ? 'border-red-500/50'
                        : 'border-[var(--theme-border-strong)]'
                    } rounded-lg text-[var(--theme-text-primary)] text-[15px] font-normal px-4 outline-none focus:border-[var(--theme-input-border-focus)] transition-all placeholder:text-[var(--theme-placeholder)]`}
                    placeholder='State'
                  />
                  {errors.state && (
                    <span className='block text-xs text-red-400 mt-2 font-medium'>
                      {errors.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Set as Default */}
              <div className='flex items-center gap-3 p-4 bg-white/5 border border-[var(--theme-border-strong)] rounded-xl'>
                <input
                  type='checkbox'
                  id='setAsDefaultDesktop'
                  checked={formData.setAsDefault}
                  onChange={(e) =>
                    handleChange('setAsDefault', e.target.checked)
                  }
                  className='w-5 h-5 rounded bg-white/10 border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] focus:ring-2 focus:ring-white/40'
                />
                <label
                  htmlFor='setAsDefaultDesktop'
                  className='flex-1 text-[13px] font-medium text-[var(--theme-text-primary)] cursor-pointer'
                >
                  Set as default address
                </label>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => router.push('/profile/addresses')}
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
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Add Address</span>
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
