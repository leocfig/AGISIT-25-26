import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      // Auth service
      "/api/users": {
        target: "http://authservice:8000",
        changeOrigin: true,
      },
      // Message service
      "/api/messaging": {
        target: "http://messageservice:8000",
        changeOrigin: true,
        ws: true,
      },
      // Online service
      "/api/online": {
        target: "http://onlineservice:8000",
        changeOrigin: true,
      },
    },
  },
})

