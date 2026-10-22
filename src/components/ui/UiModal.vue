<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { riToCompName } from '../../utils/icon';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'ri-file-edit-line' },
  width: { type: [Number, String], default: 560 },
  maxWidth: { type: [Number, String], default: 600 },
  height: { type: String, default: 'calc(100vh - 40px)' },
  fixedHeight: { type: Boolean, default: false },
  closeOnClickOverlay: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '确定' },
  confirmDisabled: { type: Boolean, default: false },
  confirmLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'close', 'confirm', 'cancel']);

const panelWidth = computed(() => typeof props.width === 'number' ? props.width + 'px' : props.width);
const panelMaxWidth = computed(() => typeof props.maxWidth === 'number' ? props.maxWidth + 'px' : props.maxWidth);

function close() {
  emit('update:modelValue', false);
  emit('close');
}
function onCancel() {
  emit('cancel');
  close();
}
function onConfirm() {
  if (props.confirmDisabled || props.confirmLoading) return;
  emit('confirm');
}
function onKey(ev) {
  if (ev.key === 'Escape' && props.modelValue && props.closeOnEsc) close();
}

let lockCount = 0;
function lockScroll(lock) {
  lockCount = Math.max(0, lockCount + (lock ? 1 : -1));
  document.body.style.overflow = lockCount > 0 ? 'hidden' : '';
}

watch(() => props.modelValue, v => lockScroll(v));
onMounted(() => { if (props.modelValue) lockScroll(true); window.addEventListener('keydown', onKey); });
onUnmounted(() => { if (props.modelValue) lockScroll(false); window.removeEventListener('keydown', onKey); });
</script>

<template>
  <teleport to="body">
    <transition name="ui-modal">
      <div v-if="modelValue" class="ui-modal-overlay" @click.self="closeOnClickOverlay && close()">
        <div
          class="ui-modal-panel"
          :style="{ width: panelWidth, maxWidth: panelMaxWidth, maxHeight: height }"
          role="dialog"
          aria-modal="true"
        >
          <div class="ui-modal-header">
            <div class="ui-modal-header-left">
              <div class="ui-modal-icon">
                <component :is="riToCompName(icon)" />
              </div>
              <div class="ui-modal-header-text">
                <h2 class="ui-modal-title">{{ title }}</h2>
                <p v-if="subtitle || $slots.subtitle" class="ui-modal-subtitle">
                  <slot name="subtitle">{{ subtitle }}</slot>
                </p>
              </div>
            </div>
            <button v-if="showClose" class="ui-modal-close" @click="close" aria-label="关闭">
              <RiCloseLine />
            </button>
          </div>

          <div class="ui-modal-body">
            <slot />
          </div>

          <div v-if="showFooter || $slots.footer" class="ui-modal-footer">
            <slot name="footer">
              <span class="ui-modal-footer-btns">
                <button class="ui-modal-cancel" @click="onCancel">{{ cancelText }}</button>
                <button
                  class="ui-modal-confirm"
                  :disabled="confirmDisabled || confirmLoading"
                  @click="onConfirm"
                >
                  <RiLoader4Line v-if="confirmLoading" class="icon spinning" />
                  {{ confirmText }}
                </button>
              </span>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.ui-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.ui-modal-panel {
  background: var(--color-bg-white);
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.ui-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 22px;
}
.ui-modal-header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}
.ui-modal-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: var(--color-primary);
  flex-shrink: 0;
}
.ui-modal-icon svg { display: inline-flex; }
.ui-modal-header-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ui-modal-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 28px;
}
.ui-modal-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 18px;
}
.ui-modal-close {
  width: 40px;
  height: 40px;
  background: var(--color-bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border: none;
  flex-shrink: 0;
  transition: background-color 0.2s, transform 0.15s;
}
.ui-modal-close:hover { background: var(--color-border-soft); }
.ui-modal-close:active { transform: scale(0.94); }
.ui-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}
.ui-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  margin-top: 4px;
  border-top: 1px solid var(--color-bg-secondary);
}
.ui-modal-footer-btns {
  display: flex;
  gap: 12px;
  margin-left: auto;
}
.ui-modal-cancel {
  height: 42px;
  padding: 0 24px;
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-bg-card);
  color: var(--color-text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.ui-modal-cancel:hover { background-color: var(--color-bg-secondary); }
.ui-modal-confirm {
  height: 42px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background-color: var(--color-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s, transform 0.15s;
}
.ui-modal-confirm:hover:not(:disabled) { opacity: 0.92; }
.ui-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.ui-modal-confirm .icon { display: inline-flex; }
.spinning { animation: ui-modal-spin 1s linear infinite; }
@keyframes ui-modal-spin { to { transform: rotate(360deg); } }

.ui-modal-enter-active, .ui-modal-leave-active { transition: opacity 0.25s ease; }
.ui-modal-enter-active .ui-modal-panel, .ui-modal-leave-active .ui-modal-panel {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.32, 0.72, 0.35, 1);
}
.ui-modal-enter-from, .ui-modal-leave-to { opacity: 0; }
.ui-modal-enter-from .ui-modal-panel, .ui-modal-leave-to .ui-modal-panel {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
</style>
