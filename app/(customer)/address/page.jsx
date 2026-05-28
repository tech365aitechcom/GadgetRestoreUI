'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  Home,
  Briefcase,
  Plus,
  Minus,
  MapPin,
  MapPinned,
  X,
  Save,
  Edit2,
  Trash2,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import customerService from '@/services/customer.service'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function AddressPage() {
  const router = useRouter()
  const { setAddress, address: savedBookingAddress } = useBooking()
  const { user } = useAuth()

  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isDeletingAddress, setIsDeletingAddress] = useState(false)

  // New address form state - same as profile/addresses/add
  const [newAddress, setNewAddress] = useState({
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

  // Fetch addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      // Check if user is authenticated
      const token = Cookies.get(TOKEN_COOKIE)

      if (!token) {
        // Guest user - no addresses
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await customerService.getAddresses()

        // Handle API response structure: response.data.addresses
        let addressesArray = []
        if (
          response?.data?.addresses &&
          Array.isArray(response.data.addresses)
        ) {
          addressesArray = response.data.addresses
        } else if (Array.isArray(response?.data)) {
          addressesArray = response.data
        } else if (Array.isArray(response)) {
          addressesArray = response
        }

        // Map backend addresses to frontend format
        const mappedAddresses = addressesArray.map((addr) => ({
          id: addr._id,
          label: addr.addressType || 'Other',
          type: addr.addressType?.toLowerCase() || 'other',
          line1: [addr.addressLine1, addr.addressLine2]
            .filter(Boolean)
            .join(', '),
          line2: [addr.city, addr.state, addr.pincode]
            .filter(Boolean)
            .join(', '),
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          landmark: addr.landmark,
          isDefault: addr.isDefault || false,
          raw: addr,
        }))

        setAddresses(mappedAddresses)

        // Auto-select default address or first address
        const defaultAddr = mappedAddresses.find((a) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (mappedAddresses.length > 0) {
          setSelectedAddressId(mappedAddresses[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
        toast.error('Failed to load addresses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAddresses()
  }, [user])

  const validateForm = () => {
    const newErrors = {}

    if (!newAddress.addressLine1 || newAddress.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address line 1 must be at least 5 characters'
    }

    if (!newAddress.pincode || !/^\d{6}$/.test(newAddress.pincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits'
    }

    if (!newAddress.city || newAddress.city.trim().length < 2) {
      newErrors.city = 'City is required'
    }

    if (!newAddress.state || newAddress.state.trim().length < 2) {
      newErrors.state = 'State is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddNewAddress = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    setIsSavingAddress(true)

    try {
      const addressData = {
        address: {
          addressType: newAddress.addressType,
          addressLine1: newAddress.addressLine1,
          addressLine2: newAddress.addressLine2 || undefined,
          landmark: newAddress.landmark || undefined,
          pincode: newAddress.pincode,
          city: newAddress.city,
          state: newAddress.state,
        },
        setAsDefault: newAddress.setAsDefault,
      }

      if (isEditingAddress) {
        // Update existing address
        await customerService.updateAddress(isEditingAddress, addressData)
        toast.success('Address updated successfully')
      } else {
        // Add new address
        await customerService.addAddress(addressData)
        toast.success('Address added successfully')
      }

      // Refresh addresses
      const response = await customerService.getAddresses()

      // Handle API response structure: response.data.addresses
      let addressesArray = []
      if (response?.data?.addresses && Array.isArray(response.data.addresses)) {
        addressesArray = response.data.addresses
      } else if (Array.isArray(response?.data)) {
        addressesArray = response.data
      } else if (Array.isArray(response)) {
        addressesArray = response
      }

      const mappedAddresses = addressesArray.map((addr) => ({
        id: addr._id,
        label: addr.addressType || 'Other',
        type: addr.addressType?.toLowerCase() || 'other',
        line1: [addr.addressLine1, addr.addressLine2]
          .filter(Boolean)
          .join(', '),
        line2: [addr.city, addr.state, addr.pincode].filter(Boolean).join(', '),
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        landmark: addr.landmark,
        isDefault: addr.isDefault || false,
        raw: addr,
      }))

      setAddresses(mappedAddresses)

      // Select the newly added/edited address
      if (!isEditingAddress && mappedAddresses.length > 0) {
        setSelectedAddressId(mappedAddresses[mappedAddresses.length - 1].id)
      } else if (isEditingAddress) {
        setSelectedAddressId(isEditingAddress)
      }

      // Close modal and reset form
      setIsAddingNew(false)
      setIsEditingAddress(null)
      setNewAddress({
        addressType: 'Home',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        pincode: '',
        city: '',
        state: '',
        setAsDefault: false,
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to save address:', error)
      toast.error(error.message || 'Failed to save address. Please try again.')
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleEditAddress = (address) => {
    setNewAddress({
      addressType: address.raw.addressType || 'Home',
      addressLine1: address.raw.addressLine1 || '',
      addressLine2: address.raw.addressLine2 || '',
      landmark: address.raw.landmark || '',
      pincode: address.raw.pincode || '',
      city: address.raw.city || '',
      state: address.raw.state || '',
      setAsDefault: address.isDefault || false,
    })
    setIsEditingAddress(address.id)
    setIsAddingNew(true)
  }

  const handleDeleteAddress = async () => {
    if (isDeletingAddress) return

    try {
      setIsDeletingAddress(true)
      await customerService.deleteAddress(showDeleteConfirm)

      // Remove from local state
      setAddresses((prev) => prev.filter((a) => a.id !== showDeleteConfirm))

      // Deselect if the deleted address was selected
      if (selectedAddressId === showDeleteConfirm) {
        setSelectedAddressId(null)
      }

      toast.success('Address deleted successfully')
      setShowDeleteConfirm(null)

      // Refresh to get updated addresses
      const response = await customerService.getAddresses()

      // Handle API response structure: response.data.addresses
      let addressesArray = []
      if (response?.data?.addresses && Array.isArray(response.data.addresses)) {
        addressesArray = response.data.addresses
      } else if (Array.isArray(response?.data)) {
        addressesArray = response.data
      } else if (Array.isArray(response)) {
        addressesArray = response
      }

      const mappedAddresses = addressesArray.map((addr) => ({
        id: addr._id,
        label: addr.addressType || 'Other',
        type: addr.addressType?.toLowerCase() || 'other',
        line1: [addr.addressLine1, addr.addressLine2]
          .filter(Boolean)
          .join(', '),
        line2: [addr.city, addr.state, addr.pincode].filter(Boolean).join(', '),
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        landmark: addr.landmark,
        isDefault: addr.isDefault || false,
        raw: addr,
      }))

      setAddresses(mappedAddresses)

      // Auto-select default or first address
      const defaultAddr = mappedAddresses.find((a) => a.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (mappedAddresses.length > 0) {
        setSelectedAddressId(mappedAddresses[0].id)
      }
    } catch (error) {
      console.error('Failed to delete address:', error)
      toast.error(error.message || 'Failed to delete address')
    } finally {
      setIsDeletingAddress(false)
    }
  }

  const handleSetDefault = async (addressId) => {
    try {
      // Optimistically update UI
      const previousAddresses = [...addresses]
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        })),
      )

      await customerService.updateAddress(addressId, { setAsDefault: true })
      toast.success('Default address updated')
    } catch (error) {
      // Revert on error
      setAddresses(previousAddresses)
      console.error('Failed to set default address:', error)
      toast.error(error.message || 'Failed to update default address')
    }
  }

  const handleConfirm = () => {
    const selected = addresses.find((a) => a.id === selectedAddressId)
    if (selected) {
      setAddress({ ...selected, notes: deliveryNotes })
      router.push('/checkout/summary')
    } else {
      toast.error('Please select an address')
    }
  }

  const handleChange = (field, value) => {
    setNewAddress((prev) => ({
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

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home size={20} />
      case 'work':
      case 'office':
        return <Briefcase size={20} />
      default:
        return <MapPinned size={20} />
    }
  }

  const AddressCard = ({ addr }) => {
    const isSelected = selectedAddressId === addr.id
    return (
      <div
        className={`w-full rounded-2xl p-5 mb-3 border transition-all ${
          isSelected
            ? 'bg-[#141414] border-white shadow-md'
            : 'bg-[#0A0A0A] border-[#222] hover:bg-[#1A1A1E]'
        }`}
      >
        <div
          onClick={() => setSelectedAddressId(addr.id)}
          className='flex items-start gap-4 cursor-pointer mb-3'
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white text-black' : 'bg-[#222] text-[#888]'}`}
          >
            {getAddressIcon(addr.type)}
          </div>
          <div className='flex-1'>
            <div className='flex justify-between items-center mb-1'>
              <div className='flex items-center gap-2'>
                <h4 className='text-[15px] font-bold text-white'>
                  {addr.label}
                </h4>
                {addr.isDefault && (
                  <span className='text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 tracking-wider'>
                    DEFAULT
                  </span>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white' : 'border-[#333]'}`}
              >
                {isSelected && (
                  <div className='w-2.5 h-2.5 bg-white rounded-full' />
                )}
              </div>
            </div>
            <p className='text-[13px] text-[#888] leading-relaxed pr-6'>
              {addr.line1}
            </p>
            <p className='text-[13px] text-[#888] leading-relaxed pr-6'>
              {addr.line2}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 mt-3 pt-3 border-t border-[#222]'>
          {!addr.isDefault && (
            <button
              onClick={() => handleSetDefault(addr.id)}
              className='flex-1 h-[36px] bg-white/5 border border-[#333] text-white rounded-lg text-[11px] font-semibold hover:bg-white/10 active:scale-[0.98] transition-all'
            >
              Set Default
            </button>
          )}
          <button
            onClick={() => handleEditAddress(addr)}
            className='flex-1 h-[36px] bg-white/5 border border-[#333] text-white rounded-lg text-[11px] font-semibold hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5'
          >
            <Edit2 size={12} />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(addr.id)}
            className='h-[36px] px-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[11px] font-semibold hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center'
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#0A0A0A] flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-[#333] border-t-white rounded-full animate-spin mx-auto mb-4' />
          <p className='text-[14px] text-[#888]'>Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='address-page-shell'>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-[100svh] relative overflow-hidden bg-[#222222]'>
        {/* Content */}
        <div className='relative z-10 pt-[72px] pb-[180px] bg-[#0A0A0A] min-h-[100svh] mt-[-20px] rounded-t-[30px]'>
          <div className='px-5 pt-6 pb-4'>
            <h1 className='text-2xl font-black text-white tracking-tight uppercase leading-tight mb-1'>
              Select Address
            </h1>
            <p className='text-[#888888] text-sm'>
              Choose a convenient address for your repair.
            </p>
          </div>

          {/* Map Preview */}
          <div className='px-5 mb-8'>
            <div className='w-full h-[180px] bg-black rounded-3xl overflow-hidden relative shadow-lg'>
              <img
                src='/images/dark-map-placeholder.png'
                alt='Map'
                className='w-full h-full object-cover opacity-60'
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.background = '#222'
                }}
              />
              <div className='absolute inset-x-0 bottom-4 flex justify-center'>
                <div className='bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl'>
                  <MapPin size={16} color='black' />
                  <span className='text-xs font-bold text-black uppercase tracking-wide'>
                    PRECISION VALLEY, CA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className='px-5 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-sm font-bold text-[#E0E0E0]'>
                Saved Addresses
              </h3>
              <span className='text-[11px] font-bold text-[#888] uppercase tracking-wider'>
                {addresses.length} LOCATIONS
              </span>
            </div>

            {addresses.length === 0 ? (
              <div className='text-center py-8 bg-[#111] rounded-2xl border border-[#222]'>
                <MapPin size={40} className='text-[#444] mx-auto mb-3' />
                <p className='text-[14px] text-[#888] mb-2'>
                  No saved addresses
                </p>
                <p className='text-[12px] text-[#666]'>
                  Add your first address below
                </p>
              </div>
            ) : (
              addresses.map((addr) => <AddressCard key={addr.id} addr={addr} />)
            )}

            <button
              onClick={() => setIsAddingNew(true)}
              className='w-full h-[60px] rounded-2xl border border-dashed border-[#333] flex items-center justify-center gap-2 text-[#888] font-bold text-[13px] uppercase tracking-wide hover:bg-[#111] mt-2 transition-colors'
            >
              <Plus size={18} /> Add New Address
            </button>
          </div>

          {/* Delivery Notes */}
          <div className='px-5 mb-8'>
            <h3 className='text-[11px] font-bold text-[#888] uppercase tracking-wider mb-3'>
              DELIVERY NOTES (OPTIONAL)
            </h3>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder='Access codes, gate instructions...'
              className='w-full h-20 bg-[#111] border border-[#222] rounded-xl p-4 text-[13px] text-white resize-none focus:bg-[#1A1A1E] focus:border-[#444] outline-none transition-all'
            />
          </div>

          {/* Confirm Button Fixed Bottom */}
          <div className='fixed bottom-[50px] left-0 right-0 p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-40 pointer-events-none'>
            <button
              onClick={handleConfirm}
              disabled={!selectedAddressId}
              className='w-full h-[50px] bg-white disabled:bg-[#333] disabled:text-[#666] text-black rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform pointer-events-auto'
            >
              Confirm Address <ArrowLeft className='rotate-180' size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop hidden lg:block bg-[#050505] min-h-[calc(100vh-var(--topbar-height))]'>
        <div className='flex h-[calc(100vh-var(--topbar-height))]'>
          {/* Left side - MAP */}
          <div className='w-[55%] relative bg-[#0D0D0F]'>
            <img
              src='/images/dark-map-placeholder.png'
              alt='Map'
              className='absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen filter grayscale'
            />

            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='relative'>
                <div className='w-12 h-14 bg-[#6c7bff] rounded-xl rounded-bl-none flex items-center justify-center shadow-2xl relative z-10 transform -translate-y-1/2'>
                  <MapPin size={24} color='white' />
                </div>
                <div className='absolute top-8 left-6 bg-[#1A1A1E] px-4 py-2 rounded-lg shadow-xl whitespace-nowrap border border-[#333]'>
                  <span className='text-xs font-black uppercase text-white'>
                    82nd Ave, Manhattan
                  </span>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className='absolute bottom-10 left-10 flex flex-col bg-[#1A1A1E] rounded-lg shadow-xl overflow-hidden z-20 border border-[#333]'>
              <button className='w-12 h-12 flex items-center justify-center text-white hover:bg-[#2A2A2E] border-b border-[#333] transition-colors cursor-pointer'>
                <Plus size={20} strokeWidth={2.5} />
              </button>
              <button className='w-12 h-12 flex items-center justify-center text-white hover:bg-[#2A2A2E] transition-colors cursor-pointer'>
                <Minus size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right side - FORM */}
          <div className='w-[45%] bg-[#0A0A0A] p-12 overflow-y-auto border-l border-[#222]'>
            <h1 className='text-[42px] font-black text-white tracking-tight leading-none mb-3'>
              Select Service Address
            </h1>
            <p className='text-[15px] text-[#888] mb-12 max-w-[85%]'>
              Choose a saved location or add a new one for your technical
              service appointment.
            </p>

            <div className='mb-10'>
              <h3 className='text-[11px] font-bold text-[#888] uppercase tracking-[0.1em] mb-4'>
                SAVED ADDRESSES
              </h3>

              {addresses.length === 0 ? (
                <div className='text-center py-12 bg-[#111] rounded-2xl border border-[#222]'>
                  <MapPin size={48} className='text-[#444] mx-auto mb-4' />
                  <p className='text-[15px] text-[#888] mb-2'>
                    No saved addresses
                  </p>
                  <p className='text-[13px] text-[#666]'>
                    Add your first address below
                  </p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <AddressCard key={addr.id} addr={addr} />
                ))
              )}

              <button
                onClick={() => setIsAddingNew(true)}
                className='w-full h-16 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center gap-3 text-[#888] font-bold text-[14px] hover:bg-[#111] transition-colors mt-2'
              >
                <Plus size={18} /> Add New Address
              </button>
            </div>

            <div className='mb-10'>
              <h3 className='text-[11px] font-bold text-[#888] uppercase tracking-[0.1em] mb-4'>
                DELIVERY NOTES (OPTIONAL)
              </h3>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder='Access codes, gate instructions...'
                className='w-full h-24 bg-[#111] border border-[#222] rounded-2xl p-5 text-[14px] text-white resize-none focus:bg-[#1A1A1E] focus:border-[#444] outline-none transition-all'
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedAddressId}
              className='w-full h-[64px] bg-white disabled:bg-[#333] disabled:text-[#666] hover:bg-gray-200 text-black rounded-[20px] text-[15px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl transition-colors'
            >
              CONFIRM ADDRESS <ArrowLeft className='rotate-180' size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      {isAddingNew && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4'>
          <div className='bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-[20px] font-black text-white uppercase'>
                {isEditingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false)
                  setIsEditingAddress(null)
                  setErrors({})
                }}
                className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#888] hover:bg-white/10 transition-colors'
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddNewAddress()
              }}
              className='space-y-5'
            >
              {/* Address Type */}
              <div>
                <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                  ADDRESS TYPE
                </label>
                <div className='flex gap-2'>
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      key={type}
                      type='button'
                      onClick={() => handleChange('addressType', type)}
                      className={`flex-1 h-[44px] rounded-lg text-[13px] font-semibold transition-all ${
                        newAddress.addressType === type
                          ? 'bg-white text-black'
                          : 'bg-white/5 border border-[#333] text-white hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                  ADDRESS LINE 1 *
                </label>
                <input
                  type='text'
                  value={newAddress.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  className={`w-full h-[52px] bg-[#111] border ${
                    errors.addressLine1 ? 'border-red-500/50' : 'border-[#222]'
                  } rounded-lg text-white text-[15px] px-4 outline-none focus:border-[#444] transition-colors`}
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
                <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                  ADDRESS LINE 2
                </label>
                <input
                  type='text'
                  value={newAddress.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value)}
                  className='w-full h-[52px] bg-[#111] border border-[#222] rounded-lg text-white text-[15px] px-4 outline-none focus:border-[#444] transition-colors'
                  placeholder='Road name, Area, Colony'
                />
              </div>

              {/* Landmark */}
              <div>
                <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                  LANDMARK
                </label>
                <input
                  type='text'
                  value={newAddress.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  className='w-full h-[52px] bg-[#111] border border-[#222] rounded-lg text-white text-[15px] px-4 outline-none focus:border-[#444] transition-colors'
                  placeholder='Nearby landmark (optional)'
                />
              </div>

              {/* Pincode and City */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                    PINCODE *
                  </label>
                  <input
                    type='text'
                    value={newAddress.pincode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                      handleChange('pincode', value)
                    }}
                    className={`w-full h-[52px] bg-[#111] border ${
                      errors.pincode ? 'border-red-500/50' : 'border-[#222]'
                    } rounded-lg text-white text-[15px] px-4 outline-none focus:border-[#444] transition-colors`}
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
                  <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                    CITY *
                  </label>
                  <input
                    type='text'
                    value={newAddress.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={`w-full h-[52px] bg-[#111] border ${
                      errors.city ? 'border-red-500/50' : 'border-[#222]'
                    } rounded-lg text-white text-[15px] px-4 outline-none focus:border-[#444] transition-colors`}
                    placeholder='City'
                  />
                  {errors.city && (
                    <span className='block text-xs text-red-400 mt-2'>
                      {errors.city}
                    </span>
                  )}
                </div>
              </div>

              {/* State */}
              <div>
                <label className='block text-[10px] font-bold text-[#888] tracking-[0.08em] mb-2 uppercase'>
                  STATE *
                </label>
                <input
                  type='text'
                  value={newAddress.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={`w-full h-[52px] bg-[#111] border ${
                    errors.state ? 'border-red-500/50' : 'border-[#222]'
                  } rounded-lg text-white text-[15px] px-4 outline-none focus:border-[#444] transition-colors`}
                  placeholder='State'
                />
                {errors.state && (
                  <span className='block text-xs text-red-400 mt-2'>
                    {errors.state}
                  </span>
                )}
              </div>

              {/* Set as Default */}
              <div className='flex items-center gap-3 p-4 bg-white/5 border border-[#222] rounded-xl'>
                <input
                  type='checkbox'
                  id='setAsDefault'
                  checked={newAddress.setAsDefault}
                  onChange={(e) =>
                    handleChange('setAsDefault', e.target.checked)
                  }
                  className='w-5 h-5 rounded bg-white/10 border-[#333] text-white focus:ring-2 focus:ring-white/40'
                />
                <label
                  htmlFor='setAsDefault'
                  className='flex-1 text-[13px] font-medium text-white cursor-pointer'
                >
                  Set as default address
                </label>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSavingAddress}
                className='w-full h-[52px] bg-white hover:bg-gray-200 disabled:bg-[#333] disabled:text-[#666] text-black rounded-lg text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200'
              >
                {isSavingAddress ? (
                  <>
                    <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
                    <span>
                      {isEditingAddress ? 'Updating...' : 'Adding...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>
                      {isEditingAddress ? 'Update Address' : 'Add Address'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4'>
          <div className='bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 max-w-[400px] w-full shadow-2xl'>
            <h3 className='text-[18px] font-black text-white mb-2'>
              Delete Address?
            </h3>
            <p className='text-[13px] text-[#888] mb-6'>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingAddress}
                className='flex-1 h-[46px] bg-white/5 border border-[#333] text-white rounded-lg text-[13px] font-bold hover:bg-white/10 transition-all disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAddress}
                disabled={isDeletingAddress}
                className='flex-1 h-[46px] bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isDeletingAddress ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
