<template>
  <div v-if="currentApp" class="tool-view">
    <TopNav
      :active-name="currentApp.name"
      :show-back="true"
      @change="onTabChange"
    />

    <main class="tool-body">
      <div class="tool-stage">
        <WujieContainer :app="currentApp" @back-home="goHome" @ready="onAppReady" />
      </div>
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
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import PageFooter from '../components/PageFooter.vue';
import WujieContainer from '../components/WujieContainer.vue';
import CreditQualificationModal from '../components/layout/CreditQualificationModal.vue';
import BiddingSitesModal from '../components/layout/BiddingSitesModal.vue';
import AboutModal from '../components/layout/AboutModal.vue';
import { SUB_APP_LIST } from '../config/apps';
import { usePreloadStore } from '../stores/preload';

const route = useRoute();
const router = useRouter();
const preloadStore = usePreloadStore();
const showCreditModal = ref(false);
const showBiddingModal = ref(false);
const showAboutModal = ref(false);

const currentApp = computed(() => {
  return SUB_APP_LIST.find(app => app.name === route.params.name);
});

function onTabChange(item) {
  router.push(`/tool/${item.name}`);
}

function goHome() {
  router.push('/');
}

/**
 * 首次进入工具页时确保后台预热已启动（首页已启动则 no-op）。
 * 预热在首页首屏完成后就开始了，这里作为兜底，覆盖直接进入 /tool/:name 的场景。
 */
function onAppReady() {
  preloadStore.start(currentApp.value?.name || '');
}

// 离开工作台（回首页）时停止预热，避免后台持续消耗资源；
// 首页重新进入时通过 onMounted 重新启动。
watch(
  () => route.path,
  (newPath) => {
    if (!newPath.startsWith('/tool/')) {
      preloadStore.stop();
    }
  },
);

// 注意：切换工具标签时不再销毁子应用实例，保留预热结果让 6 个标签来回切换都是秒开；
// 离开工作台（回首页）由 HomeView 触发 stop 清理。
</script>

<style scoped>
.tool-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-main);
}

.tool-body {
  flex: 1;
  min-height: 0;
  padding: 24px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool-stage {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
}
</style>
