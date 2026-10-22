<template>
  <div class="home-view">
    <TopNav @open-shell="onOpenShell" />

    <main class="main-body">
      <HeroSection />
      <ToolCards @select="onSelectTool" />
      <SloganBlock />
    </main>

    <PageFooter
      @credit-query="showCreditModal = true"
      @bidding-sites="showBiddingModal = true"
      @about="showAboutModal = true"
    />

    <CreditQualificationModal v-model:visible="showCreditModal" />
    <BiddingSitesModal v-model:visible="showBiddingModal" />
    <AboutModal v-model:visible="showAboutModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import HeroSection from '../components/HeroSection.vue';
import ToolCards from '../components/ToolCards.vue';
import SloganBlock from '../components/SloganBlock.vue';
import PageFooter from '../components/PageFooter.vue';
import CreditQualificationModal from '../components/layout/CreditQualificationModal.vue';
import BiddingSitesModal from '../components/layout/BiddingSitesModal.vue';
import AboutModal from '../components/layout/AboutModal.vue';
import { SUB_APP_LIST } from '../config/apps';
import { usePreloadStore } from '../stores/preload';

const router = useRouter();
const preloadStore = usePreloadStore();
const showCreditModal = ref(false);
const showBiddingModal = ref(false);
const showAboutModal = ref(false);

function onSelectTool(item) {
  router.push(`/tool/${item.name}`);
}

/** 右上角「进入统一工作台」：直接落到首个工具的工作台视图 */
function onOpenShell() {
  router.push(`/tool/${SUB_APP_LIST[0].name}`);
}

/**
 * 首页首屏渲染完成后立即错峰启动预热：
 * - 不再等到第一个子应用渲染完才预热，用户点击 tool-card 时大部分实例已就绪
 * - 用 requestIdleCallback 避免抢首屏带宽，兜底 800ms 后强制启动
 * - 不 stop：从首页跳工具页要延续预热，不能在这里清理
 */
onMounted(() => {
  const startPreload = () => preloadStore.start('');
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(startPreload, { timeout: 3000 });
  } else {
    setTimeout(startPreload, 800);
  }
});
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-main);
}

.main-body {
  flex: 1;
  padding: 168px 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}
</style>
