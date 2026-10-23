import Wujie from 'wujie-vue3';

const HTML_TIMEOUT = 8000;

/** 拉取子应用入口 HTML，超时或网络失败抛出错误 */
async function fetchAppHtml(url) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTML_TIMEOUT);

    fetch(url, {
      mode: 'no-cors',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`获取入口 HTML 失败：${response.status}`));
          return;
        }
        resolve(response.text());
      })
      .catch((error) => {
        reject(new Error(`无法获取 ${url}`));
        void error;
      })
      .finally(() => clearTimeout(timeout));
  });
}

/**
 * 仅预取子应用入口 HTML 并注入 wujie 配置（不启动子应用 JS）。
 * 这一步很轻：只多一次 fetch，子应用代码不会执行、不占 CPU 和内存。
 * 用户真正点击工具卡片时，WujieContainer 才启动子应用。
 */
export async function prefetchSubApp(app) {
  const html = await fetchAppHtml(app.url);
  Wujie.setupApp({
    name: app.name,
    url: app.url,
    html,
    alive: true,
    sync: false,
  });
  return html;
}

/**
 * 完整预热子应用：拉 HTML + 启动子应用 JS（exec:true）。
 * 成本高：会占 CPU/内存；仅作为兜底（例如当前工具启动后，把其他常用工具也 exec 起来）。
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
    html,
    alive: true,
    exec: true,
  });
}

/**
 * 强制刷新某个子应用：清缓存 → 重新 fetch HTML → 重新 setup。
 * 用于开发阶段改了子应用代码后想让 bid-boomerang 立即看到效果。
 * 生产环境也可用于"重启工具"的手动运维场景。
 */
export async function refreshSubApp(app) {
  try { Wujie.remove(app.name); } catch { /* ignore */ }
  return prefetchSubApp(app);
}

/**
 * 开发者控制台 API：
 *   window.$refreshSubApp('bid-extractor')   单个刷新
 *   window.$refreshSubApp()                  全部刷新
 *   window.$preloadStatus()                  查看当前预热状态
 * 仅开发模式可用，生产打包后不会暴露。
 */
export function installDevApi() {
  if (import.meta.env.PROD) return;

  window.$refreshSubApp = async (name) => {
    const { SUB_APP_LIST } = await import('../config/apps');
    const targets = name
      ? SUB_APP_LIST.filter((app) => app.name === name)
      : SUB_APP_LIST;
    if (!targets.length) {
      console.warn(`[preload] unknown sub-app: ${name}`);
      return;
    }
    await Promise.all(targets.map(refreshSubApp));
    console.log(`[preload] refreshed: ${targets.map((a) => a.name).join(', ')}`);
  };

  window.$preloadStatus = () => {
    console.log('[preload] usage:');
    console.log('  $refreshSubApp()               刷新全部子应用（拉最新 HTML）');
    console.log("  $refreshSubApp('bid-extractor') 只刷新指定的子应用");
    console.log('  $preloadStatus()               查看当前说明（即本函数）');
  };
}
