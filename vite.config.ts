import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Construction PM Platform',
        short_name: 'ConstructPM',
        theme_color: '#2c4a6e',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'frappe-gantt/dist/frappe-gantt.css': path.resolve(__dirname, './node_modules/frappe-gantt/dist/frappe-gantt.css'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          Host: 'polaris.local', // THIS FIXES THE HOST HEADER ISSUE
        },
      },
      '/files': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          Host: 'polaris.local',
        },
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          Host: 'polaris.local',
        },
      },
    },
  },
})