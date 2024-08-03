import { useActionData, useLoaderData } from 'react-router-dom';

import type { AppActionFunction, AppLoaderFunction } from './types';

export function useAppActionData<T extends AppActionFunction>(_: T) {
  return useActionData() as Awaited<ReturnType<T>> | undefined;
}

export function useAppLoaderData<T extends AppLoaderFunction>(_: T) {
  return useLoaderData() as Awaited<ReturnType<T>>;
}
