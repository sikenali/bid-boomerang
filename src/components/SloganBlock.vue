<template>
  <div class="slogan" aria-hidden="true">
    <div class="scroll-decor">
      <div class="scroll-line"></div>
      <div class="scroll-diamond" :style="{ background: 'var(--brand-red)' }"></div>
      <div class="scroll-line"></div>
    </div>
    <p class="text">回旋有术 · 标标必中</p>
  </div>
</template>

<style scoped>
.slogan {
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scroll-decor {
  display: flex;
  align-items: center;
  gap: 16px;
}

.scroll-line {
  width: 41px;
  height: 2px;
  background: var(--brand-gold);
  border-radius: 1px;
}

.scroll-diamond {
  width: 9px;
  height: 8px;
  border-radius: 4px;
}

.text {
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-text-faint);
  letter-spacing: 2px;
}
</style>
