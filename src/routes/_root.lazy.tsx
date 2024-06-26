import { I18nProvider } from '@lingui/react';
import { Outlet } from 'react-router-dom';
import * as S from 'superstruct';

import { activateLocale, findSupportedLocale } from '../i18n';
import { Layout } from '../layout/layout';
import type { AppActionArgs, AppLoaderArgs } from '../router/types';
import { useAppLoaderData } from '../router/utils';

const LOCALE_LOCAL_STORAGE_KEY = 'locale';

export async function loader({ context }: AppLoaderArgs) {
  const locales = navigator.languages.slice();

  const localeFromLocalStorage = localStorage.getItem(LOCALE_LOCAL_STORAGE_KEY);

  if (localeFromLocalStorage) {
    locales.unshift(localeFromLocalStorage);
  }

  await activateLocale(context.i18n, findSupportedLocale(locales));

  return context.i18n;
}

export async function action({ request }: AppActionArgs) {
  const schema = S.object({ locale: S.string() });

  const { locale } = schema.create(
    Object.fromEntries(await request.formData()),
  );

  localStorage.setItem(LOCALE_LOCAL_STORAGE_KEY, locale);

  return null;
}

export function Component() {
  const i18n = useAppLoaderData(loader);

  return (
    <I18nProvider i18n={i18n}>
      <Layout>
        <Outlet />
      </Layout>
    </I18nProvider>
  );
}
