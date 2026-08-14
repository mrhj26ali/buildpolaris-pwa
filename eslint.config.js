import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const FEATURE_SLICES = [
  'admin', 'auth', 'budget', 'closeout', 'communications', 'copilot',
  'documents', 'field', 'financials', 'projects', 'reports', 'requests',
  'scheduling', 'search', 'tasks',
]

function featureIsolation(slice) {
  const patterns = [
    {
      group: ['@/features/*', `!@/features/${slice}`, `!@/features/${slice}/**`],
      message: 'Feature slices must not import from other feature slices. Compose cross-slice behavior in app/.',
    },
  ]
  if (slice !== 'copilot') {
    patterns.push({
      group: ['@/lib/clients/aiClient'],
      message: 'Only the copilot slice may communicate with the AI gateway.',
    })
  }
  return {
    files: [`src/features/${slice}/**`],
    rules: {
      'no-restricted-imports': ['error', { patterns }],
    },
  }
}

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'coverage', 'playwright-report', '**/*.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { 
          allowConstantExport: true,
          allowExportNames: ['buttonVariants', 'tabsListVariants', 'useAuth', 'useProject', 'useOnlineStatus']
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  ...FEATURE_SLICES.map(featureIsolation),
])
