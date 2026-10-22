import Wujie from 'wujie-vue3';

const HTML_TIMEOUT = 8000;

/**
 * 空闲调度：优先用 requestIdleCallback，没有则退化为 setTimeout
 */
export function nextIdle(callback, timeout = 1000) {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  setTimeout(callback, 200);
}

/** 预取子应用入口 HTML，失败不阻塞主流程 */
async function fetchAppHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTML_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 预热单个子应用：
 * 1. 预取入口 HTML 并登记到 wujie 配置缓存，后续启动直接复用，不必重复拉取；
 * 2. 预取入口脚本资源，让 vite / 静态服务器提前完成转换与传输。
 *
 * 注意：wujie 的 preloadApp 内部以 requestIdleCallback 调度，重复调用不会重复创建实例。
 */
export async function warmupSubApp(app) {
  const html = await fetchAppHtml(app.url);
  Wujie.setupApp({
    name: app.name,
    url: app.url,
    html,
    alive: true,
    sync: false,
  });
  Wujie.preloadApp({
    name: app.name,
    url: app.url,
    alive: true,
    exec: false,
  });
  return html;
}

/** 释放预热的子应用实例（离开工作台时调用，避免后台常驻占用内存） */
export function destroySubApp(name) {
  try {
    Wujie.destroyApp(name);
  } catch (error) {
    console.warn('[preload] 销毁子应用失败：', name, error);
  }
}
