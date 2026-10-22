<script setup>
import { ref, onMounted } from 'vue';
import { BRAND_NAME, BRAND_SLOGAN, BRAND_TITLE } from '../../constants/brand';

const currentYear = new Date().getFullYear();
// 应用版本号：由 vite define 从 package.json 注入，与打包产物版本同源
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
const repoUrl = 'https://github.com/sikenali/bid-boomerang';

// 桌面端才提供子应用地址的运行时配置（网页端地址由构建期 VITE_SUBAPP_URLS 决定）
const desktop = typeof window !== 'undefined' ? window.desktop : null;
const isDesktop = !!(desktop && desktop.isDesktop);

const configFile = ref('');
const configText = ref('');
const configMessage = ref('');

async function loadConfig() {
  if (!isDesktop) return;
  try {
    const cfg = await desktop.getSubAppConfig();
    configFile.value = cfg.file || '';
    configText.value = cfg.content || '';
  } catch (error) {
    configMessage.value = `读取失败：${error?.message || error}`;
  }
}

async function saveConfig() {
  if (!isDesktop) return;
  configMessage.value = '';
  try {
    await desktop.setSubAppConfig(configText.value);
    configMessage.value = '已保存，正在重载…';
    await desktop.reloadWindow();
  } catch (error) {
    configMessage.value = `保存失败：${error?.message || error}`;
  }
}

onMounted(loadConfig);
</script>

<template>
  <div class="about-view">
    <!-- 品牌信息卡片 -->
    <div class="about-card">
      <div class="about-badge">
        <RiTargetLine class="badge-logo" size="52" color="#C0392B" />
      </div>

      <div class="about-name">{{ BRAND_TITLE }}</div>

      <div class="about-slogan">{{ BRAND_SLOGAN }}</div>

      <div class="about-version">版本: v{{ appVersion }}</div>

      <a class="about-repo" :href="repoUrl" target="_blank" rel="noopener noreferrer" title="访问 GitHub 仓库">
        <span class="repo-right">
          <RiGithubLine class="icon" size="34" />
        </span>
      </a>

      <div class="about-copy">© {{ currentYear }} {{ BRAND_NAME }} · sikenali</div>
    </div>

    <!-- 桌面端：子应用地址运行时配置 -->
    <div v-if="isDesktop" class="about-card config-card">
      <div class="config-title">子应用地址</div>
      <div class="config-desc">
        六个工具的部署地址，JSON 格式（键为应用名）。留空则使用构建期默认地址
        <code>http://127.0.0.1:5101~5106</code>。
      </div>
      <textarea
        v-model="configText"
        class="config-input"
        rows="5"
        spellcheck="false"
        placeholder='{"bid-checker":"https://work.example.com/opc/bid-checker/"}'
      ></textarea>
      <div class="config-file">配置文件：{{ configFile }}</div>
      <div class="config-actions">
        <button class="config-btn" @click="saveConfig">保存并重载</button>
        <span v-if="configMessage" class="config-message">{{ configMessage }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
}

/* 品牌信息卡片 */
.about-card {
  background-color: var(--color-bg-white, #FFFFFF);
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
  border-radius: 16px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.about-badge {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  border: 0.7px solid #E8D9B0;
  background-color: #FBF5E3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-logo {
  display: inline-flex;
}
.about-name {
  margin-top: 32px;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary, #1F1D1A);
  font-family: var(--font-family-cn);
  line-height: 1.2;
}
.about-slogan {
  margin-top: 16px;
  font-size: 16px;
  color: var(--color-text-secondary, #6E6A60);
  font-family: var(--font-family-cn);
  line-height: 1.4;
}
.about-version {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-muted, #8A8578);
  font-family: var(--font-family-cn);
  line-height: 1.4;
}
.about-repo {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.about-repo:hover {
  opacity: 0.75;
}
.repo-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 8px;
}
.repo-right .icon {
  display: inline-flex;
  color: var(--color-text-secondary, #6E6A60);
}
.about-copy {
  margin-top: 32px;
  font-size: 14px;
  color: var(--color-text-faint, #A7A296);
  font-family: var(--font-family-cn);
  line-height: 1.4;
}

/* 子应用地址配置卡片（桌面端） */
.config-card {
  height: auto;
  padding: 24px;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12px;
}
.config-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #1F1D1A);
  font-family: var(--font-family-cn);
}
.config-desc {
  font-size: 13px;
  color: var(--color-text-secondary, #6E6A60);
  font-family: var(--font-family-cn);
  line-height: 1.7;
}
.config-desc code {
  font-size: 12px;
  background: var(--color-bg-secondary, #F7F3EA);
  padding: 1px 6px;
  border-radius: 4px;
}
.config-input {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  padding: 10px 12px;
  border-radius: 8px;
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
  background: var(--color-bg-main, #FAF7F2);
  color: var(--color-text-primary, #1F1D1A);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
}
.config-input:focus {
  outline: none;
  border-color: var(--color-primary, #C0392B);
}
.config-file {
  font-size: 12px;
  color: var(--color-text-faint, #A7A296);
  word-break: break-all;
}
.config-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.config-btn {
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  background: var(--color-primary, #C0392B);
  color: var(--color-on-primary, #FFFFFF);
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.config-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}
.config-message {
  font-size: 13px;
  color: var(--color-text-secondary, #6E6A60);
}
</style>
