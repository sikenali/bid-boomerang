import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SUB_APP_LIST } from '../config/apps';
import { warmupSubApp, nextIdle } from '../utils/preload';

const REWARM_INTERVAL = 5 * 60 * 1000;

export const usePreloadStore = defineStore('preload', () => {
  /** idle 未开始 | warming 预热中 | ready 全部完成 */
  const status = ref('idle');
  const warmed = ref(0);
  const total = ref(0);
  const failed = ref([]);
  const lastWarmedAt = ref(0);

  let timer = null;
  let running = false;

  function warmOne(app) {
    return warmupSubApp(app)
      .then(() => {
        warmed.value += 1;
      })
      .catch((error) => {
        failed.value = [...failed.value, app.name];
        console.warn('[preload] 预热失败：', app.name, error);
      });
  }

  /**
   * 逐个空闲预热子应用：一次只预热一个，避免与当前正在加载的工具抢占带宽。
   * skipName 为当前已打开的工具，无需预热。
   */
  function start(skipName = '') {
    if (running) return;
    running = true;
    status.value = 'warming';
    total.value = SUB_APP_LIST.length;
    warmed.value = 0;
    failed.value = [];

    const queue = SUB_APP_LIST.filter((app) => app.name !== skipName);

    const step = () => {
      const app = queue.shift();
      if (!app) {
        status.value = 'ready';
        running = false;
        lastWarmedAt.value = Date.now();
        timer = setTimeout(() => start(skipName), REWARM_INTERVAL);
        return;
      }
      warmOne(app).finally(() => nextIdle(step, 1500));
    };

    nextIdle(step, 1000);
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    running = false;
    status.value = 'idle';
  }

  return { status, warmed, total, failed, lastWarmedAt, start, stop };
});
