// ─────────────────────────────────────────────────────────────
// Tokens — 100% faithful to impl src/constants/theme.ts
// Export names match impl exactly:
//   PALETTE / THEMES / DEFAULT_THEME / DEFAULT_THEME_ID
//   TYPOGRAPHY / SPACING / RADIUS
//   LIST_TOKENS / TX_LIST_TOKENS / SEARCH_BAR_TOKENS / BOTTOM_SEARCH_BAR_TOTAL_HEIGHT
// ─────────────────────────────────────────────────────────────

const PALETTE = {
  neutral: {
    0: '#FFFFFF', 25: '#FAFAFC', 50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE',
    300: '#E0E0E0', 400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#616161',
    800: '#424242', 900: '#212121', 950: '#121212', 1000: '#000000',
  },
  semantic: {
    success: '#4CAF50', warning: '#FFC107', error: '#F44336', info: '#2196F3',
  },
};

const PRIMARY_PURPLE = {
  50: '#f0ecfa', 100: '#c0b6df', 200: '#a191d0', 300: '#826cc0', 400: '#6248b0',
  500: '#4323a0', 600: '#381d85', 700: '#2d176b', 800: '#221250', 900: '#160c35',
  contrast: '#F24F13',
};

const PRIMARY_TEAL = {
  50: '#E0F7FA', 100: '#B2EBF2', 200: '#80DEEA', 300: '#4DD0E1', 400: '#26C6DA',
  500: '#00BCD4', 600: '#00ACC1', 700: '#0097A7', 800: '#00838F', 900: '#006064',
  contrast: '#FF6F00',
};

const GLASS_BASE = {
  blurAmount: 28,
  blurType: 'light',
  tint: 'rgba(255,255,255,0.55)',
  border: 'rgba(255,255,255,0.85)',
  shadowColor: '#000',
  shadowOpacity: 0.10,
};

const THEME_1 = {
  id: 'theme1',
  name: '經典紫 (Classic Purple)',
  statusBar: 'dark-content',
  bg: { base: '#F2F2F7', surface: PALETTE.neutral[0], surface_hover: PALETTE.neutral[100] },
  text: { primary: PALETTE.neutral[900], secondary: PALETTE.neutral[600], disabled: PALETTE.neutral[400], divisor: PALETTE.neutral[300] },
  border: { base: PALETTE.neutral[200], focus: PRIMARY_PURPLE[500] },
  primary: { main: PRIMARY_PURPLE[500], ...PRIMARY_PURPLE },
  status: { success: PALETTE.semantic.success, error: PALETTE.semantic.error, warning: PALETTE.semantic.warning },
  chart: [PRIMARY_PURPLE[800], PRIMARY_PURPLE[700], PRIMARY_PURPLE[600], PRIMARY_PURPLE[500], PRIMARY_PURPLE[400]],
  contrast: PRIMARY_PURPLE.contrast,
  glass: GLASS_BASE,
};

const THEME_2 = {
  id: 'theme2',
  name: '海洋藍 (Ocean Teal)',
  statusBar: 'dark-content',
  bg: { base: '#F2F2F7', surface: PALETTE.neutral[0], surface_hover: PALETTE.neutral[100] },
  text: { primary: PALETTE.neutral[900], secondary: PALETTE.neutral[600], disabled: PALETTE.neutral[400], divisor: PALETTE.neutral[300] },
  border: { base: PALETTE.neutral[200], focus: PRIMARY_TEAL[500] },
  primary: { main: PRIMARY_TEAL[500], ...PRIMARY_TEAL },
  status: { success: PALETTE.semantic.success, error: PALETTE.semantic.error, warning: PALETTE.semantic.warning },
  chart: [PRIMARY_TEAL[800], PRIMARY_TEAL[700], PRIMARY_TEAL[600], PRIMARY_TEAL[500], PRIMARY_TEAL[400]],
  contrast: PRIMARY_TEAL.contrast,
  glass: GLASS_BASE,
};

