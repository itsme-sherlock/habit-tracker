import { useState } from 'react';
import { Moon, Sun, Monitor, Download, Upload, Trash2, RefreshCw, AlertTriangle, Cloud, LogIn } from 'lucide-react';
import type { AppSettings } from '../types';
import { saveSettings, exportAllData, importAllData, clearAllData } from '../services/db';
import { NotificationSettingsComponent } from './NotificationSettings';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  account: {
    user: { id: string; email: string } | null;
    isLoadingAuth: boolean;
    authError: string | null;
    setAuthError: (message: string | null) => void;
    configured: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    syncStatus: {
      isOnline: boolean;
      isSyncing: boolean;
      lastSyncTime: number | null;
      pendingCount: number;
      error: string | null;
    };
    triggerSync: () => Promise<void>;
  };
}

export function SettingsComponent({ settings, onSettingsChange, account }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    const newSettings = { ...settings, theme: newTheme };
    onSettingsChange(newSettings);
    saveSettings(newSettings);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImporting(true);
      try {
        const json = e.target?.result as string;
        await importAllData(json);
        alert('Data imported successfully! The page will reload.');
        window.location.reload();
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please check the file format.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure? This will delete ALL your habits, tasks, and completions. This cannot be undone.')) {
      if (confirm('Last chance! Type "DELETE" to confirm.')) {
        await clearAllData();
        alert('All data cleared. The page will reload.');
        window.location.reload();
      }
    }
  };

  const handleAccountSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountBusy(true);
    setAuthMessage(null);
    account.setAuthError(null);
    try {
      if (authMode === 'sign-up') {
        await account.signUp(email.trim(), password);
        setAuthMessage('Account created. If email confirmation is enabled, confirm your address, then sign in.');
      } else {
        await account.signIn(email.trim(), password);
      }
      setPassword('');
    } catch (error) {
      account.setAuthError(error instanceof Error ? error.message : 'Account request failed.');
    } finally {
      setAccountBusy(false);
    }
  };

  const handleSync = async () => {
    setAccountBusy(true);
    try {
      await account.triggerSync();
    } catch (error) {
      account.setAuthError(error instanceof Error ? error.message : 'Sync could not be started.');
    } finally {
      setAccountBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-4" aria-labelledby="account-sync-heading">
        <h3 id="account-sync-heading" className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary-500" />
          Account & Sync
        </h3>
        {!account.configured ? (
          <p role="status" className="text-sm text-amber-700 dark:text-amber-300">
            Add your Supabase URL and anon key to <code>.env.local</code> (use <code>.env.example</code> as a template), run the cross-device migration in <code>supabase/migrations</code> in your Supabase SQL Editor, then restart the app.
          </p>
        ) : account.isLoadingAuth ? (
          <p className="text-sm text-gray-500">Checking account…</p>
        ) : account.user ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Storage: <span className="font-medium">{account.user.email}</span>
            </p>
            {account.syncStatus.error ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">{account.syncStatus.error}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400" role="status">
                {account.syncStatus.isSyncing
                  ? 'Syncing…'
                  : account.syncStatus.pendingCount > 0
                    ? `${account.syncStatus.pendingCount} change(s) waiting to sync`
                    : account.syncStatus.lastSyncTime
                      ? `Synced ${new Date(account.syncStatus.lastSyncTime).toLocaleString()}`
                      : 'Sync will start shortly.'}
              </p>
            )}
            {account.authError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{account.authError}</p>}
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={handleSync} disabled={accountBusy || account.syncStatus.isSyncing || !account.syncStatus.isOnline}>
                <RefreshCw className={`w-4 h-4 mr-2 ${account.syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                Refresh now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAccountSubmit} className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in with the same account on each device to sync your data.
            </p>
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="input mt-1"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete={authMode === 'sign-up' ? 'new-password' : 'current-password'}
                minLength={6}
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="input mt-1"
              />
            </label>
            {account.authError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{account.authError}</p>}
            {authMessage && <p role="status" className="text-sm text-green-700 dark:text-green-300">{authMessage}</p>}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={accountBusy}>
                <LogIn className="w-4 h-4 mr-2" />
                {accountBusy ? 'Please wait…' : authMode === 'sign-up' ? 'Create account' : 'Sign in'}
              </button>
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => {
                  setAuthMode(mode => mode === 'sign-in' ? 'sign-up' : 'sign-in');
                  setAuthMessage(null);
                  account.setAuthError(null);
                }}
              >
                {authMode === 'sign-up' ? 'I have an account' : 'Create account'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Appearance */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary-500" />
          Appearance
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                theme === t
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t === 'light' && <Sun className="w-5 h-5 mx-auto mb-1" />}
              {t === 'dark' && <Moon className="w-5 h-5 mx-auto mb-1" />}
              {t === 'system' && <Monitor className="w-5 h-5 mx-auto mb-1" />}
              <div className="capitalize">{t}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <NotificationSettingsComponent
        settings={settings.notificationSettings}
        onUpdate={(updates) => {
          const newSettings = {
            ...settings,
            notificationSettings: { ...settings.notificationSettings, ...updates },
          };
          onSettingsChange(newSettings);
          saveSettings(newSettings);
        }}
      />

      {/* Data Management */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary-500" />
          Data Management
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export All Data (JSON)'}
          </button>
          <div>
            <label className="btn-secondary w-full justify-start cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Data (JSON)
              <input
                type="file"
                accept=".json"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                disabled={importing}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-4 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showDangerZone ? 'Hide' : 'Show'}
          </button>
        </div>

        {showDangerZone && (
          <div className="animate-fade-in p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 mb-4">
              This will permanently delete all your habits, study tasks, daily completions, and settings.
              This action cannot be undone.
            </p>
            <button
              onClick={handleClearAll}
              className="btn-danger w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Data
            </button>
          </div>
        )}
      </div>

      {/* About */}
      <div className="card p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Habit Tracker PWA</p>
        <p>Version 1.0.0</p>
        <p className="mt-2">Built for GCP Data Engineer prep (Nov-Dec 2026)</p>
      </div>
    </div>
  );
}