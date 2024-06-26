import { createTheme, MantineProvider } from '@mantine/core';
import type { Router } from '@remix-run/router';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import type { AppStore } from './store/create';

interface Props {
  queryClient: QueryClient;
  router: Router;
  store: AppStore;
}

export function App({ queryClient, router, store }: Props) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          defaultColorScheme="auto"
          theme={createTheme({
            cursorType: 'pointer',
            fontFamily: 'system-ui',
            respectReducedMotion: true,
          })}
        >
          <RouterProvider
            future={{ v7_startTransition: true }}
            router={router}
          />
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
}