const THEMES = { theme1: THEME_1, theme2: THEME_2 };
const DEFAULT_THEME_ID = 'theme1';
const DEFAULT_THEME = THEME_1;

// 攤平 TOKENS 給 components.jsx / screens.jsx 用，預設 theme1
const TOKENS = {
  bg:        THEME_1.bg.base,
  surface:   THEME_1.bg.surface,
  surface2:  THEME_1.bg.surface_hover,
  ink:       THEME_1.text.primary,
  ink2:      THEME_1.text.secondary,
  ink3:      THEME_1.text.disabled,
  divider:   THEME_1.text.divisor,
  border:    THEME_1.border.base,
  hairline:  'rgba(60,60,67,0.10)',
  hairline2: PALETTE.neutral[200],
  p50:  THEME_1.primary[50],  p100: THEME_1.primary[100], p200: THEME_1.primary[200],
  p300: THEME_1.primary[300], p400: THEME_1.primary[400], p500: THEME_1.primary[500],
  p600: THEME_1.primary[600], p700: THEME_1.primary[700], p800: THEME_1.primary[800],
  p900: THEME_1.primary[900],
  contrast: THEME_1.contrast,
  success:  THEME_1.status.success,
  warning:  THEME_1.status.warning,
  error:    THEME_1.status.error,
  info:     PALETTE.semantic.info,
};
const CHART_COLORS = THEME_1.chart;
const GLASS = { ...GLASS_BASE };

const TYPOGRAPHY = {
  size: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
  weight: { light: 300, regular: 400, medium: 500 },
};
const TYPE_SCALE = TYPOGRAPHY.size;
const FONT_WEIGHT = TYPOGRAPHY.weight;

const SPACING = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 };
const RADIUS = { sm: 4, md: 8, lg: 12, full: 9999 };

const LIST_TOKENS = {
  ITEM_MIN_HEIGHT: 58,
  ITEM_PADDING_VERTICAL: 17,
  ITEM_PADDING_HORIZONTAL: SPACING[4],
  ITEM_GAP_HORIZONTAL: SPACING[3],
  ITEM_TITLE_SIZE: 17,
  ITEM_TITLE_WEIGHT: TYPOGRAPHY.weight.light,
  ICON_SIZE_SMALL: 20,
  ICON_SIZE_MEDIUM: 24,
  ICON_SIZE_LARGE: 40,
  DIVIDER_COLOR_LIGHT: 'rgba(60,60,67,0.10)',
  DIVIDER_INSET_WITH_ICON: SPACING[4] + 20 + SPACING[3],
  DIVIDER_INSET_WITHOUT_ICON: SPACING[4],
  GROUP_CARD_RADIUS: 14,
  GROUP_CARD_MARGIN_BOTTOM: 35,
  GROUP_CARD_BORDER_WIDTH: 1,
  GROUP_CARD_BORDER_COLOR: 'rgba(60,60,67,0.10)',
  SECTION_TITLE_SIZE: 13,
  SECTION_TITLE_WEIGHT: TYPOGRAPHY.weight.regular,
  SECTION_TITLE_LETTER_SPACING: 0.5,
  SECTION_TITLE_PADDING_TOP: SPACING[3],
  SECTION_TITLE_PADDING_BOTTOM: SPACING[1] + 2,
  SECTION_TITLE_PADDING_HORIZONTAL: SPACING[4],
  SELECTION_ITEM_RADIUS: RADIUS.md,
  SELECTION_ITEM_MARGIN_BOTTOM: SPACING[2],
  SELECTION_CHECKMARK_SIZE: 16,
  TRAILING_CHEVRON_SIZE: 13,
  TRAILING_CHEVRON_WEIGHT: 'semibold',
  TRAILING_VALUE_SIZE: 17,
  PRESS_BG_HIGHLIGHT_OPACITY: 0.5,
  GRID_COLUMNS: 2,
  GRID_GAP: SPACING[3],
  EMPTY_STATE_ICON_SIZE: 48,
  EMPTY_STATE_TITLE_SIZE: 17,
  EMPTY_STATE_DESCRIPTION_SIZE: 14,
  EMPTY_STATE_ICON_GAP: SPACING[3],
  EMPTY_STATE_TEXT_GAP: SPACING[2],
  EMPTY_STATE_PADDING_HORIZONTAL: SPACING[6],
};

