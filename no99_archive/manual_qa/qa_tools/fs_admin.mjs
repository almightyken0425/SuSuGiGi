// Firestore 對賬與測試佈置工具，走 firebase-admin 與本機 service account key。
// 讀取備份文件、entitlement、偏好；寫入供 T3 佈置（注入 entitlement 或毀損偏好值）。
//
// 前置：把 Firebase console 產的私鑰存為 qa_tools/serviceAccountKey.json，不進 git。
// 專案：susugigi-c4fb1。
//
// 用法：
//   node qa_tools/fs_admin.mjs get users/<uid>
//   node qa_tools/fs_admin.mjs get entitlements/<uid>
//   node qa_tools/fs_admin.mjs count users/<uid>/transactions
//   node qa_tools/fs_admin.mjs query users/<uid>/transactions 5      前 5 筆
//   node qa_tools/fs_admin.mjs set entitlements/<uid> '{"tier":1,"status":"active"}'
//   node qa_tools/fs_admin.mjs set users/<uid> '{"preferences":{"launchMode":"expense"}}'
//
// set 為 merge 寫入，供佈置測試前置狀態；讀取用於對賬。

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const here = dirname(fileURLToPath(import.meta.url));
const keyPath = join(here, 'serviceAccountKey.json');

let key;
try {
  key = JSON.parse(readFileSync(keyPath, 'utf8'));
} catch {
  console.error(
    '找不到 serviceAccountKey.json。\n' +
    '去 Firebase console 專案 susugigi-c4fb1 → 專案設定 → 服務帳戶 → 產生新的私密金鑰，\n' +
    `存到 ${keyPath}（已 gitignore、不進 git）。`,
  );
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(key) });
const db = admin.firestore();

const [cmd, path, extra] = process.argv.slice(2);

function segCount(p) {
  return p.split('/').filter(Boolean).length;
}
function isDocPath(p) {
  return segCount(p) % 2 === 0;
}
function requireDocPath(p) {
  if (!isDocPath(p)) { console.error('需文件路徑（偶數段），收到：' + p); process.exit(1); }
}
function requireCollPath(p) {
  if (isDocPath(p)) { console.error('需集合路徑（奇數段），收到：' + p); process.exit(1); }
}

async function main() {
  if (!cmd || !path) {
    console.error('缺參數。用法見檔頭。');
    process.exit(1);
  }

  if (cmd === 'get') {
    requireDocPath(path);
    const snap = await db.doc(path).get();
    if (!snap.exists) { console.log('文件不存在：' + path); return; }
    console.log(JSON.stringify(snap.data(), null, 2));
    return;
  }

  if (cmd === 'count') {
    requireCollPath(path);
    const agg = await db.collection(path).count().get();
    console.log(agg.data().count);
    return;
  }

  if (cmd === 'query') {
    requireCollPath(path);
    const rawLimit = Number(extra ?? 10);
    if (!Number.isInteger(rawLimit) || rawLimit <= 0) {
      console.error('query 的 limit 需正整數，收到：' + extra);
      process.exit(1);
    }
    const snap = await db.collection(path).limit(rawLimit).get();
    console.log('筆數（受 limit 約束）：' + snap.size);
    snap.forEach(d => console.log(d.id, JSON.stringify(d.data())));
    return;
  }

  if (cmd === 'set') {
    requireDocPath(path);
    if (!extra) { console.error('set 需第三參數 JSON'); process.exit(1); }
    await db.doc(path).set(JSON.parse(extra), { merge: true });
    console.log('已 merge 寫入 ' + path);
    return;
  }

  console.error('未知指令：' + cmd + '。支援 get count query set。');
  process.exit(1);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
