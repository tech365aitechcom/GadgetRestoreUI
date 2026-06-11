'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  CheckCheck,
  Inbox,
  ArrowRight,
  Clock,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import TopBar from '@/components/ui/TopBar';
import toast from 'react-hot-toast';
import notificationService from '@/services/notification.service';
import Skeleton from '@/components/ui/Skeleton';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'status_change', 'payment', 'general'

  const fetchNotifications = useCallback(async (showSilent = false) => {
    if (!showSilent) setIsLoading(true);
    try {
      const res = await notificationService.getNotifications({
        unreadOnly: unreadOnly || undefined,
        eventType: filterType !== 'all' ? filterType : undefined,
        limit: 50,
      });

      // Format response based on standard backend layout
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

      setNotifications(list);

      // Fetch real unread count
      try {
        const countRes = await notificationService.getUnreadCount();
        const unreadFromList = Array.isArray(list) ? list.filter(n => !n.read).length : 0;
        setUnreadCount(countRes?.data?.count ?? countRes?.count ?? unreadFromList);
      } catch {
        const unreadFromList = Array.isArray(list) ? list.filter(n => !n.read).length : 0;
        setUnreadCount(unreadFromList);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't show error toast if it's a network error (user might not be authenticated)
      if (error.response?.status !== 401) {
        toast.error('Could not sync notifications');
      }
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [unreadOnly, filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications(true);
    toast.success('Notifications synced');
  };

  const handleMarkAsRead = async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(c => Math.max(0, c - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const notificationToDelete = notifications.find(n => n._id === id);
    const wasUnread = notificationToDelete && !notificationToDelete.read;

    // Optimistic update
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (wasUnread) {
      setUnreadCount(c => Math.max(0, c - 1));
    }

    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification removed');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) {
      toast.error('No unread notifications');
      return;
    }

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
      toast.success('All marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications();
    }
  };

  const handleDeleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.read);
    if (readNotifications.length === 0) {
      toast.error('No read notifications to clear');
      return;
    }

    // Optimistic update
    setNotifications(prev => prev.filter(n => !n.read));

    try {
      await notificationService.deleteAllRead();
      toast.success('Cleared read notifications');
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Redirect if it contains order metadata
    if (notification.metadata?.ticketNumber) {
      // In this system, active orders can be viewed.
      // Redirecting to /orders with ticket parameters.
      router.push(`/orders?ticket=${notification.metadata.ticketNumber}`);
    }
  };

  const getEventBadgeStyles = (type) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'payment':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'general':
      default:
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
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

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] pb-24 text-[var(--theme-text-primary)]">
      {/* Mobile Top Bar */}
      <TopBar
        title="Notifications"
        rightAction={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`w-9 h-9 rounded-full bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] active:scale-95 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        }
      />

      <div className="max-w-[700px] mx-auto px-5 pt-6 pb-4">
        {/* Header Controls for Quick Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold">
              Feed
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] rounded-full animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors flex items-center gap-1 bg-[var(--theme-btn-secondary-bg)] px-2.5 py-1.5 rounded-lg border border-[var(--theme-border)]"
            >
              <CheckCheck size={12} /> Mark Read
            </button>
            <button
              onClick={handleDeleteAllRead}
              className="text-[11px] font-bold text-red-500/80 hover:text-red-500 transition-colors flex items-center gap-1 bg-red-500/5 px-2.5 py-1.5 rounded-lg border border-red-500/10"
            >
              <Trash2 size={12} /> Clear Read
            </button>
          </div>
        </div>

        {/* Filter Badges & Toggle */}
        <div className="flex flex-col gap-3 mb-6 bg-[var(--theme-card)] p-4 rounded-xl border border-[var(--theme-border)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[var(--theme-text-secondary)] flex items-center gap-1.5">
              <SlidersHorizontal size={12} /> Filter Options
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[var(--theme-text-secondary)]">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-[var(--theme-border)] text-[var(--theme-btn-primary-bg)] focus:ring-[var(--theme-btn-primary-bg)]"
              />
              Unread only
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--theme-border-strong)]">
            {[
              { id: 'all', label: 'All' },
              { id: 'status_change', label: 'Repairs' },
              { id: 'payment', label: 'Payments' },
              { id: 'general', label: 'General' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterType === tab.id
                    ? 'bg-[var(--theme-text-primary)] text-[var(--theme-bg)]'
                    : 'bg-[var(--theme-btn-secondary-bg)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] border border-[var(--theme-border)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4 flex gap-3"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                  <Skeleton className="h-5 w-[70%] rounded-lg" />
                  <Skeleton className="h-4 w-[90%] rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--theme-btn-secondary-bg)] flex items-center justify-center text-[var(--theme-placeholder)] mb-4">
              <Inbox size={28} />
            </div>
            <h3 className="text-[16px] font-bold mb-1">All caught up!</h3>
            <p className="text-[13px] text-[var(--theme-text-secondary)] max-w-xs">
              {unreadOnly
                ? 'No unread notifications match your current filter preferences.'
                : 'You have no notifications in your inbox at this moment.'}
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-200 cursor-pointer ${!n.read
                    ? 'bg-[var(--theme-card)] border-[var(--theme-border-strong)] shadow-sm hover:translate-y-[-1px]'
                    : 'bg-[var(--theme-bg)] border-[var(--theme-border)] hover:bg-[var(--theme-card)] opacity-85'
                  }`}
              >
                {/* Unread indicator dot */}
                {!n.read && (
                  <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[var(--theme-btn-primary-bg)]" />
                )}

                <div className={`${!n.read ? 'pl-4' : ''} flex items-start justify-between gap-3`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {n.eventType && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getEventBadgeStyles(n.eventType)}`}>
                          {n.eventType === 'status_change' ? 'Status' : n.eventType}
                        </span>
                      )}
                      {n.metadata?.ticketNumber && (
                        <span className="text-[11px] font-bold text-[var(--theme-text-secondary)]">
                          Ticket: {n.metadata.ticketNumber}
                        </span>
                      )}
                    </div>

                    <h4 className={`text-[14px] font-bold leading-snug mb-1 ${!n.read ? 'text-[var(--theme-text-primary)]' : 'text-[var(--theme-text-secondary)]'}`}>
                      {n.title}
                    </h4>

                    <p className="text-[13px] text-[var(--theme-text-secondary)] leading-relaxed mb-2.5 break-words">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--theme-text-tertiary)] font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formatTime(n.createdAt)}
                      </span>
                      {n.metadata?.ticketNumber && (
                        <span className="text-[var(--theme-btn-primary-bg)] font-semibold flex items-center gap-0.5 group">
                          View details <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDelete(n._id, e)}
                      className="w-8 h-8 rounded-lg bg-[var(--theme-btn-secondary-bg)] hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center text-[var(--theme-text-disabled)] transition-all active:scale-90"
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n._id);
                        }}
                        className="w-8 h-8 rounded-lg bg-[var(--theme-btn-secondary-bg)] hover:bg-[var(--theme-btn-secondary-hover)] flex items-center justify-center text-[var(--theme-text-secondary)] transition-all active:scale-90"
                        title="Mark as read"
                      >
                        <CheckCheck size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
