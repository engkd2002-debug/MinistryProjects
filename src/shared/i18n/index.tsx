import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { readPreferences, savePreference, type Locale } from '../theme/preferences';
import { messages } from './messages';
import { showcaseMessages } from './showcase';
import { explorerMessages } from './explorer';
void i18n.use(initReactI18next).init({
  lng: readPreferences().locale,
  fallbackLng: 'ar',
  resources: {
    ar: {
      translation: {
        ...messages.ar,
        ...explorerMessages.ar,
        ...(import.meta.env.DEV ? showcaseMessages.ar : {}),
      },
    },
    en: {
      translation: {
        ...messages.en,
        ...explorerMessages.en,
        ...(import.meta.env.DEV ? showcaseMessages.en : {}),
      },
    },
  },
  interpolation: { escapeValue: false },
  initAsync: false,
});
export function useI18n() {
  const { t, i18n: instance } = useTranslation();
  const locale: Locale = instance.language === 'en' ? 'en' : 'ar';
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.title = t('productName');
  }, [locale, t]);
  return {
    t: (key: string, options?: Record<string, unknown>) => String(t(key, options)),
    locale,
    dir: locale === 'ar' ? ('rtl' as const) : ('ltr' as const),
    setLocale: (v: Locale) => {
      void instance.changeLanguage(v);
      setStorageError(!savePreference('locale', v));
    },
    storageError,
    formatNumber: (n: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(n),
    formatDate: (d: Date) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d),
  };
}
export { i18n };
