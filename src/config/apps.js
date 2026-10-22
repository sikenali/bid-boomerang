/**
 * 六个子应用注册表
 *
 * 前端端口约定（51xx 段，避开各子应用后端与其它本地服务已占用的端口）：
 *   bid-extractor  5101   bid-maker      5102
 *   bid-typesetting 5103  bid-quotation  5104
 *   bid-compare    5105   bid-checker    5106
 *
 * 部署到 nginx 代理路径时，用环境变量覆盖（JSON，键为应用名）：
 *   VITE_SUBAPP_URLS='{"bid-checker":"https://work.example.com/opc/bid-checker/"}'
 */
const DEFAULT_PORTS = {
  'bid-extractor': 5101,
  'bid-maker': 5102,
  'bid-typesetting': 5103,
  'bid-quotation': 5104,
  'bid-compare': 5105,
  'bid-checker': 5106,
};

function readUrlOverrides() {
  const raw = import.meta.env.VITE_SUBAPP_URLS;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[apps] VITE_SUBAPP_URLS 解析失败，已忽略：', error);
    return {};
  }
}

const URL_OVERRIDES = readUrlOverrides();

const APP_META = [
  {
    name: 'bid-extractor',
    title: '标书信息抽取',
    shortTitle: '文取星',
    desc: '智能提取',
    color: 'red',
    icon: 'ri-download-cloud-line',
    iconClass: 'ri-download-cloud-line',
  },
  {
    name: 'bid-maker',
    title: '标书生成',
    shortTitle: '文制星',
    desc: '智能生成',
    color: 'gold',
    icon: 'ri-quill-pen-line',
    iconClass: 'ri-quill-pen-line',
  },
  {
    name: 'bid-checker',
    title: '标书合规校验',
    shortTitle: '文检星',
    desc: '智能校验',
    color: 'green',
    icon: 'ri-todo-line',
    iconClass: 'ri-todo-line',
  },
  {
    name: 'bid-typesetting',
    title: '标书排版',
    shortTitle: '文版星',
    desc: '智能排版',
    color: 'blue',
    icon: 'ri-layout-column-line',
    iconClass: 'ri-layout-column-line',
  },
  {
    name: 'bid-compare',
    title: '标书比对',
    shortTitle: '文比星',
    desc: '智能比对',
    color: 'red',
    icon: 'ri-book-open-line',
    iconClass: 'ri-book-open-line',
  },
  {
    name: 'bid-quotation',
    title: '报价编制',
    shortTitle: '文价星',
    desc: '智能报价',
    color: 'gold',
    icon: 'ri-price-tag-line',
    iconClass: 'ri-price-tag-line',
  },
];

export const SUB_APP_LIST = APP_META.map((app) => ({
  ...app,
  url: URL_OVERRIDES[app.name] || `http://127.0.0.1:${DEFAULT_PORTS[app.name]}`,
}));
