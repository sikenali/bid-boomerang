'use strict';

/**
 * 回旋标桌面客户端主进程.
 *
 * 进程编排(生产模式):
 *   内置静态服务器(Node http)  托管 dist/  默认 127.0.0.1:<空闲端口>
 *   BrowserWindow  -> http://127.0.0.1:<STATIC_PORT>
 *
 * 开发模式(NODE_ENV=development):不启动静态服务器,直接加载 vite dev server。
 * 端口被占用时自动改用空闲端口,避免与本机开发实例(5173)冲突。
 *
 * 关于六个子应用:主壳通过 Wujie 拉取子应用资源,子应用地址在构建时由
 * VITE_SUBAPP_URLS 决定(默认 http://127.0.0.1:5101~5106)。桌面端不需要
 * 公网地址,但要求这些本地服务回 CORS 头(Access-Control-Allow-Origin: *)。
 */

const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development';
const APP_NAME = '回旋标';
const PREF_STATIC_PORT = 18000;

/* ------------------------------------------------------------------ *
 * 运行时子应用地址配置
 *
 * 地址优先级:环境变量 BID_SUBAPP_URLS > 配置文件 subs.json > 构建期 VITE_SUBAPP_URLS
 * 配置文件位置(按平台):
 *   Windows %APPDATA%\bid-boomerang\subs.json
 *   macOS   ~/Library/Application Support/bid-boomerang\subs.json
 *   Linux   ~/.config/bid-boomerang\subs.json
 * 格式与 VITE_SUBAPP_URLS 一致:{"bid-checker":"https://..."}
 * ------------------------------------------------------------------ */

function configDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'bid-boomerang');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'bid-boomerang');
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'bid-boomerang');
}

function configFile() {
  return path.join(configDir(), 'subs.json');
}

function readConfigFile() {
  try {
    return fs.readFileSync(configFile(), 'utf-8');
  } catch {
    return '';
  }
}

function writeConfigFile(content) {
  fs.mkdirSync(configDir(), { recursive: true });
  fs.writeFileSync(configFile(), content, 'utf-8');
}

/** 解析后的地址覆盖(已按应用名归一化) */
function readSubAppOverrides() {
  const raw = process.env.BID_SUBAPP_URLS || readConfigFile();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('[desktop] 子应用地址配置解析失败,已忽略:', error.message);
    return {};
  }
}

/** 前端构建产物目录:开发取仓库 dist,生产取 extraResources 释放的 resources/dist。 */
function distRoot() {
  if (isDev) return path.join(__dirname, '..', 'dist');
  return path.join(app.getAppPath(), '..', 'dist');
}

let mainWindow = null;
let staticServer = null;
let staticPort = 0;

// ── 端口分配 ───────────────────────────────────────────────────────────

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.listen(port, '127.0.0.1', () => {
      srv.close();
      resolve(true);
    });
  });
}

/** 首选端口空闲则用之,否则向系统申请随机空闲端口。 */
async function pickPort(preferred) {
  if (await portFree(preferred)) return preferred;
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(0));
    srv.listen(0, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close();
      resolve(p);
    });
  });
}

// ── 静态服务器(托管已构建的 dist)──────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function serveStatic(root) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let pathname;
      try {
        pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      } catch {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      // 防目录穿越
      const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(root, safePath);
      if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      // 运行时子应用地址:主壳同步读取 window.__SUBAPP_URLS__
      if (pathname === '/runtime-config.js') {
        const payload = JSON.stringify(readSubAppOverrides());
        res.writeHead(200, {
          'Content-Type': 'text/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(`window.__SUBAPP_URLS__ = ${payload};`);
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      // 静态资源不存在时回落到 index.html(hash 路由无需服务端 rewrite)
      if (!fs.existsSync(filePath)) {
        filePath = path.join(root, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const headers = {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      };

      // 首页注入运行时配置脚本(模块脚本 defer,注入位置不影响执行顺序)
      if (ext === '.html') {
        const html = fs.readFileSync(filePath, 'utf-8');
        const injected = html.includes('<script type="module"')
          ? html.replace('<script type="module"', '  <script src="/runtime-config.js"></script>\n    <script type="module"')
          : html.replace('</head>', '  <script src="/runtime-config.js"></script>\n  </head>');
        res.writeHead(200, headers);
        res.end(injected);
        return;
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    });

    server.on('error', reject);
    server.listen(staticPort, '127.0.0.1', () => resolve(server));
  });
}

// ── 子应用地址(运行期覆盖)─────────────────────────────────────────────

/**
 * 读取子应用地址覆盖表,优先级:
 *   1. 环境变量 BID_SUBAPP_URLS(JSON 字符串)
 *   2. 环境变量 BID_SUBAPP_CONFIG 指向的 JSON 文件
 *   3. userData/subs.json(用户或部署方放置的配置文件)
 * 一个安装包即可适配不同部署,无需重新打包。
 */
function loadSubAppUrls() {
  const rawCandidates = [];
  if (process.env.BID_SUBAPP_URLS) rawCandidates.push(process.env.BID_SUBAPP_URLS);
  if (process.env.BID_SUBAPP_CONFIG) {
    try {
      rawCandidates.push(fs.readFileSync(process.env.BID_SUBAPP_CONFIG, 'utf8'));
    } catch (error) {
      console.warn('[desktop] 读取 BID_SUBAPP_CONFIG 失败:', error.message);
    }
  }
  try {
    rawCandidates.push(fs.readFileSync(path.join(app.getPath('userData'), 'subs.json'), 'utf8'));
  } catch {
    // 未配置文件属正常情况,忽略
  }
  for (const raw of rawCandidates) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length) return parsed;
    } catch {
      // 忽略非法 JSON,继续尝试下一个来源
    }
  }
  return {};
}

// ── 窗口 ───────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    backgroundColor: '#FAF7F2',
    title: APP_NAME,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // 把子应用地址表交给 preload,注入 window.__SUBAPP_URLS__
      additionalArguments: [`--subapp-urls=${encodeURIComponent(JSON.stringify(loadSubAppUrls()))}`],
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 外部链接走系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173';
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadURL(`http://127.0.0.1:${staticPort}/`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── 生命周期 ───────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  if (!isDev) {
    if (!fs.existsSync(path.join(distRoot(), 'index.html'))) {
      dialog.showErrorBox(APP_NAME, '未找到前端构建产物(dist/index.html),请先执行 npm run build。');
      app.quit();
      return;
    }
    staticPort = await pickPort(PREF_STATIC_PORT);
    try {
      staticServer = await serveStatic(distRoot());
    } catch (error) {
      dialog.showErrorBox(APP_NAME, `静态服务器启动失败:${error.message}`);
      app.quit();
      return;
    }
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (staticServer) staticServer.close();
});

/* ------------------------------------------------------------------ *
 * IPC:应用信息 / 子应用地址配置
 * ------------------------------------------------------------------ */

ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  electron: process.versions.electron,
  configFile: configFile(),
}));

ipcMain.handle('get-subapp-config', () => ({
  file: configFile(),
  content: readConfigFile(),
  overrides: readSubAppOverrides(),
}));

ipcMain.handle('set-subapp-config', (_event, content) => {
  const text = String(content || '');
  if (text.trim()) {
    JSON.parse(text); // 非法 JSON 直接抛错,由渲染层提示
  }
  writeConfigFile(text);
  return { ok: true, overrides: readSubAppOverrides() };
});

ipcMain.handle('reload-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.reload();
  return true;
});
