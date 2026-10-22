export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/data/**'],
  },
  {
    files: ['backend/src/**/*.ts', 'frontend/src/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TryStatement',
          message:
            'Imperative try/catch is forbidden in domain/service/hook layers. Use neverthrow Result / ResultAsync.',
        },
      ],
    },
  },
  {
    files: ['frontend/src/components/**/*.{ts,tsx}', 'frontend/src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/services/api*'],
              message:
                'UI components and pages must not import services/api directly (DIP). Use hooks, Context, or Facades.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['backend/src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['express', 'ws', 'drizzle-orm', 'node:sqlite'],
          patterns: ['**/config/db*', '**/infrastructure/**'],
        },
      ],
    },
  },
];
