import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiBookOpenLine,
  RiCloseLine,
  RiDownloadCloudLine,
  RiExternalLinkLine,
  RiFileEditLine,
  RiGithubLine,
  RiHome4Line,
  RiInformationLine,
  RiLayoutColumnLine,
  RiLinksLine,
  RiLoader4Line,
  RiMoonLine,
  RiPriceTagLine,
  RiQuillPenLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiSunLine,
  RiTargetLine,
  RiTodoLine,
} from '@remixicon/vue';
import App from './App.vue';
import router from './router';
import { useThemeStore } from './stores/theme';
import './assets/global.css';
import './style.css';
import { BRAND_TITLE } from './constants/brand';

document.title = BRAND_TITLE;

const app = createApp(App);
app.use(createPinia());
app.use(router);

const icons = {
  RiAlertLine,
  RiArrowLeftSLine,
  RiBookOpenLine,
  RiCloseLine,
  RiDownloadCloudLine,
  RiExternalLinkLine,
  RiFileEditLine,
  RiGithubLine,
  RiHome4Line,
  RiInformationLine,
  RiLayoutColumnLine,
  RiLinksLine,
  RiLoader4Line,
  RiMoonLine,
  RiPriceTagLine,
  RiQuillPenLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiSunLine,
  RiTargetLine,
  RiTodoLine,
};

for (const [name, component] of Object.entries(icons)) {
  app.component(name, component);
}

app.mount('#app');

// 加载主题（在挂载后立即应用持久化主题）
useThemeStore().loadTheme();
