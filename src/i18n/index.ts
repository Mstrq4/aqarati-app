// ============ i18n Hook — كشف اللغة تلقائياً ============
import { getLocales } from 'expo-localization';
import { ar, en, Translations } from './translations';

export type Language = 'ar' | 'en';

export function getDeviceLanguage(): Language {
  try {
    const locales = getLocales();
    const lang = locales[0]?.languageCode;
    return lang === 'ar' ? 'ar' : 'en';
  } catch {
    return 'ar';
  }
}

export function getTranslations(lang: Language): Translations {
  return lang === 'ar' ? ar : en;
}

export function t(lang: Language, key: string): string {
  const translations = lang === 'ar' ? ar : en;
  const keys = key.split('.');
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
  }
  return typeof value === 'string' ? value : key;
}

export { ar, en };
export type { Translations };
