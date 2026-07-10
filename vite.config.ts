import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav,json}']
      },
      manifest: {
        name: 'Reson',
        short_name: 'Reson',
        theme_color: '#0F0F0F',
        background_color: '#0F0F0F',
        display: 'standalone'
      }
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@state': path.resolve(__dirname, './src/state'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@audio-engine': path.resolve(__dirname, './src/audio-engine'),
      '@persistence': path.resolve(__dirname, './src/persistence'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@models': path.resolve(__dirname, './src/models'),
      '@config': path.resolve(__dirname, './src/config'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
})
