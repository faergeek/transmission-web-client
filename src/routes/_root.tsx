import { Alert, Anchor, Box, Loader, Stack } from '@mantine/core';
import { TriangleAlertIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useRouteError } from 'react-router';

export function HydrateFallback() {
  return (
    <Stack align="center" h="100dvh" justify="center">
      <Loader type="bars" />
    </Stack>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Stack align="center" h="100dvh" justify="center">
      <Box p="md">
        <Alert
          color="red"
          icon={<TriangleAlertIcon />}
          radius="xs"
          title="Something went wrong"
          variant="outline"
        >
          Please try to <Anchor href="">reload the page</Anchor>. If problem
          persists please{' '}
          <Anchor
            href="https://github.com/faergeek/transmission-web-client/issues/new"
            rel="noopener"
            target="_blank"
          >
            report a bug
          </Anchor>
        </Alert>
      </Box>
    </Stack>
  );
}
