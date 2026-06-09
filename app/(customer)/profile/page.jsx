'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    // Check if user is authenticated
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      router.push('/login')
      return
    }

    fetchProfileData()
  }, [router])

  const fetchProfileData = async () => {
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
  }

  const handleLogout = () => {
    logout()
  }

  const handleToggleNotification = async (key) => {
    const newValue = !notifications[key]

    // Optimistically update UI
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }))

    try {
      await customerService.updatePreferences({
        [key]: newValue,
      })
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
          <div className='w-12 h-12 border-3 border-(--theme-border-strong) border-t-[var(--theme-text-primary)] rounded-full animate-spin mx-auto mb-4' />
          <p className='text-[14px] text-[var(--theme-text-secondary)]'>
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[var(--theme-bg)] text-(--theme-text-primary) pb-24 lg:pb-6'>
      {/* Profile Header */}
      <div className='px-5 lg:px-6 pt-6 pb-4 lg:pb-6'>
        <h1 className='text-[22px] font-extrabold tracking-tight mb-6 lg:hidden'>
          PROFILE
        </h1>

        {/* Desktop Profile Card */}
        <div className='hidden lg:block bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 mb-6 shadow-sm'>
          <div className='flex items-start gap-6'>
            {/* Profile Image */}
            <div className='w-32 h-32 rounded-2xl bg-linear-to-br from-(--theme-border-strong) to-(--theme-border) flex items-center justify-center overflow-hidden border border-(--theme-border-strong)'>
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt={userData.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <svg
                  width='64'
                  height='64'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='text-(--theme-placeholder)'
                >
                  <circle
                    cx='12'
                    cy='8'
                    r='4'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                  />
                  <path
                    d='M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                  />
                </svg>
              )}
            </div>

            {/* Profile Info */}
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-[28px] font-extrabold text-(--theme-text-primary)'>
                  {userData.name}
                </h1>
                {/* <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--theme-btn-secondary-bg) border border-(--theme-border-strong)'>
                  <Shield
                    size={12}
                    className='text-[var(--theme-text-secondary)]'
                  />
                  <span className='text-[10px] font-bold tracking-wider text-(--theme-text-primary)'>
                    {userData.membershipType}
                  </span>
                </div> */}
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
              </div>
            </div>
          </div>

          {/* Stats Row - Desktop */}
          <div className='flex gap-4 mt-8 pt-6 border-t border-[var(--theme-border)]'>
            <div className='flex-1 bg-[var(--theme-card-darker)] rounded-xl p-5 border border-[var(--theme-border)]'>
              <div className='text-[10px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-2'>
                TOTAL REPAIRS
              </div>
              <div className='text-[32px] font-extrabold text-(--theme-text-primary)'>
                {userData.totalRepairs}
              </div>
              <div className='text-[12px] text-[var(--theme-text-secondary)] mt-1'>
                +{userData.repairsLastMonth} from last month
              </div>
            </div>

            <div className='flex-1 bg-(--theme-btn-primary-bg) rounded-xl p-5 border border-[var(--theme-border)] relative overflow-hidden text-[var(--theme-btn-primary-text)]'>
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
              <div className='text-[32px] font-extrabold text-(--theme-text-primary)'>
                {userData.warrantyMonths}m
              </div>
              <div className='text-[12px] text-[var(--theme-text-secondary)] mt-1'>
                {userData.warrantyExpiry}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Profile Card */}
        <div className='lg:hidden flex flex-col items-center text-center mb-6'>
          <div className='w-32 h-32 rounded-2xl bg-linear-to-br from-(--theme-border-strong) to-(--theme-border) border border-(--theme-border-strong) flex items-center justify-center overflow-hidden mb-4'>
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt={userData.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <svg
                width='56'
                height='56'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='text-(--theme-placeholder)'
              >
                <circle
                  cx='12'
                  cy='8'
                  r='4'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <path
                  d='M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
            )}
          </div>

          <h2 className='text-[19px] font-bold mb-1'>{userData.name}</h2>
          <p className='text-[13px] text-[var(--theme-text-secondary)] mb-3'>
            {userData.email}
          </p>

          {/* <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--theme-btn-secondary-bg) border border-(--theme-border-strong)'>
            <Shield size={12} className='text-[var(--theme-text-secondary)]' />
            <span className='text-[10px] font-bold tracking-wider'>
              {userData.membershipType}
            </span>
          </div> */}
        </div>

        {/* Stats - Mobile */}
        <div className='lg:hidden grid grid-cols-3 gap-3 mb-6'>
          <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-3 text-center'>
            <div className='text-[22px] font-extrabold mb-0.5'>
              {userData.totalRepairs}
            </div>
            <div className='text-[9px] font-bold text-[var(--theme-text-disabled)] tracking-wider uppercase'>
              REPAIRS
            </div>
          </div>
          <div className='bg-(--theme-btn-primary-bg) border border-[var(--theme-border)] rounded-xl p-3 text-center text-[var(--theme-btn-primary-text)]'>
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

      {/* Content Grid - Desktop uses 2 columns, Mobile stacks vertically */}
      <div className='px-5 lg:px-6 pb-6 lg:grid lg:grid-cols-2 lg:gap-6'>
        {/* Account Settings */}
        <div className='mb-6 lg:mb-0 lg:bg-[var(--theme-card)] lg:rounded-2xl lg:border lg:border-[var(--theme-border)] lg:p-6 lg:shadow-sm'>
          <h3 className='text-[11px] lg:text-[18px] font-bold lg:font-extrabold text-[var(--theme-text-disabled)] lg:text-(--theme-text-primary) tracking-[0.1em] lg:tracking-normal uppercase lg:normal-case mb-3 lg:mb-5'>
            {' '}
            Account Settings
          </h3>
          <div className='space-y-2'>
            <button
              onClick={() => router.push('/profile/personal-info')}
              className='w-full flex items-center gap-3 lg:gap-4 p-4 bg-[var(--theme-card)] lg:bg-transparent border border-[var(--theme-border)] lg:border-0 rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] lg:active:scale-[0.99] transition-all group'
            >
              <div className='w-9 h-9 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl bg-(--theme-btn-secondary-bg) flex items-center justify-center shrink-0 group-hover:bg-(--theme-btn-secondary-hover) transition-colors'>
                <User
                  size={18}
                  className='text-[var(--theme-text-secondary)] lg:w-5 lg:h-5'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                  Personal Information
                </div>
                <div className='hidden lg:block text-[12px] text-[var(--theme-text-secondary)]'>
                  Manage your name, email, and biometric data
                </div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)] lg:w-5 lg:h-5'
              />
            </button>

            <button
              onClick={() => router.push('/profile/addresses')}
              className='w-full flex items-center gap-3 lg:gap-4 p-4 bg-[var(--theme-card)] lg:bg-transparent border border-[var(--theme-border)] lg:border-0 rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] lg:active:scale-[0.99] transition-all group'
            >
              <div className='w-9 h-9 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl bg-(--theme-btn-secondary-bg) flex items-center justify-center shrink-0 group-hover:bg-(--theme-btn-secondary-hover) transition-colors'>
                <MapPin
                  size={18}
                  className='text-[var(--theme-text-secondary)] lg:w-5 lg:h-5'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                  <span className='lg:hidden'>My Addresses</span>
                  <span className='hidden lg:inline'>Saved Addresses</span>
                </div>
                <div className='hidden lg:block text-[12px] text-[var(--theme-text-secondary)]'>
                  {userData.addressCount} active location
                  {userData.addressCount !== 1 ? 's' : ''} for pick-up/drop-off
                </div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)] lg:w-5 lg:h-5'
              />
            </button>

            <button
              onClick={() => router.push('/orders')}
              className='w-full flex items-center gap-3 lg:gap-4 p-4 bg-[var(--theme-card)] lg:bg-transparent border border-[var(--theme-border)] lg:border-0 rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] lg:active:scale-[0.99] transition-all group'
            >
              <div className='w-9 h-9 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl bg-(--theme-btn-secondary-bg) flex items-center justify-center shrink-0 group-hover:bg-(--theme-btn-secondary-hover) transition-colors'>
                <Clock
                  size={18}
                  className='text-[var(--theme-text-secondary)] lg:w-5 lg:h-5'
                />
              </div>
              <div className='flex-1 text-left'>
                <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                  Order History
                </div>
                <div className='hidden lg:block text-[12px] text-[var(--theme-text-secondary)]'>
                  View past invoices and repair reports
                </div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)] lg:w-5 lg:h-5'
              />
            </button>
          </div>
        </div>

        {/* Notifications & Support - Desktop in card, Mobile simple */}
        <div className='lg:space-y-6'>
          {/* Mobile: Notifications Link */}
          <div className='lg:hidden mb-6'>
            <h3 className='text-[11px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-3'>
              APPLICATION
            </h3>
            <div className='space-y-2'>
              <button
                onClick={() => router.push('/notifications')}
                className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] transition-all'
              >
                <div className='w-9 h-9 rounded-lg bg-(--theme-btn-secondary-bg) flex items-center justify-center shrink-0'>
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

              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 active:scale-[0.98] transition-all'
              >
                <div className='w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0'>
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

          {/* Desktop: Notifications Card */}
          <div className='hidden lg:block bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm'>
            <h2 className='text-[18px] font-extrabold text-(--theme-text-primary) mb-5 flex items-center gap-2'>
              <Bell size={20} />
              Notifications
            </h2>
            <div className='space-y-4 mb-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[13px] font-semibold text-(--theme-text-primary)'>
                    WhatsApp Notifications
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggleNotification('whatsappNotifications')
                  }
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.whatsappNotifications
                      ? 'bg-(--theme-btn-primary-bg)'
                      : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                      notifications.whatsappNotifications
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-(--theme-btn-primary-bg)'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[13px] font-semibold text-(--theme-text-primary)'>
                    SMS Notifications
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('smsNotifications')}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.smsNotifications
                      ? 'bg-(--theme-btn-primary-bg)'
                      : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                      notifications.smsNotifications
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-(--theme-btn-primary-bg)'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[13px] font-semibold text-(--theme-text-primary)'>
                    Email Notifications
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('emailNotifications')}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.emailNotifications
                      ? 'bg-(--theme-btn-primary-bg)'
                      : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                      notifications.emailNotifications
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-(--theme-btn-primary-bg)'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[13px] font-semibold text-(--theme-text-primary)'>
                    Push Notifications
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('pushNotifications')}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.pushNotifications
                      ? 'bg-(--theme-btn-primary-bg)'
                      : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
                      notifications.pushNotifications
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-(--theme-btn-primary-bg)'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className='space-y-2'>
              <button
                onClick={() => handleContactSupport('whatsapp')}
                className='w-full flex items-center gap-3 p-4 bg-(--theme-btn-secondary-bg) border border-(--theme-border-strong) rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.99] transition-all'
              >
                <div className='w-10 h-10 rounded-xl bg-(--theme-btn-secondary-bg) flex items-center justify-center'>
                  <MessageCircle
                    size={20}
                    className='text-(--theme-text-primary)'
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
                className='w-full flex items-center gap-3 p-4 bg-(--theme-btn-secondary-bg) border border-(--theme-border-strong) rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.99] transition-all'
              >
                <div className='w-10 h-10 rounded-xl bg-(--theme-btn-secondary-bg) flex items-center justify-center'>
                  <Phone size={20} className='text-(--theme-text-primary)' />
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

          {/* Desktop: Logout Button */}
          <button
            onClick={handleLogout}
            className='hidden lg:block w-full bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-red-500 font-bold text-[13px] hover:bg-red-500/10 active:scale-[0.99] transition-all shadow-sm'
          >
            Sign Out of Precision Portal
          </button>
        </div>
      </div>
    </div>
  )
}
