import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8000'

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
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        usePolling: true,
      },
      hmr: {
        host: 'localhost',
      },
    },
  }
})
