import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Any request to /api/... is forwarded to the Express server.
    proxy: { '/api': 'http://localhost:4000' },
  },
})
