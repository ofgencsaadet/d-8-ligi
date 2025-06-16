import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/d-8-ligi/' : '/',  // Production'da GitHub Pages path'i
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}) 