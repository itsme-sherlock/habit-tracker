import { useState, useEffect, useCallback } from 'react';

export function usePWA() {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setInstalled(isStandalone || isIOSStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for service worker updates
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
    };

    // Online/offline
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    navigator.serviceWorker?.addEventListener('controllerchange', handleSWUpdate);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      navigator.serviceWorker?.removeEventListener('controllerchange', handleSWUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallable(false);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const applyUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }, []);

  return {
    installable,
    installed,
    updateAvailable,
    offline,
    install,
    applyUpdate,
  };
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}