import { useLingui } from '@lingui/react';
import { Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import type { AppLoaderArgs } from '../router/types';
import { useAppLoaderData } from '../router/utils';
import { selectCurrentServer, setServerSessionId } from '../servers/slice';
import {
  selectCurrentServerInDataFunction,
  useUpdateSessionId,
} from '../servers/utils';
import { useAppSelector } from '../store/utils';
import type { TransmissionRpcRequest } from '../transmission/rpc';
import {
  handleTransmissionRpcErrorInDataFunction,
  TorrentStatus,
  transmissionRpcQuery,
} from '../transmission/rpc';
import { formatBytesPerSecond, formatEta } from '../transmission/utils';

const torrentGetRequest = {
  method: 'torrent-get',
  arguments: {
    fields: [
      'addedDate',
      'eta',
      'id',
      'name',
      'percentComplete',
      'percentDone',
      'primary-mime-type',
      'rateDownload',
      'rateUpload',
      'status',
    ],
  },
} satisfies TransmissionRpcRequest;

export async function loader({ context }: AppLoaderArgs) {
  const server = selectCurrentServerInDataFunction(context.store);

  return handleTransmissionRpcErrorInDataFunction(
    context.queryClient.fetchQuery(
      transmissionRpcQuery({
        request: torrentGetRequest,
        server,
        updateSessionId(sessionId) {
          context.store.dispatch(setServerSessionId({ server, sessionId }));
        },
      }),
    ),
  );
}

export function Component() {
  const { i18n } = useLingui();
  const initialData = useAppLoaderData(loader);

  const server = useAppSelector(selectCurrentServer);
  const updateSessionId = useUpdateSessionId(server);

  const torrentGetResponse = useQuery({
    ...transmissionRpcQuery({
      request: torrentGetRequest,
      server,
      updateSessionId,
    }),
    initialData,
    refetchInterval: 3000,
  });

  return torrentGetResponse.data.torrents.map(torrent => {
    const formattedEta =
      torrent.status === TorrentStatus.Downloading
        ? formatEta(torrent.eta)
        : null;

    return (
      <Paper key={torrent.id} p={8} withBorder>
        <Stack gap={4}>
          <Group justify="space-between">
            <Text fw="bold">{torrent.name}</Text>
          </Group>

          <Progress size="sm" value={torrent.percentDone * 100} />

          <Group justify="space-between">
            <Group gap="xs">
              <IconDownload size={12} />

              <Text c="dimmed" fz="xs">
                {formatBytesPerSecond(i18n, torrent.rateDownload)}
              </Text>

              <IconUpload size={12} />

              <Text c="dimmed" fz="xs">
                {formatBytesPerSecond(i18n, torrent.rateUpload)}
              </Text>
            </Group>

            {formattedEta && (
              <Text c="dimmed" size="xs">
                {formattedEta}
              </Text>
            )}
          </Group>
        </Stack>
      </Paper>
    );
  });
}
