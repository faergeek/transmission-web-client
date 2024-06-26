import { useActionData, useLoaderData } from 'react-router-dom';

import type { AppActionFunction, AppLoaderFunction } from './types';

export function useAppActionData<T extends AppActionFunction>(action: T) {
  return useActionData() as Awaited<ReturnType<typeof action>> | undefined;
}

export function useAppLoaderData<T extends AppLoaderFunction>(loader: T) {
  return useLoaderData() as Awaited<ReturnType<typeof loader>>;
}
