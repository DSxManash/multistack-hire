
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',   // needed inside Docker to accept external connections
    port: 5173,
    watch: {
      usePolling: true, // Docker volume hot-reload
    },
    hmr: {
      host: 'localhost',
    },
    proxy: {
      // ALL requests starting with /api
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      
      },
      // for health checks, we also proxy /health to the backend
      '/health': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})