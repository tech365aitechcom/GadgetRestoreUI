'use client'

import { useState, useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'
import {
  ArrowLeft,
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
  Locate,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import customerService from '@/services/customer.service'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

// AddressCard component with PropTypes validation
const AddressCard = ({ addr, selectedAddressId, setSelectedAddressId, handleSetDefault, handleEditAddress, setShowDeleteConfirm, getAddressIcon }) => {
  const isSelected = selectedAddressId === addr.id

  const handleAddressClick = () => {
    setSelectedAddressId(addr.id)
  }

  return (
    <div
      className={`w-full rounded-2xl p-5 mb-3 border transition-all`}
      style={{
        background: isSelected ? 'var(--color-content-card)' : 'var(--color-content-bg)',
        borderColor: isSelected ? 'var(--color-content-text)' : 'var(--color-content-border)',
        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <button
        onClick={handleAddressClick}
        type="button"
        aria-pressed={isSelected}
        className='flex items-start gap-4 cursor-pointer mb-3 w-full text-left border-none p-0 bg-transparent'
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
      </button>

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

AddressCard.propTypes = {
  addr: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    line1: PropTypes.string.isRequired,
    line2: PropTypes.string.isRequired,
    city: PropTypes.string,
    state: PropTypes.string,
    pincode: PropTypes.string,
    landmark: PropTypes.string,
    isDefault: PropTypes.bool,
    raw: PropTypes.object,
  }).isRequired,
  selectedAddressId: PropTypes.string,
  setSelectedAddressId: PropTypes.func.isRequired,
  handleSetDefault: PropTypes.func.isRequired,
  handleEditAddress: PropTypes.func.isRequired,
  setShowDeleteConfirm: PropTypes.func.isRequired,
  getAddressIcon: PropTypes.func.isRequired,
}

// Helper function to extract addresses array from API response
const extractAddressesFromResponse = (response) => {
  if (response?.data?.addresses && Array.isArray(response.data.addresses)) {
    return response.data.addresses
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response)) {
    return response
  }

  return []
}

// Helper function to map backend addresses to frontend format
const mapBackendAddresses = (addressesArray) => {
  return addressesArray.map((addr) => ({
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
}

// Helper function to auto-select default or first address
const getAutoSelectedAddressId = (addresses) => {
  const defaultAddr = addresses.find((a) => a.isDefault)
  if (defaultAddr) return defaultAddr.id

  if (addresses.length > 0) return addresses[0].id

  return null
}

// Helper function to fetch and map addresses from API
const fetchAndMapAddresses = async () => {
  const response = await customerService.getAddresses()
  const addressesArray = extractAddressesFromResponse(response)
  return mapBackendAddresses(addressesArray)
}

// Initial form state for new addresses
const getInitialAddressFormState = () => ({
  addressType: 'Home',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  pincode: '',
  city: '',
  state: '',
  setAsDefault: false,
})

// Helper to build address data payload for API
const buildAddressPayload = (addressForm) => ({
  address: {
    addressType: addressForm.addressType,
    addressLine1: addressForm.addressLine1,
    addressLine2: addressForm.addressLine2 || undefined,
    landmark: addressForm.landmark || undefined,
    pincode: addressForm.pincode,
    city: addressForm.city,
    state: addressForm.state,
  },
  setAsDefault: addressForm.setAsDefault,
})

// Helper to populate edit form from existing address
const populateEditForm = (address) => ({
  addressType: address.raw.addressType || 'Home',
  addressLine1: address.raw.addressLine1 || '',
  addressLine2: address.raw.addressLine2 || '',
  landmark: address.raw.landmark || '',
  pincode: address.raw.pincode || '',
  city: address.raw.city || '',
  state: address.raw.state || '',
  setAsDefault: address.isDefault || false,
})

// Individual field validators
const validateLine1 = (value) => {
  if (!value || value.trim().length < 5) {
    return 'Address line 1 must be at least 5 characters'
  }
  return null
}

const validatePincode = (value) => {
  if (!value || !/^\d{6}$/.test(value)) {
    return 'Pincode must be exactly 6 digits'
  }
  return null
}

const validateCity = (value) => {
  if (!value || value.trim().length < 2) {
    return 'City is required'
  }
  return null
}

const validateState = (value) => {
  if (!value || value.trim().length < 2) {
    return 'State is required'
  }
  return null
}

// Validation helper for individual address fields
const validateAddressField = (field, value) => {
  const validators = {
    addressLine1: validateLine1,
    pincode: validatePincode,
    city: validateCity,
    state: validateState,
  }

  const validator = validators[field]
  return validator ? validator(value) : null
}

// Validate entire address form
const validateAddressForm = (addressData) => {
  const errors = {}
  const fields = ['addressLine1', 'pincode', 'city', 'state']

  fields.forEach(field => {
    const error = validateAddressField(field, addressData[field])
    if (error) {
      errors[field] = error
    }
  })

  return errors
}

// Helper to load and auto-select addresses
const loadAndSelectAddresses = async (setAddresses, setSelectedAddressId, setIsLoading) => {
  const token = Cookies.get(TOKEN_COOKIE)
  if (!token) {
    setIsLoading(false)
    return
  }

  try {
    setIsLoading(true)
    const mappedAddresses = await fetchAndMapAddresses()
    setAddresses(mappedAddresses)

    const autoSelectedId = getAutoSelectedAddressId(mappedAddresses)
    if (autoSelectedId) {
      setSelectedAddressId(autoSelectedId)
    }
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    toast.error('Failed to load addresses')
  } finally {
    setIsLoading(false)
  }
}

// Helper to execute address deletion
const executeAddressDelete = async (addressId) => {
  await customerService.deleteAddress(addressId)
  toast.success('Address deleted successfully')
}

// Helper to refresh addresses after deletion
const refreshAfterDelete = async (setAddresses, setSelectedAddressId) => {
  const mappedAddresses = await fetchAndMapAddresses()
  setAddresses(mappedAddresses)

  const autoSelectedId = getAutoSelectedAddressId(mappedAddresses)
  if (autoSelectedId) {
    setSelectedAddressId(autoSelectedId)
  }
}

// Helper to update default address on server
const updateDefaultAddress = async (addressId) => {
  await customerService.updateAddress(addressId, { setAsDefault: true })
  toast.success('Default address updated')
}

// Helper to determine which address to select after save
const getPostSaveSelectedId = (isEditingAddress, mappedAddresses) => {
  if (isEditingAddress) return isEditingAddress

  if (mappedAddresses.length > 0) {
    return mappedAddresses[mappedAddresses.length - 1].id
  }

  return null
}

// Helper to save address (create or update)
const saveAddressToServer = async (isEditingAddress, addressData) => {
  if (isEditingAddress) {
    await customerService.updateAddress(isEditingAddress, addressData)
    toast.success('Address updated successfully')
  } else {
    await customerService.addAddress(addressData)
    toast.success('Address added successfully')
  }
}

// Helper to reset form state
const resetAddressForm = (setIsAddingNew, setIsEditingAddress, setNewAddress, setErrors) => {
  setIsAddingNew(false)
  setIsEditingAddress(null)
  setNewAddress(getInitialAddressFormState())
  setErrors({})
}

// Helper to perform delete operation
const performDelete = async (addressId, setAddresses, selectedAddressId, setSelectedAddressId) => {
  await executeAddressDelete(addressId)
  setAddresses((prev) => prev.filter((a) => a.id !== addressId))

  if (selectedAddressId === addressId) {
    setSelectedAddressId(null)
  }

  await refreshAfterDelete(setAddresses, setSelectedAddressId)
}

// Hook to delete an address
const useAddressDelete = (setAddresses, selectedAddressId, setSelectedAddressId) => {
  const [isDeletingAddress, setIsDeletingAddress] = useState(false)

  const handleDelete = async (addressId) => {
    if (isDeletingAddress) return

    setIsDeletingAddress(true)
    try {
      await performDelete(addressId, setAddresses, selectedAddressId, setSelectedAddressId)
    } catch (error) {
      console.error('Failed to delete address:', error)
      toast.error(error.message || 'Failed to delete address')
    }
    setIsDeletingAddress(false)
  }

  return { isDeletingAddress, handleDelete }
}

// Hook to set default address
const useSetDefaultAddress = (addresses, setAddresses) => {
  const handleSetDefault = async (addressId) => {
    const previousAddresses = [...addresses]

    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    )

    try {
      await updateDefaultAddress(addressId)
    } catch (error) {
      setAddresses(previousAddresses)
      console.error('Failed to set default address:', error)
      toast.error(error.message || 'Failed to update default address')
    }
  }

  return { handleSetDefault }
}

// Hook to load addresses
const useAddressLoader = (user) => {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  useEffect(() => {
    loadAndSelectAddresses(setAddresses, setSelectedAddressId, setIsLoading)
  }, [user])

  const refreshAddresses = async () => {
    const mappedAddresses = await fetchAndMapAddresses()
    setAddresses(mappedAddresses)
    return mappedAddresses
  }

  return {
    addresses,
    setAddresses,
    isLoading,
    selectedAddressId,
    setSelectedAddressId,
    refreshAddresses,
  }
}

// Custom hook to load and manage addresses
const useAddressManagement = (user) => {
  const {
    addresses,
    setAddresses,
    isLoading,
    selectedAddressId,
    setSelectedAddressId,
    refreshAddresses,
  } = useAddressLoader(user)

  const { isDeletingAddress, handleDelete } = useAddressDelete(
    setAddresses,
    selectedAddressId,
    setSelectedAddressId
  )

  const { handleSetDefault } = useSetDefaultAddress(addresses, setAddresses)

  return {
    addresses,
    setAddresses,
    isLoading,
    selectedAddressId,
    setSelectedAddressId,
    isDeletingAddress,
    handleDelete,
    handleSetDefault,
    refreshAddresses,
  }
}

export default function AddressPage() {
  const router = useRouter()
  const { setAddress } = useBooking()
  const { user } = useAuth()

  const {
    addresses,
    isLoading,
    selectedAddressId,
    setSelectedAddressId,
    isDeletingAddress,
    handleDelete,
    handleSetDefault,
    refreshAddresses,
  } = useAddressManagement(user)

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [newAddress, setNewAddress] = useState(getInitialAddressFormState())
  const [errors, setErrors] = useState({})

  // Leaflet Map State and References
  const [selectedLocationText, setSelectedLocationText] = useState('Select location on map')
  const mapDesktopRef = useRef(null)
  const mapMobileRef = useRef(null)
  const isDesktopProgrammaticMoveRef = useRef(false)
  const isMobileProgrammaticMoveRef = useRef(false)

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
      const data = await res.json()
      if (data) {
        const addr = data.address || {}
        const road = addr.road || addr.suburb || addr.neighbourhood || ''
        const city = addr.city || addr.town || addr.village || addr.county || ''
        let state = addr.state || addr.region || addr.state_district || ''
        if (!state && (city.toLowerCase().includes('delhi') || displayName.toLowerCase().includes('delhi'))) {
          state = 'Delhi'
        }
        const pincode = addr.postcode || ''
        const displayName = data.display_name || 'Selected Location'

        setNewAddress((prev) => ({
          ...prev,
          addressLine1: road ? `${road}, ${addr.suburb || ''}`.replace(/,\s*$/, '').slice(0, 100) : displayName.split(',').slice(0, 2).join(', ').slice(0, 100),
          city: city || prev.city,
          state: state || prev.state,
          pincode: pincode ? pincode.replace(/\D/g, '').slice(0, 6) : prev.pincode,
        }))

        setSelectedLocationText(displayName.split(',').slice(0, 3).join(', '))
      }
    } catch (e) {
      console.error('Reverse geocoding failed:', e)
    }
  }

  const geocodeAddressText = async (addressText) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&limit=1`)
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        isDesktopProgrammaticMoveRef.current = true
        isMobileProgrammaticMoveRef.current = true

        if (mapDesktopRef.current) {
          mapDesktopRef.current.setView([latitude, longitude], 16)
        }
        if (mapMobileRef.current) {
          mapMobileRef.current.setView([latitude, longitude], 16)
        }
      }
    } catch (e) {
      console.error('Forward geocoding failed:', e)
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      const onSuccess = (position) => {
        const { latitude, longitude } = position.coords

        isDesktopProgrammaticMoveRef.current = true
        isMobileProgrammaticMoveRef.current = true

        if (mapDesktopRef.current) {
          mapDesktopRef.current.setView([latitude, longitude], 16)
        }
        if (mapMobileRef.current) {
          mapMobileRef.current.setView([latitude, longitude], 16)
        }
        reverseGeocode(latitude, longitude)
      }

      const onError = (error) => {
        console.warn('Geolocation high accuracy failed, retrying with low accuracy...', error)
        // Fallback to low accuracy
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (err) => {
            console.error('Geolocation fallback failed:', err)
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000
          }
        )
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      })
    } else {
      toast.error('Geolocation is not supported by your browser.')
    }
  }

  const handleZoomIn = () => {
    if (mapDesktopRef.current) {
      mapDesktopRef.current.zoomIn()
    }
    if (mapMobileRef.current) {
      mapMobileRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapDesktopRef.current) {
      mapDesktopRef.current.zoomOut()
    }
    if (mapMobileRef.current) {
      mapMobileRef.current.zoomOut()
    }
  }

  // Initialize Map instances using dynamic leaflet import
  useEffect(() => {
    let mapDesktop = null
    let mapMobile = null
    let active = true

    const handleResize = () => {
      if (mapDesktopRef.current) {
        mapDesktopRef.current.invalidateSize()
      }
      if (mapMobileRef.current) {
        mapMobileRef.current.invalidateSize()
      }
    }

    const initMaps = async () => {
      try {
        const leafletModule = await import('leaflet')

        // Handle ES module vs CommonJS module exports
        const L = leafletModule.default || leafletModule
        if (!L || typeof L.map !== 'function') {
          console.error('Leaflet object L is invalid or does not have map function')
          return
        }

        if (!active) return

        const defaultLat = 28.6139
        const defaultLng = 77.2090

        const desktopMapEl = document.getElementById('map-desktop')
        if (desktopMapEl && !desktopMapEl._leaflet_id) {
          try {
            mapDesktop = L.map(desktopMapEl, {
              zoomControl: false,
              attributionControl: false,
            }).setView([defaultLat, defaultLng], 14)

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
              subdomains: 'abcd',
              maxZoom: 20,
            }).addTo(mapDesktop)

            mapDesktopRef.current = mapDesktop

            setTimeout(() => {
              if (mapDesktop && active) {
                mapDesktop.invalidateSize()
              }
            }, 250)

            mapDesktop.on('moveend', () => {
              const center = mapDesktop.getCenter()

              if (isDesktopProgrammaticMoveRef.current) {
                isDesktopProgrammaticMoveRef.current = false
                return
              }

              reverseGeocode(center.lat, center.lng)
              if (mapMobileRef.current) {
                const mobileCenter = mapMobileRef.current.getCenter()
                const diffLat = Math.abs(mobileCenter.lat - center.lat)
                const diffLng = Math.abs(mobileCenter.lng - center.lng)
                if (diffLat > 0.0001 || diffLng > 0.0001) {
                  isMobileProgrammaticMoveRef.current = true
                  mapMobileRef.current.setView(center, mapDesktop.getZoom(), { animate: false })
                }
              }
            })
          } catch (err) {
            console.error('Error initializing desktop map:', err)
          }
        }

        const mobileMapEl = document.getElementById('map-mobile')
        if (mobileMapEl && !mobileMapEl._leaflet_id) {
          try {
            mapMobile = L.map(mobileMapEl, {
              zoomControl: false,
              attributionControl: false,
            }).setView([defaultLat, defaultLng], 14)

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
              subdomains: 'abcd',
              maxZoom: 20,
            }).addTo(mapMobile)

            mapMobileRef.current = mapMobile

            setTimeout(() => {
              if (mapMobile && active) {
                mapMobile.invalidateSize()
              }
            }, 250)

            mapMobile.on('moveend', () => {
              const center = mapMobile.getCenter()

              if (isMobileProgrammaticMoveRef.current) {
                isMobileProgrammaticMoveRef.current = false
                return
              }

              reverseGeocode(center.lat, center.lng)
              if (mapDesktopRef.current) {
                const desktopCenter = mapDesktopRef.current.getCenter()
                const diffLat = Math.abs(desktopCenter.lat - center.lat)
                const diffLng = Math.abs(desktopCenter.lng - center.lng)
                if (diffLat > 0.0001 || diffLng > 0.0001) {
                  isDesktopProgrammaticMoveRef.current = true
                  mapDesktopRef.current.setView(center, mapMobile.getZoom(), { animate: false })
                }
              }
            })
          } catch (err) {
            console.error('Error initializing mobile map:', err)
          }
        }

        reverseGeocode(defaultLat, defaultLng)
      } catch (err) {
        console.error('Failed in initMaps:', err)
      }
    }

    initMaps()
    window.addEventListener('resize', handleResize)

    return () => {
      active = false
      window.removeEventListener('resize', handleResize)
      if (mapDesktop) {
        mapDesktop.remove()
        mapDesktopRef.current = null
      }
      if (mapMobile) {
        mapMobile.remove()
        mapMobileRef.current = null
      }
    }
  }, [isLoading])

  // Sync map center to selected saved address
  useEffect(() => {
    if (!selectedAddressId || !addresses.length) return
    const selected = addresses.find((a) => a.id === selectedAddressId)
    if (selected) {
      const fullText = `${selected.line1}, ${selected.line2}`
      geocodeAddressText(fullText)
    }
  }, [selectedAddressId, addresses])

  const resetFormAndSyncToMap = () => {
    setIsAddingNew(false)
    setIsEditingAddress(null)
    setErrors({})

    let lat = 28.6139
    let lng = 77.2090
    if (mapDesktopRef.current) {
      const center = mapDesktopRef.current.getCenter()
      lat = center.lat
      lng = center.lng
    } else if (mapMobileRef.current) {
      const center = mapMobileRef.current.getCenter()
      lat = center.lat
      lng = center.lng
    }
    reverseGeocode(lat, lng)
  }

  const handleAddNewAddress = async () => {
    const validationErrors = validateAddressForm(newAddress)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSavingAddress(true)

    try {
      const addressData = buildAddressPayload(newAddress)
      await saveAddressToServer(isEditingAddress, addressData)

      // Refresh and select address
      const mappedAddresses = await refreshAddresses()
      const newSelectedId = getPostSaveSelectedId(isEditingAddress, mappedAddresses)

      if (newSelectedId) {
        setSelectedAddressId(newSelectedId)
      }

      // Close modal and reset form
      resetFormAndSyncToMap()
    } catch (error) {
      console.error('Failed to save address:', error)
      toast.error(error.message || 'Failed to save address. Please try again.')
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleEditAddress = (address) => {
    setNewAddress(populateEditForm(address))
    setIsEditingAddress(address.id)
    setIsAddingNew(true)

    // Forward geocode to center the map on the edited address location
    const fullText = `${address.line1}, ${address.line2}`
    geocodeAddressText(fullText)
  }

  const handleDeleteAddress = async () => {
    await handleDelete(showDeleteConfirm)
    setShowDeleteConfirm(null)
  }

  const handleOpenAddressForm = () => {
    setNewAddress((prev) => ({
      ...prev,
      addressType: 'Home',
      addressLine2: '',
      landmark: '',
      setAsDefault: false,
    }))
    setErrors({})
    setIsEditingAddress(null)
    setIsAddingNew(true)
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

    setErrors((prev) => {
      if (!prev[field]) return prev
      return { ...prev, [field]: '' }
    })
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
      {/* Unified Responsive Layout */}
      <div className='min-h-[100svh] lg:min-h-[calc(100vh-var(--topbar-height))]' style={{ background: 'var(--theme-bg)' }}>
        <div className='lg:p-8 lg:flex lg:h-[calc(100vh-var(--topbar-height))]'>
          {/* Map Section - Desktop Only */}
          <div className='hidden lg:block lg:w-[55%] relative' style={{ background: 'var(--color-content-bg)' }}>
            <div id='map-desktop' className='absolute inset-0 w-full h-full z-0' />

            {/* Center Pin overlay */}
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-[500]'>
              <div className='relative flex flex-col items-center select-none'>
                {/* Floating Address Pill */}
                <div
                  className='mb-2 px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl border transition-all duration-300'
                  style={{
                    background: 'rgba(15, 15, 20, 0.85)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-4px)'
                  }}
                >
                  <MapPin size={14} className='text-[var(--color-accent)]' />
                  <span className='text-xs font-bold text-white tracking-wide max-w-[220px] truncate'>
                    {selectedLocationText}
                  </span>
                </div>

                {/* Pointer arrow */}
                <div
                  className='w-2.5 h-2.5 rotate-45 -mt-3.5 mb-2 border-r border-b'
                  style={{
                    background: 'rgba(15, 15, 20, 0.85)',
                    borderColor: 'rgba(255, 255, 255, 0.15)'
                  }}
                />

                {/* Pulsing Core Target */}
                <div className='relative flex items-center justify-center'>
                  <div className='w-3 h-3 rounded-full bg-[var(--color-accent)] z-20 shadow-lg border-2 border-white' />
                  <div className='absolute w-8 h-8 rounded-full bg-[var(--color-accent)]/35 animate-ping opacity-75 z-10' />
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className='absolute bottom-10 left-10 flex flex-col gap-3 z-[500]'>
              <button
                type='button'
                onClick={handleUseCurrentLocation}
                className='w-12 h-12 rounded-lg flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer shadow-xl'
                style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
                title='Use Current Location'
              >
                <Locate size={20} />
              </button>
              <div className='flex flex-col rounded-lg shadow-xl overflow-hidden' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                <button
                  type='button'
                  onClick={handleZoomIn}
                  className='w-12 h-12 flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer'
                  style={{ color: 'var(--color-content-text)', borderBottom: '1px solid var(--color-content-border)' }}
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
                <button
                  type='button'
                  onClick={handleZoomOut}
                  className='w-12 h-12 flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer'
                  style={{ color: 'var(--color-content-text)' }}
                >
                  <Minus size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section - Mobile Full Width, Desktop Right Side */}
          <div className='relative pb-[180px] lg:pb-0 lg:w-[45%] lg:p-12 lg:overflow-y-auto rounded-t-[30px] lg:rounded-none' style={{ background: 'var(--color-content-bg)', borderLeft: '0 lg:1px solid var(--color-content-border)' }}>
            {/* Header */}
            <div className='px-5 pt-6 pb-4 lg:px-0 lg:pt-0 lg:pb-12'>
              <h1 className='text-2xl lg:text-[42px] font-black tracking-tight uppercase lg:normal-case leading-tight lg:leading-none mb-1 lg:mb-3' style={{ color: 'var(--color-content-text)' }}>
                Select {typeof globalThis !== 'undefined' && !('ontouchstart' in globalThis) && 'Service '}Address
              </h1>
              <p className='text-sm lg:text-[15px] lg:max-w-[85%]' style={{ color: 'var(--color-content-text-secondary)' }}>
                <span className='lg:hidden'>Choose a convenient address for your repair.</span>
                <span className='hidden lg:inline'>Choose a saved location or add a new one for your technical service appointment.</span>
              </p>
            </div>

            {/* Map Preview - Mobile Only */}
            <div className='px-5 mb-8 lg:hidden'>
              <div className='w-full h-[180px] rounded-3xl overflow-hidden relative shadow-lg' style={{ background: 'var(--theme-bg)' }}>
                <div id='map-mobile' className='w-full h-full relative z-0' />

                {/* Center Pin overlay */}
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-[500]'>
                  <div className='relative flex items-center justify-center select-none'>
                    <div className='w-3 h-3 rounded-full bg-[var(--color-accent)] z-20 shadow-lg border-2 border-white' />
                    <div className='absolute w-8 h-8 rounded-full bg-[var(--color-accent)]/35 animate-ping opacity-75 z-10' />
                  </div>
                </div>

                {/* Floating Locate Button for Mobile */}
                <button
                  type='button'
                  onClick={handleUseCurrentLocation}
                  className='absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-[500] hover:opacity-90 active:scale-95 transition-all cursor-pointer'
                  style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
                  title='Use Current Location'
                >
                  <Locate size={16} />
                </button>
              </div>
            </div>

            {/* Addresses Section */}
            <div className='px-5 lg:px-0 mb-8 lg:mb-10'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-sm lg:text-[11px] font-bold lg:uppercase lg:tracking-[0.1em]' style={{ color: 'var(--color-content-text)' }}>
                  <span className='lg:hidden'>Saved Addresses</span>
                  <span className='hidden lg:inline' style={{ color: 'var(--color-content-text-secondary)' }}>SAVED ADDRESSES</span>
                </h3>
                <span className='text-[11px] font-bold uppercase tracking-wider lg:hidden' style={{ color: 'var(--color-content-text-secondary)' }}>
                  {addresses.length} LOCATIONS
                </span>
              </div>

              {addresses.length === 0 ? (
                <div className='text-center py-8 lg:py-12 rounded-2xl' style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)' }}>
                  <MapPin size={40} className='lg:w-12 lg:h-12 text-[#444] mx-auto mb-3 lg:mb-4' />
                  <p className='text-[14px] lg:text-[15px] mb-2' style={{ color: 'var(--color-content-text-secondary)' }}>
                    No saved addresses
                  </p>
                  <p className='text-[12px] lg:text-[13px]' style={{ color: 'var(--color-content-text-secondary)' }}>
                    Add your first address below
                  </p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    addr={addr}
                    selectedAddressId={selectedAddressId}
                    setSelectedAddressId={setSelectedAddressId}
                    handleSetDefault={handleSetDefault}
                    handleEditAddress={handleEditAddress}
                    setShowDeleteConfirm={setShowDeleteConfirm}
                    getAddressIcon={getAddressIcon}
                  />
                ))
              )}

              <button
                onClick={handleOpenAddressForm}
                className='w-full h-[60px] lg:h-16 rounded-2xl lg:rounded-xl flex items-center justify-center gap-2 lg:gap-3 font-bold text-[13px] lg:text-[14px] uppercase tracking-wide hover:opacity-80 mt-2 transition-colors'
                style={{ border: '1px lg:2px dashed var(--color-content-border)', color: 'var(--color-content-text-secondary)' }}
              >
                <Plus size={18} /> Add New Address
              </button>
            </div>

            {/* Delivery Notes */}
            <div className='px-5 lg:px-0 mb-8 lg:mb-10'>
              <label htmlFor='delivery-notes' className='text-[11px] font-bold uppercase tracking-wider lg:tracking-[0.1em] mb-3 lg:mb-4 block' style={{ color: 'var(--color-content-text-secondary)' }}>
                DELIVERY NOTES (OPTIONAL)
              </label>
              <textarea
                id='delivery-notes'
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder='Access codes, gate instructions...'
                className='w-full h-20 lg:h-24 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-[13px] lg:text-[14px] resize-none outline-none transition-all'
                style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
              />
            </div>

            {/* Confirm Button - Fixed on Mobile, Static on Desktop */}
            <div className='fixed lg:static left-0 right-0 p-5 lg:p-0 z-40 pointer-events-none lg:pointer-events-auto' style={{ bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(to top, var(--color-content-bg) 60%, transparent)' }}>
              <button
                onClick={handleConfirm}
                disabled={!selectedAddressId}
                className='w-full h-[50px] lg:h-[64px] rounded-[20px] text-sm lg:text-[15px] font-bold lg:font-black uppercase lg:tracking-[0.1em] flex items-center justify-center gap-2 lg:gap-3 shadow-xl active:scale-95 lg:active:scale-100 transition-transform lg:transition-colors pointer-events-auto cursor-pointer'
                style={{
                  background: selectedAddressId ? 'var(--theme-btn-primary-bg)' : 'var(--color-content-border)',
                  color: selectedAddressId ? 'var(--theme-btn-primary-text)' : 'var(--color-content-text-secondary)',
                }}
              >
                <span className='lg:hidden'>Confirm Address</span>
                <span className='hidden lg:inline'>CONFIRM ADDRESS</span>
                <ArrowLeft className='rotate-180' size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      {isAddingNew && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4'>
          <div className='rounded-2xl p-6 max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl' style={{ background: 'var(--color-content-bg)', border: '1px solid var(--color-content-border)' }}>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-[20px] font-black uppercase' style={{ color: 'var(--color-content-text)' }}>
                {isEditingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={resetFormAndSyncToMap}
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
              <fieldset>
                <legend className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  ADDRESS TYPE
                </legend>
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
              </fieldset>

              {/* Address Line 1 */}
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <label htmlFor='address-line-1' className='block text-[10px] font-bold tracking-[0.08em] uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                    ADDRESS LINE 1 *
                  </label>
                  <button
                    type='button'
                    onClick={handleUseCurrentLocation}
                    className='text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0'
                  >
                    <Locate size={12} /> Use Current Location
                  </button>
                </div>
                <input
                  id='address-line-1'
                  type='text'
                  value={newAddress.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value.slice(0, 100))}
                  className={`w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors`}
                  style={{
                    background: 'var(--color-content-card)',
                    border: errors.addressLine1 ? '1px solid var(--color-danger)' : '1px solid var(--color-content-border)',
                    color: 'var(--color-content-text)',
                  }}
                  placeholder='House/Flat no., Building name'
                  maxLength={100}
                />
                {errors.addressLine1 && (
                  <span className='block text-xs text-red-400 mt-2'>
                    {errors.addressLine1}
                  </span>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label htmlFor='address-line-2' className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  ADDRESS LINE 2
                </label>
                <input
                  id='address-line-2'
                  type='text'
                  value={newAddress.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value.slice(0, 200))}
                  className='w-full h-[52px] rounded-lg text-[15px] px-4 outline-none transition-colors'
                  style={{ background: 'var(--color-content-card)', border: '1px solid var(--color-content-border)', color: 'var(--color-content-text)' }}
                  placeholder='Road name, Area, Colony'
                  maxLength={200}
                />
              </div>

              {/* Landmark */}
              <div>
                <label htmlFor='address-landmark' className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  LANDMARK
                </label>
                <input
                  id='address-landmark'
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
                  <label htmlFor='address-pincode' className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                    PINCODE *
                  </label>
                  <input
                    id='address-pincode'
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
                  <label htmlFor='address-city' className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                    CITY *
                  </label>
                  <input
                    id='address-city'
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
                <label htmlFor='address-state' className='block text-[10px] font-bold tracking-[0.08em] mb-2 uppercase' style={{ color: 'var(--color-content-text-secondary)' }}>
                  STATE *
                </label>
                <input
                  id='address-state'
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
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1100] p-4'>
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
