'use strict';

/**
 * 预加载脚本:仅向渲染进程暴露最小能力。
 * 渲染进程运行在 contextIsolation 沙箱内,拿不到 Node API。
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
