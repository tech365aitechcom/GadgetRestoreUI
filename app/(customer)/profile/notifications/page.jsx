'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, MessageSquare, Mail, Smartphone } from 'lucide-react'
import TopBar from '@/components/ui/TopBar'
import Cookies from 'js-cookie'
import { TOKEN_COOKIE } from '@/lib/constants'
import toast from 'react-hot-toast'
import customerService from '@/services/customer.service'

export default function NotificationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState({
    whatsappNotifications: true,
    smsNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
  })

  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      router.push('/login')
      return
    }

    fetchNotificationPreferences()
  }, [router])

  const fetchNotificationPreferences = async () => {
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
            {/* WhatsApp Notifications */}
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-start gap-3 flex-1'>
                  <div className='w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0'>
                    <MessageSquare size={20} className='text-green-400' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-[14px] font-semibold text-[var(--theme-text-primary)] mb-1'>
                      WhatsApp Notifications
                    </div>
                    <div className='text-[12px] text-[var(--theme-text-tertiary)] leading-relaxed'>
                      Receive order updates and repair status via WhatsApp
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggleNotification('whatsappNotifications')
                  }
                  className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    notifications.whatsappNotifications
                      ? 'bg-[var(--theme-toggle-bg-on)]'
                      : 'bg-[var(--theme-toggle-bg-off)]'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-[var(--theme-toggle-thumb)] rounded-full top-1 transition-transform ${
                      notifications.whatsappNotifications
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-start gap-3 flex-1'>
                  <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0'>
                    <Smartphone size={20} className='text-blue-400' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-[14px] font-semibold text-[var(--theme-text-primary)] mb-1'>
                      SMS Notifications
                    </div>
                    <div className='text-[12px] text-[var(--theme-text-tertiary)] leading-relaxed'>
                      Get text messages for important updates and confirmations
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('smsNotifications')}
                  className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    notifications.smsNotifications ? 'bg-[var(--theme-toggle-bg-on)]' : 'bg-[var(--theme-toggle-bg-off)]'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-[var(--theme-toggle-thumb)] rounded-full top-1 transition-transform ${
                      notifications.smsNotifications
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Notifications */}
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-start gap-3 flex-1'>
                  <div className='w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0'>
                    <Mail size={20} className='text-purple-400' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-[14px] font-semibold text-[var(--theme-text-primary)] mb-1'>
                      Email Notifications
                    </div>
                    <div className='text-[12px] text-[var(--theme-text-tertiary)] leading-relaxed'>
                      Receive detailed repair reports and invoices via email
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('emailNotifications')}
                  className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    notifications.emailNotifications
                      ? 'bg-[var(--theme-toggle-bg-on)]'
                      : 'bg-[var(--theme-toggle-bg-off)]'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-[var(--theme-toggle-thumb)] rounded-full top-1 transition-transform ${
                      notifications.emailNotifications
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Push Notifications */}
            <div className='bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-start gap-3 flex-1'>
                  <div className='w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0'>
                    <Bell size={20} className='text-orange-400' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-[14px] font-semibold text-[var(--theme-text-primary)] mb-1'>
                      Push Notifications
                    </div>
                    <div className='text-[12px] text-[var(--theme-text-tertiary)] leading-relaxed'>
                      Get instant alerts on your device for real-time updates
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('pushNotifications')}
                  className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    notifications.pushNotifications ? 'bg-[var(--theme-toggle-bg-on)]' : 'bg-[var(--theme-toggle-bg-off)]'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-[var(--theme-toggle-thumb)] rounded-full top-1 transition-transform ${
                      notifications.pushNotifications
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
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
              {/* WhatsApp Notifications */}
              <div className='flex items-start gap-4 p-5 bg-white/[0.03] border border-[var(--theme-border-strong)] rounded-xl'>
                <div className='w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0'>
                  <MessageSquare size={22} className='text-green-400' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='text-[15px] font-semibold text-[var(--theme-text-primary)]'>
                      WhatsApp Notifications
                    </div>
                    <button
                      onClick={() =>
                        handleToggleNotification('whatsappNotifications')
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        notifications.whatsappNotifications
                          ? 'bg-[var(--theme-toggle-bg-on)]'
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
                  <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed'>
                    Receive order updates, repair status, and delivery
                    notifications via WhatsApp
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className='flex items-start gap-4 p-5 bg-white/[0.03] border border-[var(--theme-border-strong)] rounded-xl'>
                <div className='w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0'>
                  <Smartphone size={22} className='text-blue-400' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='text-[15px] font-semibold text-[var(--theme-text-primary)]'>
                      SMS Notifications
                    </div>
                    <button
                      onClick={() =>
                        handleToggleNotification('smsNotifications')
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        notifications.smsNotifications
                          ? 'bg-[var(--theme-toggle-bg-on)]'
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
                  <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed'>
                    Get important updates and confirmations via text message to
                    your registered mobile number
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className='flex items-start gap-4 p-5 bg-white/[0.03] border border-[var(--theme-border-strong)] rounded-xl'>
                <div className='w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0'>
                  <Mail size={22} className='text-purple-400' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='text-[15px] font-semibold text-[var(--theme-text-primary)]'>
                      Email Notifications
                    </div>
                    <button
                      onClick={() =>
                        handleToggleNotification('emailNotifications')
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        notifications.emailNotifications
                          ? 'bg-[var(--theme-toggle-bg-on)]'
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
                  <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed'>
                    Receive detailed repair reports, invoices, and warranty
                    information via email
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div className='flex items-start gap-4 p-5 bg-white/[0.03] border border-[var(--theme-border-strong)] rounded-xl'>
                <div className='w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0'>
                  <Bell size={22} className='text-orange-400' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='text-[15px] font-semibold text-[var(--theme-text-primary)]'>
                      Push Notifications
                    </div>
                    <button
                      onClick={() =>
                        handleToggleNotification('pushNotifications')
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        notifications.pushNotifications
                          ? 'bg-[var(--theme-toggle-bg-on)]'
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
                  <div className='text-[13px] text-[var(--theme-text-secondary)] leading-relaxed'>
                    Get instant push alerts on your device for real-time repair
                    status updates
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className='mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4'>
              <div className='text-[13px] text-blue-200 leading-relaxed'>
                <strong>Recommended:</strong> Enable WhatsApp or SMS
                notifications to receive timely updates on your repair progress.
                You'll be notified at each stage from pickup to delivery.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
