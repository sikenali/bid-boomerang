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
import { ref, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import PageFooter from '../components/PageFooter.vue';
import WujieContainer from '../components/WujieContainer.vue';
import CreditQualificationModal from '../components/layout/CreditQualificationModal.vue';
import BiddingSitesModal from '../components/layout/BiddingSitesModal.vue';
import AboutModal from '../components/layout/AboutModal.vue';
import { SUB_APP_LIST } from '../config/apps';
import { usePreloadStore } from '../stores/preload';
import { destroySubApp } from '../utils/preload';

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
 * 当前工具渲染完成后再开始后台预热其余工具：
 * 避免与正在加载的工具抢占带宽，预热完成后点击任意工具都是秒开。
 */
function onAppReady() {
  preloadStore.start(currentApp.value?.name || '');
}

onBeforeUnmount(() => {
  preloadStore.stop();
  SUB_APP_LIST.forEach((app) => destroySubApp(app.name));
});
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
