import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ToolView from '../views/ToolView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/tool/:name', name: 'tool', component: ToolView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
