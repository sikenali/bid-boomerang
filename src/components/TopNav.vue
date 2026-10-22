<template>
  <header class="top-nav">
    <div class="nav-left" @click="goHome">
      <div class="tool-mark">
        <RiTargetLine size="26" color="var(--color-primary, #C0392B)" />
      </div>
      <span class="brand-cn">{{ BRAND_NAME }}</span>
      <span class="divider"></span>
      <span class="page-title">文档智能处理平台</span>
    </div>

    <nav v-if="showNavItems" class="nav-center" role="navigation" aria-label="六星工具">
      <button
        v-for="item in SUB_APP_LIST"
        :key="item.name"
        class="nav-item"
        :class="[`color-${item.color}`, { active: activeName === item.name }]"
        :aria-current="activeName === item.name ? 'page' : undefined"
        @click="$emit('change', item)"
      >
        <component :is="toolIconComponent(item.iconClass)" size="18" />
        <span class="nav-label">{{ item.shortTitle }}</span>
      </button>
    </nav>

    <div class="nav-right">
      <UiTip :text="isDark ? '切换浅色主题' : '切换深色主题'" placement="bottom">
        <button class="nav-btn" @click="toggleTheme">
          <RiSunLine v-if="isDark" size="18" />
          <RiMoonLine v-else size="18" />
        </button>
      </UiTip>
      <UiTip :text="showBack ? '返回首页' : '进入统一工作台'" placement="bottom">
        <button class="nav-btn" @click="onWorkbenchClick">
          <RiHome4Line size="18" />
        </button>
      </UiTip>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../stores/theme';
import { SUB_APP_LIST } from '../config/apps';
import { toolIconComponent } from '../config/toolIcons';
import { BRAND_NAME } from '../constants/brand';
import UiTip from './ui/UiTip.vue';

const props = defineProps({
  activeName: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
});

const emit = defineEmits(['change', 'open-shell']);

const router = useRouter();
const themeStore = useThemeStore();

const showNavItems = computed(() => !!props.activeName);
const isDark = computed(() => themeStore.currentTheme === 'dark');

function goHome() {
  router.push('/');
}

function onWorkbenchClick() {
  if (props.showBack) {
    goHome();
  } else {
    emit('open-shell');
  }
}

function toggleTheme() {
  themeStore.toggleTheme();
}
</script>

<style scoped>
.top-nav {
  height: var(--nav-h);
  background: var(--color-bg-white);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 0.7px solid var(--color-border-soft);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.nav-left:hover .brand-cn {
  color: var(--color-primary);
}

.tool-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.brand-cn {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  transition: color var(--t-fast) var(--ease);
}

.divider {
  width: 2px;
  height: 20px;
  background: var(--color-border);
  display: inline-block;
}

.page-title {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color var(--t-fast) var(--ease),
    transform var(--t-fast) var(--ease);
  color: var(--color-text-primary);
  font-family: var(--font-family-cn);
  line-height: 1.2;
}

.nav-item:hover {
  background: var(--color-bg-secondary);
  transform: translateY(-1px);
}

.nav-item.active {
  background: var(--color-primary-soft);
}

.nav-item.active .nav-label {
  color: var(--color-primary);
  font-weight: 600;
}

.nav-item .nav-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-item.color-red svg { color: var(--brand-red); }
.nav-item.color-gold svg { color: var(--brand-gold-strong); }
.nav-item.color-green svg { color: var(--brand-green); }
.nav-item.color-blue svg { color: var(--brand-blue); }
.nav-item.active.color-red svg { color: var(--color-primary); }

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--color-bg-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color var(--t-base) var(--ease), color var(--t-base) var(--ease), transform var(--t-base) var(--ease), box-shadow var(--t-base) var(--ease);
}

.nav-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}
</style>
