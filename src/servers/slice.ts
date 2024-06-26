import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit';
import * as S from 'superstruct';
import invariant from 'tiny-invariant';

import { thunk } from '../store/utils';
import type { ServerUrlInput } from './types';
import { buildServerUrl } from './utils';

const LOCAL_STORAGE_KEY = 'servers';

export const TransmissionRpcServer = S.object({
  host: S.string(),
  https: S.boolean(),
  id: S.string(),
  name: S.string(),
  password: S.optional(S.string()),
  pathname: S.string(),
  port: S.number(),
  username: S.optional(S.string()),
});

export type TransmissionRpcServer = S.Infer<typeof TransmissionRpcServer>;

const PersistentState = S.object({
  currentServerId: S.optional(S.string()),
  servers: S.array(TransmissionRpcServer),
  sessions: S.record(S.string(), S.string()),
});

type PersistentState = S.Infer<typeof PersistentState>;

const emptyPersistentState: PersistentState = { servers: [], sessions: {} };

export interface ServersState {
  byId: Partial<Record<string, TransmissionRpcServer>>;
  currentServerId?: string;
  list: string[];
  sessions: Partial<Record<string, string>>;
}

const initialState: ServersState = {
  byId: {},
  list: [],
  sessions: {},
};

const createLocalSelector = createSelector.withTypes<ServersState>();

const internalSelectServerById = (
  byId: ServersState['byId'],
  sessions: ServersState['sessions'],
  id: string | undefined,
) => {
  if (!id) return;
  const server = byId[id];
  if (!server) return;

  const url = buildServerUrl(server).toString();
  return { ...server, sessionId: sessions[url] };
};

const { actions, reducer, selectors } = createSlice({
  name: 'servers',
  initialState,
  reducers: {
    addServer(state, action: PayloadAction<TransmissionRpcServer>) {
      const server = action.payload;
      state.byId[server.id] = server;
      state.list.push(server.id);
    },
    restoreState(state, action: PayloadAction<PersistentState>) {
      const { currentServerId, servers, sessions } = action.payload;
      state.currentServerId = currentServerId;
      state.list = servers.map(server => server.id);
      state.sessions = sessions;

      state.byId = servers.reduce<ServersState['byId']>((acc, server) => {
        acc[server.id] = server;
        return acc;
      }, {});
    },
    setCurrentServerId(state, action: PayloadAction<string | undefined>) {
      state.currentServerId = action.payload;
    },
    setServerSessionId(
      state,
      action: PayloadAction<{ server: ServerUrlInput; sessionId: string }>,
    ) {
      const { server, sessionId } = action.payload;
      const url = buildServerUrl(server).toString();
      state.sessions[url] = sessionId;
    },
  },
  selectors: {
    selectCurrentServerId: state => state.currentServerId,
    selectCurrentServer: createLocalSelector(
      [
        state => state.byId,
        state => state.sessions,
        state => state.currentServerId,
      ],
      internalSelectServerById,
    ),
    selectServerById: createLocalSelector(
      [
        state => state.byId,
        state => state.sessions,
        (_, id: string | undefined) => id,
      ],
      internalSelectServerById,
    ),
    selectAllServers: createLocalSelector(
      [state => state.byId, state => state.sessions, state => state.list],
      (byId, sessions, list) =>
        list.map(id => {
          const server = internalSelectServerById(byId, sessions, id);
          invariant(server);
          return server;
        }),
    ),
    selectSessions: state => state.sessions,
  },
});

function persistServersState() {
  return thunk(({ getState }) => {
    const state = getState();

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(
        PersistentState.mask({
          currentServerId: selectors.selectCurrentServerId(state),
          servers: selectors.selectAllServers(state),
          sessions: { ...selectors.selectSessions(state) },
        }),
      ),
    );
  });
}

export function bindToLocalStorage() {
  return thunk(({ dispatch }) => {
    const initialValue = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (initialValue) {
      restoreState(initialValue);
    }

    addEventListener('storage', handleStorageEvent);

    if (import.meta.hot) {
      import.meta.hot.accept(mod => {
        if (mod) {
          dispatch(mod.bindToLocalStorage());
        }
      });

      import.meta.hot.dispose(() => {
        removeEventListener('storage', handleStorageEvent);
      });
    }

    function restoreState(localStorageValue: string) {
      try {
        dispatch(
          actions.restoreState(
            PersistentState.create(JSON.parse(localStorageValue)),
          ),
        );
      } catch {
        dispatch(actions.restoreState(emptyPersistentState));
      }
    }

    function handleStorageEvent(event: StorageEvent) {
      if (
        event.storageArea === localStorage &&
        event.key === LOCAL_STORAGE_KEY
      ) {
        if (event.newValue) {
          restoreState(event.newValue);
        } else {
          dispatch(actions.restoreState(emptyPersistentState));
        }
      }
    }
  });
}

export function addServer(input: {
  host: string;
  https: boolean;
  name: string;
  password?: string;
  pathname: string;
  port: number;
  sessionId?: string;
  username?: string;
}) {
  return thunk(({ dispatch }) => {
    const server = TransmissionRpcServer.create({ ...input, id: nanoid() });
    dispatch(actions.addServer(server));
    dispatch(persistServersState());
    return server;
  });
}

export function setServerSessionId({
  server,
  sessionId,
}: {
  server: ServerUrlInput;
  sessionId: string;
}) {
  return thunk(({ dispatch }) => {
    dispatch(actions.setServerSessionId({ server, sessionId }));
    dispatch(persistServersState());
  });
}

export function setCurrentServer(id: string | undefined) {
  return thunk(({ dispatch, getState }) => {
    const server = selectors.selectServerById(getState(), id);

    dispatch(actions.setCurrentServerId(server?.id));
    dispatch(persistServersState());
  });
}

export const servers = reducer;
export const { selectAllServers, selectCurrentServer } = selectors;
