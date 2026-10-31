// Web Push Notification Service
// Note: For production, you need a VAPID key pair and a push server
// This implementation handles client-side subscription and service worker communication

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging not supported');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    return null;
  }
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Send notification via service worker (for local testing)
export async function sendLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    ...options,
  });
}

// Generate VAPID keys (for development - in production, generate once and store securely)
// Run this in browser console to generate keys:
// const keys = await crypto.subtle.generateKey(
//   { name: 'ECDH', namedCurve: 'P-256' },
//   true,
//   ['deriveKey', 'deriveBits']
// );
// const publicKey = await crypto.subtle.exportKey('raw', keys.publicKey);
// const privateKey = await crypto.subtle.exportKey('raw', keys.privateKey);
// console.log('Public:', btoa(String.fromCharCode(...new Uint8Array(publicKey))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));
// console.log('Private:', btoa(String.fromCharCode(...new Uint8Array(privateKey))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));