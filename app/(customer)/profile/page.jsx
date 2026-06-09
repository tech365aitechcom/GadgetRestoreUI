'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  CreditCard,
  MapPin,
  Clock,
  Bell,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import {
  TOKEN_COOKIE,
  SUPPORT_WHATSAPP,
  SUPPORT_PHONE,
  SUPPORT_EMAIL,
} from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import customerService from '@/services/customer.service'
import notificationService from '@/services/notification.service'
import pushNotificationService from '@/services/push-notification.service'

export default function ProfilePage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: null,
    membershipType: 'MEMBER',
    totalRepairs: 0,
    repairsLastMonth: 0,
    currentStatus: 'No Active Orders',
    currentDevice: '',
    warrantyMonths: 0,
    warrantyExpiry: '',
    addressCount: 0,
  })

  const [notifications, setNotifications] = useState({
    whatsappNotifications: true,
    smsNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
  })

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true)
      const profile = await customerService.getProfile()

      // Map backend data to frontend state
      setUserData({
        name: profile.fullName || 'Guest User',
        email: profile.email || 'Not provided',
        phone: profile.mobile || '',
        profileImage: null,
        membershipType:
          profile.statistics?.totalOrders >= 5 ? 'PRO MEMBER' : 'MEMBER',
        totalRepairs: profile.statistics?.completedOrders || 0,
        repairsLastMonth: 0, // Calculate if needed
        currentStatus:
          profile.statistics?.totalOrders > profile.statistics?.completedOrders
            ? 'Active'
            : 'No Active Orders',
        currentDevice: '', // This would come from active order
        warrantyMonths: 6, // This would be calculated based on last order
        warrantyExpiry: 'Premium coverage',
        addressCount: profile.addresses?.length || 0,
      })

      // Set notification preferences
      if (profile.preferences) {
        setNotifications({
          whatsappNotifications:
            profile.preferences.whatsappNotifications ?? true,
          smsNotifications: profile.preferences.smsNotifications ?? true,
          emailNotifications: profile.preferences.emailNotifications ?? false,
          pushNotifications: profile.preferences.pushNotifications ?? true,
        })
      }
    } catch (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes('customer not found')
      ) {
        // Expected for new users, set default guest profile
        setUserData((prev) => ({
          ...prev,
          name: 'Guest User',
          email: 'Not provided',
          currentStatus: 'No Active Orders',
        }))
      } else {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check if user is authenticated
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      router.push('/login')
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async profile sync for this route
    fetchProfileData()
  }, [fetchProfileData, router])

  const handleLogout = () => {
    logout()
  }

  const handleToggleNotification = async (key) => {
    const newValue = !notifications[key]

    if (key === 'pushNotifications' && newValue) {
      try {
        await pushNotificationService.requestAndRegister()
      } catch (error) {
        toast.error(error.message || 'Push notifications could not be enabled')
        return
      }
    }

    // Optimistically update UI
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }))

    try {
      await customerService.updatePreferences({
        [key]: newValue,
      })
      if (key === 'pushNotifications' && !newValue) {
        try {
          await pushNotificationService.unregister()
        } catch (error) {
          console.warn('Push unregister failed:', error.message)
        }
      }
      toast.success('Notification preference updated')
    } catch (error) {
      // Revert on error
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }))
      toast.error('Failed to update preference')
    }
  }

  const handleRegisterBrowserPush = async () => {
    try {
      await pushNotificationService.requestAndRegister()
      await customerService.updatePreferences({ pushNotifications: true })
      setNotifications((prev) => ({
        ...prev,
        pushNotifications: true,
      }))
      toast.success('Browser push enabled for this device')
    } catch (error) {
      toast.error(error.message || 'Push notifications could not be enabled')
    }
  }

  const handleSendTestPush = async () => {
    try {
      const response = await notificationService.sendTestPush()
      const result = response.data || {}

      if (result.success) {
        await pushNotificationService.showLocalNotification('Gadget Restore test notification', {
          body: 'Push notification display is working on this browser.',
        })
        toast.success('Test push sent. Check your browser notifications.')
        return
      }

      const reasonMap = {
        customer_preference_disabled: 'Push preference is disabled. Enable it first.',
        firebase_not_configured: 'Backend Firebase credentials are not configured.',
        no_registered_devices: 'This browser is not registered yet. Click Enable this device first.',
      }
      toast.error(reasonMap[result.reason] || 'Test push was not sent.')
    } catch (error) {
      toast.error(error.message || 'Failed to send test push')
    }
  }

  const handleContactSupport = (method) => {
    switch (method) {
      case 'whatsapp':
        window.open(SUPPORT_WHATSAPP, '_blank')
        break
      case 'phone':
        window.location.href = SUPPORT_PHONE
        break
      case 'email':
        window.location.href = SUPPORT_EMAIL
        break
      default:
        break
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--theme-bg)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-[var(--theme-border-strong)] border-t-[var(--theme-text-primary)] rounded-full animate-spin mx-auto mb-4' />
          <p className='text-[14px] text-[var(--theme-text-secondary)]'>
            Loading profile...
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
      <div className='lg:hidden min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] pb-24'>
        {/* Profile Header */}
        <div className='px-5 pt-6 pb-4'>
          <h1 className='text-[22px] font-extrabold tracking-tight mb-6'>
            PROFILE
          </h1>

          {/* Profile Card */}
          <div className='flex flex-col items-center text-center mb-6'>
            <div className='relative mb-4'>
              <div className='w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--theme-border-strong)] to-[var(--theme-border)] border border-[var(--theme-border-strong)] flex items-center justify-center overflow-hidden'>
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User size={48} className='text-[var(--theme-placeholder)]' />
                )}
              </div>
              <button
                className='absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] flex items-center justify-center shadow-lg'
                aria-label='Edit profile picture'
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 14 14'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M10.5 1.5L12.5 3.5L4.5 11.5H2.5V9.5L10.5 1.5Z'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>

            <h2 className='text-[19px] font-bold mb-1'>{userData.name}</h2>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-3'>
              {userData.email}
            </p>

            <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border-strong)]'>
              <Shield
                size={12}
                className='text-[var(--theme-text-secondary)]'
              />
              <span className='text-[10px] font-bold tracking-wider'>
                {userData.membershipType}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-3 mb-6'>
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-3 text-center'>
              <div className='text-[22px] font-extrabold mb-0.5'>
                {userData.totalRepairs}
              </div>
              <div className='text-[9px] font-bold text-[var(--theme-text-disabled)] tracking-wider uppercase'>
                REPAIRS
              </div>
            </div>
            <div className='bg-[var(--theme-btn-primary-bg)] border border-[var(--theme-border)] rounded-xl p-3 text-center text-[var(--theme-btn-primary-text)]'>
              <div className='flex items-center justify-center mb-1'>
                <Clock
                  size={18}
                  className='text-[var(--theme-btn-primary-text)]'
                />
              </div>
              <div className='text-[9px] font-bold text-[var(--theme-btn-primary-text)] tracking-wider uppercase'>
                ACTIVE
              </div>
            </div>
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-3 text-center'>
              <div className='text-[22px] font-extrabold mb-0.5'>
                {userData.warrantyMonths}
                <span className='text-[14px]'>m</span>
              </div>
              <div className='text-[9px] font-bold text-[var(--theme-text-disabled)] tracking-wider uppercase'>
                WARRANTY
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className='px-5 pb-6'>
          <h3 className='text-[11px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-3'>
            ACCOUNT SETTINGS
          </h3>
          <div className='space-y-2'>
            <button
              onClick={() => router.push('/profile/personal-info')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center flex-shrink-0'>
                <User
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>
                  Personal Information
                </div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button>

            {/* <button
              onClick={() => router.push('/profile/payment-methods')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0'>
                <CreditCard
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>Payment Methods</div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button> */}

            <button
              onClick={() => router.push('/profile/addresses')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center flex-shrink-0'>
                <MapPin
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>My Addresses</div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button>

            <button
              onClick={() => router.push('/orders')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center flex-shrink-0'>
                <Clock
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>Order History</div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button>
          </div>
        </div>

        {/* Application */}
        <div className='px-5 pb-6'>
          <h3 className='text-[11px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-3'>
            APPLICATION
          </h3>
          <div className='space-y-2'>
            <button
              onClick={() => router.push('/notifications')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center flex-shrink-0'>
                <Bell
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>Notifications</div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button>

            {/* <button
              onClick={() => router.push('/profile/security')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center flex-shrink-0'>
                <Shield
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>
                  Security & Privacy
                </div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button>

            <button
              onClick={() => router.push('/profile/support')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center flex-shrink-0'>
                <MessageCircle
                  size={18}
                  className='text-[var(--theme-text-secondary)]'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold'>Help & Support</div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)]'
              />
            </button> */}

            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 active:scale-[0.98] transition-all'
            >
              <div className='w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0'>
                <LogOut size={18} className='text-red-500' />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold text-red-500'>
                  Logout
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}

      <div className='hidden lg:block p-6'>
        {/* Desktop Profile Header */}
        <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 mb-6 shadow-sm'>
          <div className='flex items-start gap-6'>
            {/* Profile Image */}
            <div className='relative'>
              <div className='w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--theme-border-strong)] to-[var(--theme-border)] flex items-center justify-center overflow-hidden border border-[var(--theme-border-strong)]'>
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User size={56} className='text-[var(--theme-placeholder)]' />
                )}
              </div>
              <button
                className='absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] flex items-center justify-center shadow-lg hover:bg-[var(--theme-btn-primary-hover)] transition-colors'
                aria-label='Edit profile picture'
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12 2L14 4L5 13H3V11L12 2Z'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>

            {/* Profile Info */}
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-[28px] font-extrabold text-[var(--theme-text-primary)]'>
                  {userData.name}
                </h1>
                <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border-strong)]'>
                  <Shield
                    size={12}
                    className='text-[var(--theme-text-secondary)]'
                  />
                  <span className='text-[10px] font-bold tracking-wider text-[var(--theme-text-primary)]'>
                    {userData.membershipType}
                  </span>
                </div>
              </div>
              <p className='text-[15px] text-[var(--theme-text-secondary)] mb-4'>
                {userData.email}
              </p>

              <div className='flex gap-4'>
                <button
                  className='btn-primary text-[13px] px-5 h-[42px]'
                  onClick={() => router.push('/profile/personal-info')}
                >
                  Edit Profile
                </button>
                {/* <button className='btn-secondary text-[13px] px-5 h-[42px]'>
                  Security Log
                </button> */}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className='flex gap-4 mt-8 pt-6 border-t border-[var(--theme-border)]'>
            <div className='flex-1 bg-[var(--theme-card-darker)] rounded-xl p-5 border border-[var(--theme-border)]'>
              <div className='text-[10px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-2'>
                TOTAL REPAIRS
              </div>
              <div className='text-[32px] font-extrabold text-[var(--theme-text-primary)]'>
                {userData.totalRepairs}
              </div>
              <div className='text-[12px] text-[var(--theme-text-secondary)] mt-1'>
                +{userData.repairsLastMonth} from last month
              </div>
            </div>

            <div className='flex-1 bg-[var(--theme-btn-primary-bg)] rounded-xl p-5 border border-[var(--theme-border)] relative overflow-hidden text-[var(--theme-btn-primary-text)]'>
              <div className='absolute inset-0 bg-gradient-to-br from-black/5 to-transparent' />
              <div className='relative'>
                <div className='text-[10px] font-bold text-[var(--theme-btn-primary-text)] tracking-[0.1em] uppercase mb-2'>
                  CURRENT STATUS
                </div>
                <div className='text-[24px] font-extrabold text-[var(--theme-btn-primary-text)] mb-1'>
                  {userData.currentStatus}
                </div>
                <div className='text-[12px] text-[var(--theme-btn-primary-text)]'>
                  {userData.currentDevice}
                </div>
              </div>
            </div>

            <div className='flex-1 bg-[var(--theme-card-darker)] rounded-xl p-5 border border-[var(--theme-border)]'>
              <div className='text-[10px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-2'>
                WARRANTY COVERAGE
              </div>
              <div className='text-[32px] font-extrabold text-[var(--theme-text-primary)]'>
                {userData.warrantyMonths}m
              </div>
              <div className='text-[12px] text-[var(--theme-text-secondary)] mt-1'>
                {userData.warrantyExpiry}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Content Grid */}
        <div className='grid grid-cols-2 gap-6'>
          {/* Account Settings */}
          <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm'>
            <h2 className='text-[18px] font-extrabold text-[var(--theme-text-primary)] mb-5'>
              Account Settings
            </h2>
            <div className='space-y-2'>
              <button
                onClick={() => router.push('/profile/personal-info')}
                className='w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all group'
              >
                <div className='w-11 h-11 rounded-xl bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center group-hover:bg-[var(--theme-btn-secondary-hover)] transition-colors'>
                  <User
                    size={20}
                    className='text-[var(--theme-text-secondary)]'
                  />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-[var(--theme-text-primary)]'>
                    Personal Information
                  </div>
                  <div className='text-[12px] text-[var(--theme-text-secondary)]'>
                    Manage your name, email, and biometric data
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className='text-[var(--theme-text-disabled)]'
                />
              </button>

              <button
                onClick={() => router.push('/profile/addresses')}
                className='w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all group'
              >
                <div className='w-11 h-11 rounded-xl bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center group-hover:bg-[var(--theme-btn-secondary-hover)] transition-colors'>
                  <MapPin
                    size={20}
                    className='text-[var(--theme-text-secondary)]'
                  />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-[var(--theme-text-primary)]'>
                    Saved Addresses
                  </div>
                  <div className='text-[12px] text-[var(--theme-text-secondary)]'>
                    {userData.addressCount} active location
                    {userData.addressCount !== 1 ? 's' : ''} for
                    pick-up/drop-off
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className='text-[var(--theme-text-disabled)]'
                />
              </button>

              <button
                onClick={() => router.push('/orders')}
                className='w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all group'
              >
                <div className='w-11 h-11 rounded-xl bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center group-hover:bg-[var(--theme-btn-secondary-hover)] transition-colors'>
                  <Clock
                    size={20}
                    className='text-[var(--theme-text-secondary)]'
                  />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-[var(--theme-text-primary)]'>
                    Order History
                  </div>
                  <div className='text-[12px] text-[var(--theme-text-secondary)]'>
                    View past invoices and repair reports
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className='text-[var(--theme-text-disabled)]'
                />
              </button>
            </div>
          </div>

          {/* App Settings & Support */}
          <div className='space-y-6'>
            {/* Notifications */}
            <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm'>
              <h2 className='text-[18px] font-extrabold text-[var(--theme-text-primary)] mb-5 flex items-center gap-2'>
                <Bell size={20} />
                Notifications
              </h2>
              <div className='space-y-4 mb-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
                      WhatsApp Notifications
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleNotification('whatsappNotifications')
                    }
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      notifications.whatsappNotifications
                        ? 'bg-[var(--theme-btn-primary-bg)]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                        notifications.whatsappNotifications
                          ? 'translate-x-6 bg-black'
                          : 'translate-x-1 bg-[var(--theme-btn-primary-bg)]'
                      }`}
                    />
                  </button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
                      SMS Notifications
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('smsNotifications')}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      notifications.smsNotifications
                        ? 'bg-[var(--theme-btn-primary-bg)]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                        notifications.smsNotifications
                          ? 'translate-x-6 bg-black'
                          : 'translate-x-1 bg-[var(--theme-btn-primary-bg)]'
                      }`}
                    />
                  </button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
                      Email Notifications
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleNotification('emailNotifications')
                    }
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      notifications.emailNotifications
                        ? 'bg-[var(--theme-btn-primary-bg)]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                        notifications.emailNotifications
                          ? 'translate-x-6 bg-black'
                          : 'translate-x-1 bg-[var(--theme-btn-primary-bg)]'
                      }`}
                    />
                  </button>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-[13px] font-semibold text-[var(--theme-text-primary)]'>
                      Push Notifications
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleNotification('pushNotifications')
                    }
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      notifications.pushNotifications
                        ? 'bg-[var(--theme-btn-primary-bg)]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                        notifications.pushNotifications
                          ? 'translate-x-6 bg-black'
                          : 'translate-x-1 bg-[var(--theme-btn-primary-bg)]'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4'>
                <button
                  type='button'
                  onClick={handleRegisterBrowserPush}
                  className='rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-[13px] font-semibold text-[var(--theme-text-primary)] hover:bg-white/15 transition-colors'
                >
                  Enable this device
                </button>
                <button
                  type='button'
                  onClick={handleSendTestPush}
                  className='rounded-xl bg-[var(--theme-btn-primary-bg)] px-4 py-3 text-[13px] font-semibold text-[var(--theme-btn-primary-text)] hover:opacity-90 transition-opacity'
                >
                  Send test push
                </button>
              </div>
              <div className='space-y-2'>
                <button
                  onClick={() => handleContactSupport('whatsapp')}
                  className='w-full flex items-center gap-3 p-4 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border-strong)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all'
                >
                  <div className='w-10 h-10 rounded-xl bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center'>
                    <MessageCircle
                      size={20}
                      className='text-[var(--theme-text-primary)]'
                    />
                  </div>
                  <div className='flex-1 text-left'>
                    <div className='text-[13px] font-semibold'>
                      Live Assistant
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className='text-[var(--theme-text-disabled)]'
                  />
                </button>

                <button
                  onClick={() => handleContactSupport('phone')}
                  className='w-full flex items-center gap-3 p-4 bg-[var(--theme-btn-secondary-bg)] border border-[var(--theme-border-strong)] rounded-xl hover:bg-[var(--theme-btn-secondary-hover)] active:scale-[0.99] transition-all'
                >
                  <div className='w-10 h-10 rounded-xl bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center'>
                    <Phone
                      size={20}
                      className='text-[var(--theme-text-primary)]'
                    />
                  </div>
                  <div className='flex-1 text-left'>
                    <div className='text-[13px] font-semibold'>Help Center</div>
                  </div>
                  <ChevronRight
                    size={18}
                    className='text-[var(--theme-text-disabled)]'
                  />
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className='w-full bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-red-500 font-bold text-[13px] hover:bg-red-500/10 active:scale-[0.99] transition-all shadow-sm'
            >
              Sign Out of Precision Portal
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
