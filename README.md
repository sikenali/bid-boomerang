# 回旋标

文档智能处理平台 — 取、制、检、版、比、价，六步成章，回旋有术。

## 产品架构

平台围绕"文房六宝"六大核心能力构建，每张卡片代表一项文档智能服务：

| 卡片 | 名称 | 功能 | 说明 |
| -- | --- | --- | --- |
| 1 | 文取星 | 智能提取 | 对文件内容进行提取信息展示 |
| 2 | 文制星 | 智能生成 | 根据模板和参数自动生成标准化文档 |
| 3 | 文检星 | 智能校验 | 对文档内容进行合规性、完整性校验 |
| 4 | 文版星 | 智能排版 | 自动调整文档格式、字体、间距等排版要素 |
| 5 | 文比星 | 智能比对 | 对比多份文档差异，高亮标注变更内容 |
| 6 | 文价星 | 智能报价 | 根据历史数据与市场行情智能生成投标报价建议 |

## 页面说明

- **首页**：品牌展示 + 六宝卡片入口
- **统一工作台**：顶部导航调度六大工具，子应用保活切换
- **招标采购平台**：军工装备、航天、船舶等采购平台
- **信用查询平台**：企业信用、资质证书等招投标必备信息查询

## 本地联调

```bash
# 一键启动六个子应用 + 主壳（子应用并行启动，约 15s 全部就绪）
./scripts/start-all.sh

# 需要子应用后端时（Go / Node 服务，较重）
WITH_BACKEND=1 ./scripts/start-all.sh
```

主壳 `http://localhost:5173/`，六个子应用固定端口：

| 应用 | 前端端口 | 目录 |
| --- | --- | --- |
| bid-extractor（文取星） | 5101 | `/home/jingle/opc/bid-extractor/frontend` |
| bid-maker（文制星） | 5102 | `/home/jingle/opc/bid-maker/frontend` |
| bid-typesetting（文版星） | 5103 | `/home/jingle/opc/bid-typesetting` |
| bid-quotation（文价星） | 5104 | `/home/jingle/opc/bid-quotation` |
| bid-compare（文比星） | 5105 | `/home/jingle/opc/bid-compare` |
| bid-checker（文检星） | 5106 | `/home/jingle/opc/bid-checker` |

各子应用 `vite.config` 固定 `host: 127.0.0.1`、端口，并放行 CORS（Wujie 通过 fetch 拉取子应用资源，
缺 CORS 直接加载失败）；同时开启 `server.warmup` 预热入口模块——开发模式首次加载由 6~25s 降到 0.6s。

### 启动速度

| 场景 | 优化前 | 优化后 |
| --- | --- | --- |
| 首次打开工作台（当前工具） | 9.2s | 4.5s |
| 首次点击其余工具 | 5.8 ~ 25s | **0.0 ~ 0.1s** |
| 再次切换（保活） | 0.3s | 0.0s |

主壳在当前工具渲染完成后，会在空闲时段逐个后台预热其余五个工具（`preloadApp` + `exec`），
顶部导航右侧显示「预热 n/6」进度。低内存机器可用 `VITE_PRELOAD=off` 关闭预热。

### 生产部署

生产走 nginx 代理路径时，用环境变量覆盖子应用地址（JSON，键为应用名）：

```bash
VITE_SUBAPP_URLS='{"bid-checker":"https://work.example.com/opc/bid-checker/"}' npm run build
```

本地若要以「构建态」联调（单包直出，首屏 < 1s），在子应用目录执行 `npm run build && npm run preview`，
`preview` 与开发服务同端口且同样放行 CORS，主壳无需改动。

## 桌面客户端（Electron）

主壳提供 Windows / macOS / Linux 三平台桌面端，产物由 GitHub Actions 打出并挂到 Release：

| 平台 | 产物 | 备注 |
| --- | --- | --- |
| Windows x64 | `bid-boomerang-<版本>-win-x64.exe` | NSIS 安装包 |
| macOS | `bid-boomerang-<版本>-mac-x64.dmg` / `-mac-arm64.dmg` | Intel 与 Apple Silicon |
| Linux x64 | `bid-boomerang-<版本>-linux-x64.AppImage` / `.deb` | |

推送 `v*` 标签即触发 `.github/workflows/desktop.yml`：构建主壳 → electron-builder 出包 →
上传到 GitHub Release。本地需要时用 `npm run package:desktop`（当前平台）或
`package:desktop:win|mac|linux`。

**为什么主壳跑在 `http://127.0.0.1:<port>` 而不是 `file://`**：Wujie 依赖 `fetch` 拉取子应用资源，
桌面端内置了一个零依赖的本地静态服务器托管 `dist/`，端口占用时自动改用空闲端口。

### 子应用地址：运行时可配置

同一个安装包适配任意部署，子应用地址有三层来源（后者覆盖前者）：

| 层级 | 来源 | 说明 |
| --- | --- | --- |
| 构建期 | `VITE_SUBAPP_URLS` 环境变量 | 打包时烘焙进前端 |
| 运行期（文件） | `subs.json` 配置文件 | 桌面端「关于」弹窗里可直接编辑保存 |
| 运行期（环境变量） | `BID_SUBAPP_URLS` 环境变量 | 优先级最高，便于脚本化启动 |

配置文件位置：

- Windows：`%APPDATA%\bid-boomerang\subs.json`
- macOS：`~/Library/Application Support/bid-boomerang\subs.json`
- Linux：`~/.config/bid-boomerang\subs.json`

格式与 `VITE_SUBAPP_URLS` 一致（键为应用名，未列出的应用使用默认地址）：

```json
{
  "bid-checker": "https://work.example.com/opc/bid-checker/",
  "bid-quotation": "https://work.example.com/opc/bid-quotation/"
}
```

桌面端主进程会把最终生效的覆盖表以 `/runtime-config.js` 注入页面，前端在初始化时同步读取，
因此**修改后重载窗口即可生效，无需重新打包**。注意：子应用自身需放行 CORS 响应头。

## License

[GNU GPL-3.0 官方许可协议](https://www.gnu.org/licenses/gpl-3.0.en.html)
