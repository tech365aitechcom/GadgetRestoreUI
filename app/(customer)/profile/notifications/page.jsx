'use client'

import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/navigation'
import { Bell, MessageSquare, Mail, Smartphone } from 'lucide-react'
import TopBar from '@/components/ui/TopBar'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import toast from 'react-hot-toast'
import customerService from '@/services/customer.service'
import pushNotificationService from '@/services/push-notification.service'
import notificationService from '@/services/notification.service'

const NOTIFICATION_TYPES = [
  {
    key: 'whatsappNotifications',
    icon: MessageSquare,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
    title: 'WhatsApp Notifications',
    mobileDesc: 'Receive order updates and repair status via WhatsApp',
    desktopDesc: 'Receive order updates, repair status, and delivery notifications via WhatsApp'
  },
  {
    key: 'smsNotifications',
    icon: Smartphone,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    title: 'SMS Notifications',
    mobileDesc: 'Get text messages for important updates and confirmations',
    desktopDesc: 'Get important updates and confirmations via text message to your registered mobile number'
  },
  {
    key: 'emailNotifications',
    icon: Mail,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    title: 'Email Notifications',
    mobileDesc: 'Receive detailed repair reports and invoices via email',
    desktopDesc: 'Receive detailed repair reports, invoices, and warranty information via email'
  },
  {
    key: 'pushNotifications',
    icon: Bell,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    title: 'Push Notifications',
    mobileDesc: 'Get instant alerts on your device for real-time updates',
    desktopDesc: 'Get instant push alerts on your device for real-time repair status updates'
  }
]

const MobileToggle = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-3 ${
      checked ? 'bg-[var(--theme-toggle-bg-on)]' : 'bg-[var(--theme-toggle-bg-off)]'
    }`}
  >
    <div
      className={`absolute w-5 h-5 bg-[var(--theme-toggle-thumb)] rounded-full top-1 transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)
MobileToggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

