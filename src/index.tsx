import './index.css';
import '@mantine/core/styles.css';

import { i18n } from '@lingui/core';
import { QueryClient } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import invariant from 'tiny-invariant';

import { App } from './app';
import * as routesMod from './router/routes';
import { bindToLocalStorage } from './servers/slice';
import { createAppStore } from './store/create';

const rootEl = document.getElementById('app');
invariant(rootEl);

const store = createAppStore();
store.dispatch(bindToLocalStorage());

const queryClient = new QueryClient();

i18n.on('change', () => {
  document.documentElement.lang = i18n.locale;
});

let { getRoutes } = routesMod;

const contextToInject = { i18n, queryClient, store };

const router = createBrowserRouter(getRoutes(contextToInject), {
  basename: import.meta.env.BASE_URL,
});

if (import.meta.hot) {
  import.meta.hot.accept('./router/routes.ts', updatedRoutesMod => {
    if (!updatedRoutesMod) return;

    ({ getRoutes } = updatedRoutesMod);
    router._internalSetRoutes(getRoutes(contextToInject));
    router.revalidate();
  });
}

createRoot(rootEl).render(
  <StrictMode>
    <App queryClient={queryClient} router={router} store={store} />
  </StrictMode>,
);
