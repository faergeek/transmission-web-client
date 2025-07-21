import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import {
  ActionIcon,
  AppShell,
  Group,
  Modal,
  Select,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  CheckIcon,
  FolderPlusIcon,
  ServerCogIcon,
  SettingsIcon,
} from 'lucide-react';
import { useFetcher } from 'react-router';

import { localesMeta, supportedLocales } from '../i18n';
import { selectCurrentServer } from '../servers/slice';
import { useAppSelector } from '../store/utils';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const { i18n } = useLingui();
  const server = useAppSelector(selectCurrentServer);
  const changeLocaleFetcher = useFetcher();
  const [isServerSettingsModalOpen, serverSettingsModal] = useDisclosure(false);

  return (
    <AppShell header={{ height: 44 }}>
      <AppShell.Header>
        <Group justify="space-between" wrap="nowrap">
          <ActionIcon.Group>
            <ActionIcon
              aria-label={t`Add a torrent from file`}
              disabled={!server}
              size="xl"
              variant="default"
            >
              <FolderPlusIcon />
            </ActionIcon>

            <ActionIcon
              aria-label={t`Server settings`}
              size="xl"
              variant="default"
              onClick={serverSettingsModal.open}
            >
              <ServerCogIcon />
            </ActionIcon>

            <ActionIcon
              aria-label={t`Client settings`}
              size="xl"
              variant="default"
            >
              <SettingsIcon />
            </ActionIcon>
          </ActionIcon.Group>

          <Group>
            <Select
              allowDeselect={false}
              aria-label={t`Language`}
              data={supportedLocales.map(locale => ({
                label: localesMeta[locale]?.label ?? locale,
                value: locale,
              }))}
              defaultValue={i18n.locale}
              leftSection={
                <Text component="span" fz={16} w={16}>
                  {localesMeta[i18n.locale]?.icon}
                </Text>
              }
              renderOption={({ option, checked }) => (
                <Group flex="1" gap="xs">
                  <Text component="span" fz={16} w={16}>
                    {localesMeta[option.value]?.icon}
                  </Text>

                  {option.label}

                  {checked && (
                    <CheckIcon style={{ marginInlineStart: 'auto' }} />
                  )}
                </Group>
              )}
              searchable
              onChange={locale => {
                changeLocaleFetcher.submit(
                  { locale },
                  { method: 'post', action: '/' },
                );
              }}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>

      <Modal
        opened={isServerSettingsModalOpen}
        title={t`Server settings`}
        onClose={serverSettingsModal.close}
      >
        <Trans>Server settings</Trans>
      </Modal>
    </AppShell>
  );
}
