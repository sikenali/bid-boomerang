<template>
  <div class="about-view">
    <div class="about-card">
      <div class="about-logo">
        <RiTargetLine size="64" color="var(--color-primary, #C0392B)" />
      </div>
      <h1 class="about-title">回旋标 · 文档智能处理平台</h1>
      <p class="about-version">Version 1.0.0</p>
      <p class="about-desc">
        基于 Wujie 微前端架构的统一工作台，集成标书信息抽取、生成、排版、报价、比对、校验六大智能工具。
      </p>
      <div class="about-info">
        <div class="info-row">
          <span class="info-label">架构</span>
          <span class="info-value">Vue 3 + Vite + Wujie</span>
        </div>
        <div class="info-row">
          <span class="info-label">图标库</span>
          <span class="info-value">RemixIcon</span>
        </div>
        <div class="info-row">
          <span class="info-label">设计规范</span>
          <span class="info-value">DESIGN.md · Parchment 羊皮纸</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.about-card {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.about-logo {
  margin-bottom: 8px;
}

.about-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.about-version {
  font-size: 13px;
  color: var(--color-text-faint);
  margin: 0;
}

.about-desc {
  font-size: 14px;
  color: var(--color-text-body);
  line-height: 1.6;
  margin: 8px 0 16px;
}

.about-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-soft);
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-label {
  color: var(--color-text-muted);
}

.info-value {
  color: var(--color-text-body);
  font-weight: 500;
}
</style>
