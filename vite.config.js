import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@assets': fileURLToPath(new URL('./attached_assets', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:54112',
    },
  },
})
