# 回旋标工作台 · Wujie 微前端接入设计

日期：2026-10-21
范围：`bid-boomerang/shell-main`（主壳）+ 六个子应用的开发服务器配置

## 1. 背景与问题

`shell-main` 原先只是门户首页：点击顶部导航或工具卡片只会弹一个 Toast 提示，
从未真正渲染子应用。用户诉求：

1. 去掉所有点击操作的 Toast 提示；
2. 点击工具卡片 / 顶部导航后，真正进入对应工具的主界面。

`bg.md` 已确定技术选型：Wujie（腾讯无界微前端）承载六个子应用，
主壳负责调度、上下文下发与子应用注册表维护。

## 2. 目标与非目标

**目标**

- 主壳点击工具 → 在主壳内以 Wujie 微前端方式渲染对应子应用的主界面；
- 切换工具时子应用实例保活（`alive`），不丢失已填表单 / 已跑任务；
- 主壳不再出现任何点击 Toast；
- 子应用未启动、加载失败时给出内联占位而非白屏或弹窗；
- 子应用地址可通过环境变量覆盖，便于生产 nginx 代理部署。

**非目标**

- 不做多标签栏（可关闭、多任务并存）——采用「单容器 + 顶部导航」精简体量；
- 不做主壳登录态 / Token 真实下发（保留 `postMessage` 通道位置）；
- 不改动六个子应用的业务逻辑、路由与数据结构。

## 3. 架构

主壳已经是 hash 路由结构（`vue-router`），本次在其上补齐子应用渲染：

```
shell-main (Vue3 + Vite + wujie-vue3 + vue-router)
├── routes
│   ├── /             → HomeView   门户首页（Hero + ToolCards + Slogan）
│   └── /tool/:name   → ToolView   工具工作台（TopNav + WujieContainer）
└── WujieContainer    微前端容器：wujie + 加载态 + 错误占位
     └── <wujie name=... url=... alive sync=false load-error>
          ├── bid-extractor   (Vue3, 5101)
          ├── bid-maker       (Vue3, 5102)
          ├── bid-typesetting (Vue3, 5103)
          ├── bid-quotation   (React19, 5104)
          ├── bid-compare     (Vue3, 5105)
          └── bid-checker     (Vue3, 5106)
```

主壳不打包子应用资源，浏览器按需 fetch 子应用入口 HTML/JS。

## 4. 交互与状态

路由即状态：

| 触发 | 行为 |
|---|---|
| 首页工具卡片 | `router.push('/tool/:name')` → ToolView 渲染对应子应用 |
| 首页右上「进入统一工作台」 | `router.push('/tool/bid-extractor')`（首个工具） |
| 工作台顶部导航项 | `router.push('/tool/:name')`，同路由不同参数 → 组件复用 → 容器换应用（保活） |
| 容器错误态「重试」 | 重新拉起当前子应用实例 |
| 容器错误态「返回首页」 | `router.push('/')` |
| 顶部「返回首页」按钮 / 品牌区 | `router.push('/')` |

`/tool/:name` 与 `/tool/:other` 属同一路由记录，vue-router 复用组件实例，
因此 `WujieContainer` 内的 `<wujie>` 不会被卸载重建，`alive` 保活成立。
离开工作台（回到首页）时组件卸载，子应用实例随之销毁——本期不做后台常驻。

## 5. Toast 移除

- 删除 `src/utils/toast.js`（`ElMessage` 工具）。
- `HomeView.vue`：删除「进入统一工作台」的 `ElMessage.info`，改为直接路由到工具工作台。
- `ThemeSettingsView.vue`：删除主题 / 强调色 / 恢复默认的 `ElMessage.success`，
  状态由界面本身（选中态、配色）表达。

全站不再有点击 Toast 组件。

## 6. Wujie 容器

`src/components/WujieContainer.vue`

| 属性 | 值 | 理由 |
|---|---|---|
| `alive` | `true` | 切换工具不销毁实例，保留子应用内部状态 |
| `sync` | `false` | 主壳为 hash 路由；避免子应用路由写坏主壳地址栏 |
| `width` / `height` | `100%` | 撑满容器 |
| `load-error` | 回调 | 资源加载失败时切到错误占位 |

