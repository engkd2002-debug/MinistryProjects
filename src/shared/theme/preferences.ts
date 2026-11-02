export type ThemePreference = 'system' | 'light' | 'dark';
export type Locale = 'ar' | 'en';
export const PREFERENCES_KEY = 'snrp.preferences';
export function readPreferences(): {
  theme: ThemePreference;
  locale: Locale;
  storageAvailable: boolean;
} {
  try {
    const p = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    return {
      theme: ['system', 'light', 'dark'].includes(p.theme) ? p.theme : 'system',
      locale: p.locale === 'en' ? 'en' : 'ar',
      storageAvailable: true,
    };
  } catch {
    return { theme: 'system', locale: 'ar', storageAvailable: false };
  }
}
export function savePreference(key: 'theme' | 'locale', value: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ ...existing, [key]: value }));
    return true;
  } catch {
    return false;
  }
}
