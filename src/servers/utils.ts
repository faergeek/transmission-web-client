import { useAppDispatch } from '../store/utils';
import { setServerSessionId } from './slice';
import type { ServerUrlInput } from './types';

export function buildServerUrl(server: ServerUrlInput) {
  const protocol = server.https ? 'https' : 'http';
  const url = new URL(`${protocol}://${server.host}`);
  url.pathname = server.pathname;
  url.port = String(server.port);

  return url;
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
