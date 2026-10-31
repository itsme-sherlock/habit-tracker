import { useState, useEffect, useCallback } from 'react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from '../services/db';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
  requestNotificationPermission,
  getNotificationPermission,
  isPushSupported,
  sendLocalNotification,
} from '../services/push';
import { sendTestEmail, isEmailConfigured } from '../services/email';
import { initScheduler, stopScheduler, triggerTestNotifications } from '../services/scheduler';

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    pushTime: '08:00',
    emailTime: '08:00',
    emailAddress: '',
    reminderTime: '20:00',
  });
  const [loading, setLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [sending, setSending] = useState(false);

  const loadSettings = useCallback(async () => {
    const [savedSettings, pushSub, perm, emailConf] = await Promise.all([
      getNotificationSettings(),
      getPushSubscription(),
      getNotificationPermission(),
      isEmailConfigured(),
    ]);
    setSettings(savedSettings);
    setPushSubscribed(!!pushSub);
    setPermission(perm);
    setEmailConfigured(emailConf);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPushSupported(isPushSupported());
    loadSettings();
    initScheduler();

    return () => {
      stopScheduler();
    };
  }, [loadSettings]);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    await saveNotificationSettings(newSettings);
    setSettings(newSettings);
  }, [settings]);

  const requestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    return perm;
  }, []);

  const enablePush = useCallback(async () => {
    if (!pushSupported) return false;
    if (permission !== 'granted') {
      await requestPermission();
    }
    const sub = await subscribeToPush();
    if (sub) {
      setPushSubscribed(true);
      await updateSettings({ pushEnabled: true });
      return true;
    }
    return false;
  }, [pushSupported, permission, requestPermission, updateSettings]);

  const disablePush = useCallback(async () => {
    await unsubscribeFromPush();
    setPushSubscribed(false);
    await updateSettings({ pushEnabled: false });
  }, [updateSettings]);

  const sendTestPush = useCallback(async () => {
    await sendLocalNotification('🧪 Test Notification', {
      body: 'Push notifications are working!',
      tag: 'test-push',
    });
  }, []);

  const sendTestEmailNotification = useCallback(async () => {
    if (!settings.emailAddress) return false;
    setSending(true);
    const result = await sendTestEmail(settings.emailAddress);
    setSending(false);
    return result;
  }, [settings.emailAddress]);

  const triggerTest = useCallback(async () => {
    await triggerTestNotifications();
  }, []);

  return {
    settings,
    loading,
    pushSupported,
    pushSubscribed,
    permission,
    emailConfigured,
    sending,
    updateSettings,
    requestPermission,
    enablePush,
    disablePush,
    sendTestPush,
    sendTestEmailNotification,
    triggerTest,
    refresh: loadSettings,
  };
}