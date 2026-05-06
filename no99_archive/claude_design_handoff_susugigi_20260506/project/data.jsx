// ─────────────────────────────────────────────────────────────
// Tokens — faithful to repo theme.ts (Classic Purple THEME_1)
// ─────────────────────────────────────────────────────────────
const TOKENS = {
  // bg / surfaces (theme.bg)
  bg:        '#F2F2F7',                  // iOS systemGroupedBackground
  surface:   '#FFFFFF',                  // PALETTE.neutral[0]
  surface2:  '#F5F5F5',                  // surface_hover

  // text (theme.text)
  ink:       '#212121',                  // PALETTE.neutral[900] — primary
  ink2:      '#757575',                  // PALETTE.neutral[600] — secondary
  ink3:      '#BDBDBD',                  // PALETTE.neutral[400] — disabled
  divider:   '#E0E0E0',                  // PALETTE.neutral[300]
  hairline:  'rgba(60,60,67,0.10)',     // LIST_TOKENS divider light
  hairline2: '#EEEEEE',                  // PALETTE.neutral[200]

  // primary — Classic Purple
  p50:       '#f0ecfa',
  p100:      '#c0b6df',
  p200:      '#a191d0',
  p300:      '#826cc0',
  p400:      '#6248b0',
  p500:      '#4323a0',                  // primary.main
  p600:      '#381d85',
  p700:      '#2d176b',
  p800:      '#221250',
  p900:      '#160c35',
  contrast:  '#F24F13',                  // accent contrast (orange)

  // status
  success:   '#4CAF50',
  error:     '#F44336',
  warning:   '#FFC107',
  info:      '#2196F3',
};

// Chart colors from theme1.chart (purples 800→400)
const CHART_COLORS = ['#221250','#2d176b','#381d85','#4323a0','#6248b0','#826cc0','#a191d0','#c0b6df'];

// Categories (zh-TW)
const CATEGORIES = [
  { id: 'food',     name: '飲食',     type: 'expense', glyph: 'fork' },
  { id: 'trans',    name: '交通',     type: 'expense', glyph: 'car' },
  { id: 'shop',     name: '購物',     type: 'expense', glyph: 'bag' },
  { id: 'ent',      name: '娛樂',     type: 'expense', glyph: 'play' },
  { id: 'home',     name: '居家',     type: 'expense', glyph: 'house' },
  { id: 'health',   name: '醫療',     type: 'expense', glyph: 'plus' },
  { id: 'edu',      name: '教育',     type: 'expense', glyph: 'book' },
  { id: 'gift',     name: '禮物',     type: 'expense', glyph: 'gift' },
  { id: 'salary',   name: '薪資',     type: 'income',  glyph: 'wallet' },
  { id: 'invest',   name: '投資',     type: 'income',  glyph: 'arrow-up' },
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const ACCOUNTS = [
  { id: 'cash',    name: '現金',          balance: 3240,    icon: 'cash',  currency: 'TWD' },
  { id: 'bank',    name: '玉山活儲',       balance: 128450,  icon: 'bank',  currency: 'TWD' },
  { id: 'credit',  name: '國泰世華 信用卡', balance: -8420,   icon: 'card',  currency: 'TWD' },
  { id: 'invest',  name: '富邦證券',       balance: 462100,  icon: 'chart', currency: 'TWD' },
];
const ACC_BY_ID = Object.fromEntries(ACCOUNTS.map(a => [a.id, a]));

// Mock period — May 2026
const TX = [
  { id: 1,  date: 'May 2',  cat: 'food',   acc: 'credit', amount: -185,  note: '路易莎咖啡' },
  { id: 2,  date: 'May 2',  cat: 'food',   acc: 'cash',   amount: -120,  note: '便當' },
  { id: 3,  date: 'May 2',  cat: 'trans',  acc: 'credit', amount: -32,   note: '捷運' },
  { id: 4,  date: 'May 1',  cat: 'ent',    acc: 'credit', amount: -480,  note: '電影 — 沙丘' },
  { id: 5,  date: 'May 1',  cat: 'food',   acc: 'credit', amount: -780,  note: '居酒屋' },
  { id: 6,  date: 'May 1',  cat: 'shop',   acc: 'credit', amount: -1290, note: 'Uniqlo T-shirt × 2' },
  { id: 7,  date: 'Apr 30', cat: 'salary', acc: 'bank',   amount: 68000, note: '4 月薪資' },
  { id: 8,  date: 'Apr 30', cat: 'trans',  acc: 'credit', amount: -28,   note: '公車' },
  { id: 9,  date: 'Apr 29', cat: 'food',   acc: 'cash',   amount: -340,  note: '晚餐 — 牛肉麵' },
  { id: 10, date: 'Apr 29', cat: 'health', acc: 'credit', amount: -650,  note: '牙科檢查' },
  { id: 11, date: 'Apr 29', cat: 'home',   acc: 'credit', amount: -1480, note: '電費' },
];

function periodTotals(items) {
  let income = 0, expense = 0;
  for (const t of items) {
    if (t.amount > 0) income += t.amount;
    else expense += -t.amount;
  }
  return { income, expense, balance: income - expense };
}

// Group by date (Date mode)
function groupByDate(items) {
  const m = new Map();
  for (const t of items) {
    if (!m.has(t.date)) m.set(t.date, []);
    m.get(t.date).push(t);
  }
  return Array.from(m.entries()).map(([title, data]) => ({
    id: 'date_' + title,
    title,
    data,
    total: data.reduce((s, t) => s + t.amount, 0),
  }));
}
// Group by category (Category mode), expense only by chartMode
function groupByCategory(items, chartMode = 'expense') {
  const filtered = items.filter(t => chartMode === 'expense' ? t.amount < 0 : t.amount > 0);
  const m = new Map();
  for (const t of filtered) {
    if (!m.has(t.cat)) m.set(t.cat, []);
    m.get(t.cat).push(t);
  }
  return Array.from(m.entries()).map(([cat, data]) => ({
    id: 'cat_' + cat,
    cat,
    title: CAT_BY_ID[cat].name,
    iconGlyph: CAT_BY_ID[cat].glyph,
    data,
    total: data.reduce((s, t) => s + t.amount, 0),
  })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

// Pie data — by category, expense
function pieData(items) {
  const m = new Map();
  for (const t of items) {
    if (t.amount >= 0) continue;
    m.set(t.cat, (m.get(t.cat) || 0) + (-t.amount));
  }
  const arr = Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  return arr.map(([id, value], i) => ({
    id, value,
    color: CHART_COLORS[i % CHART_COLORS.length],
    cat: CAT_BY_ID[id],
  }));
}

function fmt(n, code = 'TWD') {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const symbol = code === 'TWD' ? 'NT$' : code;
  return sign + symbol + abs.toLocaleString('en-US');
}

Object.assign(window, {
  TOKENS, CHART_COLORS, CATEGORIES, CAT_BY_ID, ACCOUNTS, ACC_BY_ID, TX,
  periodTotals, groupByDate, groupByCategory, pieData, fmt,
});
