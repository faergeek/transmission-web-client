import { Result } from '@faergeek/monads';
import { queryOptions, skipToken } from '@tanstack/react-query';
import { redirect } from 'react-router-dom';
import invariant from 'tiny-invariant';

import type { ServerUrlInput } from '../servers/types';
import { buildServerUrl } from '../servers/utils';
import { base64Encode } from '../utils/base64';
import type { ConvertSnakeCaseKeysToCamelCase } from '../utils/case';
import { convertSnakeCaseKeysToCamelCase } from '../utils/case';

type Units = [string, string, string, string];

const SESSION_ID_HEADER_NAME = 'X-Transmission-Session-Id';

type SessionEncryption = 'required' | 'preferred' | 'tolerated';

interface SessionGetResponseValues {
  'alt-speed-down': number;
  'alt-speed-enabled': boolean;
  'alt-speed-time-begin': number;
  'alt-speed-time-day': number;
  'alt-speed-time-enabled': boolean;
  'alt-speed-time-end': number;
  'alt-speed-up': number;
  'anti-brute-force-enabled': boolean;
  'anti-brute-force-threshold': number;
  'blocklist-enabled': boolean;
  'blocklist-size': number;
  'blocklist-url': string;
  'cache-size-mb': number;
  'config-dir': string;
  'default-trackers': string;
  'dht-enabled': boolean;
  'download-dir': string;
  'download-dir-free-space': number;
  'download-queue-enabled': boolean;
  'download-queue-size': number;
  encryption: SessionEncryption;
  'idle-seeding-limit': number;
  'idle-seeding-limit-enabled': boolean;
  'incomplete-dir': string;
  'incomplete-dir-enabled': boolean;
  'lpd-enabled': boolean;
  'peer-limit-global': number;
  'peer-limit-per-torrent': number;
  'peer-port': number;
  'peer-port-random-on-start': boolean;
  'pex-enabled': boolean;
  'port-forwarding-enabled': boolean;
  'queue-stalled-enabled': boolean;
  'queue-stalled-minutes': number;
  'rename-partial-files': boolean;
  'rpc-version': number;
  'rpc-version-minimum': number;
  'rpc-version-semver': string;
  'script-torrent-added-enabled': boolean;
  'script-torrent-added-filename': string;
  'script-torrent-done-enabled': boolean;
  'script-torrent-done-filename': string;
  'script-torrent-done-seeding-enabled': boolean;
  'script-torrent-done-seeding-filename': string;
  'seed-queue-enabled': boolean;
  'seed-queue-size': number;
  seedRatioLimit: number;
  seedRatioLimited: boolean;
  'session-id': string;
  'speed-limit-down': number;
  'speed-limit-down-enabled': boolean;
  'speed-limit-up': number;
  'speed-limit-up-enabled': boolean;
  'start-added-torrents': boolean;
  'tcp-enabled': boolean;
  'trash-original-torrent-files': boolean;
  'utp-enabled': true;
  version: string;
  units: {
    'memory-bytes': number;
    'memory-units': Units;
    'size-bytes': number;
    'size-units': Units;
    'speed-bytes': number;
    'speed-units': Units;
  };
}

type SessionGetField = keyof SessionGetResponseValues;

interface SessionGetRequest<
  Fields extends SessionGetField[] = SessionGetField[],
> {
  method: 'session-get';
  arguments?: {
    fields?: Fields;
  };
}

export enum TorrentStatus {
  Stopped = 0,
  QueuedToVerify = 1,
  Verifying = 2,
  QueuedToDownload = 3,
  Downloading = 4,
  QueuedToSeed = 5,
  Seeding = 6,
}

