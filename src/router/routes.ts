import type {
  ActionFunctionArgs,
  LazyRouteFunction,
  LoaderFunctionArgs,
  RouteObject,
} from 'react-router-dom';

import type {
  AppNonIndexRouteObject,
  AppRouteObject,
  RouteContext,
} from './types';

export function getRoutes(contextToInject: RouteContext): RouteObject[] {
  const eagerRoutes = Object.fromEntries(
    Object.entries(
      import.meta.glob(
        [
          '../routes/*.ts',
          '../routes/*.tsx',
          '!../routes/*.lazy.ts',
          '!../routes/*.lazy.tsx',
        ],
        {
          eager: true,
        },
      ),
    ).map(([key, value]) => [key.replace(/\.tsx?$/g, ''), value]),
  );

  const lazyRoutes = Object.fromEntries(
    Object.entries(
      import.meta.glob(['../routes/*.lazy.ts', '../routes/*.lazy.tsx']),
    ).map(([key, value]) => [key.replace(/\.lazy\.tsx?$/g, ''), value]),
  );

  const globRoutes: Partial<Record<string, AppNonIndexRouteObject>> =
    Object.fromEntries(
      Array.from(
        new Set([...Object.keys(eagerRoutes), ...Object.keys(lazyRoutes)]),
      ).map(key => {
        const route: AppRouteObject =
          eagerRoutes[key] && typeof eagerRoutes[key] === 'object'
            ? { ...eagerRoutes[key] }
            : {};

        const lazy = lazyRoutes[key];

        if (lazy) {
          route.lazy = lazy as AppRouteObject['lazy'];
        }

        return [key.replace(/^\.\.\/routes\//, ''), route];
      }),
    );

  const { _root, _index, ...otherRoutes } = globRoutes;

  const indexRoute: AppRouteObject[] = _index
    ? [{ index: true, ...globRoutes._index }]
    : [];

  const otherChildren: AppRouteObject[] = Object.entries(otherRoutes).map(
    ([key, value]) => ({
      ...value,
      path: key
        .split('.')
        .map(segment => segment.replace(/^\$$/, '*').replace(/^\$/, ':'))
        .join('/'),
      index: false,
    }),
  );

  return injectRouteContext(contextToInject, [
    {
      ..._root,
      path: '/',
      index: false,
      children: indexRoute.concat(otherChildren),
    },
  ]);
}

function injectRouteContext(
  context: RouteContext,
  routes: AppRouteObject[],
): RouteObject[] {
  function injectIntoAction(
    action: AppRouteObject['action'],
  ): RouteObject['action'] {
    return typeof action === 'function'
      ? (arg: ActionFunctionArgs) => action({ ...arg, context })
      : action;
  }

  function injectIntoLoader(
    loader: AppRouteObject['loader'],
  ): RouteObject['loader'] {
    return typeof loader === 'function'
      ? (arg: LoaderFunctionArgs) => loader({ ...arg, context })
      : loader;
  }

  function injectIntoLazy(
    lazy: AppRouteObject['lazy'],
  ): LazyRouteFunction<RouteObject> | undefined {
    return (
      lazy &&
      ((() =>
        lazy().then(({ action, loader, ...otherLazyProps }) => ({
          ...otherLazyProps,
          action: injectIntoAction(action),
          loader: injectIntoLoader(loader),
        }))) as LazyRouteFunction<RouteObject>)
    );
  }

  return routes.map(route =>
    route.index
      ? {
          ...route,
          action: injectIntoAction(route.action),
          lazy: injectIntoLazy(route.lazy),
          loader: injectIntoLoader(route.loader),
        }
      : {
          ...route,
          action: injectIntoAction(route.action),
          lazy: injectIntoLazy(route.lazy),
          loader: injectIntoLoader(route.loader),
          children:
            route.children && injectRouteContext(context, route.children),
        },
  );
}
