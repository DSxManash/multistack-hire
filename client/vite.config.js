import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Browser API calls use VITE_API_URL directly (see src/api/config.js).
  // No Vite proxy — avoids relative /api requests hitting the frontend origin.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Production (GitHub Pages / custom domain): set VITE_BASE_PATH=./ in CI.
    base: env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/',
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        usePolling: true,
      },
      hmr: {
        host: 'localhost',
      },
    },
  }
})
