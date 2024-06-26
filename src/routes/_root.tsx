import { I18nProvider } from '@lingui/react';
import { Alert, Anchor, Box, Loader, Stack } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Outlet, useRouteError } from 'react-router-dom';
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

export function HydrateFallback() {
  return (
    <Stack align="center" h="100dvh" justify="center">
      <Loader type="bars" />
    </Stack>
  );
}

/* eslint-disable lingui/no-unlocalized-strings */
export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Stack align="center" h="100dvh" justify="center">
      <Box p="md">
        <Alert
          color="red"
          icon={<IconAlertTriangleFilled />}
          radius="xs"
          title="Something went wrong"
          variant="outline"
        >
          Please try to <Anchor href="">reload the page</Anchor>. If problem
          persists please{' '}
          <Anchor
            href="https://github.com/faergeek/transmission-web-client/issues/new"
            rel="noopener"
            target="_blank"
          >
            report a bug
          </Anchor>
        </Alert>
      </Box>
    </Stack>
  );
}
/* eslint-enable lingui/no-unlocalized-strings */
