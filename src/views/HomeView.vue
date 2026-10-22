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
import { ref } from 'vue';
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

const router = useRouter();
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