const TX_LIST_TOKENS = {
  SECTION_CARD_RADIUS: 14,
  SECTION_CARD_MARGIN_BOTTOM: 14,
  SECTION_CARD_HORIZONTAL_PADDING: SPACING[4],
  SECTION_HEADER_PADDING_V_COLLAPSED: 12,
  SECTION_HEADER_PADDING_V_EXPANDED: 10,
  SECTION_HEADER_PADDING_H: SPACING[4],
  SECTION_HEADER_TITLE_SIZE_COLLAPSED: 17,
  SECTION_HEADER_TITLE_SIZE_EXPANDED: 14,
  SECTION_HEADER_TOTAL_SIZE_COLLAPSED: 15,
  SECTION_HEADER_TOTAL_SIZE_EXPANDED: 13,
  SECTION_HEADER_TITLE_WEIGHT: TYPOGRAPHY.weight.medium,
  SECTION_HEADER_TOTAL_WEIGHT: TYPOGRAPHY.weight.medium,
  ICON_OUTLINE_BORDER_WIDTH: 1,
  ICON_OUTLINE_SIZE: 32,
  ICON_OUTLINE_RADIUS: 10,
  ROW_AMOUNT_SIZE: 16,
  ROW_AMOUNT_WEIGHT: TYPOGRAPHY.weight.medium,
  ROW_LEFT_SLOT_SIZE: 32,
  ROW_NOTE_SIZE: 15,
  ROW_SECONDARY_SIZE: 12,
  MORPH_DURATION_MS: 280,
};
// 老命名 alias 保留向後相容（intro / foundations / showcase 用過）
const TX_TOKENS = TX_LIST_TOKENS;

const SEARCH_BAR_TOKENS = {
  PILL_HEIGHT: 44,
  PADDING_HORIZONTAL: SPACING[4],
  PADDING_VERTICAL: SPACING[3],
  PILL_PADDING_HORIZONTAL: SPACING[3],
  ICON_GAP: SPACING[2],
  ICON_SIZE: 20,
  INPUT_FONT_SIZE: TYPOGRAPHY.size.base,
};
const SEARCH_TOKENS = SEARCH_BAR_TOKENS;
const BOTTOM_SEARCH_BAR_TOTAL_HEIGHT = SEARCH_BAR_TOKENS.PILL_HEIGHT + SEARCH_BAR_TOKENS.PADDING_VERTICAL * 2;

