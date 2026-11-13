import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, execSync } from 'node:child_process';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const apkDir = path.join(androidDir, 'app/build/outputs/apk/debug');
const apkSrcDefault = path.join(apkDir, 'app-debug.apk');
const recordsDir = path.join(root, 'docs/build-records');

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: root, stdio: 'inherit', ...opts });
}
function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','pipe'], ...opts }).trim();
}
function shInherit(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

const nowLagos = () => sh("TZ=Africa/Lagos date '+%Y-%m-%d %H:%M:%S (Africa/Lagos)'");
const buildStart = nowLagos();
const dateCompact = sh("TZ=Africa/Lagos date '+%Y%m%d'");
const timeCompact = sh("TZ=Africa/Lagos date '+%H%M%S'");
const versionName = `${buildStart.slice(0,10).replace(/-/g,'.')}-${timeCompact}-debug`;
const versionCode = String(Math.floor(Date.now()/1000));
const apkName = `flowsnap-debug-${dateCompact}-${timeCompact}.apk`;
const gitSha = sh('git rev-parse HEAD');
const gitShort = sh('git rev-parse --short HEAD');
const gitBranch = sh('git rev-parse --abbrev-ref HEAD');
const porcelain = sh('git status --porcelain');
const dirtyFiles = porcelain ? porcelain.split('\n').filter(Boolean) : [];
const worktreeClean = dirtyFiles.length === 0;

const env = {
  ...process.env,
  FLOWSNAP_BUILD_DATE: buildStart,
  FLOWSNAP_BUILD_DATE_COMPACT: dateCompact,
  FLOWSNAP_BUILD_TIME_COMPACT: timeCompact,
  FLOWSNAP_VERSION_NAME: versionName,
  FLOWSNAP_VERSION_CODE: versionCode,
  FLOWSNAP_GIT_SHA: gitSha,
  FLOWSNAP_GIT_SHORT: gitShort,
  FLOWSNAP_GIT_BRANCH: gitBranch,
  FLOWSNAP_APK_NAME: apkName,
};

console.log('== Generating build info ==');
run('node', ['scripts/generate-build-info.mjs'], { env });

console.log('== Capacitor sync ==');
run('npx', ['--no-install', 'cap', 'sync', 'android'], { env });

const gradleBin = process.env.FLOWSNAP_GRADLE_BIN || path.join(process.env.HOME || '', '.gradle/wrapper/dists/gradle-8.14.2-bin/2pb3mgt1p815evrl3weanttgr/gradle-8.14.2/bin/gradle');
console.log('== Gradle assembleDebug ==', gradleBin);
shInherit(`${JSON.stringify(gradleBin)} assembleDebug`, androidDir);

let apkSrc = path.join(apkDir, apkName);
if (!fs.existsSync(apkSrc)) {
  const files = fs.existsSync(apkDir) ? fs.readdirSync(apkDir).filter(f => f.endsWith('.apk')) : [];
  const preferred = files.find(f => f.includes(timeCompact)) || files.find(f => f.includes(dateCompact)) || files[0];
  if (preferred) apkSrc = path.join(apkDir, preferred);
}
if (!fs.existsSync(apkSrc)) {
  apkSrc = apkSrcDefault;
}
if (!fs.existsSync(apkSrc)) throw new Error('APK not found in ' + apkDir);
const completion = nowLagos();
const stat = fs.statSync(apkSrc);
const buf = fs.readFileSync(apkSrc);
const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
const apkDest = apkSrc; // Gradle already produced dated filename when configured

let embedded = {};
try {
  const aapt = process.env.AAPT_BIN || '/home/olugbenga/Android/Sdk/build-tools/34.0.0/aapt';
  const badging = sh(`${JSON.stringify(aapt)} dump badging ${JSON.stringify(apkDest)} 2>/dev/null | head -5`);
  embedded.badging = badging;
} catch {}

const record = {
  apk: { filename: path.basename(apkDest), absolutePath: apkDest, originalOutput: apkSrc },
  applicationId: 'com.flowsnap.app',
  versionName,
  versionCode: Number(versionCode),
  buildCompletionTimestampAfricaLagos: completion,
  buildStartTimestampAfricaLagos: buildStart,
  git: { branch: gitBranch, commitSha: gitSha, short: gitShort, worktreeClean },
  uncommittedChanges: dirtyFiles,
  fileSizeBytes: stat.size,
  sha256,
  buildResult: 'SUCCESS',
  embedded,
  notes: worktreeClean ? [] : ['APK built from worktree with uncommitted changes; does not represent HEAD alone.'],
};
fs.mkdirSync(recordsDir, { recursive: true });
const recordPath = path.join(recordsDir, `${path.basename(apkName, '.apk')}.json`);
fs.writeFileSync(recordPath, JSON.stringify(record, null, 2) + '\n');
console.log('BUILD_RECORD_PATH=' + recordPath);
console.log(JSON.stringify(record, null, 2));
