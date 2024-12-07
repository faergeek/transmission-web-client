import type { I18n } from '@lingui/core';
import { plural, t } from '@lingui/core/macro';

function formatUnits(
  i18n: I18n,
  bytes: number,
  divisor: number,
  units: string[],
) {
  let i = 0;
  for (i = 0; i < units.length && bytes / divisor >= 1; i++) {
    bytes /= divisor;
  }

  return i18n.number(bytes, {
    maximumFractionDigits: 2,
    style: 'unit',
    unit: units[i],
  });
}

export function formatBytes(i18n: I18n, value: number) {
  return formatUnits(i18n, value, 1000, [
    'byte',
    'kilobyte',
    'megabyte',
    'gigabyte',
    'terabyte',
  ]);
}

export function formatBytesPerSecond(i18n: I18n, value: number) {
  return formatUnits(i18n, value, 1000, [
    'byte-per-second',
    'kilobyte-per-second',
    'megabyte-per-second',
    'gigabyte-per-second',
    'terabyte-per-second',
  ]);
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatEta(eta: number) {
  if (eta <= 0) return null;

  const days = Math.floor(eta / DAY);
  const hours = Math.floor((eta % DAY) / HOUR);
  const minutes = Math.floor((eta % HOUR) / MINUTE);
  const seconds = Math.floor(eta % MINUTE);

  const duration = [
    days && plural(days, { one: '# day', other: '# days' }),
    hours && plural(hours, { one: '# hour', other: '# hours' }),
    minutes && plural(minutes, { one: '# minute', other: '# minutes' }),
    seconds && plural(seconds, { one: '# second', other: '# seconds' }),
  ]
    .filter(Boolean)
    .join(' ');

  return t`${duration} remaining`;
}
