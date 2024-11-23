import { createTheme, MantineProvider } from '@mantine/core';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import type { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router';

import type { AppStore } from './store/create';

interface Props {
  queryClient: QueryClient;
  router: ReturnType<typeof createBrowserRouter>;
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
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
}
