import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend URL - uses environment variable or defaults to port 5000 (Flask default)
const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../static/react',
    emptyOutDir: true,
  },
  server: {
    // Proxy is ONLY used in development when running `npm run dev`
    // In production, Flask serves the built files directly from static/react/
    proxy: {
      '/api': backendUrl,
      '/static': backendUrl,
    }
  }
})
