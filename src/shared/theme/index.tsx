import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readPreferences, savePreference, type ThemePreference } from './preferences';
const ThemeContext = createContext<{
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  setTheme: (v: ThemePreference) => void;
  storageError: boolean;
} | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => readPreferences().theme);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [storageError, setStorageError] = useState(!readPreferences().storageAvailable);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));
  }, [resolved]);
  function setTheme(value: ThemePreference) {
    setPreference(value);
    setStorageError(!savePreference('theme', value));
  }
  return (
    <ThemeContext.Provider value={{ preference, resolved, setTheme, storageError }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider required');
  return context;
}
