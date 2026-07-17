// 付費牆 20 語系掃描：逐語系切換 app 語言、simctl 截圖、產出 contact sheet。
// 前置：Metro 8081 在跑、模擬器 dev build 前景停在付費牆頁。
// 機制：經 CDP 呼叫 PreferenceContext 掛的 dev hook globalThis.__qaLanguage
//       （走設定頁同一條 setLanguage 全路徑），語系會真實落庫、掃完自動還原原語系。
// 用法：node paywall_locale_sweep.mjs [輸出目錄] [--check]
//   --check 只驗 hook 可達性、不截圖（CI/交接前煙霧測試用）。
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const outDir = args.find(a => !a.startsWith('--')) || './paywall_locale_sweep_out';

const LOCALES = ['en','zh-Hant','zh-Hans','ja','ko','de','es','fr','pt-BR','it','nl','sv','da','no','fi','pl','id','vi','th','hi'];
const SETTLE_MS = 900; // 語系切換後等 re-render 與快取重建

const pages = await (await fetch('http://localhost:8081/json')).json();
const page = pages.find(p => /Bridgeless|React Native/i.test(p.description || '') && !/Reanimated/i.test(p.description || ''));
if (!page) { console.error('找不到 Hermes CDP target（Metro 8081 有跑？app 有開？）'); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++msgId;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
});
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) { throw new Error(r.result.exceptionDetails.text || 'evaluate 失敗'); }
  return r.result?.result?.value;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

ws.onerror = (e) => { console.error('ws error', e.message); process.exit(1); };
ws.onopen = async () => {
  await send('Runtime.enable');

  const hookType = await evaluate('typeof globalThis.__qaLanguage');
  if (hookType !== 'object') {
    console.error(`__qaLanguage hook 不可達（typeof=${hookType}）。要 dev build 且 PreferenceProvider 已掛載。`);
    process.exit(1);
  }
  const original = await evaluate('globalThis.__qaLanguage.get()');
  console.log(`hook OK、目前語系 ${original}`);
  if (checkOnly) { console.log('[--check 通過]'); process.exit(0); }

  mkdirSync(outDir, { recursive: true });
  const shots = [];
  for (const [i, locale] of LOCALES.entries()) {
    await evaluate(`globalThis.__qaLanguage.set(${JSON.stringify(locale)})`);
    await sleep(SETTLE_MS);
    const file = `${String(i + 1).padStart(2, '0')}_${locale}.png`;
    execSync(`xcrun simctl io booted screenshot ${JSON.stringify(join(outDir, file))}`, { stdio: 'pipe' });
    shots.push({ locale, file });
    console.log(`${locale} 截好`);
  }

  await evaluate(`globalThis.__qaLanguage.set(${JSON.stringify(original)})`);
  console.log(`已還原語系 ${original}`);

  const html = `<!doctype html><meta charset="utf-8"><title>paywall locale sweep</title>
<style>body{font-family:sans-serif;background:#111;color:#eee;margin:16px}
 .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
 figure{margin:0}img{width:100%;border-radius:8px}figcaption{text-align:center;padding:4px;font-size:14px}</style>
<h1>付費牆 20 語系（${new Date().toISOString().slice(0, 10)}）</h1><div class="grid">
${shots.map(s => `<figure><img src="${s.file}" loading="lazy"><figcaption>${s.locale}</figcaption></figure>`).join('\n')}
</div>`;
  writeFileSync(join(outDir, 'index.html'), html);
  console.log(`完成：${shots.length} 張、contact sheet ${join(outDir, 'index.html')}`);
  process.exit(0);
};
