import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Black Rose D&D 5e',
        short_name: 'Black Rose',
        description: 'Ficha de Personagem D&D 5e e Grimório Offline-First',
        theme_color: '#0d0d11',
        background_color: '#090a0f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          // Cache Magic Card images with CacheFirst (Offline Card Grimoire!)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/cards'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'black-rose-cards-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache Spells API catalog with StaleWhileRevalidate
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/spells'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'black-rose-spells-api-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache Meta Options (Races / Classes) with StaleWhileRevalidate
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/characters/meta/options'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'black-rose-meta-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/cards': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
