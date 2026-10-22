<template>
  <section class="tool-cards-wrap">
    <div class="tool-cards">
      <button
        v-for="item in SUB_APP_LIST"
        :key="item.name"
        class="tool-card"
        :class="`color-${item.color}`"
        :title="`${item.title} — ${item.desc}`"
        @click="$emit('select', item)"
      >
        <div class="icon-container">
          <component :is="toolIconComponent(item.iconClass)" size="28" />
        </div>
        <div class="card-name-wrap">
          <span class="card-name">{{ item.shortTitle }}</span>
        </div>
        <div class="card-desc-wrap">
          <span class="card-desc">{{ item.desc }}</span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { SUB_APP_LIST } from '../config/apps';
import { toolIconComponent } from '../config/toolIcons';

defineEmits(['select']);
</script>

<style scoped>
.tool-cards-wrap {
  padding-top: 64px;
  display: flex;
  justify-content: center;
}

.tool-cards {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.tool-card {
  width: 190px;
  height: 200px;
  background: var(--color-bg-white);
  border: var(--border-hair) solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: var(--font-family-cn);
  transition:
    transform var(--t-base) var(--ease),
    box-shadow var(--t-base) var(--ease),
    border-color var(--t-base) var(--ease);
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border);
}

.tool-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.icon-container {
  width: 62px;
  height: 62px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--t-base) var(--ease);
}

.tool-card:hover .icon-container {
  transform: scale(1.06);
}

.tool-card.color-red .icon-container {
  background: var(--brand-red-soft);
  color: var(--brand-red-strong);
}
.tool-card.color-gold .icon-container {
  background: var(--brand-gold-soft);
  color: var(--brand-gold);
}
.tool-card.color-green .icon-container {
  background: var(--brand-green-soft);
  color: var(--brand-green);
}
.tool-card.color-blue .icon-container {
  background: var(--brand-blue-soft);
  color: var(--brand-blue);
}

.card-name-wrap {
  padding-top: 20px;
}

.card-name {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.card-desc-wrap {
  padding-top: 8px;
  display: flex;
  justify-content: center;
}

.card-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.2;
}
</style>
