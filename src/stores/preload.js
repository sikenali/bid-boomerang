import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SUB_APP_LIST } from '../config/apps';
import { prefetchSubApp, refreshSubApp, installDevApi } from '../utils/preload';

/** 错峰 fetch 间隔，避免瞬间并发压满网络栈 */
const PREFETCH_GAP = 120;

/**
 * 预热策略（轻量版）：
 *   - 首页只 prefetch 入口 HTML（一次 fetch），不启动子应用 JS
 *   - 用户点击工具卡片时才由 WujieContainer 真正启动子应用（wujie alive:true 会自动保留）
 *   - 首页预热完成后 300ms，把剩余工具的 HTML 也 fetch 好（用户下次点击时秒开）
 *   - 开发阶段改代码 → 控制台 window.$refreshSubApp(name) 手动刷新
 */
export const usePreloadStore = defineStore('preload', () => {
  /** idle | prefetching | ready */
  const status = ref('idle');
  const prefetched = ref(0);
  const total = ref(0);
  const failed = ref([]);

  let running = false;
  const prefetchDone = new Set();

  async function prefetchOne(app) {
    if (prefetchDone.has(app.name)) return;
    try {
      await prefetchSubApp(app);
      prefetchDone.add(app.name);
      prefetched.value += 1;
    } catch (error) {
      failed.value = [...failed.value, app.name];
      console.warn('[preload] 预取失败：', app.name, error?.message || error);
    }
  }

  /**
   * 启动轻量预热：并发 fetch 所有子应用入口 HTML。
   * skipName 为当前已打开的工具（跳过）。
   */
  function start(skipName = '') {
    if (import.meta.env.VITE_PRELOAD === 'off') return;
    if (running) return;
    running = true;
    status.value = 'prefetching';
    total.value = SUB_APP_LIST.length;
    prefetched.value = 0;
    failed.value = [];
    prefetchDone.clear();

    const queue = SUB_APP_LIST.filter((app) => app.name !== skipName);
    let index = 0;

    const launch = () => {
      if (index >= queue.length) {
        status.value = 'ready';
        running = false;
        return;
      }
      const app = queue[index];
      index += 1;
      prefetchOne(app);
      setTimeout(launch, PREFETCH_GAP);
    };

    launch();
  }

  /** 手动刷新某个子应用（供开发用） */
  async function refresh(name) {
    const app = SUB_APP_LIST.find((a) => a.name === name);
    if (!app) return;
    prefetchDone.delete(app.name);
    await refreshSubApp(app);
  }

  function stop() {
    running = false;
    status.value = 'idle';
  }

  return { status, prefetched, total, failed, start, stop, refresh };
});

// 只在开发环境注入控制台 API
installDevApi();
