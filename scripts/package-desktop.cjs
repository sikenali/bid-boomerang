'use strict';

/**
 * 桌面客户端打包流水线:
 *
 *   1. 构建主壳前端(shell)         -> dist/
 *   2. electron-builder 按平台出包  -> release/
 *
 * 用法:
 *   node scripts/package-desktop.js              # 当前平台
 *   node scripts/package-desktop.js --win|--mac|--linux
 *   node scripts/package-desktop.js --mac --arm64
 *
 * 平台参数原样透传给 electron-builder,例如 "--win --x64"。
 * 注意:本脚本不处理子应用(六星工具各自独立打包/部署),主壳通过
 * VITE_SUBAPP_URLS 指向子应用地址,默认为本机 5101~5106。
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
// 平台参数整体透传给 electron-builder,例如 "--win --x64" / "--mac --arm64"
const platformArgs = process.argv.slice(2).map((a) => (/^--/.test(a) ? a : `--${a}`));
const platformFlag = platformArgs.join(' ');

const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, command, args, cwd = REPO_ROOT) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${command} ${args.join(' ')}`);
  // Windows 下 npm 是 .cmd shim,Node 20.12+ 要求走 shell 才能 spawn,否则报 EINVAL
  const useShell = process.platform === 'win32';
  execFileSync(command, args, { cwd, stdio: 'inherit', shell: useShell });
}

applyReleaseVersion();

const steps = [
  {
    label: '构建主壳前端',
    run: () => run('vite build', NPM, ['run', 'build']),
  },
  {
    label: 'electron-builder 出包',
    run: () => {
      const args = ['exec', 'electron-builder', '--'];
      if (platformFlag) args.push(...platformArgs);
      run('electron-builder', NPM, args);
    },
  },
];

/**
 * 版本号口径:package.json 的 version 为唯一来源。
 *
 * - CI(tag 触发):tag 版本必须与 package.json 完全一致,否则直接失败——
 *   否则会出现「仓库写 1.0.2、tag 是 v1.0.3、装出来又是 1.0.2」的三方分裂。
 * - 本地手动出包:允许用 RELEASE_VERSION 临时覆盖(仅改工作区),但会打印警告。
 *
 * 仅接受形如 v1.2.3 / 1.2.3 的版本号,其它值(如分支名 main)一律忽略。
 */
function applyReleaseVersion() {
  const rawVersion = (process.env.RELEASE_VERSION || '').trim();
  if (!rawVersion) return;
  const version = rawVersion.replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/.test(version)) {
    console.log(`  忽略非版本号 RELEASE_VERSION=${rawVersion},使用 package.json 版本`);
    return;
  }
  const pkgPath = path.join(REPO_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.version === version) {
    console.log(`  版本号与 package.json 一致:${version}`);
    return;
  }
  if (process.env.CI) {
    console.error('');
    console.error(`❌ 版本号不一致:tag=${version},package.json=${pkg.version}`);
    console.error('   版本口径唯一来源是 package.json,请先改版本号并提交,再打同名 tag。');
    console.error('');
    process.exit(1);
  }
  pkg.version = version;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`  ⚠️ 本地临时覆盖版本号为 ${version}(仅本次构建的工作区)`);
}

for (const step of steps) {
  step.run();
}

const releaseDir = path.join(REPO_ROOT, 'release');
if (fs.existsSync(releaseDir)) {
  const files = fs.readdirSync(releaseDir).filter((f) => /\.(exe|dmg|AppImage|deb|zip)$/.test(f));
  console.log('\n✅ 打包完成,产物:');
  for (const f of files) console.log(`   release/${f}`);
} else {
  console.log('\n⚠️ 未找到 release 目录,请检查 electron-builder 输出');
}
