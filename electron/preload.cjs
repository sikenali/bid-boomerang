'use strict';

/**
 * 预加载脚本:仅向渲染进程暴露最小能力。
 * 渲染进程运行在 contextIsolation 沙箱内,拿不到 Node API。
 */
const { contextBridge, ipcRenderer } = require('electron');

// 运行期子应用地址覆盖(供 src/config/apps.js 读取)
contextBridge.exposeInMainWorld('__SUBAPP_URLS__', readSubAppUrls());

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  /** 应用信息(版本/平台/配置文件路径) */
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  /** 读取子应用地址配置(运行时可配置) */
  getSubAppConfig: () => ipcRenderer.invoke('get-subapp-config'),
  /** 写入子应用地址配置,返回生效后的覆盖表 */
  setSubAppConfig: (content) => ipcRenderer.invoke('set-subapp-config', content),
  /** 重载窗口以应用新的子应用地址 */
  reloadWindow: () => ipcRenderer.invoke('reload-window'),
});
