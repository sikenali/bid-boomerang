import { createRouter, createWebHashHistory } from 'vue-router';

/**
 * 路由懒加载：
 *   - Home 首屏只加载 HomeView 及其依赖（HeroSection / ToolCards / SloganBlock 等）
 *   - ToolView 及其依赖（WujieContainer + 4 个 modal）延迟到用户点击工具卡片时才加载
 *   - 这样首页 JS 包更小、解析更快，且不影响 ToolView 已有的 preload 逻辑
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/tool/:name', name: 'tool', component: () => import('../views/ToolView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
