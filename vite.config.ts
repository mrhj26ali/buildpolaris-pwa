import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const isTest = Boolean(process.env.VITEST)

const dbStorageAlias = isTest
  ? path.resolve(__dirname, './tests/stubs/rxdb-storage.ts')
  : path.resolve(__dirname, './src/lib/db/storage.ts')

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-icon-180.png'],
      manifest: {
        name: 'BuildPolaris',
        short_name: 'BuildPolaris',
        description: 'Construction project management for field, scheduling, financials, and closeout.',
        theme_color: '#111f31',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/files\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '~db-storage': dbStorageAlias,
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/files': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/{unit,integration,security,performance}/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
