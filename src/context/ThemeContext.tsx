import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AppSettings } from '../types';
import { getSettings } from '../services/db';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [initialized, setInitialized] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    let isDark: boolean;
    if (newTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      isDark = newTheme === 'dark';
      root.setAttribute('data-theme', newTheme);
    }
    setResolvedTheme(isDark ? 'dark' : 'light');
    // Also toggle .dark class for CSS selectors
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Initialize theme from settings on app load
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await getSettings();
        const savedTheme = settings?.theme || 'system';
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } catch {
        // Fallback to system preference
        applyTheme('system');
      } finally {
        setInitialized(true);
      }
    };
    loadTheme();
  }, []);

  // Listen for system theme changes when using 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      applyTheme('system');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}