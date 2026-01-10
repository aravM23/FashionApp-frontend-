import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend URL
const backendUrl = process.env.VITE_BACKEND_URL || 'https://oro-kmuj.onrender.com';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': backendUrl,
      '/static': backendUrl,
    }
  }
})
