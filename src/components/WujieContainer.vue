<template>
  <div class="wujie-container">
    <div ref="hostRef" class="wujie-host">
      <Wujie
        ref="wujieRef"
        :name="app.name"
        :url="app.url"
        :alive="true"
        :sync="false"
        width="100%"
        height="100%"
        :load-error="handleLoadError"
      />
    </div>

    <div v-if="status === 'loading'" class="wujie-mask">
      <div class="mask-inner">
        <RiLoader4Line class="mask-spinner" size="28" />
        <span class="mask-title">正在载入 {{ app.title }}</span>
        <span class="mask-url">{{ app.url }}</span>
        <span class="mask-hint">{{ loadHint }}</span>
      </div>
    </div>

    <div v-if="status === 'error'" class="wujie-error">
      <div class="error-card">
        <RiAlertLine class="error-icon" size="30" />
        <h3 class="error-title">无法连接「{{ app.title }}」</h3>
        <p class="error-text">{{ errorMessage || '请确认该工具的开发服务已启动。' }}</p>
        <p class="error-url"><code>{{ app.url }}</code></p>
        <div class="error-actions">
          <button class="error-btn" @click="retry">
            <RiRefreshLine size="16" />
            <span>重试</span>
          </button>
          <button class="error-btn ghost" @click="$emit('back-home')">
            <RiArrowLeftSLine size="16" />
            <span>返回首页</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import Wujie from 'wujie-vue3';

const props = defineProps({
  app: { type: Object, required: true },
});

const emit = defineEmits(['back-home', 'message', 'ready']);

const hostRef = ref(null);
const wujieRef = ref(null);
const status = ref('loading');
const errorMessage = ref('');
const elapsed = ref(0);

const LOAD_TIMEOUT = 20000;
const POLL_INTERVAL = 50;

let timer = null;
let ticker = null;
/** 已注册到 wujie bus 的回调，便于切换标签/卸载时反注册，避免监听器累积 */
let busCallbacks = {};

const loadHint = computed(() => {
  if (elapsed.value < 3) return '正在拉取子应用资源…';
  return `开发模式首次加载需实时编译子应用，已等待 ${elapsed.value}s，请稍候…`;
});

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startTicker() {
  stopTicker();
  elapsed.value = 0;
  ticker = setInterval(() => {
    elapsed.value += 1;
  }, 1000);
}

