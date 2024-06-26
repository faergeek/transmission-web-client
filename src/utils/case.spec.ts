import { describe, expect, expectTypeOf, it, test } from 'vitest';

import { convertSnakeCaseKeysToCamelCase, snakeCaseToCamelCase } from './case';

test('snakeCaseToCamelCase', () => {
  const expected = 'testNameInput';
  const output = snakeCaseToCamelCase('test-name-input');

  expect(output).toStrictEqual(expected);
  expectTypeOf(output).toEqualTypeOf<'testNameInput'>();
});

describe('convertSnakeCaseKeysToCamelCase', () => {
  it('converts a shallow object keys', () => {
    const expected = {
      peerPort: 123,
      scriptTorrentDoneEnabled: false,
      version: '4.0.6 (38c164933e)',
    };

    const output = convertSnakeCaseKeysToCamelCase({
      'peer-port': 123,
      'script-torrent-done-enabled': false,
      version: '4.0.6 (38c164933e)',
    });

    expect(output).toStrictEqual(expected);
    expectTypeOf(output).toEqualTypeOf(expected);
  });

  it('converts nested objects keys as well', () => {
    type Units = [string, string, string, string];

    const expected = {
      units: {
        memoryBytes: 1024,
        memoryUnits: ['KiB', 'MiB', 'GiB', 'TiB'] as Units,
        sizeBytes: 1000,
        sizeUnits: ['kB', 'MB', 'GB', 'TB'] as Units,
        speedBytes: 1000,
        speedUnits: ['kB/s', 'MB/s', 'GB/s', 'TB/s'] as Units,
      },
    };

    const output = convertSnakeCaseKeysToCamelCase({
      units: {
        'memory-bytes': 1024,
        'memory-units': ['KiB', 'MiB', 'GiB', 'TiB'] as Units,
        'size-bytes': 1000,
        'size-units': ['kB', 'MB', 'GB', 'TB'] as Units,
        'speed-bytes': 1000,
        'speed-units': ['kB/s', 'MB/s', 'GB/s', 'TB/s'] as Units,
      },
    });

    expect(output).toStrictEqual(expected);
    expectTypeOf(output).toEqualTypeOf(expected);
  });

  it('converts objects keys in an array', () => {
    const expected = {
      torrents: [
        {
          name: 'ubuntu-24.04-desktop-amd64.iso',
          primaryMimeType: 'application/octet-stream',
        },
      ],
    };

    const output = convertSnakeCaseKeysToCamelCase({
      torrents: [
        {
          name: 'ubuntu-24.04-desktop-amd64.iso',
          'primary-mime-type': 'application/octet-stream',
        },
      ],
    });

    expect(output).toStrictEqual(expected);
    expectTypeOf(output).toEqualTypeOf(expected);
  });
});