const DesktopToggle = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-12 h-7 rounded-full transition-colors ${
      checked ? 'bg-[var(--theme-toggle-bg-on)]' : 'bg-white/10'
    }`}
  >
    <div
      className={`absolute w-5 h-5 rounded-full top-1 transition-transform ${
        checked ? 'translate-x-6 bg-black' : 'translate-x-1 bg-[var(--theme-btn-primary-bg)]'
      }`}
    />
  </button>
)
DesktopToggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

const MobileNotificationItem = ({ icon: Icon, iconColor, iconBg, title, description, checked, onChange }) => (
  <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4'>
    <div className='flex items-start justify-between mb-3'>
      <div className='flex items-start gap-3 flex-1'>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className='flex-1'>
          <div className='text-[14px] font-semibold text-[var(--theme-text-primary)] mb-1'>
            {title}
          </div>
          <div className='text-[12px] text-[var(--theme-text-tertiary)] leading-relaxed'>
            {description}
          </div>
        </div>
      </div>
      <MobileToggle checked={checked} onChange={onChange} />
    </div>
  </div>
)
MobileNotificationItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  iconBg: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

const DesktopNotificationItem = ({ icon: Icon, iconColor, iconBg, title, description, checked, onChange, children }) => (
  <div className='flex items-start gap-4 p-5 bg-white/[0.03] border border-[var(--theme-border-strong)] rounded-xl'>
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div className='flex-1'>
      <div className='flex items-center justify-between mb-2'>
        <div className='text-[15px] font-semibold text-[var(--theme-text-primary)]'>
          {title}
        </div>
        <DesktopToggle checked={checked} onChange={onChange} />
      </div>
      <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed'>
        {description}
      </div>
      {children}
    </div>
  </div>
)
DesktopNotificationItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  iconBg: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
}

const disablePushNotifications = async () => {
  try {
    await pushNotificationService.unregister()
  } catch (error) {
    console.warn('Push unregister failed silently:', error)
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState({
    whatsappNotifications: true,
    smsNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
  })

  const fetchNotificationPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      const profile = await customerService.getProfile()

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
      console.error('Failed to fetch preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      router.push('/login')
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async profile sync for this route
    fetchNotificationPreferences()
  }, [fetchNotificationPreferences, router])

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
        await disablePushNotifications()
      }
      toast.success('Notification preference updated')
    } catch (error) {
      console.error('Failed to update notification preference:', error)
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
      console.error('Failed to enable push notifications:', error)
      toast.error(error.message || 'Push notifications could not be enabled')
    }
  }

  const handleSendTestPush = async () => {
    try {
      const response = await notificationService.sendTestPush()
      const result = response.data || {}

      if (result.success) {
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
      console.error('Failed to send test push:', error)
      toast.error(error.message || 'Failed to send test push')
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--theme-bg)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-[var(--theme-border-strong)] border-t-white rounded-full animate-spin mx-auto mb-4' />
          <p className='text-[14px] text-[var(--theme-text-secondary)]'>
            Loading preferences...
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
        <TopBar title='Notification Preferences' />

        <div className='p-5'>
          <p className='text-[13px] text-[var(--theme-text-secondary)] mb-6'>
            Manage your notification preferences for order updates and important
            information
          </p>

          <div className='space-y-3'>
            {NOTIFICATION_TYPES.map((type) => (
              <MobileNotificationItem
                key={type.key}
                icon={type.icon}
                iconColor={type.iconColor}
                iconBg={type.iconBg}
                title={type.title}
                description={type.mobileDesc}
                checked={notifications[type.key]}
                onChange={() => handleToggleNotification(type.key)}
              />
            ))}
            
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                type='button'
                onClick={handleRegisterBrowserPush}
                className='flex-1 rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-[13px] font-semibold text-[var(--theme-text-primary)] hover:bg-white/15 transition-colors'
              >
                Enable this device
              </button>
              <button
                type='button'
                onClick={handleSendTestPush}
                className='flex-1 rounded-xl bg-[var(--theme-btn-primary-bg)] px-4 py-3 text-[13px] font-semibold text-[var(--theme-btn-primary-text)] hover:opacity-90 transition-opacity'
              >
                Send test push
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className='mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4'>
            <div className='text-[12px] text-blue-200 leading-relaxed'>
              <strong>Tip:</strong> We recommend enabling WhatsApp or SMS
              notifications to stay updated on your repair status in real-time.
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className='hidden lg:block min-h-[calc(100vh-var(--topbar-height))] bg-[var(--theme-bg)]'>
        <div className='max-w-[900px] mx-auto px-12 py-8'>
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
              Notifications
            </span>
          </div>

          {/* Card */}
          <div className='bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-sm'>
            <h1 className='text-[24px] font-extrabold text-[var(--theme-text-primary)] mb-2'>
              Notification Preferences
            </h1>
            <p className='text-[13px] text-[var(--theme-text-secondary)] mb-8'>
              Choose how you want to receive updates about your repairs and
              orders
            </p>

            <div className='space-y-4'>
              {NOTIFICATION_TYPES.map((type) => (
                <DesktopNotificationItem
                  key={type.key}
                  icon={type.icon}
                  iconColor={type.iconColor}
                  iconBg={type.iconBg}
                  title={type.title}
                  description={type.desktopDesc}
                  checked={notifications[type.key]}
                  onChange={() => handleToggleNotification(type.key)}
                >
                  {type.key === 'pushNotifications' && (
                    <div className='mt-4 flex flex-col sm:flex-row gap-2'>
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
                  )}
                </DesktopNotificationItem>
              ))}
            </div>

            {/* Info Box */}
            <div className='mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4'>
              <div className='text-[13px] text-blue-200 leading-relaxed'>
                <strong>Recommended:</strong> Enable WhatsApp or SMS
                notifications to receive timely updates on your repair progress.
                You&apos;ll be notified at each stage from pickup to delivery.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
