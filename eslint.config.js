import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// ARCH v2.1 §6.2's actual feature slices — corrected from the previous list,
// which named several slices ('admin', 'auth', 'budget', 'documents',
// 'reports', 'requests', 'search', 'tasks') that don't exist in this tree and
// was missing 'document_control' and 'identity'.
const FEATURE_SLICES = [
  'closeout', 'communications', 'copilot', 'document_control', 'field',
  'financials', 'identity', 'projects', 'scheduling',
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
      message: 'Only the copilot slice may import lib/clients/aiClient (and even then, only for its typed SSE-event shapes — see that file\'s own header comment). No feature slice talks to buildpolaris_ai directly.',
    })
  }
  return {
    files: [`src/features/${slice}/**`],
    rules: {
      'no-restricted-imports': ['error', { patterns }],
    },
  }
}

// Structural enforcement of NFR-SCALE.5 / ARCH §4.2: "there is no
// browser-to-AI-sidecar network path anywhere in this platform." This rule
// bans any literal string containing an AI-gateway-shaped path or hostname
// pattern OUTSIDE lib/clients/bffClient.ts and lib/clients/aiClient.ts (the
// only two files ARCH's "two-file rule" permits to know a backend origin).
// It catches the failure mode the import-restriction rule above cannot: a
// hardcoded fetch('http://ai-gateway...') string that doesn't go through any
// import at all.
const aiIsolationLiteralBan = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/lib/clients/bffClient.ts', 'src/lib/clients/aiClient.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/ai-gateway|ai_sidecar|:8001|buildpolaris_ai\\.internal/i]",
        message: 'No direct network reference to the AI sidecar is allowed outside lib/clients/. All AI traffic must be proxied through buildpolaris_bff via bffClient.ts (ARCH §4.2 — PWA never talks to buildpolaris_ai directly).',
      },
    ],
  },
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
          allowExportNames: ['buttonVariants', 'badgeVariants', 'useAuth', 'useAuthState', 'useTheme', 'useProjectContext'],
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
  aiIsolationLiteralBan,
  ...FEATURE_SLICES.map(featureIsolation),
])
