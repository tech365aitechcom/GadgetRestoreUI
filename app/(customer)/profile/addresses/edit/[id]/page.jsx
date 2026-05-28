'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save } from 'lucide-react'
import TopBar from '@/components/ui/TopBar'
import toast from 'react-hot-toast'
import customerService from '@/services/customer.service'

export default function EditAddressPage() {
  const router = useRouter()
  const params = useParams()
  const addressId = params.id

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
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

  useEffect(() => {
    fetchAddressData()
  }, [addressId])

  const fetchAddressData = async () => {
    try {
      setIsFetching(true)
      const response = await customerService.getAddresses()

      // Handle different response structures
      let addressesArray = []
      if (response?.data?.addresses && Array.isArray(response.data.addresses)) {
        addressesArray = response.data.addresses
      } else if (Array.isArray(response?.data)) {
        addressesArray = response.data
      } else if (Array.isArray(response)) {
        addressesArray = response
      }

      const address = addressesArray.find((addr) => addr._id === addressId)

      if (!address) {
        toast.error('Address not found')
        router.push('/profile/addresses')
        return
      }

      setFormData({
        addressType: address.addressType || 'Home',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        landmark: address.landmark || '',
        pincode: address.pincode || '',
        city: address.city || '',
        state: address.state || '',
        setAsDefault: address.isDefault || false,
      })
    } catch (error) {
      console.error('Failed to fetch address:', error)
      toast.error('Failed to load address data')
      router.push('/profile/addresses')
    } finally {
      setIsFetching(false)
    }
  }

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

      await customerService.updateAddress(addressId, addressData)
      toast.success('Address updated successfully')
      router.push('/profile/addresses')
    } catch (error) {
      console.error('Failed to update address:', error)
      toast.error(
        error.message || 'Failed to update address. Please try again.',
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
      <div className='min-h-screen bg-[var(--theme-bg)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-[var(--theme-border-strong)] border-t-white rounded-full animate-spin mx-auto mb-4' />
          <p className='text-[14px] text-[var(--theme-text-secondary)]'>
            Loading address...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile and Desktop forms - same structure as add page, just with "Edit" title and pre-filled data */}
      {/* For brevity, I'll include just the mobile version, desktop follows same pattern */}

      <div className='lg:hidden min-h-screen bg-[var(--theme-bg)]'>
        <TopBar title='Edit Address' />

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

      {/* Desktop view - same structure as mobile, with desktop styling */}
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
              Edit Address
            </span>
          </div>

          {/* Card */}
          <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-sm'>
            <h1 className='text-[24px] font-extrabold text-[var(--theme-text-primary)] mb-2'>
              Edit Address
            </h1>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-8'>
              Update your address information
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

                {/* Pincode and City */}
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
