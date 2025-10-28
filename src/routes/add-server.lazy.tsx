import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Button,
  Checkbox,
  Collapse,
  Container,
  Group,
  InputWrapper,
  NumberInput,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Timeline,
} from '@mantine/core';
import {
  ArrowLeftIcon,
  CheckIcon,
  CloudAlertIcon,
  CloudCheckIcon,
  CloudCogIcon,
  LockIcon,
  LockKeyholeIcon,
  LockKeyholeOpenIcon,
  PlugIcon,
  PlusIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, redirect, useNavigation } from 'react-router';
import * as S from 'superstruct';

import type { AppActionArgs } from '../router/types';
import { useAppActionData } from '../router/utils';
import {
  addServer,
  setCurrentServer,
  setServerSessionId,
} from '../servers/slice';
import type { TransmissionRpcErrorInfo } from '../transmission/rpc';
import { makeTransmissionRpcRequest } from '../transmission/rpc';

const checkbox = S.coerce(S.boolean(), S.optional(S.string()), Boolean);

const FormValues = S.object({
  intent: S.union([S.literal('connect'), S.literal('login'), S.literal('add')]),
  host: S.string(),
  https: checkbox,
  name: S.optional(S.string()),
  password: S.optional(S.string()),
  pathname: S.string(),
  port: S.refine(
    S.coerce(S.number(), S.string(), value => parseInt(value, 10)),
    'port',
    isFinite,
  ),
  saveCredentials: checkbox,
  username: S.optional(S.string()),
});

function parseFormValues(formData: FormData) {
  return FormValues.create(Object.fromEntries(formData));
}

export async function action({ context, request }: AppActionArgs): Promise<{
  error?: TransmissionRpcErrorInfo;
  values: S.Infer<typeof FormValues>;
}> {
  const values = parseFormValues(await request.formData());

  const result = await makeTransmissionRpcRequest(
    values,
    { method: 'session-get', arguments: { fields: ['version'] } },
    {
      updateSessionId(sessionId) {
        context.store.dispatch(
          setServerSessionId({ server: values, sessionId }),
        );
      },
    },
  );

  return result.match({
    Err: error => ({ error, values }),
    Ok: () => {
      if (values.name) {
        const { intent, name, ...otherProps } = values;
        const input = { ...otherProps, name };
        const server = context.store.dispatch(addServer(input));

        context.store.dispatch(setCurrentServer(server.id));

        throw redirect('/');
      }

      return { values };
    },
  });
}