function stopTicker() {
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

/** 子应用已渲染到 shadowRoot 中（wujie-app 为开放 shadow，宿主属性 data-wujie-id 即应用名） */
function isRendered() {
  const host = hostRef.value;
  if (!host) return false;
  // alive: true 下，切换标签后老的 wujie-app 节点仍在 DOM，需遍历匹配当前 name
  const appElements = host.querySelectorAll('wujie-app');
  for (const appElement of appElements) {
    if (appElement.getAttribute('data-wujie-id') !== props.app.name) continue;
    const shadow = appElement.shadowRoot;
    if (!shadow || shadow.childElementCount === 0) return false;
    const body = shadow.querySelector('body');
    if (!body || body.childElementCount === 0) return false;
    if ((body.textContent || '').trim().length > 0) return true;
    // 纯图形界面（无文本）用尺寸兜底；offsetHeight 比 getBoundingClientRect 便宜
    return body.offsetHeight > 40;
  }
  return false;
}

function startPolling() {
  stopPolling();
  errorMessage.value = '';

  // 切标签场景：preloaded + alive 的子应用常常瞬间就绪，
  // 先检查再切 loading，彻底避免"闪一下 loading mask"
  if (isRendered()) {
    status.value = 'ready';
    sendContextToSubApp();
    emit('ready', props.app.name);
    return;
  }

  status.value = 'loading';
  startTicker();
  const deadline = Date.now() + LOAD_TIMEOUT;

  timer = setInterval(() => {
    if (isRendered()) {
      status.value = 'ready';
      stopPolling();
      stopTicker();
      sendContextToSubApp();
      emit('ready', props.app.name);
    } else if (Date.now() > deadline) {
      errorMessage.value = '加载超时，请确认该工具的开发服务已启动。';
      status.value = 'error';
      stopPolling();
      stopTicker();
    }
  }, POLL_INTERVAL);
}

function handleLoadError(src, error) {
  const raw = error?.message || String(error || src);
  const isNetworkIssue = /failed to fetch|networkerror|err_connection/i.test(raw);
  errorMessage.value = isNetworkIssue
    ? '无法连接到子应用服务，请确认该工具的开发服务已启动。'
    : `资源加载失败：${raw}`;
  status.value = 'error';
  stopPolling();
  stopTicker();
}

function retry() {
  status.value = 'loading';
  errorMessage.value = '';
  nextTick(() => {
    if (wujieRef.value?.refresh) {
      wujieRef.value.refresh();
    }
    startPolling();
  });
}

/** 安全解析 localStorage JSON（localStorage 可能被外部写入非法内容，不能抛错阻断上下文下发） */
function readJsonSafe(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** 移除已注册的 bus 监听器（切换标签或卸载时调用，避免监听器累积） */
function unregisterBusCallbacks() {
  const instance = wujieRef.value?.$wujie || wujieRef.value;
  if (instance?.bus) {
    for (const [event, cb] of Object.entries(busCallbacks)) {
      try { instance.bus.$off(event, cb); } catch { /* ignore */ }
    }
  }
  busCallbacks = {};
}

/** 下发 token、用户信息、公共上下文给子应用 */
function sendContextToSubApp() {
  const instance = wujieRef.value?.$wujie || wujieRef.value;
  if (!instance?.bus) return;

  // 先反注册旧监听器：alive 模式下切回标签会重新触发本函数，不反注册会累积
  unregisterBusCallbacks();

  instance.bus.$emit('token', {
    token: localStorage.getItem('token') || '',
    userInfo: readJsonSafe('userInfo', {}),
  });

  instance.bus.$emit('context', {
    appName: props.app.name,
    appTitle: props.app.title,
    theme: localStorage.getItem('theme') || 'parchment',
    accent: localStorage.getItem('accent') || '#BE3B2E',
  });

  const on = (event, handler) => {
    busCallbacks[event] = handler;
    instance.bus.$on(event, handler);
  };
  on('updateTitle', (title) => emit('message', { type: 'updateTitle', title }));
  on('taskProgress', (progress) => emit('message', { type: 'taskProgress', data: progress }));
  on('agentResult', (result) => emit('message', { type: 'agentResult', data: result }));
  on('error', (error) => emit('message', { type: 'error', data: error }));
}

watch(
  () => props.app.name,
  () => {
    nextTick(startPolling);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopPolling();
  stopTicker();
  unregisterBusCallbacks();
});

defineExpose({ status });
</script>

<style scoped>
.wujie-container {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-white);
  border: var(--border-hair) solid var(--color-border-soft);
}

.wujie-host {
  position: absolute;
  inset: 0;
}

.wujie-host :deep(wujie-app) {
  display: block;
  width: 100%;
  height: 100%;
}

.wujie-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-white);
}

.mask-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.mask-spinner {
  color: var(--color-primary);
  animation: mask-spin 1s linear infinite;
}

@keyframes mask-spin {
  to {
    transform: rotate(360deg);
  }
}

.mask-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.mask-url {
  font-size: 13px;
  color: var(--color-text-faint);
}

.mask-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
  max-width: 320px;
  line-height: 1.6;
}

.wujie-error {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-white);
  padding: 32px;
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 520px;
}

.error-icon {
  color: var(--color-error);
}

.error-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.error-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-body);
}

.error-url code {
  display: inline-block;
  margin: 0;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  font-size: 13px;
  color: var(--color-text-secondary);
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.error-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 14px;
  cursor: pointer;
  transition: opacity var(--t-fast) var(--ease), transform var(--t-fast) var(--ease);
}

.error-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.error-btn.ghost {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.error-btn.ghost:hover {
  background: var(--color-border-line);
}
</style>
