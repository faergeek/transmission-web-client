import { i18n } from '@lingui/core';
import { beforeEach } from 'vitest';

import { activateLocale } from '../i18n';

beforeEach(() => activateLocale(i18n, 'en'));
