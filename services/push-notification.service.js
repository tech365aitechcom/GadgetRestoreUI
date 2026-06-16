import { initializeApp, getApps } from 'firebase/app';
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import notificationService from './notification.service';

const DEVICE_ID_KEY = 'gadget_restore_push_device_id';
const FCM_TOKEN_KEY = 'gadget_restore_fcm_token';

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function hasFirebaseConfig() {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId);
}

function getDeviceId() {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const prefix = Capacitor.isNativePlatform() ? `native-${Capacitor.getPlatform()}-` : 'web-';
  const nextId = `${prefix}${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  window.localStorage.setItem(DEVICE_ID_KEY, nextId);
  return nextId;
}

async function getServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

async function getMessagingInstance() {
  if (typeof window === 'undefined') return null;
  if (!hasFirebaseConfig()) return null;
  if (!(await isSupported())) return null;

  const app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());
  return getMessaging(app);
}

export const pushNotificationService = {
  isConfigured: hasFirebaseConfig,

  async isSupported() {
    if (typeof window === 'undefined') return false;
    if (Capacitor.isNativePlatform()) return true;
    if (!('Notification' in window)) return false;
    if (!('serviceWorker' in navigator)) return false;
    return hasFirebaseConfig() && await isSupported();
  },

  getPermission() {
    if (typeof window === 'undefined') return 'unsupported';
    if (Capacitor.isNativePlatform()) {
      // For Capacitor, we return the status asynchronously via checkPermissions/requestPermissions.
      // We default to 'default' here to ensure requestAndRegister is called when requested.
      return 'default';
    }
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  async requestAndRegister() {
    if (!(await this.isSupported())) {
      throw new Error('Push notifications are not supported or Firebase is not configured.');
    }

    if (Capacitor.isNativePlatform()) {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('Native notification permission was not granted.');
      }

      await PushNotifications.register();

      return new Promise((resolve, reject) => {
        let regListener;
        let errListener;

        const cleanUp = () => {
          regListener?.then((l) => l.remove()).catch(() => {});
          errListener?.then((l) => l.remove()).catch(() => {});
        };

        const registrationPromise = PushNotifications.addListener('registration', async (token) => {
          try {
            const fcmToken = token.value;
            const platform = Capacitor.getPlatform();
            const deviceType = platform === 'ios' ? 'iOS' : 'Android';

            const payload = {
              fcmToken,
              deviceId: getDeviceId(),
              deviceType,
              platform: `${deviceType} App`,
              userAgent: navigator.userAgent,
            };

            await notificationService.registerPushDevice(payload);
            window.localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
            cleanUp();
            resolve(payload);
          } catch (error) {
            cleanUp();
            reject(error);
          }
        });

        const errorPromise = PushNotifications.addListener('registrationError', (error) => {
          cleanUp();
          reject(new Error(`Native push registration failed: ${error.error}`));
        });

        regListener = registrationPromise;
        errListener = errorPromise;
      });
    }

    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    const messaging = await getMessagingInstance();
    const registration = await getServiceWorkerRegistration();
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!messaging || !registration || !vapidKey) {
      throw new Error('Firebase messaging is not fully configured.');
    }

    const fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) {
      throw new Error('Unable to create push notification token.');
    }

    const payload = {
      fcmToken,
      deviceId: getDeviceId(),
      deviceType: 'Web',
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };

    await notificationService.registerPushDevice(payload);
    window.localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    return payload;
  },

  async refreshIfGranted() {
    if (typeof window === 'undefined') return null;
    
    if (Capacitor.isNativePlatform()) {
      // For Capacitor, we try to refresh if permissions are granted.
      // Calling register() again is standard on app launch to get the token.
      const permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'granted') {
        try {
          return await this.requestAndRegister();
        } catch (error) {
          console.warn('Native push token refresh failed:', error.message);
          return null;
        }
      }
      return null;
    }

    if (this.getPermission() !== 'granted') return null;
    try {
      return await this.requestAndRegister();
    } catch (error) {
      console.warn('Push registration refresh failed:', error.message);
      return null;
    }
  },

  async subscribeToForegroundMessages(callback) {
    if (Capacitor.isNativePlatform()) {
      const listenerPromise = PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          const webFormattedPayload = {
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: notification.data || {},
          };
          callback?.(webFormattedPayload);
        }
      );
      return () => {
        listenerPromise.then((l) => l.remove()).catch(() => {});
      };
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      callback?.(payload);
    });
  },

  async showLocalNotification(title = 'Gadget Restore', options = {}) {
    if (typeof window === 'undefined') return;

    if (Capacitor.isNativePlatform()) {
      // Capacitor does not need service worker showNotification, we can use LocalNotifications plugin
      // or simply rely on standard FCM notifications.
      console.log('Foreground notification received natively: ', title, options);
      return;
    }

    if (!('Notification' in window)) {
      throw new Error('Browser notifications are not supported.');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Browser notification permission is not granted.');
    }

    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      throw new Error('Service worker is not available.');
    }

    await registration.showNotification(title, {
      body: options.body || 'Browser notification display is working.',
      icon: options.icon || '/gadget-restore-logo.svg',
      badge: options.badge || '/gadget-restore-logo.svg',
      data: {
        click_action: options.clickAction || '/notifications',
      },
    });
  },

  async unregister() {
    const fcmToken = window.localStorage.getItem(FCM_TOKEN_KEY);

    if (Capacitor.isNativePlatform()) {
      try {
        await PushNotifications.removeAllListeners();
      } catch (error) {
        console.warn('Failed to remove native push listeners:', error.message);
      }
    } else {
      const messaging = await getMessagingInstance();
      if (messaging && fcmToken) {
        try {
          await deleteToken(messaging);
        } catch (error) {
          console.warn('Failed to delete local FCM token:', error.message);
        }
      }
    }

    if (fcmToken) {
      await notificationService.unregisterPushDevice({
        fcmToken,
        deviceId: getDeviceId(),
      });
    }

    window.localStorage.removeItem(FCM_TOKEN_KEY);
  },
};

export default pushNotificationService;
