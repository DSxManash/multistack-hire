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
    watch: {
      usePolling: true, // Needed for Docker volumes to trigger hot-reload consistently
    },
    hmr: {
      host: 'localhost',
    },
    proxy: {
      '/health': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})