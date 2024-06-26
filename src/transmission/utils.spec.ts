import { i18n } from '@lingui/core';
import { expect, test } from 'vitest';

import { formatBytes, formatBytesPerSecond, formatEta } from './utils';

test('formatBytes', () => {
  expect(formatBytes(i18n, 42)).toBe('42 byte');
  expect(formatBytes(i18n, 4242)).toBe('4.24 kB');
  expect(formatBytes(i18n, 42424242)).toBe('42.42 MB');
  expect(formatBytes(i18n, 4242424242)).toBe('4.24 GB');
  expect(formatBytes(i18n, 42424242424242)).toBe('42.42 TB');
});

test('formatBytesPerSecond', () => {
  expect(formatBytesPerSecond(i18n, 42)).toBe('42 byte/s');
  expect(formatBytesPerSecond(i18n, 4242)).toBe('4.24 kB/s');
  expect(formatBytesPerSecond(i18n, 42424242)).toBe('42.42 MB/s');
  expect(formatBytesPerSecond(i18n, 4242424242)).toBe('4.24 GB/s');
  expect(formatBytesPerSecond(i18n, 42424242424242)).toBe('42.42 TB/s');
});

test('formatEta', () => {
  expect(formatEta(0)).toBeNull();

  expect(formatEta(1)).toBe('1 second remaining');
  expect(formatEta(2)).toBe('2 seconds remaining');

  expect(formatEta(1 * 60)).toBe('1 minute remaining');
  expect(formatEta(2 * 60)).toBe('2 minutes remaining');
  expect(formatEta(1 * 60 + 1)).toBe('1 minute 1 second remaining');
  expect(formatEta(1 * 60 + 2)).toBe('1 minute 2 seconds remaining');

  expect(formatEta(1 * 60 * 60)).toBe('1 hour remaining');
  expect(formatEta(2 * 60 * 60)).toBe('2 hours remaining');

  expect(formatEta(1 * 60 * 60 + 1 * 60)).toBe('1 hour 1 minute remaining');
  expect(formatEta(1 * 60 * 60 + 2 * 60)).toBe('1 hour 2 minutes remaining');

  expect(formatEta(1 * 60 * 60 * 24)).toBe('1 day remaining');
  expect(formatEta(2 * 60 * 60 * 24)).toBe('2 days remaining');

  expect(formatEta(1 * 60 * 60 * 24 + 1 * 60 * 60)).toBe(
    '1 day 1 hour remaining',
  );
  expect(formatEta(1 * 60 * 60 * 24 + 2 * 60 * 60)).toBe(
    '1 day 2 hours remaining',
  );
});
