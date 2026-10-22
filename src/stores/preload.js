import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SUB_APP_LIST } from '../config/apps';
import { warmupSubApp, nextIdle } from '../utils/preload';

const REWARM_INTERVAL = 5 * 60 * 1000;

export const usePreloadStore = defineStore('preload', () => {
  /** idle 未开始 | warming 首次预热中 | ready 已就绪 */
  const status = ref('idle');
  const warmed = ref(0);
  const total = ref(0);
  const failed = ref([]);

  let timer = null;
  let running = false;
  let firstCycle = true;

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
   *
   * 首轮结束后每 REWARM_INTERVAL 刷新一次入口 HTML 缓存，避免子应用改动后拿到旧入口。
   */
  function start(skipName = '') {
    // 可通过 VITE_PRELOAD=off 关闭后台预热（低内存机器 / 排查问题时）
    if (import.meta.env.VITE_PRELOAD === 'off') return;
    if (running) return;
    running = true;
    total.value = SUB_APP_LIST.length;
    warmed.value = 0;
    failed.value = [];
    if (firstCycle) {
      status.value = 'warming';
    }

    const queue = SUB_APP_LIST.filter((app) => app.name !== skipName);

    const step = () => {
      const app = queue.shift();
      if (!app) {
        status.value = 'ready';
        running = false;
        firstCycle = false;
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
    firstCycle = true;
    status.value = 'idle';
  }

  return { status, warmed, total, failed, start, stop };
});
