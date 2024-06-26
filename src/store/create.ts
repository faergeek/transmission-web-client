import { configureStore } from '@reduxjs/toolkit';

import { reducer } from './reducer';

type AppExtraThunkArg = void;

export function createAppStore(extraThunkArg: AppExtraThunkArg) {
  const store = configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: { extraArgument: extraThunkArg } }),
    reducer,
  });

  if (import.meta.hot) {
    import.meta.hot.accept('./reducer.ts', mod => {
      if (mod) {
        store.replaceReducer(mod.reducer);
      }
    });
  }

  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];
export type AppState = ReturnType<AppGetState>;
