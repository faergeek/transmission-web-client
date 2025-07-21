import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Button,
  Checkbox,
  Container,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core';
import { LockOpenIcon } from 'lucide-react';
import { Form, redirect, useNavigation } from 'react-router';
import * as S from 'superstruct';

import type { AppActionArgs, AppLoaderArgs } from '../router/types';
import { setServerSessionId, updateServer } from '../servers/slice';
import { selectCurrentServerInDataFunction } from '../servers/utils';
import { makeTransmissionRpcRequest } from '../transmission/rpc';

export async function loader({ context }: AppLoaderArgs) {
  const server = selectCurrentServerInDataFunction(context.store);

  const result = await makeTransmissionRpcRequest(
    server,
    { method: 'session-get', arguments: { fields: ['version'] } },
    {
      updateSessionId(sessionId) {
        context.store.dispatch(setServerSessionId({ server, sessionId }));
      },
    },
  );

  return result.match({
    Err: error => {
      if (error.kind === 'unauthorized') return null;

      throw error;
    },
    Ok: () => {
      throw redirect('/');
    },
  });
}

const checkbox = S.coerce(S.boolean(), S.optional(S.string()), Boolean);

const FormValues = S.object({
  password: S.optional(S.string()),
  saveCredentials: checkbox,
  username: S.optional(S.string()),
});

export async function action({ context, request }: AppActionArgs) {
  const currentServer = selectCurrentServerInDataFunction(context.store);

  const values = FormValues.create(
    Object.fromEntries(await request.formData()),
  );

  context.store.dispatch(updateServer({ ...currentServer, ...values }));

  return null;
}

export function Component() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  return (
    <Container mt="md" py="xl" size={400}>
      <Form method="POST">
        <Trans>Login</Trans>

        <Stack>
          <TextInput
            autoComplete="username"
            disabled={isSubmitting}
            label={t`Username`}
            name="username"
          />

          <PasswordInput
            autoComplete="current-password"
            disabled={isSubmitting}
            label={t`Password`}
            name="password"
          />

          <Checkbox
            disabled={isSubmitting}
            label={t`Save username and password`}
            name="saveCredentials"
          />

          <Group justify="end">
            <Button
              disabled={isSubmitting}
              leftSection={<LockOpenIcon />}
              loading={isSubmitting}
              type="submit"
            >
              <Trans>Login</Trans>
            </Button>
          </Group>
        </Stack>
      </Form>
    </Container>
  );
}
