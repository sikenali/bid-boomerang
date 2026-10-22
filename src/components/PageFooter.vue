<template>
  <footer class="page-footer">
    <UiTip text="关于回旋标" placement="top">
      <div class="footer-brand" @click="$emit('about')">
        <RiTargetLine size="20" color="var(--color-primary, #C0392B)" />
        <span class="footer-brand-text">回旋标工具系列</span>
      </div>
    </UiTip>

    <div class="footer-actions">
      <UiTip text="企业信用" placement="top">
        <div class="footer-icon-btn" @click="$emit('credit-query')">
          <RiShieldCheckLine size="14" />
        </div>
      </UiTip>
      <UiTip text="招标网站" placement="top">
        <div class="footer-icon-btn" @click="$emit('bidding-sites')">
          <RiLinksLine size="14" />
        </div>
      </UiTip>
    </div>

    <span class="footer-copy">
      © {{ year }} {{ BRAND_NAME }} · Powered by <a href="https://lazycat.cloud/" target="_blank" rel="noopener noreferrer" class="footer-link">LightOS</a>
    </span>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BRAND_NAME } from '../constants/brand';
import UiTip from './ui/UiTip.vue';

defineEmits(['credit-query', 'bidding-sites', 'about']);

const year = ref(new Date().getFullYear());
onMounted(() => { year.value = new Date().getFullYear(); });
</script>

<style scoped>
.page-footer {
  height: var(--footer-h);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(180deg, var(--color-bg-white) 0%, var(--color-bg-secondary) 100%);
  border-top: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity var(--t-fast) var(--ease);
}

.footer-brand:hover {
  opacity: 0.72;
}

.footer-brand-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-body);
  white-space: nowrap;
}

.footer-actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.footer-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-bg-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color var(--t-base) var(--ease), color var(--t-base) var(--ease), transform var(--t-base) var(--ease), box-shadow var(--t-base) var(--ease);
}

.footer-icon-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.footer-copy {
  font-size: 14px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.footer-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity var(--t-fast) var(--ease);
}

.footer-link:hover {
  opacity: 0.75;
  text-decoration: underline;
}
</style>
