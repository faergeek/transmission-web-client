import { base, node, react, typescript, vitest } from '@faergeek/eslint-config';
import lingui from 'eslint-plugin-lingui';
import globals from 'globals';

export default [
  { ignores: ['dist/'] },
  ...base,
  ...node.map(config => ({
    ...config,
    files: ['*.js'],
  })),
  ...node.map(config => ({
    ...config,
    files: ['*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  })),
  ...react.map(config => ({
    ...config,
    files: ['src/**/*'],
    settings: {
      ...config.settings,
      linkComponents: ['Anchor', { name: 'Link', linkAttribute: 'to' }],
    },
  })),
  {
    files: ['src/**/*'],
    ignores: ['*.spec.*'],
    plugins: { lingui },
    rules: {
      'lingui/t-call-in-function': 'warn',
      'lingui/no-single-variables-to-translate': 'warn',
      'lingui/no-expression-in-message': 'warn',
      'lingui/no-single-tag-to-translate': 'warn',
      'lingui/no-trans-inside-trans': 'warn',
    },
  },
  {
    files: ['src/**/*'],
    ignores: ['**/*.spec.*', 'src/index.tsx', 'src/tests/setup.ts'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: '@lingui/core',
              importNames: ['i18n'],
              message: 'Get i18n instance using useLingui',
            },
            {
              name: '@lingui/react',
              importNames: ['Trans'],
              message: 'Use Trans from @lingui/react/macro instead',
            },
          ],
        },
      ],
    },
  },
  ...vitest.map(config => ({
    ...config,
    files: ['**/*.spec.*'],
  })),
  ...typescript,
];
