'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  X, 
  Trash2, 
  CheckCheck, 
  Inbox, 
  ArrowRight, 
  Clock, 
  RefreshCw,
  SlidersHorizontal 
} from 'lucide-react';
import toast from 'react-hot-toast';
import notificationService from '@/services/notification.service';

export default function NotificationDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const drawerRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Close drawer on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      fetchNotifications();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated before making API call
      const token = document.cookie.split('; ').find(row => row.startsWith('customer_token='));
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await notificationService.getNotifications({
        unreadOnly: unreadOnly || undefined,
        eventType: filterType !== 'all' ? filterType : undefined,
        limit: 20
      });

      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

      setNotifications(list);

      try {
        const countRes = await notificationService.getUnreadCount();
        const unreadFromList = Array.isArray(list) ? list.filter(n => !n.read).length : 0;
        setUnreadCount(countRes?.data?.count ?? countRes?.count ?? unreadFromList);
      } catch {
        const unreadFromList = Array.isArray(list) ? list.filter(n => !n.read).length : 0;
        setUnreadCount(unreadFromList);
      }
    } catch (error) {
      console.error('Failed to get notifications in drawer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [unreadOnly, filterType, isOpen]);

  const handleMarkAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(c => Math.max(0, c - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error(error);
      fetchNotifications();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const isUnread = notifications.find(n => n._id === id && !n.read);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (isUnread) setUnreadCount(c => Math.max(0, c - 1));

    try {
      await notificationService.deleteNotification(id);
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
      toast.success('All marked as read');
    } catch {
      fetchNotifications();
    }
  };

  const handleClearRead = async () => {
    const read = notifications.filter(n => n.read);
    if (read.length === 0) return;

    setNotifications(prev => prev.filter(n => !n.read));

    try {
      await notificationService.deleteAllRead();
      toast.success('Cleared read');
    } catch {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read) handleMarkAsRead(n._id);
    onClose();

    if (n.metadata?.ticketNumber) {
      router.push(`/orders?ticket=${n.metadata.ticketNumber}`);
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 1000 / 60);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Drawer Backdrop with subtle glassmorphism */}
      <div 
        className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 z-[999] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <aside 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-[430px] max-w-[90vw] bg-[var(--theme-card)] border-l border-[var(--theme-border-strong)] shadow-2xl z-[1000] flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Notifications Drawer"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--theme-border-strong)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-extrabold text-[var(--theme-text-primary)]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--theme-btn-secondary-bg)] hover:bg-[var(--theme-btn-secondary-hover)] flex items-center justify-center text-[var(--theme-text-secondary)] active:scale-95 transition-all"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3 bg-[var(--theme-btn-secondary-bg)] border-b border-[var(--theme-border)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors flex items-center gap-1"
            >
              <CheckCheck size={11} /> Mark all read
            </button>
            <span className="text-[var(--theme-placeholder)] text-[10px]">•</span>
            <button
              onClick={handleClearRead}
              className="text-[11px] font-bold text-red-500/80 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={11} /> Clear read
            </button>
          </div>

          <button
            onClick={fetchNotifications}
            className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
            title="Refresh feed"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-[var(--theme-border-strong)] flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[var(--theme-text-tertiary)] flex items-center gap-1">
              <SlidersHorizontal size={10} /> Filter Inbox
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[var(--theme-text-secondary)] font-medium">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-[var(--theme-border)] text-[var(--theme-btn-primary-bg)] focus:ring-[var(--theme-btn-primary-bg)] w-3.5 h-3.5"
              />
              Unread only
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'status_change', label: 'Repairs' },
              { id: 'payment', label: 'Payments' },
              { id: 'general', label: 'General' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex-shrink-0 transition-all ${
                  filterType === tab.id
                    ? 'bg-[var(--theme-text-primary)] text-[var(--theme-bg)]'
                    : 'bg-[var(--theme-btn-secondary-bg)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] border border-[var(--theme-border)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications list or states */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-[var(--theme-border-strong)] border-t-[var(--theme-text-primary)] rounded-full animate-spin mb-3" />
              <p className="text-[12px] text-[var(--theme-text-secondary)]">Syncing notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center text-[var(--theme-placeholder)] mb-3">
                <Bell size={20} />
              </div>
              <h4 className="text-[14px] font-bold text-[var(--theme-text-primary)] mb-1">Inbox is empty</h4>
              <p className="text-[12px] text-[var(--theme-text-secondary)] max-w-[200px]">
                {unreadOnly ? 'No unread notifications matched.' : 'No notifications found at the moment.'}
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`group relative overflow-hidden p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  !n.read 
                    ? 'bg-[var(--theme-card)] border-[var(--theme-border-strong)] shadow-sm hover:translate-y-[-1px]' 
                    : 'bg-[var(--theme-bg)] border-[var(--theme-border)] hover:bg-[var(--theme-card)] opacity-85'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-[var(--theme-btn-primary-bg)]" />
                )}

                <div className={`${!n.read ? 'pl-3' : ''} flex items-start justify-between gap-3`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {n.eventType && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          n.eventType === 'status_change' ? 'bg-blue-500/10 text-blue-400' :
                          n.eventType === 'payment' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {n.eventType === 'status_change' ? 'Status' : n.eventType}
                        </span>
                      )}
                      {n.metadata?.ticketNumber && (
                        <span className="text-[10px] font-bold text-[var(--theme-text-secondary)]">
                          Ticket: {n.metadata.ticketNumber}
                        </span>
                      )}
                    </div>
                    
                    <h5 className={`text-[13px] font-bold leading-snug mb-1 ${!n.read ? 'text-[var(--theme-text-primary)]' : 'text-[var(--theme-text-secondary)]'}`}>
                      {n.title}
                    </h5>
                    
                    <p className="text-[12px] text-[var(--theme-text-secondary)] leading-relaxed mb-2 break-words">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-[var(--theme-text-tertiary)] font-medium">
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} /> {formatTime(n.createdAt)}
                      </span>
                      {n.metadata?.ticketNumber && (
                        <span className="text-[var(--theme-btn-primary-bg)] font-semibold flex items-center gap-0.5">
                          View Details <ArrowRight size={8} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Individual delete */}
                  <button
                    onClick={(e) => handleDelete(n._id, e)}
                    className="w-7 h-7 rounded-lg bg-[var(--theme-btn-secondary-bg)] hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center text-[var(--theme-text-disabled)] transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </aside>
    </>
  );
}
