import en from './translations/en.json';
import es from './translations/es.json';
import it from './translations/it.json';
import fr from './translations/fr.json';
import de from './translations/de.json';

export const languages = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
} as const;

export const defaultLang = 'es' as const;

export type Lang = keyof typeof languages;

const translations = { en, es, it, fr, de } as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return translations[lang];
}

export function getLocalizedPath(lang: Lang, path: string = '/'): string {
  if (lang === defaultLang) return path;
  return `/${lang}${path}`;
}
