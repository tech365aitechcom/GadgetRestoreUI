'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { TOKEN_COOKIE } from '@/lib/constants';
import pushNotificationService from '@/services/push-notification.service';

export default function PushNotificationRegistrar() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (!token) return;

    // Refresh token if permissions are granted
    pushNotificationService.refreshIfGranted();

    let unsubscribe = () => {};

    // 1. Handle foreground notifications
    pushNotificationService.subscribeToForegroundMessages((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'Gadget Restore';
      const body = payload.notification?.body || payload.data?.body || 'You have a new order update.';

      toast.success(`${title}: ${body}`);

      // Web only: display service worker local notification
      if (!Capacitor.isNativePlatform() && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker?.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/gadget-restore-logo.svg',
            badge: '/gadget-restore-logo.svg',
            data: {
              click_action: payload.data?.click_action || payload.fcmOptions?.link || '/notifications',
            },
          });
        });
      }
    }).then((nextUnsubscribe) => {
      unsubscribe = nextUnsubscribe;
    });

    // 2. Native only: Handle deep linking when clicking a notification
    let actionListenerPromise;
    if (Capacitor.isNativePlatform()) {
      actionListenerPromise = PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action) => {
          const data = action.notification.data || {};
          const ticketNumber = data.ticketNumber;
          if (ticketNumber) {
            router.push(`/orders/${ticketNumber}`);
          } else {
            router.push('/notifications');
          }
        }
      );
    }

    return () => {
      unsubscribe();
      if (actionListenerPromise) {
        actionListenerPromise.then((l) => l.remove()).catch(() => {});
      }
    };
  }, [router]);

  return null;
}

