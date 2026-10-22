<script setup>
import { BRAND_NAME, BRAND_TITLE } from '../../constants/brand';

const currentYear = new Date().getFullYear();
// 应用版本号：当前为常量，后续打包时从软件版本提取显示
const appVersion = 'V1.0.0';
const repoUrl = 'https://github.com/sikenali/bid-boomerang';
</script>

<template>
  <div class="about-view">
    <!-- 品牌信息卡片 -->
    <div class="about-card">
      <div class="about-badge">
        <RiTargetLine class="badge-logo" size="52" color="#C0392B" />
      </div>

      <div class="about-name">{{ BRAND_TITLE }}</div>

      <div class="about-slogan">取、制、检、版、比、价，六步成章，回旋有术</div>

      <div class="about-version">版本: {{ appVersion }}</div>

      <a class="about-repo" :href="repoUrl" target="_blank" rel="noopener noreferrer" title="访问 GitHub 仓库">
        <span class="repo-right">
          <RiGithubLine class="icon" size="34" />
        </span>
      </a>

      <div class="about-copy">© {{ currentYear }} {{ BRAND_NAME }} · sikenali</div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1620px;
}

/* 品牌信息卡片 */
.about-card {
  background-color: var(--color-bg-white, #FFFFFF);
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
  border-radius: 16px;
  height: 525px;
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
}
</style>
