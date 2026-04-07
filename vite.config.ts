import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/layout-llm': {
        target: 'http://127.0.0.1:4302',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/layout-llm/, '') || '/',
      },
    },
  },
})