interface TorrentGetResponseValues {
  activityDate: number;
  addedDate: number;
  availability: unknown;
  bandwidthPriority: number;
  comment: string;
  corruptEver: number;
  creator: string;
  dateCreated: number;
  desiredAvailable: number;
  doneDate: number;
  downloadDir: string;
  downloadedEver: number;
  downloadLimit: number;
  downloadLimited: boolean;
  editDate: number;
  error: number;
  errorString: string;
  eta: number;
  etaIdle: number;
  'file-count': number;
  files: unknown[];
  fileStats: unknown[];
  group: string;
  hashString: string;
  haveUnchecked: number;
  haveValid: number;
  honorsSessionLimits: boolean;
  id: number;
  isFinished: boolean;
  isPrivate: boolean;
  isStalled: boolean;
  labels: unknown[];
  leftUntilDone: number;
  magnetLink: string;
  manualAnnounceTime: number;
  maxConnectedPeers: number;
  metadataPercentComplete: number;
  name: string;
  'peer-limit': number;
  peers: unknown[];
  peersConnected: number;
  peersFrom: object;
  peersGettingFromUs: number;
  peersSendingToUs: number;
  percentComplete: number;
  percentDone: number;
  pieces: string;
  pieceCount: number;
  pieceSize: number;
  priorities: unknown[];
  'primary-mime-type': string;
  queuePosition: number;
  rateDownload: number;
  rateUpload: number;
  recheckProgress: number;
  secondsDownloading: number;
  secondsSeeding: number;
  seedIdleLimit: number;
  seedIdleMode: number;
  seedRatioLimit: number;
  seedRatioMode: number;
  sequentialDownload: boolean;
  sizeWhenDone: number;
  startDate: number;
  status: TorrentStatus;
  trackers: unknown[];
  trackerList: string;
  trackerStats: unknown[];
  totalSize: number;
  torrentFile: string;
  uploadedEver: number;
  uploadLimit: number;
  uploadLimited: boolean;
  uploadRatio: number;
  wanted: unknown[];
  webseeds: unknown[];
  webseedsSendingToUs: number;
}

type TorrentGetField = keyof TorrentGetResponseValues;

interface TorrentGetByIdRequest<
  Fields extends TorrentGetField[] = TorrentGetField[],
> {
  method: 'torrent-get';
  arguments: {
    fields: Fields;
    ids?: number | Array<number | string>;
  };
}

interface TorrentGetRecentlyActiveRequest<
  Fields extends TorrentGetField[] = TorrentGetField[],
> {
  method: 'torrent-get';
  arguments: {
    fields: Fields;
    ids: 'recently-active';
  };
}

type TorrentGetRequest =
  | TorrentGetByIdRequest
  | TorrentGetRecentlyActiveRequest;

export type TransmissionRpcRequest = SessionGetRequest | TorrentGetRequest;

type TransmissionRpcResponseRaw<T extends TransmissionRpcRequest> =
  T extends SessionGetRequest<infer Fields>
    ? { [K in Fields[number]]: SessionGetResponseValues[K] }
    : T extends TorrentGetRecentlyActiveRequest<infer Fields>
      ? {
          removed: number[];
          torrents: Array<{
            [K in Fields[number]]: TorrentGetResponseValues[K];
          }>;
        }
      : T extends TorrentGetByIdRequest<infer Fields>
        ? {
            torrents: Array<{
              [K in Fields[number]]: TorrentGetResponseValues[K];
            }>;
          }
        : never;

export type TransmissionRpcResponse<T extends TransmissionRpcRequest> =
  ConvertSnakeCaseKeysToCamelCase<TransmissionRpcResponseRaw<T>>;

interface TransmissionRpcResponseInfo {
  status: number;
  statusText: string;
  text: string;
}

export type TransmissionRpcErrorInfo =
  | { kind: 'network-failure' }
  | ({ kind: 'session-update-failure' } & TransmissionRpcResponseInfo)
  | ({ kind: 'unauthorized' } & TransmissionRpcResponseInfo)
  | ({ kind: 'unexpected-failure' } & TransmissionRpcResponseInfo)
  | ({ kind: 'unexpected-response-content' } & TransmissionRpcResponseInfo);

class TransmissionRpcError extends Error {
  readonly info;
  readonly name = TransmissionRpcError.name;

  constructor(info: TransmissionRpcErrorInfo) {
    super(info.kind);
    this.info = info;
  }
}

