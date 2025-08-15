import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'

const isWindows = os.platform() === 'win32'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: parseInt(process.env.VITE_PORT || '5173'),
    hmr: {
      overlay: false,
      port: parseInt(process.env.VITE_PORT || '5173'),
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    watch: {
      // Only poll on Windows (Docker Desktop) where native FS events are flaky
      usePolling: isWindows,
      interval: isWindows ? 300 : undefined, // faster dev-reload when polling
      // Ignore heavy dirs for performance
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})
