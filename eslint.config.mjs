import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/infrastructure/supabase/database.types.ts',
    ],
  },

  ...coreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // Unused code is dead weight; allow the `_` escape hatch for intentional gaps.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // `any` defeats the point of the strict compiler config.
      '@typescript-eslint/no-explicit-any': 'error',
      // Enforce `import type` so types never survive into the runtime bundle.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'object-shorthand': 'error',
    },
  },

  {
    // The architecture boundary, enforced by tooling rather than by convention:
    // the domain core must never depend on a framework or a vendor SDK.
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['next', 'next/*', 'react', 'react-dom', '@supabase/*'],
              message:
                'src/core is framework-agnostic. Move this dependency to a module infrastructure layer.',
            },
          ],
        },
      ],
    },
  },

  {
    // Application and domain layers describe intent via ports; no vendor SDK reaches them.
    files: ['src/modules/*/application/**/*.ts', 'src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*'],
              message:
                'Use a port interface here. Supabase belongs in the module infrastructure layer.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
