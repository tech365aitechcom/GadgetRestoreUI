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
        className={`w-full rounded-2xl p-5 mb-3 border transition-all`}
        style={{
          background: isSelected ? 'var(--color-content-card)' : 'var(--color-content-bg)',
          borderColor: isSelected ? 'var(--color-content-text)' : 'var(--color-content-border)',
          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div
          onClick={() => setSelectedAddressId(addr.id)}
          className='flex items-start gap-4 cursor-pointer mb-3'
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
            style={{
              background: isSelected ? 'var(--color-content-text)' : 'var(--color-content-card)',
              color: isSelected ? 'var(--color-content-bg)' : 'var(--color-content-text-secondary)',
            }}
          >
            {getAddressIcon(addr.type)}
          </div>
          <div className='flex-1'>
            <div className='flex justify-between items-center mb-1'>
              <div className='flex items-center gap-2'>
                <h4 className='text-[15px] font-bold' style={{ color: 'var(--color-content-text)' }}>
                  {addr.label}
                </h4>
                {addr.isDefault && (
                  <span className='text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 tracking-wider'>
                    DEFAULT
                  </span>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
                style={{ borderColor: isSelected ? 'var(--color-content-text)' : 'var(--color-content-border)' }}
              >
                {isSelected && (
                  <div className='w-2.5 h-2.5 rounded-full' style={{ background: 'var(--color-content-text)' }} />
                )}
              </div>
            </div>
            <p className='text-[13px] leading-relaxed pr-6' style={{ color: 'var(--color-content-text-secondary)' }}>
              {addr.line1}
            </p>
            <p className='text-[13px] leading-relaxed pr-6' style={{ color: 'var(--color-content-text-secondary)' }}>
              {addr.line2}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 mt-3 pt-3' style={{ borderTop: '1px solid var(--color-content-border)' }}>
          {!addr.isDefault && (
            <button
              onClick={() => handleSetDefault(addr.id)}
              className='flex-1 h-[36px] border rounded-lg text-[11px] font-semibold hover:bg-white/10 active:scale-[0.98] transition-all'
              style={{ background: 'var(--color-content-border)', borderColor: 'var(--color-content-border)', color: 'var(--color-content-text)' }}
            >
              Set Default
            </button>
          )}
          <button
            onClick={() => handleEditAddress(addr)}
            className='flex-1 h-[36px] border rounded-lg text-[11px] font-semibold hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5'
            style={{ background: 'var(--color-content-border)', borderColor: 'var(--color-content-border)', color: 'var(--color-content-text)' }}
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
      <div className='min-h-screen flex items-center justify-center' style={{ background: 'var(--color-content-bg)' }}>
        <div className='text-center'>
          <div className='w-12 h-12 border-3 rounded-full animate-spin mx-auto mb-4' style={{ borderColor: 'var(--color-content-border)', borderTopColor: 'var(--color-content-text)' }} />
          <p className='text-[14px]' style={{ color: 'var(--color-content-text-secondary)' }}>Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='address-page-shell'>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-mobile lg:hidden min-h-[100svh] relative overflow-hidden' style={{ background: 'var(--color-content-card)' }}>
        {/* Content */}
        <div className='relative z-10 pb-[180px] rounded-t-[30px]' style={{ background: 'var(--color-content-bg)' }}>
          <div className='px-5 pt-6 pb-4'>
            <h1 className='text-2xl font-black tracking-tight uppercase leading-tight mb-1' style={{ color: 'var(--color-content-text)' }}>
              Select Address
            </h1>
            <p className='text-sm' style={{ color: 'var(--color-content-text-secondary)' }}>
              Choose a convenient address for your repair.
            </p>
          </div>

          {/* Map Preview */}
          <div className='px-5 mb-8'>
            <div className='w-full h-[180px] rounded-3xl overflow-hidden relative shadow-lg' style={{ background: 'var(--theme-bg)' }}>
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
              <h3 className='text-sm font-bold mb-4' style={{ color: 'var(--color-content-text)' }}>
                Saved Addresses
              </h3>
              <span className='text-[11px] font-bold uppercase tracking-wider' style={{ color: 'var(--color-content-text-secondary)' }}>
                {addresses.length} LOCATIONS
              </span>
            </div>

            {addresses.length === 0 ? (
              <div className='text-center py-8 rounded-2xl' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                <MapPin size={40} className='text-[#444] mx-auto mb-3' />
                <p className='text-[14px] mb-2' style={{ color: 'var(--color-content-text-secondary)' }}>
                  No saved addresses
                </p>
                <p className='text-[12px]' style={{ color: 'var(--color-content-text-secondary)' }}>
                  Add your first address below
                </p>
              </div>
            ) : (
              addresses.map((addr) => <AddressCard key={addr.id} addr={addr} />)
            )}

            <button
              onClick={() => setIsAddingNew(true)}
              className='w-full h-[60px] rounded-2xl flex items-center justify-center gap-2 font-bold text-[13px] uppercase tracking-wide hover:opacity-80 mt-2 transition-colors'
              style={{ border: '1px dashed var(--color-content-border)', color: 'var(--color-content-text-secondary)' }}
            >
              <Plus size={18} /> Add New Address
            </button>
          </div>

          {/* Delivery Notes */}
          <div className='px-5 mb-8'>
            <h3 className='text-[11px] font-bold uppercase tracking-wider mb-3' style={{ color: 'var(--color-content-text-secondary)' }}>
              DELIVERY NOTES (OPTIONAL)
            </h3>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder='Access codes, gate instructions...'
              className='w-full h-20 rounded-xl p-4 text-[13px] resize-none outline-none transition-all'
              style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
            />
          </div>

          {/* Confirm Button Fixed Bottom */}
          <div className='fixed bottom-[50px] left-0 right-0 p-5 z-40 pointer-events-none' style={{ background: 'linear-gradient(to top, var(--color-content-bg) 60%, transparent)' }}>
            <button
              onClick={handleConfirm}
              disabled={!selectedAddressId}
              className='w-full h-[50px] rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform pointer-events-auto'
              style={{
                background: selectedAddressId ? 'var(--theme-btn-primary-bg)' : 'var(--color-content-border)',
                color: selectedAddressId ? 'var(--theme-btn-primary-text)' : 'var(--color-content-text-secondary)',
              }}
            >
              Confirm Address <ArrowLeft className='rotate-180' size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='home-desktop hidden lg:block min-h-[calc(100vh-var(--topbar-height))]' style={{ background: 'var(--theme-bg)' }}>
        <div className='p-8 flex h-[calc(100vh-var(--topbar-height))]'>
          {/* Left side - MAP */}
          <div className='w-[55%] relative' style={{ background: 'var(--color-content-bg)' }}>
            <img
              src='/images/dark-map-placeholder.png'
              alt='Map'
              className='absolute inset-0 w-full h-full object-cover opacity-55 filter grayscale'
            />

            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='relative'>
                <div className='w-12 h-14 rounded-xl rounded-bl-none flex items-center justify-center shadow-2xl relative z-10 transform -translate-y-1/2' style={{ background: 'var(--color-accent)' }}>
                  <MapPin size={24} color='white' />
                </div>
                <div className='absolute top-8 left-6 px-4 py-2 rounded-lg shadow-xl whitespace-nowrap' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                  <span className='text-xs font-black uppercase' style={{ color: 'var(--color-content-text)' }}>
                    82nd Ave, Manhattan
                  </span>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className='absolute bottom-10 left-10 flex flex-col rounded-lg shadow-xl overflow-hidden z-20' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
              <button className='w-12 h-12 flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer' style={{ color: 'var(--color-content-text)', borderBottom: '1px solid var(--color-content-border)' }}>
                <Plus size={20} strokeWidth={2.5} />
              </button>
              <button className='w-12 h-12 flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer' style={{ color: 'var(--color-content-text)' }}>
                <Minus size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right side - FORM */}
          <div className='w-[45%] p-12 overflow-y-auto' style={{ background: 'var(--color-content-bg)', borderLeft: '1px solid var(--color-content-border)' }}>
            <h1 className='text-[42px] font-black tracking-tight leading-none mb-3' style={{ color: 'var(--color-content-text)' }}>
              Select Service Address
            </h1>
            <p className='text-[15px] mb-12 max-w-[85%]' style={{ color: 'var(--color-content-text-secondary)' }}>
              Choose a saved location or add a new one for your technical
              service appointment.
            </p>

            <div className='mb-10'>
              <h3 className='text-[11px] font-bold uppercase tracking-[0.1em] mb-4' style={{ color: 'var(--color-content-text-secondary)' }}>
                SAVED ADDRESSES
              </h3>

              {addresses.length === 0 ? (
                <div className='text-center py-12 rounded-2xl' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                  <MapPin size={48} className='text-[#444] mx-auto mb-4' />
                  <p className='text-[15px] mb-2' style={{ color: 'var(--color-content-text-secondary)' }}>
                    No saved addresses
                  </p>
                  <p className='text-[13px]' style={{ color: 'var(--color-content-text-secondary)' }}>
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
                className='w-full h-16 rounded-xl flex items-center justify-center gap-3 font-bold text-[14px] hover:opacity-80 transition-colors mt-2'
                style={{ border: '2px dashed var(--color-content-border)', color: 'var(--color-content-text-secondary)' }}
              >
                <Plus size={18} /> Add New Address
              </button>
            </div>

            <div className='mb-10'>
              <h3 className='text-[11px] font-bold uppercase tracking-[0.1em] mb-4' style={{ color: 'var(--color-content-text-secondary)' }}>
                DELIVERY NOTES (OPTIONAL)
              </h3>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder='Access codes, gate instructions...'
                className='w-full h-24 rounded-2xl p-5 text-[14px] resize-none outline-none transition-all'
                style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedAddressId}
              className='w-full h-[64px] rounded-[20px] text-[15px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl transition-colors cursor-pointer'
              style={{
                background: selectedAddressId ? 'var(--theme-btn-primary-bg)' : 'var(--color-content-border)',
                color: selectedAddressId ? 'var(--theme-btn-primary-text)' : 'var(--color-content-text-secondary)',
              }}
            >
              CONFIRM ADDRESS <ArrowLeft className='rotate-180' size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      {isAddingNew && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4'>
          <div className='rounded-2xl p-6 max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl' style={{ background: 'var(--color-content-bg)', border: '1px solid var(--color-content-border)' }}>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-[20px] font-black uppercase' style={{ color: 'var(--color-content-text)' }}>
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
                <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  ADDRESS TYPE
                </label>
                <div className='flex gap-2'>
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      key={type}
                      type='button'
                      onClick={() => handleChange('addressType', type)}
                      className={`flex-1 h-[44px] rounded-lg text-[13px] font-semibold transition-all ${newAddress.addressType === type
                        ? ''
                        : 'hover:bg-white/10'
                        }`}
                      style={{
                        background: newAddress.addressType === type ? 'var(--theme-btn-primary-bg)' : 'var(--color-content-border)',
                        border: newAddress.addressType === type ? 'none' : '1px solid var(--color-content-border)',
                        color: newAddress.addressType === type ? 'var(--theme-btn-primary-text)' : 'var(--color-content-text)',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  ADDRESS LINE 1 *
                </label>
                <input
                  type='text'
                  value={newAddress.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  className={`w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors`}
                  style={{
                    background: 'var(--color-content-card)',
                    border: errors.addressLine1 ? '1px solid var(--color-danger)' : '1px solid var(--color-content-border)',
                    color: 'var(--color-content-text)',
                  }}
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
                <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  ADDRESS LINE 2
                </label>
                <input
                  type='text'
                  value={newAddress.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value)}
                  className='w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors'
                  style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
                  placeholder='Road name, Area, Colony'
                />
              </div>

              {/* Landmark */}
              <div>
                <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  LANDMARK
                </label>
                <input
                  type='text'
                  value={newAddress.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  className='w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors'
                  style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
                  placeholder='Nearby landmark (optional)'
                />
              </div>

              {/* Pincode and City */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
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
                    className={`w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors`}
                    style={{
                      background: 'var(--color-content-card)',
                      border: errors.pincode ? '1px solid var(--color-danger)' : '1px solid var(--color-content-border)',
                      color: 'var(--color-content-text)',
                    }}
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
                  <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                    CITY *
                  </label>
                  <input
                    type='text'
                    value={newAddress.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={`w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors`}
                    style={{
                      background: 'var(--color-content-card)',
                      border: errors.city ? '1px solid var(--color-danger)' : '1px solid var(--color-content-border)',
                      color: 'var(--color-content-text)',
                    }}
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
                <label className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  STATE *
                </label>
                <input
                  type='text'
                  value={newAddress.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={`w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors`}
                  style={{
                    background: 'var(--color-content-card)',
                    border: errors.state ? '1px solid var(--color-danger)' : '1px solid var(--color-content-border)',
                    color: 'var(--color-content-text)',
                  }}
                  placeholder='State'
                />
                {errors.state && (
                  <span className='block text-xs text-red-400 mt-2'>
                    {errors.state}
                  </span>
                )}
              </div>

              {/* Set as Default */}
              <div className='flex items-center gap-3 p-4 rounded-xl' style={{ background: 'var(--color-content-border)', border: '1px solid var(--color-content-border)' }}>
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
                  className='flex-1 text-[13px] font-medium cursor-pointer'
                  style={{ color: 'var(--color-content-text)' }}
                >
                  Set as default address
                </label>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSavingAddress}
                className='w-full h-[52px] rounded-lg text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200'
                style={{
                  background: isSavingAddress ? 'var(--color-content-border)' : 'var(--theme-btn-primary-bg)',
                  color: isSavingAddress ? 'var(--color-content-text-secondary)' : 'var(--theme-btn-primary-text)',
                }}
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
          <div className='rounded-2xl p-6 max-w-[400px] w-full shadow-2xl' style={{ background: 'var(--color-content-bg)', border: '1px solid var(--color-content-border)' }}>
            <h3 className='text-[18px] font-black mb-2' style={{ color: 'var(--color-content-text)' }}>
              Delete Address?
            </h3>
            <p className='text-[13px] mb-6' style={{ color: 'var(--color-content-text-secondary)' }}>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingAddress}
                className='flex-1 h-[46px] border rounded-lg text-[13px] font-bold hover:bg-white/10 transition-all disabled:opacity-50'
                style={{ background: 'var(--color-content-border)', borderColor: 'var(--color-content-border)', color: 'var(--color-content-text)' }}
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