interface TransmissionRpcServerForRequest extends ServerUrlInput {
  password?: string;
  sessionId?: string;
  username?: string;
}

export async function makeTransmissionRpcRequest<
  T extends TransmissionRpcRequest,
>(
  server: TransmissionRpcServerForRequest,
  request: T,
  {
    signal,
    updateSessionId,
  }: {
    signal?: AbortSignal;
    updateSessionId?: (newSessionId: string) => void;
  } = {},
) {
  return makeRequest(server.sessionId);

  async function makeRequest(
    sessionId: string | undefined,
  ): Promise<Result<TransmissionRpcResponse<T>, TransmissionRpcErrorInfo>> {
    const req = new Request(buildServerUrl(server), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (server.password && server.username) {
      req.headers.set(
        'Authorization',
        `Basic ${base64Encode(`${server.username}:${server.password}`)}`,
      );
    }

    if (sessionId) {
      req.headers.set(SESSION_ID_HEADER_NAME, sessionId);
    }

    let res: Response;

    try {
      res = await fetch(req);
    } catch {
      return Result.Err({ kind: 'network-failure' });
    }

    if (!res.ok) {
      switch (res.status) {
        case 401:
          return Result.Err({
            kind: 'unauthorized',
            status: res.status,
            statusText: res.statusText,
            text: await res.text(),
          });
        case 409:
          if (sessionId === server.sessionId) {
            const updatedSessionId = res.headers.get(SESSION_ID_HEADER_NAME);

            if (updatedSessionId) {
              const responseWithUpdatedSessionId =
                await makeRequest(updatedSessionId);
              updateSessionId?.(updatedSessionId);
              return responseWithUpdatedSessionId;
            }
          }

          return Result.Err({
            kind: 'session-update-failure',
            status: res.status,
            statusText: res.statusText,
            text: await res.text(),
          });
        default: {
          const text = await res.text();

          try {
            const json: unknown = JSON.parse(text);
            invariant(
              json &&
                typeof json === 'object' &&
                'result' in json &&
                typeof json.result === 'string',
            );
            return Result.Err({
              kind: 'unexpected-response-content',
              status: res.status,
              statusText: res.statusText,
              text: JSON.stringify(json),
            });
          } catch {
            return Result.Err({
              kind: 'unexpected-failure',
              status: res.status,
              statusText: res.statusText,
              text,
            });
          }
        }
      }
    }

    const json: unknown = await res.json();

    if (
      !json ||
      typeof json !== 'object' ||
      !('result' in json) ||
      typeof json.result !== 'string' ||
      !('arguments' in json)
    ) {
      return Result.Err({
        kind: 'unexpected-response-content',
        status: res.status,
        statusText: res.statusText,
        text: JSON.stringify(json),
      });
    }

    if (json.result !== 'success') {
      return Result.Err({
        kind: 'unexpected-failure',
        status: res.status,
        statusText: res.statusText,
        text: JSON.stringify(json),
      });
    }

    return Result.Ok(
      convertSnakeCaseKeysToCamelCase(
        json.arguments as TransmissionRpcResponseRaw<T>,
      ),
    );
  }
}

export function transmissionRpcQuery<T extends TransmissionRpcRequest>({
  request,
  server,
  updateSessionId,
}: {
  request: T;
  server: TransmissionRpcServerForRequest | undefined;
  updateSessionId?: (sessionId: string) => void;
}) {
  return queryOptions({
    queryKey: [server, request],
    queryFn: server
      ? async () => {
          const result = await makeTransmissionRpcRequest(server, request, {
            updateSessionId,
          });

          return result.match({
            Ok: json => json,
            Err: err => {
              throw new TransmissionRpcError(err);
            },
          });
        }
      : skipToken,
  });
}

export async function handleTransmissionRpcErrorInDataFunction<T>(
  promise: Promise<T>,
) {
  try {
    return await promise;
  } catch (err) {
    if (
      err instanceof TransmissionRpcError &&
      err.info.kind === 'unauthorized'
    ) {
      throw redirect('/login');
    }

    throw err;
  }
}
