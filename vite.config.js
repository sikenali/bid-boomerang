import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  // 相对基路径：产物可部署在任意子路径（GitHub Pages /bid-boomerang/、nginx 子目录）
  base: './',
  plugins: [vue()],
  define: {
    // 版本号唯一来源：package.json 的 version（CI 出包时会同步为 tag 版本）
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    port: 8080,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1024,
  },
})
