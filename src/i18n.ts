import type { I18n, Messages } from '@lingui/core';

const FALLBACK_LOCALE = 'en';

const messageImporters = Object.fromEntries(
  Object.entries(import.meta.glob('./locales/*/messages.po')).map(
    ([key, importFn]) => [
      key.replace(/^\.\/locales\//, '').replace(/\/messages\.po$/, ''),
      importFn as () => Promise<{ messages: Messages }>,
    ],
  ),
);

export const supportedLocales = Object.keys(messageImporters);

interface LocaleMeta {
  icon: string | undefined;
  label: string;
}

export const localesMeta: Partial<Record<string, LocaleMeta>> =
  Object.fromEntries(
    Object.entries(
      import.meta.glob('./locales/*/meta.tsx', { eager: true }),
    ).map(([key, value]) => {
      const locale = key
        .replace(/^\.\/locales\//, '')
        .replace(/\/meta\.tsx/, '');

      const meta = value && typeof value === 'object' ? value : {};

      const icon =
        'icon' in meta && typeof meta.icon === 'string' ? meta.icon : undefined;

      const label =
        'label' in meta && typeof meta.label === 'string' ? meta.label : locale;

      return [locale, { icon, label }];
    }),
  );

export function findSupportedLocale(preferredLocales: string[]) {
  return (
    preferredLocales.find(locale => messageImporters[locale] != null) ??
    preferredLocales.find(locale => messageImporters[locale.split('-')[0]]) ??
    FALLBACK_LOCALE
  );
}

export async function activateLocale(i18n: I18n, locale: string) {
  const { messages } = await messageImporters[locale]();
  i18n.loadAndActivate({ locale, messages });
}