// ─────────────────────────────────────────────────────────────
// IconDefinition.json — 完整 43 個 icon（對齊 impl）
// ─────────────────────────────────────────────────────────────
const ICON_LIBRARY = [
  { id: 1,  uniqueName: 'mci-food',             library: 'MaterialCommunityIcons', glyph: 'food',                 tags: ['category'] },
  { id: 2,  uniqueName: 'mci-bus',              library: 'MaterialCommunityIcons', glyph: 'bus',                  tags: ['category'] },
  { id: 3,  uniqueName: 'mci-cart',             library: 'MaterialCommunityIcons', glyph: 'cart',                 tags: ['category'] },
  { id: 4,  uniqueName: 'mci-movie',            library: 'MaterialCommunityIcons', glyph: 'movie',                tags: ['category'] },
  { id: 5,  uniqueName: 'mci-home',             library: 'MaterialCommunityIcons', glyph: 'home',                 tags: ['category','account'] },
  { id: 6,  uniqueName: 'mci-water',            library: 'MaterialCommunityIcons', glyph: 'water',                tags: ['category'] },
  { id: 7,  uniqueName: 'mci-hospital',         library: 'MaterialCommunityIcons', glyph: 'hospital-box',         tags: ['category'] },
  { id: 8,  uniqueName: 'mci-school',           library: 'MaterialCommunityIcons', glyph: 'school',               tags: ['category'] },
  { id: 9,  uniqueName: 'mci-dots-horizontal',  library: 'MaterialCommunityIcons', glyph: 'dots-horizontal',      tags: ['category','account'] },
  { id: 10, uniqueName: 'mci-cash-multiple',    library: 'MaterialCommunityIcons', glyph: 'cash-multiple',        tags: ['category','account'] },
  { id: 11, uniqueName: 'ant-star',             library: 'AntDesign',              glyph: 'star',                 tags: ['category'] },
  { id: 12, uniqueName: 'mci-chart-line',       library: 'MaterialCommunityIcons', glyph: 'chart-line',           tags: ['category'] },
  { id: 13, uniqueName: 'mci-bank',             library: 'MaterialCommunityIcons', glyph: 'bank',                 tags: ['account'] },
  { id: 14, uniqueName: 'ant-creditcard',       library: 'AntDesign',              glyph: 'creditcard',           tags: ['account'] },
  { id: 15, uniqueName: 'ant-wallet',           library: 'AntDesign',              glyph: 'wallet',               tags: ['account'] },
  { id: 16, uniqueName: 'ant-amazon',           library: 'AntDesign',              glyph: 'amazon',               tags: ['category'] },
  { id: 17, uniqueName: 'ant-book',             library: 'AntDesign',              glyph: 'book',                 tags: ['category'] },
  { id: 18, uniqueName: 'mci-lightbulb-on-outline', library: 'MaterialCommunityIcons', glyph: 'lightbulb-on-outline', tags: ['category'] },
  { id: 19, uniqueName: 'ant-camera',           library: 'AntDesign',              glyph: 'camera',               tags: ['category'] },
  { id: 20, uniqueName: 'ant-clear',            library: 'AntDesign',              glyph: 'clear',                tags: ['category'] },
  { id: 21, uniqueName: 'ant-coffee',           library: 'AntDesign',              glyph: 'coffee',               tags: ['category'] },
  { id: 22, uniqueName: 'ant-customerservice',  library: 'AntDesign',              glyph: 'customerservice',      tags: ['category'] },
  { id: 23, uniqueName: 'mci-currency-usd',     library: 'MaterialCommunityIcons', glyph: 'currency-usd',         tags: ['category','account'] },
  { id: 24, uniqueName: 'ant-dribbble',         library: 'AntDesign',              glyph: 'dribbble',             tags: ['category'] },
  { id: 25, uniqueName: 'mci-currency-eur',     library: 'MaterialCommunityIcons', glyph: 'currency-eur',         tags: ['category','account'] },
  { id: 26, uniqueName: 'ant-experiment',       library: 'AntDesign',              glyph: 'experiment',           tags: ['category'] },
  { id: 27, uniqueName: 'ant-fire',             library: 'AntDesign',              glyph: 'fire',                 tags: ['category'] },
  { id: 28, uniqueName: 'mci-earth',            library: 'MaterialCommunityIcons', glyph: 'earth',                tags: ['category'] },
  { id: 29, uniqueName: 'ant-laptop',           library: 'AntDesign',              glyph: 'laptop',               tags: ['category'] },
  { id: 30, uniqueName: 'ant-notification',     library: 'AntDesign',              glyph: 'notification',         tags: ['category'] },
  { id: 31, uniqueName: 'ant-pay-circle1',      library: 'AntDesign',              glyph: 'pay-circle1',          tags: ['category','account'] },
  { id: 32, uniqueName: 'mci-currency-gbp',     library: 'MaterialCommunityIcons', glyph: 'currency-gbp',         tags: ['category','account'] },
  { id: 33, uniqueName: 'ant-read',             library: 'AntDesign',              glyph: 'read',                 tags: ['category'] },
  { id: 34, uniqueName: 'ant-rocket1',          library: 'AntDesign',              glyph: 'rocket1',              tags: ['category'] },
  { id: 35, uniqueName: 'ant-ruby',             library: 'AntDesign',              glyph: 'ruby',                 tags: ['category'] },
  { id: 36, uniqueName: 'ant-scissor',          library: 'AntDesign',              glyph: 'scissor',              tags: ['category'] },
  { id: 37, uniqueName: 'ant-shoppingcart',     library: 'AntDesign',              glyph: 'shoppingcart',         tags: ['category'] },
  { id: 38, uniqueName: 'ant-sliders',          library: 'AntDesign',              glyph: 'sliders',              tags: ['category'] },
  { id: 39, uniqueName: 'ant-team',             library: 'AntDesign',              glyph: 'team',                 tags: ['category'] },
  { id: 40, uniqueName: 'ant-tool',             library: 'AntDesign',              glyph: 'tool',                 tags: ['category'] },
  { id: 41, uniqueName: 'ant-truck',            library: 'AntDesign',              glyph: 'truck',                tags: ['category'] },
  { id: 42, uniqueName: 'ant-unlock',           library: 'AntDesign',              glyph: 'unlock',               tags: ['category','account'] },
  { id: 43, uniqueName: 'ant-warning',          library: 'AntDesign',              glyph: 'warning',              tags: ['category'] },
];
const ICON_BY_ID = Object.fromEntries(ICON_LIBRARY.map(i => [i.id, i]));

