import { redirect } from 'react-router';

import type { AppStore } from '../store/create';
import { useAppDispatch } from '../store/utils';
import {
  selectAllServers,
  selectCurrentServer,
  setCurrentServer,
  setServerSessionId,
} from './slice';
import type { ServerUrlInput } from './types';

export function buildServerUrl(server: ServerUrlInput) {
  const protocol = server.https ? 'https' : 'http';
  const url = new URL(`${protocol}://${server.host}`);
  url.pathname = server.pathname;
  url.port = String(server.port);

  return url;
}

export function selectCurrentServerInDataFunction(store: AppStore) {
  let server = selectCurrentServer(store.getState());

  if (!server) {
    const servers = selectAllServers(store.getState());
    const firstServer = servers.at(0);

    if (!firstServer) {
      throw redirect('/add-server');
    }

    store.dispatch(setCurrentServer(firstServer.id));
    server = firstServer;
  }

  return server;
}

export function useUpdateSessionId(server: ServerUrlInput | undefined) {
  const dispatch = useAppDispatch();

  return (
    server &&
    ((sessionId: string) => {
      dispatch(setServerSessionId({ server, sessionId }));
    })
  );
}
