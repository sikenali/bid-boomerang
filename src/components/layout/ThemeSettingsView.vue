<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();

const themes = [
  {
    type: 'parchment',
    name: '浅色主题 · 羊皮纸',
    desc: '当前默认，长时间阅读标书不易疲劳',
    previewBg: '#FAF7F2',
    previewTop: '#FFFFFF',
  },
  {
    type: 'dark',
    name: '深色主题 · 墨夜',
    desc: '夜间或暗光环境投标作业更护眼',
    previewBg: '#17171A',
    previewTop: '#232324',
  },
];

const accents = [
  { key: 'vermilion', name: '朱红 · 默认', color: '#BE3B2E' },
  { key: 'gold', name: '鎏金', color: '#D3A93F' },
  { key: 'jade', name: '玉绿', color: '#3E8C6E' },
  { key: 'cloud', name: '云蓝', color: '#4A72A8' },
  { key: 'ink', name: '黛墨', color: '#2F3640' },
];

const selectedTheme = ref('parchment');
const selectedAccent = ref('vermilion');

onMounted(() => {
  selectedTheme.value = themeStore.currentTheme;
  const saved = localStorage.getItem('accent');
  if (saved) {
    const found = accents.find(a => a.color === saved);
    if (found) selectedAccent.value = found.key;
  }
});

function selectTheme(type) {
  selectedTheme.value = type;
  themeStore.applyTheme(type);
}

function selectAccent(key) {
  selectedAccent.value = key;
  const accent = accents.find(a => a.key === key);
  if (!accent) return;
  localStorage.setItem('accent', accent.color);
  document.documentElement.style.setProperty('--color-primary', accent.color);
}

function resetAll() {
  selectedTheme.value = 'parchment';
  selectedAccent.value = 'vermilion';
  themeStore.applyTheme('parchment');
  localStorage.removeItem('accent');
  document.documentElement.style.removeProperty('--color-primary');
}
</script>

<template>
  <div class="theme-view">
    <div class="page-header-card">
      <div class="header-content">
        <div class="breadcrumb">首页 / 设置中心 / 主题管理</div>
        <h1 class="page-title">主题管理</h1>
        <p class="page-desc">统一切换外观底色与强调色，修改即时生效</p>
      </div>
      <button class="reset-btn" @click="resetAll">恢复默认</button>
    </div>

    <div class="card">
      <h2 class="card-title">外观主题</h2>
      <div class="theme-grid">
        <div
          v-for="theme in themes"
          :key="theme.type"
          class="theme-card"
          :class="{ active: selectedTheme === theme.type }"
          @click="selectTheme(theme.type)"
        >
          <div v-if="selectedTheme === theme.type" class="check-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="theme-preview" :style="{ background: theme.previewBg }">
            <div class="preview-topbar" :style="{ background: theme.previewTop }"></div>
            <div class="preview-content">
              <div class="preview-line"></div>
              <div class="preview-line short"></div>
            </div>
          </div>
          <div class="theme-name">{{ theme.name }}</div>
          <div class="theme-desc">{{ theme.desc }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">强调色</h2>
      <div class="accent-row">
        <div
          v-for="accent in accents"
          :key="accent.key"
          class="accent-item"
          @click="selectAccent(accent.key)"
        >
          <div class="accent-circle" :style="{ background: accent.color }">
            <svg v-if="selectedAccent === accent.key" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="accent-name" :class="{ bold: selectedAccent === accent.key }">{{ accent.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header-card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breadcrumb {
  font-size: 12px;
  color: var(--color-text-faint);
}

.breadcrumb::before {
  content: '';
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.reset-btn {
  height: 40px;
  padding: 0 20px;
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-card);
  color: var(--color-text-body);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.reset-btn:hover {
  background: var(--color-bg-secondary);
}

.card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.theme-card {
  border: 0.7px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.theme-card:hover {
  border-color: var(--color-border-hover);
}

.theme-card.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.check-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.theme-preview {
  height: 128px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-topbar {
  height: 28px;
}

.preview-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-line {
  height: 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-text-muted) 30%, transparent);
}

.preview-line.short {
  width: 50%;
}

.theme-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-top: 12px;
}

.theme-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.accent-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.accent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.accent-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.accent-item:hover .accent-circle {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.accent-name {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.accent-name.bold {
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
