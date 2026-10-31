import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Download, Upload, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import type { AppSettings } from '../types';
import { getSettings, saveSettings, exportAllData, importAllData, clearAllData } from '../services/db';
import { NotificationSettingsComponent } from './NotificationSettings';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsComponent({ settings, onSettingsChange }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

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

  return (
    <div className="space-y-6 max-w-2xl">
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