import { Bell, Mail, Clock, Check, X } from 'lucide-react';
import type { NotificationSettings } from '../types';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onUpdate: (updates: Partial<NotificationSettings>) => void;
}

export function NotificationSettingsComponent({ settings, onUpdate }: NotificationSettingsProps) {
  const {
    pushSupported,
    pushSubscribed,
    permission,
    emailConfigured,
    sending,
    requestPermission,
    enablePush,
    disablePush,
    sendTestPush,
    sendTestEmailNotification,
    triggerTest,
  } = useNotifications();

  const handleTimeChange = (field: 'pushTime' | 'emailTime' | 'reminderTime', value: string) => {
    onUpdate({ [field]: value });
  };

  const handleEmailChange = (value: string) => {
    onUpdate({ emailAddress: value });
  };

  const handleTogglePush = (enabled: boolean) => {
    onUpdate({ pushEnabled: enabled });
    if (enabled) {
      enablePush();
    } else {
      disablePush();
    }
  };

  const handleToggleEmail = (enabled: boolean) => {
    onUpdate({ emailEnabled: enabled });
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Push Notifications</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pushEnabled}
              onChange={(e) => handleTogglePush(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
          </label>
        </div>

        {settings.pushEnabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Notification Time</label>
              <input
                type="time"
                value={settings.pushTime}
                onChange={(e) => handleTimeChange('pushTime', e.target.value)}
                className="input"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {pushSupported ? (
                  pushSubscribed ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" /> Subscribed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <Clock className="w-4 h-4" /> Not subscribed
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <X className="w-4 h-4" /> Not supported
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({permission})
                </span>
              </div>
              {!pushSubscribed && pushSupported && permission !== 'granted' && (
                <button
                  onClick={requestPermission}
                  className="btn-secondary text-sm"
                >
                  Allow
                </button>
              )}
              {!pushSubscribed && pushSupported && permission === 'granted' && (
                <button
                  onClick={enablePush}
                  className="btn-primary text-sm"
                >
                  Subscribe
                </button>
              )}
              {pushSubscribed && (
                <button
                  onClick={disablePush}
                  className="btn-danger text-sm"
                >
                  Unsubscribe
                </button>
              )}
            </div>

            <button onClick={sendTestPush} className="btn-secondary text-sm w-full" disabled={!pushSubscribed}>
              Send Test Notification
            </button>
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Email Notifications</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => handleToggleEmail(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
          </label>
        </div>

        {settings.emailEnabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={settings.emailAddress}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="input"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notification Time</label>
              <input
                type="time"
                value={settings.emailTime}
                onChange={(e) => handleTimeChange('emailTime', e.target.value)}
                className="input"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {emailConfigured ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" /> EmailJS Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Clock className="w-4 h-4" /> EmailJS Not Configured
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={sendTestEmailNotification}
              className="btn-secondary text-sm w-full"
              disabled={!settings.emailAddress || sending}
            >
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        )}
      </div>

      {/* Evening Reminder */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Evening Reminder</h3>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reminder Time (optional)</label>
          <input
            type="time"
            value={settings.reminderTime || ''}
            onChange={(e) => handleTimeChange('reminderTime', e.target.value)}
            className="input"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Get reminded to complete your checklist before the day ends.
          </p>
        </div>
      </div>

      {/* Test All */}
      <div className="card p-4">
        <button
          onClick={triggerTest}
          className="btn-primary w-full"
        >
          Trigger Test Notifications Now
        </button>
      </div>
    </div>
  );
}