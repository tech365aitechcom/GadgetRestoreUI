'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  MapPinned,
} from 'lucide-react'
import TopBar from '@/components/ui/TopBar'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import toast from 'react-hot-toast'
import customerService from '@/services/customer.service'

export default function AddressesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [addresses, setAddresses] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isDeletingAddress, setIsDeletingAddress] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      router.push('/login')
      return
    }

    fetchAddresses()
  }, [router])

  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
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

      // Map backend addresses to frontend format
      const mappedAddresses = addressesArray.map((addr) => ({
        id: addr._id,
        label: addr.addressType || 'Other',
        icon: getIconFromType(addr.addressType),
        name: addr.customerId?.fullName,
        street: [addr.addressLine1, addr.addressLine2, addr.landmark]
          .filter(Boolean)
          .join(', '),
        city: addr.city,
        state: addr.state,
        zipCode: addr.pincode,
        isDefault: addr.isDefault || false,
        raw: addr, // Keep raw data for editing
      }))

      setAddresses(mappedAddresses)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      toast.error('Failed to load addresses')
    } finally {
      setIsLoading(false)
    }
  }

  const getIconFromType = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return 'home'
      case 'work':
      case 'office':
        return 'work'
      default:
        return 'other'
    }
  }

  const handleAddAddress = () => {
    router.push('/profile/addresses/add')
  }

  const handleEditAddress = (addressId) => {
    router.push(`/profile/addresses/edit/${addressId}`)
  }

  const handleDeleteAddress = (addressId) => {
    setShowDeleteConfirm(addressId)
  }

  const confirmDelete = async () => {
    if (isDeletingAddress) return

    try {
      setIsDeletingAddress(true)
      await customerService.deleteAddress(showDeleteConfirm)

      // Remove from local state
      setAddresses((prev) => prev.filter((a) => a.id !== showDeleteConfirm))
      toast.success('Address deleted successfully')
      setShowDeleteConfirm(null)

      // Refresh to get updated default address
      await fetchAddresses()
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

  const getAddressIcon = (iconType) => {
    switch (iconType) {
      case 'home':
        return <Home size={18} />
      case 'work':
        return <Briefcase size={18} />
      default:
        return <MapPinned size={18} />
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--theme-bg)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-[var(--theme-border-strong)] border-t-white rounded-full animate-spin mx-auto mb-4' />
          <p className='text-[14px] text-[var(--theme-text-secondary)]'>
            Loading addresses...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='lg:hidden min-h-screen bg-[var(--theme-bg)] pb-24'>
        <TopBar title='My Addresses' />

        <div className='p-5'>
          {/* Add Address Button */}
          <button
            onClick={handleAddAddress}
            className='w-full h-[52px] bg-[var(--theme-btn-primary-bg)] hover:bg-neutral-100 text-[var(--theme-btn-primary-text)] rounded-lg text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 mb-5'
          >
            <Plus size={20} />
            <span>Add New Address</span>
          </button>

          {/* Addresses List */}
          <div className='space-y-3'>
            {addresses.map((address) => (
              <div
                key={address.id}
                className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--theme-text-secondary)]'>
                      {getAddressIcon(address.icon)}
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-[15px] font-bold text-[var(--theme-text-primary)]'>
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className='text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 tracking-wider'>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <span className='text-[12px] text-[var(--theme-text-tertiary)]'>
                        {address.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed mb-4'>
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                </div>

                <div className='flex gap-2'>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className='flex-1 h-[40px] bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] rounded-lg text-[12px] font-semibold hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address.id)}
                    className='flex-1 h-[40px] bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] rounded-lg text-[12px] font-semibold hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-2'
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className='h-[40px] px-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[12px] font-semibold hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && (
            <div className='text-center py-12'>
              <MapPin
                size={48}
                className='text-white/20 mx-auto mb-4'
                strokeWidth={1.5}
              />
              <p className='text-[15px] text-[var(--theme-text-tertiary)] mb-2'>
                No addresses saved yet
              </p>
              <p className='text-[13px] text-[var(--theme-placeholder)]'>
                Add an address for faster checkout
              </p>
            </div>
          )}
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
            <span className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
              Saved Addresses
            </span>
          </div>

          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-[24px] font-extrabold text-[var(--theme-text-primary)] mb-1'>
                Saved Addresses
              </h1>
              <p className='text-[13px] text-[var(--theme-text-secondary)]'>
                {addresses.length} active location
                {addresses.length !== 1 ? 's' : ''} for pick-up/drop-off
              </p>
            </div>
            <button
              onClick={handleAddAddress}
              className='btn-primary text-[13px] px-5 h-[46px] flex items-center gap-2'
            >
              <Plus size={18} />
              Add Address
            </button>
          </div>

          {/* Addresses Grid */}
          <div className='grid grid-cols-3 gap-4'>
            {addresses.map((address) => (
              <div
                key={address.id}
                className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[var(--theme-text-secondary)]'>
                      {getAddressIcon(address.icon)}
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-[16px] font-bold text-[var(--theme-text-primary)]'>
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className='text-[9px] font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 tracking-wider'>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <span className='text-[12px] text-[var(--theme-text-secondary)]'>
                        {address.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed mb-5'>
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                </div>

                <div className='flex gap-2'>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className='flex-1 h-[40px] bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] rounded-lg text-[12px] font-semibold hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address.id)}
                    className='flex-1 h-[40px] bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] rounded-lg text-[12px] font-semibold hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-2'
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className='h-[40px] px-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[12px] font-semibold hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && (
            <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-12 text-center shadow-sm'>
              <MapPin
                size={56}
                className='text-white/20 mx-auto mb-4'
                strokeWidth={1.5}
              />
              <p className='text-[16px] font-semibold text-[var(--theme-text-primary)] mb-2'>
                No addresses saved yet
              </p>
              <p className='text-[13px] text-[var(--theme-text-secondary)] mb-6'>
                Add an address for faster checkout and seamless device pick-up
              </p>
              <button
                onClick={handleAddAddress}
                className='btn-primary text-[13px] px-6 h-[46px] flex items-center gap-2 mx-auto'
              >
                <Plus size={18} />
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4'>
          <div className='bg-[var(--theme-card)] border border-[var(--theme-border-strong)] rounded-2xl p-6 max-w-[400px] w-full shadow-2xl'>
            <h3 className='text-[18px] font-extrabold text-[var(--theme-text-primary)] mb-2'>
              Delete Address?
            </h3>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-6'>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className='flex-1 h-[46px] bg-white/5 border border-[var(--theme-border-strong)] text-[var(--theme-text-primary)] rounded-lg text-[13px] font-bold hover:bg-[var(--theme-btn-secondary-hover)] transition-all'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='flex-1 h-[46px] bg-red-600 hover:bg-red-700 text-[var(--theme-text-primary)] rounded-lg text-[13px] font-bold transition-all'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