> `wujie-vue3@2.1.0` 无 `fallback` / `fetch` 布尔属性：`degrade` 为真会强制切 iframe
> 渲染（失去 shadow DOM 隔离），故不启用，交由 wujie 按浏览器能力自动降级。

**加载态**：容器上层覆盖遮罩（旋转图标 + 「正在载入 <工具名>」+ 地址）。

**加载完成判定**：轮询 `wujie-app` 宿主元素的开放 shadowRoot 是否已有子元素；
`data-wujie-id` 与当前应用名一致才算命中（避免切换瞬间误判旧应用）。20s 未就绪 → 错误态。

**错误态**：`loadError` 回调或超时触发，不挂载任何弹窗，显示内联占位卡：
工具名、错误说明、实际地址、「重试」按钮、「返回首页」按钮。

**重试**：调用 `wujie` 组件实例的 `refresh()`（destroyApp + 重新 startApp）。

## 7. 子应用地址与端口

`src/config/apps.js` 保留默认端口，并允许 `VITE_SUBAPP_URLS`（JSON，键为 app `name`）逐项覆盖：

```bash
VITE_SUBAPP_URLS='{"bid-checker":"https://work.example.com/opc/bid-checker/"}'
```

端口使用 `51xx` 段，避开各子应用后端（3000 / 8080 / 8099 / 8000）与其它本地服务：

| 应用 | 前端端口 | 入口路径 |
|---|---|---|
| bid-extractor | 5101 | `/`（重定向到 `/upload`） |
| bid-maker | 5102 | `/` |
| bid-typesetting | 5103 | `/` |
| bid-quotation | 5104 | `/` |
| bid-compare | 5105 | `/` |
| bid-checker | 5106 | `/`（重定向到 `/upload`） |

### 7.1 子应用改造（仅开发服务器配置）

每个子应用的 `vite.config` 需：

1. 固定 `server.port` 为上表端口（消除默认 5173 冲突）；
2. 固定 `server.host = '127.0.0.1'`（本机联调，不暴露局域网；避免 IPv4/IPv6 绑定歧义）；
3. 增加 `server.headers['Access-Control-Allow-Origin'] = '*'`（Wujie 通过 fetch 拉取子应用资源，
   缺 CORS 直接加载失败）。

业务源码零改动。

## 8. 错误处理

| 场景 | 表现 |
|---|---|
| 子应用未启动 | 错误占位卡（网络错误文案）+ 地址 + 重试 / 返回首页 |
| 子应用启动但资源 404 | `loadError` 触发 → 错误占位卡 |
| 加载超过 20s | 判定超时 → 错误占位卡 |
| 切换工具 | 旧实例保活隐藏，新实例显示加载遮罩 |

## 9. 验证

`npm run build` 通过；用 Playwright 实测（Chromium，shell 8080 + checker 5106 + quotation 5104）：

- 首页 6 张工具卡片；点击「文检星」→ `#/tool/bid-checker`，wujie 容器渲染出
  「文检猩 · 标书智能检查平台」界面；
- 顶部导航切到「文价星」→ React 子应用渲染成功；
- 切回「文检星」→ 实例仍在（保活）；
- 未启动的「文版星」→ 错误占位可见，文案与地址正确；
- 启动服务后点「重试」→ 渲染成功，错误占位消失；
- 全流程 `#__toast_container__` 数量为 0（无 Toast）。

## 10. 交付物

- `shell-main/src/components/WujieContainer.vue`（新增）
- `shell-main/src/views/ToolView.vue`（接入容器）
- `shell-main/src/views/HomeView.vue`（去 Toast，主界面按钮改为进入工作台）
- `shell-main/src/components/layout/ThemeSettingsView.vue`（去 Toast）
- `shell-main/src/utils/toast.js`（删除）
- `shell-main/src/config/apps.js`（端口表 + 环境变量覆盖）
- `shell-main/src/main.js`（注册 `RiAlertLine` / `RiRefreshLine`）
- `shell-main/package.json`（新增 `wujie-vue3`）
- `shell-main/README.md`（端口表 / 启动说明 / 容器说明）
- 六个子应用 `vite.config`（host + port + CORS）
