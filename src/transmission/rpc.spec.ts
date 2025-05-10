import type { Result } from '@faergeek/monads';
import type { DefaultBodyType } from 'msw';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';

import { buildServerUrl } from '../servers/utils';
import type { TransmissionRpcErrorInfo, TransmissionRpcRequest } from './rpc';
import { makeTransmissionRpcRequest } from './rpc';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('makeTransmissionRpcRequest', () => {
  it('sends a basic request', async () => {
    const rpcServer = {
      host: 'example.com',
      pathname: '/transmission/rpc',
      port: 9091,
      https: false,
    };

    const responder = vi.fn<
      (req: {
        headers: Record<string, string>;
        body: unknown;
      }) =>
        | HttpResponse<DefaultBodyType>
        | Promise<HttpResponse<DefaultBodyType>>
    >(() => HttpResponse.text('Unexpected request', { status: 400 }));

    server.use(
      http.post(buildServerUrl(rpcServer).toString(), async info =>
        responder({
          headers: Object.fromEntries(info.request.headers),
          body: await info.request.json(),
        }),
      ),
    );

    const request = {
      method: 'session-get',
    } satisfies TransmissionRpcRequest;

    responder.mockReturnValueOnce(
      HttpResponse.json({
        arguments: {
          'peer-port': 123,
          'script-torrent-done-enabled': false,
          version: '4.0.6 (38c164933e)',
        },
        result: 'success',
      }),
    );

    const result = await makeTransmissionRpcRequest(rpcServer, request);

    expectTypeOf(result).toEqualTypeOf<
      Result<
        {
          altSpeedDown: number;
          altSpeedEnabled: boolean;
          altSpeedTimeBegin: number;
          altSpeedTimeDay: number;
          altSpeedTimeEnabled: boolean;
          altSpeedTimeEnd: number;
          altSpeedUp: number;
          antiBruteForceEnabled: boolean;
          antiBruteForceThreshold: number;
          blocklistEnabled: boolean;
          blocklistSize: number;
          blocklistUrl: string;
          cacheSizeMb: number;
          configDir: string;
          defaultTrackers: string;
          dhtEnabled: boolean;
          downloadDir: string;
          downloadDirFreeSpace: number;
          downloadQueueEnabled: boolean;
          downloadQueueSize: number;
          encryption: 'required' | 'preferred' | 'tolerated';
          idleSeedingLimit: number;
          idleSeedingLimitEnabled: boolean;
          incompleteDir: string;
          incompleteDirEnabled: boolean;
          lpdEnabled: boolean;
          peerLimitGlobal: number;
          peerLimitPerTorrent: number;
          peerPort: number;
          peerPortRandomOnStart: boolean;
          pexEnabled: boolean;
          portForwardingEnabled: boolean;
          queueStalledEnabled: boolean;
          queueStalledMinutes: number;
          renamePartialFiles: boolean;
          rpcVersion: number;
          rpcVersionMinimum: number;
          rpcVersionSemver: string;
          scriptTorrentAddedEnabled: boolean;
          scriptTorrentAddedFilename: string;
          scriptTorrentDoneEnabled: boolean;
          scriptTorrentDoneFilename: string;
          scriptTorrentDoneSeedingEnabled: boolean;
          scriptTorrentDoneSeedingFilename: string;
          seedQueueEnabled: boolean;
          seedQueueSize: number;
          seedRatioLimit: number;
          seedRatioLimited: boolean;
          sessionId: string;
          speedLimitDown: number;
          speedLimitDownEnabled: boolean;
          speedLimitUp: number;
          speedLimitUpEnabled: boolean;
          startAddedTorrents: boolean;
          tcpEnabled: boolean;
          trashOriginalTorrentFiles: boolean;
          utpEnabled: true;
          version: string;
          units: {
            memoryBytes: number;
            memoryUnits: [string, string, string, string];
            sizeBytes: number;
            sizeUnits: [string, string, string, string];
            speedBytes: number;
            speedUnits: [string, string, string, string];
          };
        },
        TransmissionRpcErrorInfo
      >
    >();

    expect(responder.mock.calls).toStrictEqual([
      [
        {
          headers: { 'content-type': 'application/json' },
          body: request,
        },
      ],
    ]);

    expect(result.assertOk()).toStrictEqual({
      peerPort: 123,
      scriptTorrentDoneEnabled: false,
      version: '4.0.6 (38c164933e)',
    });
  });
});
