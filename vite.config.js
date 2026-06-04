import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server: bind to localhost only. Don't enable allowedHosts: true —
// that lets any Host header reach dev, which is unnecessary and can be
// abused for cache-poisoning or DNS rebinding against local services.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
