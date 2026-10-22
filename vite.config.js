import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 相对基路径：产物可部署在任意子路径（GitHub Pages /bid-boomerang/、nginx 子目录）
  base: './',
  plugins: [vue()],
  server: {
    port: 8080,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1024,
  },
})
