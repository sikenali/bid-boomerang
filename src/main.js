import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  RiAddLine,
  RiAlertLine,
  RiArrowLeftSLine,
  RiBookOpenLine,
  RiCloseLine,
  RiCpuLine,
  RiDownload2Line,
  RiDownloadCloudLine,
  RiExternalLinkLine,
  RiFileList2Line,
  RiGitBranchLine,
  RiHome4Line,
  RiInformationLine,
  RiLayoutColumnLine,
  RiListCheck,
  RiLinksLine,
  RiLoader4Line,
  RiMoonLine,
  RiPaletteLine,
  RiPencilLine,
  RiPriceTagLine,
  RiQuillPenLine,
  RiRefreshLine,
  RiSearchLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiSunLine,
  RiTargetLine,
  RiUserSettingsLine,
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
  RiAddLine,
  RiAlertLine,
  RiArrowLeftSLine,
  RiBookOpenLine,
  RiCloseLine,
  RiCpuLine,
  RiDownload2Line,
  RiDownloadCloudLine,
  RiExternalLinkLine,
  RiFileList2Line,
  RiGitBranchLine,
  RiHome4Line,
  RiInformationLine,
  RiLayoutColumnLine,
  RiListCheck,
  RiLinksLine,
  RiLoader4Line,
  RiMoonLine,
  RiPaletteLine,
  RiPencilLine,
  RiPriceTagLine,
  RiQuillPenLine,
  RiRefreshLine,
  RiSearchLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiSunLine,
  RiTargetLine,
  RiUserSettingsLine,
};

for (const [name, component] of Object.entries(icons)) {
  app.component(name, component);
}

app.mount('#app');

// 加载主题（在挂载后立即应用持久化主题）
useThemeStore().loadTheme();
