import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plain static output in ./dist (served from the site root, e.g. todo.zgjimrashiti.online).
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { port: 3000, strictPort: true },
  build: { outDir: 'dist', sourcemap: false },
})