// ─────────────────────────────────────────────────────────────
// Mock data — 對齊 i18n 字串與 impl 的 seed
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'food',    name: '飲食',  type: 'expense', iconId: 1  },  // mci-food
  { id: 'trans',   name: '交通',  type: 'expense', iconId: 2  },  // mci-bus
  { id: 'shop',    name: '購物',  type: 'expense', iconId: 3  },  // mci-cart
  { id: 'ent',     name: '娛樂',  type: 'expense', iconId: 4  },  // mci-movie
  { id: 'home',    name: '居家',  type: 'expense', iconId: 5  },  // mci-home
  { id: 'health',  name: '醫療',  type: 'expense', iconId: 7  },  // mci-hospital
  { id: 'edu',     name: '教育',  type: 'expense', iconId: 8  },  // mci-school
  { id: 'gift',    name: '禮物',  type: 'expense', iconId: 11 },  // ant-star
  { id: 'salary',  name: '薪資',  type: 'income',  iconId: 10 },  // mci-cash-multiple
  { id: 'invest',  name: '投資',  type: 'income',  iconId: 12 },  // mci-chart-line
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const ACCOUNTS = [
  { id: 'cash',     name: '現金',           balance: 3240,    iconId: 15, typeId: 1, currency: 'TWD' },  // ant-wallet
  { id: 'bank',     name: '玉山活儲',        balance: 128450,  iconId: 13, typeId: 2, currency: 'TWD' },  // mci-bank
  { id: 'credit',   name: '國泰世華 信用卡', balance: -8420,   iconId: 14, typeId: 3, currency: 'TWD' },  // ant-creditcard
  { id: 'invest',   name: '富邦證券',        balance: 462100,  iconId: 12, typeId: 4, currency: 'TWD' },  // mci-chart-line
  { id: 'usd_cash', name: 'USD 旅費',        balance: 320,     iconId: 23, typeId: 1, currency: 'USD' },  // mci-currency-usd
];
const ACC_BY_ID = Object.fromEntries(ACCOUNTS.map(a => [a.id, a]));

