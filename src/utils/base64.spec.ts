import { expect, test } from 'vitest';

import { base64Encode } from './base64';

test('base64Encode', () => {
  expect(base64Encode('username:password')).toBe('dXNlcm5hbWU6cGFzc3dvcmQ=');
  expect(base64Encode('a Ā 𐀀 文 🦄')).toBe('YSDEgCDwkICAIOaWhyDwn6aE');
});
