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
import Skeleton from '@/components/ui/Skeleton'

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
        await pushNotificationService.showLocalNotification(
          'Gadget Restore test notification',
          {
            body: 'Push notification display is working on this browser.',
          },
        )
        toast.success('Test push sent. Check your browser notifications.')
        return
      }

      const reasonMap = {
        customer_preference_disabled:
          'Push preference is disabled. Enable it first.',
        firebase_not_configured:
          'Backend Firebase credentials are not configured.',
        no_registered_devices:
          'This browser is not registered yet. Click Enable this device first.',
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
      <>
        {/* ── Mobile Skeleton ── */}
        <div className='lg:hidden min-h-screen bg-[var(--theme-bg)] pb-24 px-5 pt-6'>
          <Skeleton className='h-7 w-28 rounded-lg mb-6' />

          <div className='flex flex-col items-center text-center mb-6'>
            <Skeleton className='w-32 h-32 rounded-2xl mb-4' />
            <Skeleton className='h-5 w-40 rounded-lg mb-2' />
            <Skeleton className='h-4 w-48 rounded-md mb-3' />
          </div>

          <div className='space-y-6'>
            <div>
              <Skeleton className='h-3 w-28 rounded mb-3' />
              <div className='space-y-2'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className='h-[72px] w-full rounded-xl' />
                ))}
              </div>
            </div>

            <div>
              <Skeleton className='h-3 w-20 rounded mb-3' />
              <div className='space-y-2'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className='h-[72px] w-full rounded-xl' />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop Skeleton ── */}
        <div className='hidden lg:block min-h-[calc(100vh-var(--topbar-height))] bg-[var(--theme-bg)] px-6 py-8'>
          {/* Profile Card Header Skeleton */}
          <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 mb-6 shadow-sm flex items-start gap-6'>
            <Skeleton className='w-32 h-32 rounded-2xl' />
            <div className='flex-1 space-y-3 pt-2'>
              <Skeleton className='h-8 w-56 rounded-lg' />
              <Skeleton className='h-4 w-44 rounded-md' />
              <Skeleton className='h-[42px] w-32 rounded-lg mt-2' />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className='grid grid-cols-2 gap-6'>
            {/* Left Card */}
            <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm space-y-5'>
              <Skeleton className='h-6 w-36 rounded-lg mb-2' />
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-4 p-2'>
                    <Skeleton className='w-11 h-11 rounded-xl' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-32 rounded' />
                      <Skeleton className='h-3.5 w-48 rounded' />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card */}
            <div className='space-y-6'>
              <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm space-y-5'>
                <Skeleton className='h-6 w-44 rounded-lg mb-2' />
                <Skeleton className='h-4 w-full rounded-md' />
                <div className='space-y-3'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className='flex items-center gap-4 p-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl'
                    >
                      <Skeleton className='w-10 h-10 rounded-lg' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-24 rounded' />
                        <Skeleton className='h-3.5 w-32 rounded' />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton className='h-[54px] w-full rounded-2xl' />
            </div>
          </div>
        </div>
      </>
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
        </div>
      </div>

      {/* Content Grid - Desktop uses 2 columns, Mobile stacks vertically */}
      <div className='px-5 lg:px-6 pb-6 lg:grid lg:grid-cols-2 lg:gap-6'>
        {/* Account Settings */}
        <div className='mb-6 lg:mb-0 lg:bg-[var(--theme-card)] lg:rounded-2xl lg:border lg:border-[var(--theme-border)] lg:p-6 lg:shadow-sm'>
          <h3 className='text-[11px] lg:text-[18px] font-bold lg:font-extrabold text-[var(--theme-text-disabled)] lg:text-(--theme-text-primary) tracking-[0.1em] lg:tracking-normal uppercase lg:normal-case mb-3 lg:mb-5'>
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
                  Manage your name and email address
                </div>
              </div>
              <ChevronRight
                size={18}
                className='text-[var(--theme-text-disabled)] lg:w-5 lg:h-5'
              />
            </button>

            <button
              onClick={() => router.push('/profile/addresses')}
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] lg:bg-transparent border border-[var(--theme-border)] lg:border-0 rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] lg:active:scale-[0.99] transition-all group'
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
              className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] lg:bg-transparent border border-[var(--theme-border)] lg:border-0 rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] lg:active:scale-[0.99] transition-all group'
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

        {/* Support & Application */}
        <div className='lg:space-y-6'>
          {/* Mobile: Support Section */}
          <div className='lg:hidden mb-6'>
            <h3 className='text-[11px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-3'>
              Support
            </h3>
            <div className='space-y-2'>
              <a
                href={SUPPORT_WHATSAPP}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] transition-all group'
              >
                <div className='w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors'>
                  <MessageCircle size={18} className='text-green-500' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                    WhatsApp Chat
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className='text-[var(--theme-text-disabled)]'
                />
              </a>

              <a
                href={SUPPORT_PHONE}
                className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] transition-all group'
              >
                <div className='w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors'>
                  <Phone size={18} className='text-blue-500' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                    Phone Support
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className='text-[var(--theme-text-disabled)]'
                />
              </a>

              <a
                href={SUPPORT_EMAIL}
                className='w-full flex items-center gap-3 p-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) active:scale-[0.98] transition-all group'
              >
                <div className='w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors'>
                  <Mail size={18} className='text-purple-500' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                    Email Support
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className='text-[var(--theme-text-disabled)]'
                />
              </a>
            </div>
          </div>

          {/* Mobile: Application Section */}
          <div className='lg:hidden mb-6'>
            <h3 className='text-[11px] font-bold text-[var(--theme-text-disabled)] tracking-[0.1em] uppercase mb-3'>
              Application
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

          {/* Desktop: Support Card */}
          <div className='hidden lg:block bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm'>
            <h2 className='text-[18px] font-extrabold text-(--theme-text-primary) mb-5 flex items-center gap-2'>
              <MessageCircle
                size={20}
                className='text-[var(--theme-btn-primary-bg)]'
              />
              Customer Support
            </h2>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-6'>
              Have questions or need assistance with your repair? Reach out to
              us through any of the channels below.
            </p>
            <div className='space-y-3'>
              <a
                href={SUPPORT_WHATSAPP}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full flex items-center gap-4 p-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) hover:border-[var(--theme-border-strong)] active:scale-[0.99] transition-all group'
              >
                <div className='w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors'>
                  <MessageCircle size={20} className='text-green-500' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                    WhatsApp Chat
                  </div>
                  <div className='text-[12px] text-[var(--theme-text-secondary)]'>
                    Chat with our support team
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className='text-[var(--theme-text-disabled)]'
                />
              </a>

              <a
                href={SUPPORT_PHONE}
                className='w-full flex items-center gap-4 p-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) hover:border-[var(--theme-border-strong)] active:scale-[0.99] transition-all group'
              >
                <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors'>
                  <Phone size={20} className='text-blue-500' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                    Phone Number
                  </div>
                  <div className='text-[12px] text-[var(--theme-text-secondary)]'>
                    Call +91 99999 99999
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className='text-[var(--theme-text-disabled)]'
                />
              </a>

              <a
                href={SUPPORT_EMAIL}
                className='w-full flex items-center gap-4 p-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl hover:bg-(--theme-btn-secondary-hover) hover:border-[var(--theme-border-strong)] active:scale-[0.99] transition-all group'
              >
                <div className='w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors'>
                  <Mail size={20} className='text-purple-500' />
                </div>
                <div className='flex-1 text-left'>
                  <div className='text-[14px] font-semibold text-(--theme-text-primary)'>
                    Email Support
                  </div>
                  <div className='text-[12px] text-[var(--theme-text-secondary)]'>
                    support@gadgetrestore.in
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className='text-[var(--theme-text-disabled)]'
                />
              </a>
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
    </div>
  )
}
