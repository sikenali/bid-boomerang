# shell-main · 回旋标统一工作台

Vue3 + Vite + Wujie 主壳：门户首页 + 六星工具工作台，用微前端方式把六个标书工具
（抽取 / 生成 / 校验 / 排版 / 比对 / 报价）收进同一个外壳调度。

## 启动

```bash
npm install
npm run dev        # http://localhost:8080
npm run build
```

> 需先启动对应子应用的开发服务（见下方端口表），否则容器会显示「无法连接」占位。

## 子应用端口

六个子应用的前端统一使用 `51xx` 段，避开各子应用后端与其它本地服务已占用的端口：

| 应用 | 前端端口 | 目录 |
|---|---|---|
| bid-extractor（文取星） | 5101 | `/home/jingle/opc/bid-extractor/frontend` |
| bid-maker（文制星） | 5102 | `/home/jingle/opc/bid-maker/frontend` |
| bid-typesetting（文版星） | 5103 | `/home/jingle/opc/bid-typesetting` |
| bid-quotation（文价星） | 5104 | `/home/jingle/opc/bid-quotation` |
| bid-compare（文比星） | 5105 | `/home/jingle/opc/bid-compare` |
| bid-checker（文检星） | 5106 | `/home/jingle/opc/bid-checker` |

各子应用 `vite.config` 已固定 `host: '127.0.0.1'`、`port` 与
`server.headers['Access-Control-Allow-Origin'] = '*'`（Wujie 通过 fetch 拉取子应用资源，
缺 CORS 会直接加载失败）。

## 子应用地址覆盖

生产环境走 nginx 代理路径时，用环境变量覆盖默认地址（JSON，键为应用名）：

```bash
VITE_SUBAPP_URLS='{"bid-checker":"https://work.example.com/opc/bid-checker/"}' npm run build
```

## 目录

```
src/
├── App.vue                 # 根组件（router-view）
├── router/index.js         # / → 首页，/tool/:name → 工具工作台
├── views/
│   ├── HomeView.vue        # 门户首页（Hero + ToolCards + Slogan）
│   └── ToolView.vue        # 工具工作台（顶部导航 + Wujie 容器）
├── components/
│   ├── TopNav.vue          # 顶部导航（品牌 + 六工具 + 主题/设置/返回）
│   ├── ToolCards.vue       # 六个工具卡片
│   ├── WujieContainer.vue  # Wujie 微前端容器（加载态 / 错误占位 / 重试）
│   ├── HeroSection.vue     # 金线 + 主标题 + 副标题
│   ├── SloganBlock.vue     # 底部标语
│   ├── PageFooter.vue      # 页脚
│   ├── layout/             # 设置弹窗
│   └── ui/                 # UiModal / UiTip
├── config/
│   ├── apps.js             # 六个子应用注册表（端口 + 环境变量覆盖）
│   └── toolIcons.js        # 图标映射
├── stores/theme.js         # 主题 store
└── utils/icon.js
```

## 交互

- 首页点击工具卡片或顶部「进入统一工作台」→ 路由到 `/tool/:name`，由 `WujieContainer`
  通过 Wujie 渲染对应子应用主界面。
- 工作台内点击顶部导航切换工具：容器 `alive` 保活，子应用实例不销毁、状态不丢失。
- 子应用未启动 / 资源加载失败 → 容器显示内联占位（错误说明 + 地址 + 重试 / 返回首页），
  **不使用 Toast 通知**。
- 全站点击操作不弹 Toast（`src/utils/toast.js` 已移除）。

## Wujie 容器说明

`WujieContainer.vue` 使用 `wujie-vue3`：

| 属性 | 值 | 理由 |
|---|---|---|
| `alive` | `true` | 切换工具保活，保留子应用内部状态 |
| `sync` | `false` | 主壳为 hash 路由，不让子应用路由写坏地址栏 |
| `load-error` | 回调 | 资源加载失败时切到错误占位 |
| `width` / `height` | `100%` | 撑满容器 |

加载完成判定：轮询 `wujie-app` 宿主元素的开放 shadowRoot 是否已有内容，
20s 未就绪则判定为加载失败。

## 设计变量

见 `src/assets/global.css`：品牌红 `#BE3B2E`、金 `#C6A45C`、绿 `#4E9B7A`、蓝 `#4A72A8`，
卡片描边 `#EFEBE1`，导航底 `#F7F0E7`。