export function Component() {
  const navigation = useNavigation();
  const actionData = useAppActionData(action);

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useEffect(() => {
    if (!actionData || navigation.state !== 'idle') return;

    const { error } = actionData;

    if (!error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveItemIndex(2);
    } else if (error.kind === 'unauthorized') {
      setActiveItemIndex(1);
    }
  }, [actionData, navigation.state]);

  const connectionStatus = actionData
    ? actionData.error && actionData.error.kind !== 'unauthorized'
      ? 'failed'
      : 'success'
    : undefined;

  const loginStatus = actionData
    ? actionData.error?.kind === 'unauthorized'
      ? 'credentials-required'
      : actionData.values.username && actionData.values.password
        ? 'success'
        : 'unnecessary'
    : undefined;

  const isSubmitting = navigation.state !== 'idle';
  const pending = navigation.formData && parseFormValues(navigation.formData);

  return (
    <Container mt="md" py="xl" size={400}>
      <Timeline active={activeItemIndex} bulletSize={24} lineWidth={2}>
        <Timeline.Item
          bullet={
            connectionStatus === 'failed' ? (
              <CloudAlertIcon size={16} />
            ) : connectionStatus === 'success' ? (
              <CloudCheckIcon size={16} />
            ) : (
              <CloudCogIcon size={16} />
            )
          }
          color={connectionStatus === 'failed' ? 'red' : undefined}
          lineVariant={connectionStatus === 'success' ? 'solid' : 'dashed'}
          title={t`Connection information`}
        >
          <Stack gap="xs">
            {pending?.intent === 'connect' ? (
              <Text c="dimmed" size="sm">
                <Trans>Checking connection...</Trans>
              </Text>
            ) : actionData ? (
              actionData.error && actionData.error.kind !== 'unauthorized' ? (
                <Text c="red" size="sm">
                  {actionData?.error.kind === 'network-failure' ? (
                    <Trans>Could not connect to the server</Trans>
                  ) : (
                    <Trans>Unexpected error</Trans>
                  )}
                </Text>
              ) : (
                <Text c="green" size="sm">
                  <Trans>Connected</Trans>
                </Text>
              )
            ) : (
              <Text c="dimmed" size="sm">
                <Trans>
                  Please provide information necessary to connect to your
                  Transmission server
                </Trans>
              </Text>
            )}

            <Collapse in={activeItemIndex === 0}>
              <Form method="POST">
                <Stack>
                  <input defaultValue="connect" name="intent" type="hidden" />

                  <TextInput
                    autoFocus
                    defaultValue={actionData?.values?.host ?? 'localhost'}
                    disabled={isSubmitting}
                    label={t`Address`}
                    name="host"
                    required
                  />

                  <InputWrapper label={t`Port`} required>
                    <Group align="center">
                      <NumberInput
                        allowDecimal={false}
                        defaultValue={actionData?.values?.port ?? 9091}
                        disabled={isSubmitting}
                        name="port"
                        required
                      />

                      <Checkbox
                        defaultChecked={actionData?.values?.https ?? false}
                        disabled={isSubmitting}
                        label="HTTPS"
                        name="https"
                      />
                    </Group>
                  </InputWrapper>

                  <TextInput
                    defaultValue={
                      actionData?.values?.pathname ?? '/transmission/rpc'
                    }
                    disabled={isSubmitting}
                    label={t`Path`}
                    name="pathname"
                    required
                  />

                  <Group justify="end">
                    <Button
                      disabled={isSubmitting}
                      leftSection={<PlugIcon />}
                      loading={isSubmitting}
                      type="submit"
                    >
                      <Trans>Connect</Trans>
                    </Button>
                  </Group>
                </Stack>
              </Form>
            </Collapse>
          </Stack>
        </Timeline.Item>

        <Timeline.Item
          bullet={
            loginStatus === 'credentials-required' ? (
              <LockKeyholeIcon size={16} />
            ) : loginStatus === 'success' || loginStatus === 'unnecessary' ? (
              <LockKeyholeOpenIcon size={16} />
            ) : (
              <LockIcon size={16} />
            )
          }
          lineVariant={
            loginStatus === 'success' || loginStatus === 'unnecessary'
              ? 'solid'
              : 'dashed'
          }
          title={t`Login`}
        >
          <Stack>
            <Stack gap="xs">
              {pending?.intent === 'login' ? (
                <Text c="dimmed" size="sm">
                  <Trans>Logging in...</Trans>
                </Text>
              ) : actionData && actionData.values.intent === 'login' ? (
                actionData.error ? (
                  <Text c="red" size="sm">
                    {actionData.values.username ||
                    actionData.values.password ? (
                      <Trans>Wrong username and/or password</Trans>
                    ) : (
                      <Trans>Please provide username and password</Trans>
                    )}
                  </Text>
                ) : (
                  <Text c="green" size="sm">
                    {loginStatus === 'unnecessary' ? (
                      <Trans>
                        Server does not require username and password
                      </Trans>
                    ) : (
                      <Trans>Logged in</Trans>
                    )}
                  </Text>
                )
              ) : actionData?.error?.kind === 'unauthorized' ? (
                <Text c="dimmed" size="sm">
                  <Trans>Server requires username and password</Trans>
                </Text>
              ) : (
                <Text c="dimmed" size="sm">
                  <Trans>
                    If server is configured to require username and password you
                    will need to provide them at this step
                  </Trans>
                </Text>
              )}

              <Collapse in={activeItemIndex === 1}>
                <Form method="POST">
                  <input defaultValue="login" name="intent" type="hidden" />

                  <input
                    defaultValue={actionData?.values.host}
                    name="host"
                    type="hidden"
                  />

                  <input
                    defaultValue={actionData?.values.https ? 'on' : ''}
                    name="https"
                    type="hidden"
                  />

                  <input
                    defaultValue={actionData?.values.pathname}
                    name="pathname"
                    type="hidden"
                  />

                  <input
                    defaultValue={actionData?.values.port}
                    name="port"
                    type="hidden"
                  />

                  <Stack>
                    <TextInput
                      autoComplete="username"
                      defaultValue={actionData?.values?.username}
                      disabled={isSubmitting}
                      label={t`Username`}
                      name="username"
                    />

                    <PasswordInput
                      autoComplete="current-password"
                      defaultValue={actionData?.values?.password}
                      disabled={isSubmitting}
                      label={t`Password`}
                      name="password"
                    />

                    <Checkbox
                      defaultChecked={
                        actionData?.values?.saveCredentials ?? false
                      }
                      disabled={isSubmitting}
                      label={t`Save username and password`}
                      name="saveCredentials"
                    />

                    <Group justify="end">
                      <Button
                        disabled={isSubmitting}
                        leftSection={<ArrowLeftIcon />}
                        variant="subtle"
                        onClick={() => {
                          setActiveItemIndex(prev => prev - 1);
                        }}
                      >
                        <Trans>Back</Trans>
                      </Button>

                      <Button
                        disabled={isSubmitting}
                        leftSection={<LockKeyholeOpenIcon />}
                        loading={isSubmitting}
                        type="submit"
                      >
                        <Trans>Login</Trans>
                      </Button>
                    </Group>
                  </Stack>
                </Form>
              </Collapse>
            </Stack>
          </Stack>
        </Timeline.Item>

        <Timeline.Item bullet={<CheckIcon size={12} />} title={t`Ready`}>
          <Stack>
            <Text c="dimmed" size="sm">
              <Trans>Name your server and you&apos;re good to go</Trans>
            </Text>

            <Collapse in={activeItemIndex === 2}>
              <Form method="POST">
                <input defaultValue="add" name="intent" type="hidden" />

                <input
                  defaultValue={actionData?.values.host}
                  name="host"
                  type="hidden"
                />

                <input
                  defaultValue={actionData?.values.https ? 'on' : undefined}
                  name="https"
                  type="hidden"
                />

                <input
                  defaultValue={actionData?.values.pathname}
                  name="pathname"
                  type="hidden"
                />

                <input
                  defaultValue={actionData?.values.port}
                  name="port"
                  type="hidden"
                />

                <input
                  defaultValue={actionData?.values.username}
                  name="username"
                  type="hidden"
                />

                <input
                  defaultValue={actionData?.values.password}
                  name="password"
                  type="hidden"
                />

                <input
                  defaultValue={
                    actionData?.values.saveCredentials ? 'on' : undefined
                  }
                  name="saveCredentials"
                  type="hidden"
                />

                <Stack>
                  <TextInput
                    defaultValue={
                      actionData?.values.name ?? actionData?.values.host
                    }
                    disabled={isSubmitting}
                    label={t`Name`}
                    name="name"
                    required
                  />

                  <Group justify="end">
                    <Button
                      disabled={isSubmitting}
                      leftSection={<ArrowLeftIcon />}
                      variant="subtle"
                      onClick={() => {
                        setActiveItemIndex(prev => prev - 1);
                      }}
                    >
                      <Trans>Back</Trans>
                    </Button>

                    <Button
                      disabled={isSubmitting}
                      leftSection={<PlusIcon />}
                      loading={isSubmitting}
                      type="submit"
                    >
                      <Trans>Add</Trans>
                    </Button>
                  </Group>
                </Stack>
              </Form>
            </Collapse>
          </Stack>
        </Timeline.Item>
      </Timeline>
    </Container>
  );
}
