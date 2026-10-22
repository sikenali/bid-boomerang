<template>
  <section class="hero">
    <div class="deco-line" aria-hidden="true"></div>
    <h1 class="hero-title">文制五攻 · 六星连逐</h1>
    <p class="subtitle">取、制、检、版、比、价，六步成章，回旋有术</p>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.deco-line {
  width: 61px;
  height: 3px;
  background: var(--brand-gold);
  border-radius: 2px;
}

.hero-title {
  margin-top: 20px;
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 4px;
}

.subtitle {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}
</style>
