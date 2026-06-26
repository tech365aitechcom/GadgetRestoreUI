import { useState, useEffect, useRef } from 'react'
import {
  Home,
  ClipboardList,
  User,
  Settings,
  Bell,
  HelpCircle,
  Search,
  Plus,
  X,
  Loader2,
  ChevronRight,
  Smartphone,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBooking } from '@/context/BookingContext'
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation'
import NotificationDrawer from '@/components/layout/NotificationDrawer'
import LoginAlertModal from '@/components/ui/LoginAlertModal'
import notificationService from '@/services/notification.service'
import catalogueService from '@/services/catalogue.service'
import orderService from '@/services/order.service'
import { setRouterInstance } from '@/lib/navigation'
import Link from 'next/link'

export default function AppShell({ children, className = '' }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { startBooking, setModel } = useBooking()
  const { navigateTo, showLoginModal, setShowLoginModal, redirectPath } =
    useProtectedNavigation()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [searchResults, setSearchResults] = useState({ devices: [], tickets: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [userOrders, setUserOrders] = useState([])
  const containerRef = useRef(null)

  // Register router instance for use in API interceptor
  useEffect(() => {
    setRouterInstance(router)
  }, [router])

  // Pre-fetch user orders when user is authenticated
  useEffect(() => {
    if (!user) {
      setUserOrders([])
      return
    }

    const loadOrders = async () => {
      try {
        const response = await orderService.getOrders(1, 50)
        setUserOrders(response.orders || [])
      } catch (err) {
        console.error('Error fetching user orders for search:', err)
      }
    }

    loadOrders()
  }, [user])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Execute search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      const cleanQuery = debouncedQuery.startsWith('#') ? debouncedQuery.slice(1) : debouncedQuery
      const queryTrimmed = cleanQuery.trim()

      if (queryTrimmed.length < 2) {
        setSearchResults({ devices: [], tickets: [] })
        return
      }

      setIsLoading(true)
      try {
        // 1. Search products/models publicly
        const devices = await catalogueService.searchProducts(queryTrimmed)

        // 2. Search customer's tickets locally in-memory
        const queryLower = queryTrimmed.toLowerCase()
        let matchedTickets = userOrders.filter((ticket) => {
          const ticketNo = (ticket.ticketNumber || '').toLowerCase()
          const brand = (ticket.brandRef?.name || '').toLowerCase()
          const model = (ticket.modelRef?.name || '').toLowerCase()
          const status = (ticket.repairStatus || '').toLowerCase()
          return (
            ticketNo.includes(queryLower) ||
            brand.includes(queryLower) ||
            model.includes(queryLower) ||
            status.includes(queryLower)
          )
        })

        // 3. Fallback: if no ticket matches locally and the user is authenticated,
        // search specifically for this ticket number directly from the server.
        if (matchedTickets.length === 0 && user) {
          try {
            const singleOrder = await orderService.getOrderDetails(queryTrimmed)
            if (singleOrder && singleOrder.ticketNumber) {
              matchedTickets = [singleOrder]
            }
          } catch (err) {
            // Ignore if order not found or doesn't belong to current customer
          }
        }

        setSearchResults({
          devices: devices || [],
          tickets: matchedTickets || [],
        })
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, userOrders, user])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectModel = (device) => {
    setIsFocused(false)
    setSearchQuery('')
    startBooking({ brand: device.brandId, category: device.categoryId })
    setModel(device)
    router.push('/select-symptoms')
  }

  const handleSelectTicket = (ticket) => {
    setIsFocused(false)
    setSearchQuery('')
    router.push(`/orders/detail?ticketNumber=${encodeURIComponent(ticket.ticketNumber)}`)
  }

  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        setUnreadCount(
          res?.data?.unreadCount ??
          res?.data?.count ??
          res?.count ??
          0
        )
      } catch (err) {
        // Set to 0 on error
        setUnreadCount(0)
      }
    }
    fetchUnreadCount()
    // Fetch unread count every 30 seconds to keep drawer icon in sync
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const navItems = [
    // { href: '/', label: 'Home', icon: Home },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/profile', label: 'Profile', icon: User },
    // { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className={`app-shell ${className}`}>
      {/* ── Dark Sidebar — shown only on desktop via CSS ── */}
      <aside className='desktop-sidebar'>
        {/* Logo */}
        <Link href="/">
          <div className='pt-6 px-5 pb-5'>
            <img
              src='/gadget-restore-logo.svg'
              alt='Gadget Restore'
              className='h-11 w-auto object-contain'
            />
          </div>
        </Link>

        {/* Nav links */}
        <nav className='flex-1 py-2 px-3 flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  navigateTo(item.href)
                }}
                className={`flex items-center gap-3 py-3 px-5 rounded-xl border-none cursor-pointer w-full text-sm text-left transition-all duration-150 ${isActive
                  ? 'font-extrabold text-black bg-white'
                  : 'font-bold text-[#8A8A8A] bg-transparent hover:text-white hover:bg-white/6'
                  }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User snippet */}
        <div className='py-4 px-5 border-t border-divider flex items-center gap-3'>
          <div className='w-8.5 h-8.5 rounded-full bg-white/10 flex items-center justify-center shrink-0'>
            <User size={18} color='#fff' strokeWidth={2} />
          </div>
          <span className='text-[13px] font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap'>
            Hi {user?.name || 'Guest'}
          </span>
        </div>
      </aside>

      {/* ── Light Content Column ── */}
      <main className='content-col'>
        {/* Desktop Top Bar */}
        <header className='desktop-topbar'>
          <div ref={containerRef} className='desktop-topbar-search relative flex items-center w-full max-w-[440px]'>
            <Search size={15} color='var(--color-content-text-secondary)' className="shrink-0" />
            <input
              type='text'
              placeholder='Search devices or tickets...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--color-content-text)] !cursor-text"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults({ devices: [], tickets: [] })
                }}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-[var(--color-content-text-secondary)] shrink-0 flex items-center justify-center border-none bg-transparent"
                type="button"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown Results Overlay */}
            {isFocused && (searchQuery.trim().length >= 2 || isLoading) && (
              <div
                className="absolute top-[48px] left-0 w-[480px] bg-[var(--color-content-card)] border border-[var(--color-content-border)] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.4)] z-50 overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--color-content-text-secondary)]">
                    <Loader2 size={16} className="animate-spin text-[var(--color-accent)]" />
                    Searching...
                  </div>
                ) : searchResults.devices.length === 0 && searchResults.tickets.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--color-content-text-secondary)]">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--color-content-divider)] scrollbar-none">
                    {/* Device results */}
                    {searchResults.devices.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-content-text-secondary)] px-3.5 py-1.5 mb-1">
                          Devices / Models (Book Repair)
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.devices.map((device) => (
                            <button
                              key={device._id}
                              onClick={() => handleSelectModel(device)}
                              className="w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--color-content-bg)] border border-[var(--color-content-border)] flex items-center justify-center p-1 shrink-0">
                                  <img
                                    src={device.image || (device.brandId?.name?.toLowerCase().includes('apple') ? '/images/default-apple.png' : '/images/default-android.png')}
                                    alt={device.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.src = device.brandId?.name?.toLowerCase().includes('apple') ? '/images/default-apple.png' : '/images/default-android.png'
                                    }}
                                  />
                                </div>
                                <div>
                                  <span className="block text-sm font-semibold text-[var(--color-content-text)] group-hover:text-[var(--color-accent)] transition-colors">
                                    {device.name}
                                  </span>
                                  <span className="block text-[11px] text-[var(--color-content-text-secondary)] mt-0.5 uppercase tracking-wide font-bold">
                                    {device.brandId?.name} • {device.categoryId?.name}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight size={15} className="text-[var(--color-content-text-secondary)] group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ticket/Order results */}
                    {searchResults.tickets.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-content-text-secondary)] px-3.5 py-1.5 mb-1">
                          Your Service Tickets
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.tickets.map((ticket) => (
                            <button
                              key={ticket.ticketNumber}
                              onClick={() => handleSelectTicket(ticket)}
                              className="w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--color-content-bg)] border border-[var(--color-content-border)] flex items-center justify-center p-1 shrink-0">
                                  <img
                                    src={ticket.modelRef?.image || (ticket.brandRef?.name?.toLowerCase().includes('apple') ? '/images/default-apple.png' : '/images/default-android.png')}
                                    alt={ticket.modelRef?.name || 'Device'}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.src = ticket.brandRef?.name?.toLowerCase().includes('apple') ? '/images/default-apple.png' : '/images/default-android.png'
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[var(--color-content-text)] font-mono">
                                      {ticket.ticketNumber}
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-white/10 text-[var(--color-content-text-secondary)]">
                                      {ticket.repairStatus?.replaceAll('_', ' ')}
                                    </span>
                                  </div>
                                  <span className="block text-[11px] text-[var(--color-content-text-secondary)] mt-0.5 font-bold">
                                    {ticket.modelRef?.name}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight size={15} className="text-[var(--color-content-text-secondary)] group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='flex items-center gap-5 ml-auto'>
            <button
              aria-label='Notifications'
              onClick={() => setIsNotificationOpen(true)}
              className='bg-transparent border-none cursor-pointer text-content-text-secondary flex items-center relative'
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 w-1.75 h-1.75 rounded-full bg-danger border border-bg animate-pulse' />
              )}
            </button>
            {/* <button
              aria-label='Help'
              className='bg-transparent border-none cursor-pointer text-content-text-secondary flex items-center'
            >
              <HelpCircle size={21} />
            </button> */}
            {/* <button
              onClick={() => router.push('/select-category')}
              className='btn-primary h-9.5 text-[13px] px-4.5 rounded-[10px]'
            >
              New Repair <Plus size={14} />
            </button> */}
          </div>
        </header>

        {children}
      </main>

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <LoginAlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={redirectPath}
      />
    </div>
  )
}
