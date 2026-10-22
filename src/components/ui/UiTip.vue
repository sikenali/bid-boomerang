<script setup>
defineProps({
  text: { type: String, default: '' },
  placement: { type: String, default: 'top' },
  maxWidth: { type: Number, default: 220 },
  disabled: { type: Boolean, default: false },
});
</script>

<template>
  <span class="ui-tip" :class="['is-' + placement, { 'is-disabled': disabled }]">
    <slot />
    <span
      v-if="!disabled && ($slots.content || text)"
      class="ui-tip-bubble"
      :style="{ maxWidth: maxWidth + 'px' }"
      role="tooltip"
    >
      <slot name="content">{{ text }}</slot>
    </span>
  </span>
</template>

<style scoped>
.ui-tip {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: fit-content;
  width: fit-content;
}
.ui-tip-bubble {
  position: absolute;
  z-index: 1070;
  width: max-content;
  max-width: 260px;
  padding: 7px 12px;
  border-radius: 9px;
  background-color: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
  font-size: 12.5px;
  font-weight: 400;
  line-height: 1.5;
  white-space: nowrap;
  word-break: keep-all;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.16s ease, transform 0.16s ease;
  box-shadow: var(--shadow-md);
}
.ui-tip:not(.is-disabled):hover .ui-tip-bubble,
.ui-tip:not(.is-disabled):focus-within .ui-tip-bubble {
  opacity: 1;
}
.ui-tip-bubble::after {
  content: '';
  position: absolute;
  width: 7px;
  height: 7px;
  background-color: inherit;
  transform: rotate(45deg);
}
.is-top .ui-tip-bubble {
  bottom: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%) scale(0.96);
}
.is-top:hover .ui-tip-bubble, .is-top:focus-within .ui-tip-bubble {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
.is-top .ui-tip-bubble::after { top: calc(100% - 4px); left: calc(50% - 3.5px); }
.is-bottom .ui-tip-bubble {
  top: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%) scale(0.96);
}
.is-bottom:hover .ui-tip-bubble, .is-bottom:focus-within .ui-tip-bubble {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
.is-bottom .ui-tip-bubble::after { bottom: calc(100% - 4px); left: calc(50% - 3.5px); }
</style>
