// 從 Metro 8081 的 CDP 端點擷取 device console，只印 QA marker。
// RN 0.79 的 JS console 走 CDP、不進 Metro log，故需接 ws 撈 consoleAPICalled。
//
// 用法：
//   node qa_tools/cdp_capture.mjs                    擷取全部 QA marker，預設 60 秒
//   node qa_tools/cdp_capture.mjs "QA BACKUP"        只印含此前綴的 marker
//   node qa_tools/cdp_capture.mjs "QA RCACHE" 20     前綴 + 秒數
//
// 邊界：只印比對到的 marker、有秒數上限，避免無界錄 JWS 或 stack 爆磁碟。
// 退出碼區分失敗與靜默：0 為正常結束（已連上，擷取數印於 stderr）、
// 1 為連不上或 ws 中途失敗（避免把連線失敗誤讀成 marker 沒發）。
//
// 依賴：Node 22+（全域 WebSocket 於 22.4 起穩定內建）與內建 fetch；
// 模擬器 app 在跑、Metro 在 8081。

if (typeof WebSocket === 'undefined') {
  console.error('此 Node 版本無全域 WebSocket，需 Node 22+。目前 ' + process.version);
  process.exit(1);
}

const filter = process.argv[2] ?? 'QA ';
const rawDuration = Number(process.argv[3]);
const durationSec = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 60;
const METRO = 'http://localhost:8081';

function argToText(a) {
  if (a == null) return '';
  if (a.type === 'string') return a.value ?? '';
  if (a.value !== undefined) return String(a.value);
  if (a.description !== undefined) return a.description;
  return '';
}

async function pickTarget() {
  const res = await fetch(`${METRO}/json`).catch(() => null);
  if (!res || !res.ok) throw new Error('Metro 8081 無回應：確認 Metro 在跑、app 已啟動');
  const targets = await res.json();
  const withWs = targets.filter(t => t.webSocketDebuggerUrl);
  if (!withWs.length) throw new Error('無可接的 CDP 目標：app 未連上 debugger');
  // 優先選 Hermes / React Native 分頁
  const preferred = withWs.find(t =>
    /hermes|react|experimental/i.test(`${t.title ?? ''} ${t.description ?? ''} ${t.vm ?? ''}`),
  );
  return (preferred ?? withWs[0]).webSocketDebuggerUrl;
}

async function main() {
  const wsUrl = await pickTarget();
  const ws = new WebSocket(wsUrl);
  let id = 1;
  let opened = false;
  let captured = 0;
  let finished = false;

  const finish = (code) => {
    if (finished) return;
    finished = true;
    console.error(`[cdp_capture] connected=${opened} captured=${captured}`);
    try { ws.close(); } catch { /* already closing */ }
    process.exit(code);
  };

  ws.addEventListener('open', () => {
    opened = true;
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.enable' }));
    console.error(`[cdp_capture] 已連上，過濾 "${filter}"，${durationSec} 秒後結束`);
  });

  ws.addEventListener('message', (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.method !== 'Runtime.consoleAPICalled') return;
    const text = (msg.params?.args ?? []).map(argToText).join(' ');
    if (text.includes(filter)) {
      captured++;
      const ts = new Date().toISOString().slice(11, 23);
      console.log(`${ts}  ${text}`);
    }
  });

  // 連線階段失敗必須以非零退出，否則呼叫端會把連不上誤讀成沒 marker。
  ws.addEventListener('error', (e) => {
    console.error('[cdp_capture] ws 錯誤', e.message ?? e);
    if (!opened) finish(1);
  });

  ws.addEventListener('close', () => {
    if (!finished) finish(opened ? 0 : 1);
  });

  // 正常結束：已連上即 exit 0（擷取 0 筆是合法結果、代表 marker 沒發）。
  setTimeout(() => finish(opened ? 0 : 1), durationSec * 1000);
}

main().catch((e) => { console.error('[cdp_capture]', e.message); process.exit(1); });