// 多幣別範例 transaction（May 2026）。amount 在 impl 是 cents 整數。
// 這份 mock 為方便閱讀用元（÷100 後的值）；只是設計稿、不影響真實計算。
// recurring: scheduleId != null 的衍生實例
// currency / convertedAmount: 跨幣別記錄
const TX = [
  { id: 1,  date: 'May 2',  cat: 'food',   acc: 'credit',   amount: -185,  note: '路易莎咖啡' },
  { id: 2,  date: 'May 2',  cat: 'food',   acc: 'cash',     amount: -120,  note: '便當' },
  { id: 3,  date: 'May 2',  cat: 'trans',  acc: 'credit',   amount: -32,   note: '捷運月票',     recurring: true },
  { id: 4,  date: 'May 1',  cat: 'ent',    acc: 'usd_cash', amount: -15,   currency: 'USD', convertedAmount: -480, note: 'Netflix 訂閱',  recurring: true },
  { id: 5,  date: 'May 1',  cat: 'food',   acc: 'credit',   amount: -780,  note: '居酒屋' },
  { id: 6,  date: 'May 1',  cat: 'shop',   acc: 'usd_cash', amount: -40,   currency: 'USD', convertedAmount: -1290, note: 'Uniqlo T-shirt × 2' },
  { id: 7,  date: 'Apr 30', cat: 'salary', acc: 'bank',     amount: 68000, note: '4 月薪資',     recurring: true },
  { id: 8,  date: 'Apr 30', cat: 'trans',  acc: 'credit',   amount: -28,   note: '公車' },
  { id: 9,  date: 'Apr 29', cat: 'food',   acc: 'cash',     amount: -340,  note: '晚餐 — 牛肉麵' },
  { id: 10, date: 'Apr 29', cat: 'health', acc: 'credit',   amount: -650,  note: '牙科檢查' },
  { id: 11, date: 'Apr 29', cat: 'home',   acc: 'credit',   amount: -1480, note: '電費',         recurring: true },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const baseAmount = (t) => t.convertedAmount ?? t.amount;

function periodTotals(items) {
  let income = 0, expense = 0;
  for (const t of items) {
    const a = baseAmount(t);
    if (a > 0) income += a; else expense += -a;
  }
  return { income, expense, balance: income - expense };
}

function groupByDate(items) {
  const m = new Map();
  for (const t of items) {
    if (!m.has(t.date)) m.set(t.date, []);
    m.get(t.date).push(t);
  }
  return Array.from(m.entries()).map(([title, data]) => ({
    id: 'date_' + title, title, data,
    total: data.reduce((s, t) => s + baseAmount(t), 0),
  }));
}

function groupByCategory(items, chartMode = 'expense') {
  const filtered = items.filter(t => chartMode === 'expense' ? baseAmount(t) < 0 : baseAmount(t) > 0);
  const m = new Map();
  for (const t of filtered) {
    if (!m.has(t.cat)) m.set(t.cat, []);
    m.get(t.cat).push(t);
  }
  return Array.from(m.entries()).map(([cat, data]) => ({
    id: 'cat_' + cat, cat,
    title: CAT_BY_ID[cat].name,
    iconId: CAT_BY_ID[cat].iconId,
    data,
    total: data.reduce((s, t) => s + baseAmount(t), 0),
  })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

function pieData(items) {
  const m = new Map();
  for (const t of items) {
    const a = baseAmount(t);
    if (a >= 0) continue;
    m.set(t.cat, (m.get(t.cat) || 0) + (-a));
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
  const symbol = code === 'TWD' ? 'NT$' : code === 'USD' ? 'US$' : code === 'JPY' ? '¥' : code;
  return sign + symbol + abs.toLocaleString('en-US');
}

Object.assign(window, {
  PALETTE, THEMES, THEME_1, THEME_2, DEFAULT_THEME, DEFAULT_THEME_ID,
  TOKENS, CHART_COLORS, GLASS,
  TYPOGRAPHY, TYPE_SCALE, FONT_WEIGHT,
  SPACING, RADIUS,
  LIST_TOKENS, TX_LIST_TOKENS, TX_TOKENS,
  SEARCH_BAR_TOKENS, SEARCH_TOKENS, BOTTOM_SEARCH_BAR_TOTAL_HEIGHT,
  ICON_LIBRARY, ICON_BY_ID,
  CATEGORIES, CAT_BY_ID, ACCOUNTS, ACC_BY_ID, TX,
  baseAmount, periodTotals, groupByDate, groupByCategory, pieData, fmt,
});
