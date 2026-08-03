// 一次性 CDP harness：對 Hermes 直呼模組函式並同步擷取 console 事件。
// 用法：node cdp_harness.mjs '<JS 運算式>' [收尾等待秒數]
const expr = process.argv[2];
const waitSec = Number(process.argv[3] || 6);
if (!expr) { console.error('缺運算式'); process.exit(1); }

const pages = await (await fetch('http://localhost:8081/json')).json();
const page = pages.find(p => /Bridgeless|React Native/i.test(p.description || '') && !/Reanimated/i.test(p.description || ''));
if (!page) { console.error('找不到 Hermes CDP target'); process.exit(1); }

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
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    const text = (m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ');
    console.log('[console]', text);
  }
};

ws.onopen = async () => {
  await send('Runtime.enable');
  const r = await send('Runtime.evaluate', {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  });
  console.log('[evaluate 結果]', JSON.stringify(r.result, null, 1));
  setTimeout(() => { console.log('[done]'); process.exit(0); }, waitSec * 1000);
};
ws.onerror = (e) => { console.error('ws error', e.message); process.exit(1); };
