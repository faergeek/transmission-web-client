import type { I18n } from '@lingui/core';
import type { QueryClient } from '@tanstack/react-query';
import type {
  IndexRouteObject,
  NonIndexRouteObject,
  Params,
} from 'react-router-dom';

import type { AppStore } from '../store/create';

export interface RouteContext {
  i18n: I18n;
  queryClient: QueryClient;
  store: AppStore;
}

export interface AppLoaderArgs {
  request: Request;
  params: Params;
  context: RouteContext;
}

export interface AppActionArgs {
  request: Request;
  params: Params;
  context: RouteContext;
}

type DataFunctionValue = Response | NonNullable<unknown> | null;
type DataFunctionReturnValue = Promise<DataFunctionValue> | DataFunctionValue;

export type AppLoaderFunction = (
  args: AppLoaderArgs,
) => DataFunctionReturnValue;

export type AppActionFunction = (
  args: AppActionArgs,
) => DataFunctionReturnValue;

type AppLazyRouteFunction = () => Promise<
  Omit<
    AppNonIndexRouteObject,
    'caseSensitive' | 'id' | 'index' | 'lazy' | 'path'
  >
>;

export type AppIndexRouteObject = Omit<
  IndexRouteObject,
  'action' | 'children' | 'lazy' | 'loader'
> & {
  action?: AppActionFunction;
  lazy?: AppLazyRouteFunction;
  loader?: AppLoaderFunction;
};

export type AppNonIndexRouteObject = Omit<
  NonIndexRouteObject,
  'action' | 'children' | 'lazy' | 'loader'
> & {
  action?: AppActionFunction;
  children?: AppRouteObject[];
  lazy?: AppLazyRouteFunction;
  loader?: AppLoaderFunction;
};

export type AppRouteObject = AppIndexRouteObject | AppNonIndexRouteObject;
