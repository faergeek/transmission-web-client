import { useDispatch, useSelector, useStore } from 'react-redux';

import type {
  AppDispatch,
  AppGetState,
  AppState,
  AppStore,
} from '../store/create';

export function thunk<T>(
  cb: (args: Pick<AppStore, 'dispatch' | 'getState'>) => T,
) {
  return (dispatch: AppDispatch, getState: AppGetState) =>
    cb({ dispatch, getState });
}

export const useAppStore = useStore.withTypes<AppStore>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppState>();

export function curriedSelector<RestArgs extends unknown[], T>(
  selector: (state: AppState, ...args: RestArgs) => T,
) {
  return (...args: RestArgs) => {
    return (state: AppState) => selector(state, ...args);
  };
}
