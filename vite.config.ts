import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  },
})
