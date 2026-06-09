'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { TOKEN_COOKIE } from '@/lib/constants';
import pushNotificationService from '@/services/push-notification.service';

export default function PushNotificationRegistrar() {
  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (!token) return;

    pushNotificationService.refreshIfGranted();

    let unsubscribe = () => {};
    pushNotificationService.subscribeToForegroundMessages((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'Gadget Restore';
      const body = payload.notification?.body || payload.data?.body || 'You have a new order update.';

      toast.success(`${title}: ${body}`);

      if (Notification.permission === 'granted') {
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

    return () => unsubscribe();
  }, []);

  return null;
}
