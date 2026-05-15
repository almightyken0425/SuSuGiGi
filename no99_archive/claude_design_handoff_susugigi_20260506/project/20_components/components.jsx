// ─────────────────────────────────────────────────────────────
// Components — 對齊 src/components/*  與 src/components/list/*
// 元件名稱、props、視覺值都對齊 impl。
// Glyph 名稱使用 impl 的 MCI / FontAwesome / SF Symbols 真名，
// 內部映射到自製 SVG（命名以 impl 真名為準）。
// ─────────────────────────────────────────────────────────────

// ─── Glyph ─── 自製 SVG icon
// 名稱規則：使用 impl 中 <MaterialCommunityIcons name="..."> 或
// <FontAwesome name="..."> 或 SF Symbols 的真實 name。
// 不存在的就用視覺近似的 fallback。
const GLYPH_ALIASES = {
  // MCI → canonical
  'magnify': 'search',
  'calendar-blank-outline': 'calendar',
  'calendar-clock': 'calendar',
  'tag-outline': 'tag',
  'bank-outline': 'bank',
  'cog-outline': 'gear',
  'star-outline': 'star',
  'bug-outline': 'bug',
  'shield-account-outline': 'shield',
  'database-cog-outline': 'database',
  'database-refresh-outline': 'refresh',
  'archive-arrow-up-outline': 'upload',
  'archive-arrow-down-outline': 'download',
  'file-import-outline': 'download',
  'file-export-outline': 'upload',
  'swap-horizontal': 'exchange',
  'backspace-outline': 'backspace',
  'help-circle-outline': 'help',
  'bank-transfer': 'exchange',
  'arrow-right': 'arrow-right',
  'arrow-left': 'arrow-left',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  // FontAwesome
  'times': 'x',
  'check': 'check',
  'plus': 'plus',
  'minus': 'minus',
  // SF Symbols
  'xmark': 'x',
  'checkmark': 'check',
  'chevron.right': 'chevron-right',
  'line.3.horizontal.decrease': 'filter',
  'magnifyingglass': 'search',
  'gearshape': 'gear',
  'arrow.triangle.merge': 'merge',
  // MCI category / account icons → custom SVG
  'food': 'food',
  'bus': 'bus',
  'cart': 'cart',
  'movie': 'movie',
  'home': 'house',
  'water': 'water',
  'hospital-box': 'hospital',
  'school': 'school',
  'dots-horizontal': 'dots-horizontal',
  'cash-multiple': 'cash',
  'chart-line': 'chart',
  'bank': 'bank',
  'creditcard': 'card',
  'wallet': 'wallet',
  'currency-usd': 'currency-usd',
  'currency-eur': 'currency-eur',
  'currency-gbp': 'currency-gbp',
  'lightbulb-on-outline': 'bulb',
  'earth': 'globe',
  'coffee': 'coffee',
  'pay-circle1': 'pay',
  'shoppingcart': 'cart',
  'star': 'star',
  'amazon': 'shopping',
  'book': 'book',
  'camera': 'camera',
  'clear': 'x',
  'customerservice': 'headphones',
  'dribbble': 'circle',
  'experiment': 'flask',
  'fire': 'fire',
  'laptop': 'laptop',
  'notification': 'bell',
  'read': 'book',
  'rocket1': 'rocket',
  'ruby': 'diamond',
  'scissor': 'scissor',
  'sliders': 'sliders',
  'team': 'team',
  'tool': 'wrench',
  'truck': 'truck',
  'unlock': 'unlock',
  'warning': 'warning',
  // alert + reverse
  'alert-circle': 'warning',
  'exchange': 'exchange',
  'repeat': 'repeat',
  'sync': 'sync',
  'refresh': 'refresh',
  'clock': 'clock',
  'filter': 'filter',
  'search': 'search',
  'gear': 'gear',
  'check-circle': 'check-circle',
};

function Glyph({ name, size = 16, color = TOKENS.ink, stroke = 2 }) {
  const canonical = GLYPH_ALIASES[name] || name;
  const s = size, c = color, sw = stroke;
  switch (canonical) {
    // ─── 通用 UI ───
    case 'chevron-left':   return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'chevron-right':  return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'chevron-up':     return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 10L8 5L13 10" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'chevron-down':   return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 6L8 11L13 6" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'arrow-right':    return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'arrow-left':     return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4L3 8l4 4" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'x':              return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'check':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke={c} strokeWidth={sw + 0.5} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'check-circle':   return (<svg width={s} height={s} viewBox="0 0 16 16" fill={c}><circle cx="8" cy="8" r="7" fill={c}/><path d="M4.5 8L7 10.5L11.5 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'plus':           return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="7" y="2.5" width="2" height="11" rx="1" fill={c}/><rect x="2.5" y="7" width="11" height="2" rx="1" fill={c}/></svg>);
    case 'minus':          return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2.5" y="7" width="11" height="2" rx="1" fill={c}/></svg>);
    case 'exchange':       return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 5h10l-2.5-2.5M13 11H3l2.5 2.5" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'merge':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 14V8c0-2 1-3 3-3M12 14V8c0-2-1-3-3-3M5 7L7 5L9 7M7 5V14" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'filter':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4.5 8h7M7 12h3" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'search':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={c} strokeWidth={sw}/><path d="M10.5 10.5L13.5 13.5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'gear':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.2" stroke={c} strokeWidth={sw}/><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'repeat':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M11 1.5L13.5 4L11 6.5M2.5 8V6a2 2 0 012-2H13M5 14.5L2.5 12L5 9.5M13.5 8v2a2 2 0 01-2 2H3" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'sync':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 018.5-3.5M13 8a5 5 0 01-8.5 3.5M11.5 2v3h-3M4.5 14v-3h3" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'refresh':        return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M13.5 8a5.5 5.5 0 11-1.4-3.7M13.5 2v3h-3" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'clock':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth={sw}/><path d="M8 4.5V8l2.5 1.5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'calendar':       return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke={c} strokeWidth={sw}/><path d="M2 6h12M5 2v3M11 2v3" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'tag':            return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5H13.5V7L7 13.5L1.5 8L8 1.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><circle cx="10.5" cy="5" r="1" fill={c}/></svg>);
    case 'shield':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5L13.5 4V8C13.5 11 11 13.5 8 14.5C5 13.5 2.5 11 2.5 8V4L8 1.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'database':       return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="3.5" rx="5.5" ry="1.8" stroke={c} strokeWidth={sw}/><path d="M2.5 3.5V12c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8V3.5M2.5 7.7c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8" stroke={c} strokeWidth={sw}/></svg>);
    case 'star':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.9 5.6L14.5 6.2L11.2 9.4L12 14L8 11.7L4 14L4.8 9.4L1.5 6.2L6.1 5.6L8 1.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'star-fill':      return (<svg width={s} height={s} viewBox="0 0 16 16"><path d="M8 1.5L9.9 5.6L14.5 6.2L11.2 9.4L12 14L8 11.7L4 14L4.8 9.4L1.5 6.2L6.1 5.6L8 1.5Z" fill={c}/></svg>);
    case 'bug':            return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="9" rx="3.5" ry="4.5" stroke={c} strokeWidth={sw}/><path d="M8 4.5V2.5M5 5L3.5 3.5M11 5L12.5 3.5M3 9H5M11 9H13M3.5 13L5 12M12.5 13L11 12" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'backspace':      return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M8 4h12a2 2 0 012 2v12a2 2 0 01-2 2H8L2 12L8 4z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 9l6 6M17 9l-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>);
    case 'upload':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 10V2m0 0L5 5m3-3l3 3M2.5 13.5h11" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'download':       return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0L5 7m3 3l3-3M2.5 12.5h11" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'cloud':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 12.5a3 3 0 010-6 4.5 4.5 0 018.6 1.3A2.7 2.7 0 0112 12.5H4Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'trash':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 5h10M5.5 5V3.5h5V5M6 7v5M10 7v5M4 5l.5 9h7L12 5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'help':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth={sw}/><path d="M6 6.5a2 2 0 014 0c0 1.5-2 1.5-2 3M8 12v0.5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'dots-horizontal': return (<svg width={s} height={s} viewBox="0 0 16 16"><circle cx="3.5" cy="8" r="1.3" fill={c}/><circle cx="8" cy="8" r="1.3" fill={c}/><circle cx="12.5" cy="8" r="1.3" fill={c}/></svg>);
    case 'drag':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="4" r="1" fill={c}/><circle cx="10" cy="4" r="1" fill={c}/><circle cx="6" cy="8" r="1" fill={c}/><circle cx="10" cy="8" r="1" fill={c}/><circle cx="6" cy="12" r="1" fill={c}/><circle cx="10" cy="12" r="1" fill={c}/></svg>);
    case 'globe':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth={sw}/><path d="M2 8h12M8 2c2 1.8 3 4 3 6s-1 4.2-3 6c-2-1.8-3-4-3-6s1-4.2 3-6Z" stroke={c} strokeWidth={sw}/></svg>);

    // ─── Categories / Accounts ─── 簡化 SVG 對應 IconDefinition.json
    case 'food':           return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="4" y="2" width="1.6" height="12" rx="0.8" fill={c}/><rect x="10.4" y="2" width="1.6" height="12" rx="0.8" fill={c}/><rect x="3" y="2" width="10" height="1.6" rx="0.8" fill={c}/></svg>);
    case 'bus':            return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3" width="11" height="9" rx="1.5" stroke={c} strokeWidth={sw}/><path d="M2.5 8.5h11M5.5 5.5h5" stroke={c} strokeWidth={sw}/><circle cx="5" cy="13" r="1" fill={c}/><circle cx="11" cy="13" r="1" fill={c}/></svg>);
    case 'cart':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 3h2l1.5 7h7.5l1.5-5h-9" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="13" r="1.2" fill={c}/><circle cx="12" cy="13" r="1.2" fill={c}/></svg>);
    case 'movie':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="9" rx="1" stroke={c} strokeWidth={sw}/><path d="M2 6h12M2 10h12M5 3.5v9M11 3.5v9" stroke={c} strokeWidth={sw}/></svg>);
    case 'house':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 8L8 2.5L14 8V13.5C14 14 13.5 14.5 13 14.5H3C2.5 14.5 2 14 2 13.5V8Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><path d="M6.5 14.5V10H9.5V14.5" stroke={c} strokeWidth={sw}/></svg>);
    case 'water':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2C5 6 3 9 3 11a5 5 0 0010 0c0-2-2-5-5-9Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'hospital':       return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3" width="11" height="11" rx="1.5" stroke={c} strokeWidth={sw}/><path d="M8 6v5M5.5 8.5h5" stroke={c} strokeWidth={sw + 0.5} strokeLinecap="round"/></svg>);
    case 'school':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 5L8 8L14.5 5L8 2Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><path d="M4 6.5V10c0 1 2 2 4 2s4-1 4-2V6.5" stroke={c} strokeWidth={sw}/></svg>);
    case 'cash':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="8" rx="1" stroke={c} strokeWidth={sw}/><circle cx="8" cy="8" r="2" stroke={c} strokeWidth={sw}/></svg>);
    case 'bank':           return (<svg width={s} height={s} viewBox="0 0 16 16"><path d="M8 2L14 5H2L8 2Z" fill={c}/><rect x="3" y="6" width="1.6" height="6" fill={c}/><rect x="7.2" y="6" width="1.6" height="6" fill={c}/><rect x="11.4" y="6" width="1.6" height="6" fill={c}/><rect x="2" y="12.5" width="12" height="1.6" rx="0.5" fill={c}/></svg>);
    case 'card':           return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" fill="none" stroke={c} strokeWidth={sw}/><rect x="1.5" y="6" width="13" height="1.6" fill={c}/></svg>);
    case 'chart':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 13h12M3 11l3-4 3 2 5-5" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'wallet':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke={c} strokeWidth={sw}/><circle cx="11" cy="8.5" r="1" fill={c}/></svg>);
    case 'currency-usd':   return (<svg width={s} height={s} viewBox="0 0 16 16"><text x="8" y="13" textAnchor="middle" fontFamily="-apple-system, system-ui" fontWeight="700" fontSize="14" fill={c}>$</text></svg>);
    case 'currency-eur':   return (<svg width={s} height={s} viewBox="0 0 16 16"><text x="8" y="13" textAnchor="middle" fontFamily="-apple-system, system-ui" fontWeight="700" fontSize="14" fill={c}>€</text></svg>);
    case 'currency-gbp':   return (<svg width={s} height={s} viewBox="0 0 16 16"><text x="8" y="13" textAnchor="middle" fontFamily="-apple-system, system-ui" fontWeight="700" fontSize="14" fill={c}>£</text></svg>);
    case 'bulb':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 11a3 3 0 016 0v1H5v-1zM6 14h4M6.5 13.2h3" stroke={c} strokeWidth={sw} strokeLinecap="round"/><circle cx="8" cy="6" r="3.5" stroke={c} strokeWidth={sw}/></svg>);
    case 'coffee':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 6h9v5a3 3 0 01-3 3H6a3 3 0 01-3-3V6zM12 7h2a1.5 1.5 0 010 3h-2M5 2.5l-0.5 2M8 2.5l-0.5 2M11 2.5l-0.5 2" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'pay':            return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth={sw}/><text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="700" fill={c}>$</text></svg>);
    case 'shopping':       return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 6h10l-1 8H4L3 6zM6 6V4a2 2 0 014 0v2" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'book':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2.5 3a1 1 0 011-1H13v12H3.5a1 1 0 01-1-1V3z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><path d="M2.5 12.5a1 1 0 011-1H13" stroke={c} strokeWidth={sw}/></svg>);
    case 'camera':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.5" stroke={c} strokeWidth={sw}/><circle cx="8" cy="9.5" r="2.5" stroke={c} strokeWidth={sw}/><path d="M6 5l1-2h2l1 2" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'headphones':     return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 11V8a6 6 0 0112 0v3M2 11h2v3H2.5a0.5 0.5 0 01-0.5-0.5V11zM12 11h2v2.5a0.5 0.5 0 01-0.5 0.5H12v-3z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'circle':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke={c} strokeWidth={sw}/><circle cx="8" cy="8" r="2" fill={c}/></svg>);
    case 'flask':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 2v4L3 12.5a1 1 0 00.9 1.5h8.2a1 1 0 00.9-1.5L10 6V2M5.5 2h5" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'fire':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5C6 4.5 4 6 4 9a4 4 0 008 0c0-2-1.5-3-2.5-5C9 5 8 4 8 1.5z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'laptop':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="7" rx="1" stroke={c} strokeWidth={sw}/><path d="M1.5 12h13l-1 1.5H2.5L1.5 12z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'bell':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 11h8l-1-2V7a3 3 0 00-6 0v2l-1 2zM6.5 13h3" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'rocket':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5 4 4.5 6.5 4.5 9l1.5 1.5h4L11.5 9c0-2.5-.5-5-3.5-7.5ZM4.5 11l-2 2.5 3-.5M11.5 11l2 2.5-3-.5" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="6.5" r="1.3" stroke={c} strokeWidth={sw}/></svg>);
    case 'diamond':        return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 6l3-3.5h6L14 6l-6 8L2 6zM2 6h12M5 2.5L8 6l3-3.5" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'scissor':        return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="4" cy="11" r="2" stroke={c} strokeWidth={sw}/><circle cx="12" cy="11" r="2" stroke={c} strokeWidth={sw}/><path d="M5.5 9.5L13.5 1.5M10.5 9.5L2.5 1.5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'sliders':        return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke={c} strokeWidth={sw} strokeLinecap="round"/><circle cx="5" cy="4" r="1.5" fill={TOKENS.surface} stroke={c} strokeWidth={sw}/><circle cx="10" cy="8" r="1.5" fill={TOKENS.surface} stroke={c} strokeWidth={sw}/><circle cx="6" cy="12" r="1.5" fill={TOKENS.surface} stroke={c} strokeWidth={sw}/></svg>);
    case 'team':           return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5" cy="6" r="2" stroke={c} strokeWidth={sw}/><circle cx="11" cy="6" r="2" stroke={c} strokeWidth={sw}/><path d="M2 13.5c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5M8 13.5c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5" stroke={c} strokeWidth={sw}/></svg>);
    case 'wrench':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M11.5 3a3 3 0 11-2.5 4.5L3 13.5l-1-1 6-6A3 3 0 0111.5 3z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'truck':          return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="8" height="6" rx="0.5" stroke={c} strokeWidth={sw}/><path d="M9 7h3.5L15 9.5V11H9V7z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><circle cx="4" cy="12.5" r="1.2" stroke={c} strokeWidth={sw}/><circle cx="12" cy="12.5" r="1.2" stroke={c} strokeWidth={sw}/></svg>);
    case 'unlock':         return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3" y="7.5" width="10" height="6.5" rx="1" stroke={c} strokeWidth={sw}/><path d="M5.5 7.5V5a2.5 2.5 0 015 0" stroke={c} strokeWidth={sw}/></svg>);
    case 'warning':        return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2L14.5 13.5H1.5L8 2zM8 6.5v3M8 11.5v0.3" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);

    case 'google':         return (<svg width={s} height={s} viewBox="0 0 18 18"><path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.7v2.2h2.8c1.7-1.5 2.7-3.8 2.7-6.5z" fill="#4285F4"/><path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.8-2.2c-.8.5-1.8.9-3.2.9-2.5 0-4.5-1.7-5.3-3.9H.8v2.3C2.3 15.9 5.4 18 9 18z" fill="#34A853"/><path d="M3.7 10.6c-.2-.6-.3-1.2-.3-1.6s.1-1.4.3-1.6V5H.8C0 6.4 0 7.7 0 9s0 2.6.8 4l2.9-2.4z" fill="#FBBC05"/><path d="M9 3.6c1.3 0 2.5.5 3.4 1.4l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.3 2.1.8 5l2.9 2.3C4.5 5.3 6.5 3.6 9 3.6z" fill="#EA4335"/></svg>);

    default: return null;
  }
}

// ─── DynamicIconById ─── 對齊 impl src/components/DynamicIcon.tsx
// 用 IconDefinition.json 的 numeric id 找到 uniqueName，再交給 Glyph 畫
function DynamicIconById({ iconId, size = 24, color = TOKENS.ink }) {
  const def = ICON_BY_ID[iconId];
  if (!def) return <Glyph name="alert-circle" size={size} color={color}/>;
  // 把 uniqueName 拆成 library 前綴後的真實 glyph name
  // mci-food → food（會 fall through 到 Glyph alias）
  // ant-creditcard → creditcard
  const glyphName = def.glyph;
  return <Glyph name={glyphName} size={size} color={color}/>;
}

// ─── IconOutline ─── PeriodPage 的 section icon 容器
// impl 是 32×32 純對齊容器（無 border），但保留 prop 允許覆蓋
function IconOutline({ iconId, glyph, size = TX_LIST_TOKENS.ICON_OUTLINE_SIZE, color = TOKENS.p500, withBorder = false }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: withBorder ? TX_LIST_TOKENS.ICON_OUTLINE_RADIUS : 0,
      border: withBorder ? `${TX_LIST_TOKENS.ICON_OUTLINE_BORDER_WIDTH}px solid ${TOKENS.divider}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {iconId ? <DynamicIconById iconId={iconId} size={Math.round(size * 0.56)} color={color}/>
              : <Glyph name={glyph || 'help'} size={Math.round(size * 0.56)} color={color}/>}
    </div>
  );
}

// ─── GlassView ─── 對齊 src/components/GlassView.tsx
// iOS BlurView 模擬：CSS backdrop-filter
function GlassView({ children, style = {}, blurAmount, tint, border = true, pill = false }) {
  const amount = blurAmount ?? GLASS.blurAmount;
  const t = tint ?? GLASS.tint;
  return (
    <div style={{
      position: 'relative',
      background: t,
      backdropFilter: `blur(${amount}px) saturate(180%)`,
      WebkitBackdropFilter: `blur(${amount}px) saturate(180%)`,
      border: border ? `1px solid ${GLASS.border}` : 'none',
      boxShadow: `0 4px 12px rgba(0,0,0,${GLASS.shadowOpacity})`,
      borderRadius: pill ? RADIUS.full : undefined,
      ...style,
    }}>{children}</div>
  );
}

// ─── ListGroupCard ─── 對齊 src/components/list/ListGroupCard.tsx
// overflow: hidden 會把第一個 ListItem 的 borderTop hairline 切掉
function ListGroupCard({ children, style = {} }) {
  return (
    <div style={{
      background: TOKENS.surface,
      borderRadius: LIST_TOKENS.GROUP_CARD_RADIUS,
      borderWidth: LIST_TOKENS.GROUP_CARD_BORDER_WIDTH,
      borderStyle: 'solid',
      borderColor: LIST_TOKENS.GROUP_CARD_BORDER_COLOR,
      overflow: 'hidden',
      marginBottom: LIST_TOKENS.GROUP_CARD_MARGIN_BOTTOM,
      ...style,
    }}>{children}</div>
  );
}
// 老命名 alias
const GroupCard = ListGroupCard;

// ─── ListSection ─── 對齊 src/components/list/ListSection.tsx
// title 可選，無 title 時只是個容器（impl 大多沒 title）
function ListSection({ title, children, style = {} }) {
  return (
    <div style={style}>
      {title && <ListSectionTitle>{title}</ListSectionTitle>}
      {children}
    </div>
  );
}

function ListSectionTitle({ children }) {
  return (
    <div style={{
      fontSize: LIST_TOKENS.SECTION_TITLE_SIZE,
      color: TOKENS.ink2,
      fontWeight: LIST_TOKENS.SECTION_TITLE_WEIGHT,
      letterSpacing: LIST_TOKENS.SECTION_TITLE_LETTER_SPACING,
      paddingLeft: LIST_TOKENS.SECTION_TITLE_PADDING_HORIZONTAL,
      paddingRight: LIST_TOKENS.SECTION_TITLE_PADDING_HORIZONTAL,
      paddingTop: LIST_TOKENS.SECTION_TITLE_PADDING_TOP,
      paddingBottom: LIST_TOKENS.SECTION_TITLE_PADDING_BOTTOM,
      textTransform: 'uppercase',
    }}>{children}</div>
  );
}

// ─── ListItem ─── 對齊 src/components/list/ListItem.tsx
// 每個 row 都有 borderTop hairline，第一個被 GroupCard 的 overflow: hidden 切掉
// 不需要 isLast prop
function ListItem({ leftIcon, title, titleColor, subtitle, value, showChevron, trailing, onPress, disabled, style = {} }) {
  const [pressed, setPressed] = React.useState(false);
  const resolvedTitleColor = disabled ? TOKENS.ink3 : (titleColor || TOKENS.ink);
  const trailingContent = trailing ?? ((value !== undefined || showChevron) ? (
    <>
      {value !== undefined && (
        <span style={{ fontSize: LIST_TOKENS.TRAILING_VALUE_SIZE, color: TOKENS.ink2 }}>{value}</span>
      )}
      {showChevron && (
        <div style={{ marginLeft: value !== undefined ? 6 : 0 }}>
          <Glyph name="chevron.right" size={LIST_TOKENS.TRAILING_CHEVRON_SIZE} color={TOKENS.ink3} stroke={2.5}/>
        </div>
      )}
    </>
  ) : null);
  return (
    <div
      onClick={disabled ? undefined : onPress}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center',
        minHeight: LIST_TOKENS.ITEM_MIN_HEIGHT,
        paddingTop: LIST_TOKENS.ITEM_PADDING_VERTICAL,
        paddingBottom: LIST_TOKENS.ITEM_PADDING_VERTICAL,
        paddingLeft: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
        paddingRight: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
        background: pressed && !disabled ? TOKENS.surface2 : TOKENS.surface,
        borderTop: `0.5px solid ${LIST_TOKENS.DIVIDER_COLOR_LIGHT}`,
        cursor: onPress && !disabled ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}>
      {leftIcon && (
        <div style={{ marginRight: LIST_TOKENS.ITEM_GAP_HORIZONTAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {leftIcon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: LIST_TOKENS.ITEM_TITLE_SIZE,
          fontWeight: LIST_TOKENS.ITEM_TITLE_WEIGHT,
          color: resolvedTitleColor,
          letterSpacing: -0.43,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 13, color: TOKENS.ink2, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>
        )}
      </div>
      {trailingContent && (
        <div style={{ marginLeft: LIST_TOKENS.ITEM_GAP_HORIZONTAL, display: 'flex', alignItems: 'center' }}>
          {trailingContent}
        </div>
      )}
    </div>
  );
}

// ─── SelectionListItem ─── 對齊 src/components/list/SelectionListItem.tsx
// 右側 FontAwesome "check" 16px primary，selected 才出現
function SelectionListItem({ leftIcon, title, subtitle, selected, onPress, disabled, style = {} }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={disabled ? undefined : onPress}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center',
        minHeight: LIST_TOKENS.ITEM_MIN_HEIGHT,
        paddingTop: LIST_TOKENS.ITEM_PADDING_VERTICAL,
        paddingBottom: LIST_TOKENS.ITEM_PADDING_VERTICAL,
        paddingLeft: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
        paddingRight: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
        background: pressed && !disabled ? TOKENS.surface2 : TOKENS.surface,
        borderTop: `0.5px solid ${LIST_TOKENS.DIVIDER_COLOR_LIGHT}`,
        cursor: onPress && !disabled ? 'pointer' : 'default',
        userSelect: 'none', opacity: disabled ? 0.5 : 1, ...style,
      }}>
      {leftIcon && (
        <div style={{ marginRight: LIST_TOKENS.ITEM_GAP_HORIZONTAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{leftIcon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: LIST_TOKENS.ITEM_TITLE_SIZE,
          fontWeight: LIST_TOKENS.ITEM_TITLE_WEIGHT,
          color: disabled ? TOKENS.ink3 : TOKENS.ink, letterSpacing: -0.43,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: TOKENS.ink2, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ marginLeft: LIST_TOKENS.ITEM_GAP_HORIZONTAL, width: LIST_TOKENS.SELECTION_CHECKMARK_SIZE, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        {selected && <Glyph name="check" size={LIST_TOKENS.SELECTION_CHECKMARK_SIZE} color={TOKENS.p500} stroke={2.4}/>}
      </div>
    </div>
  );
}

// ─── ReorderableListItem ─── 對齊 src/components/list/ReorderableListItem.tsx
// NO drag handle icon — 整列拖拉，靠手勢觸發
// height 由 caller style 控制
function ReorderableListItem({ leftIcon, title, subtitle, trailing, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      paddingLeft: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
      paddingRight: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
      background: TOKENS.surface,
      borderTop: `0.5px solid ${LIST_TOKENS.DIVIDER_COLOR_LIGHT}`,
      userSelect: 'none', ...style,
    }}>
      {leftIcon && (
        <div style={{ marginRight: LIST_TOKENS.ITEM_GAP_HORIZONTAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{leftIcon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: LIST_TOKENS.ITEM_TITLE_SIZE,
          fontWeight: LIST_TOKENS.ITEM_TITLE_WEIGHT,
          color: TOKENS.ink, letterSpacing: -0.43,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: TOKENS.ink2, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {trailing && <div style={{ marginLeft: LIST_TOKENS.ITEM_GAP_HORIZONTAL }}>{trailing}</div>}
    </div>
  );
}

// ─── SelectionGridItem ─── 對齊 src/components/list/SelectionGridItem.tsx
// Card 風格：preview aspectRatio 1.4 + title 下方 + check-circle 在右上角
function SelectionGridItem({ title, selected, onPress, children, style = {} }) {
  return (
    <div onClick={onPress} style={{
      flex: 1, background: TOKENS.surface,
      borderRadius: LIST_TOKENS.GROUP_CARD_RADIUS,
      padding: LIST_TOKENS.ITEM_PADDING_HORIZONTAL,
      position: 'relative', overflow: 'hidden',
      cursor: 'pointer', boxSizing: 'border-box',
      ...style,
    }}>
      <div style={{
        width: '100%', aspectRatio: 1.4,
        borderRadius: RADIUS.sm, overflow: 'hidden',
        marginBottom: LIST_TOKENS.ITEM_PADDING_VERTICAL,
        display: 'flex', flexDirection: 'row',
      }}>{children}</div>
      <div style={{
        fontSize: LIST_TOKENS.ITEM_TITLE_SIZE,
        fontWeight: LIST_TOKENS.ITEM_TITLE_WEIGHT,
        color: TOKENS.ink, letterSpacing: -0.43,
      }}>{title}</div>
      {selected && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <Glyph name="check-circle" size={LIST_TOKENS.SELECTION_CHECKMARK_SIZE + 4} color={TOKENS.p500}/>
        </div>
      )}
    </div>
  );
}

// ─── ListEmptyState ─── 對齊 src/components/list/ListEmptyState.tsx
// 預設 icon: MCI "magnify"
function ListEmptyState({ iconName = 'magnify', title, description }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingLeft: LIST_TOKENS.EMPTY_STATE_PADDING_HORIZONTAL,
      paddingRight: LIST_TOKENS.EMPTY_STATE_PADDING_HORIZONTAL,
    }}>
      <div style={{ marginBottom: LIST_TOKENS.EMPTY_STATE_ICON_GAP }}>
        <Glyph name={iconName} size={LIST_TOKENS.EMPTY_STATE_ICON_SIZE} color={TOKENS.ink3} stroke={1.5}/>
      </div>
      <div style={{
        fontSize: LIST_TOKENS.EMPTY_STATE_TITLE_SIZE,
        color: TOKENS.ink2, textAlign: 'center',
        lineHeight: 1.4,
      }}>{title}</div>
      {description && <div style={{
        fontSize: LIST_TOKENS.EMPTY_STATE_DESCRIPTION_SIZE,
        color: TOKENS.ink3, textAlign: 'center',
        marginTop: LIST_TOKENS.EMPTY_STATE_TEXT_GAP, lineHeight: 1.4,
      }}>{description}</div>}
    </div>
  );
}
const EmptyState = ListEmptyState;

// ─── NavHeader ─── push 模式 navigation header
// impl 是透明 background，title 17px medium，back 用 SF "chevron.left" minimal display
function NavHeader({ title, leadingText, leadingAction, trailing }) {
  return (
    <div style={{
      paddingTop: 60, paddingBottom: 8, paddingLeft: 8, paddingRight: 8,
      display: 'flex', alignItems: 'center',
      background: 'transparent',
      position: 'relative', zIndex: 5,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 32 }}>
        {leadingText !== undefined && (
          <button onClick={leadingAction} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: TOKENS.p500, fontSize: 17, fontWeight: 400,
            padding: '8px 4px', display: 'flex', alignItems: 'center', gap: 2,
            fontFamily: 'inherit',
          }}>
            <Glyph name="chevron-left" size={16} color={TOKENS.p500} stroke={2.4}/>
            {leadingText && <span>{leadingText}</span>}
          </button>
        )}
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: 60, transform: 'translateX(-50%)',
        fontSize: 17, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.ink, whiteSpace: 'nowrap',
      }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, minHeight: 32 }}>
        {trailing}
      </div>
    </div>
  );
}

// ─── ModalHeader ─── fullScreenModal 用，左 ModalCloseButton、右 HeaderCheckmarkButton
function ModalHeader({ title, onClose, onSave, saveDisabled }) {
  return (
    <div style={{
      paddingTop: 60, paddingBottom: 8, paddingLeft: 8, paddingRight: 8,
      display: 'flex', alignItems: 'center',
      background: 'transparent', position: 'relative', zIndex: 5,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 32 }}>
        <ModalCloseButton onPress={onClose}/>
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: 60, transform: 'translateX(-50%)',
        fontSize: 17, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.ink, whiteSpace: 'nowrap',
      }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 32 }}>
        {onSave && <HeaderCheckmarkButton onPress={onSave} disabled={saveDisabled}/>}
      </div>
    </div>
  );
}

// ─── ModalCloseButton ─── 對齊 src/components/ModalCloseButton.tsx
// SFSymbol "xmark" 17px semibold，padding 10×10
function ModalCloseButton({ onPress }) {
  return (
    <button onClick={onPress} style={{
      border: 'none', background: 'transparent', cursor: 'pointer',
      padding: '10px 10px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Glyph name="xmark" size={17} color={TOKENS.ink} stroke={2.4}/>
    </button>
  );
}

// ─── HeaderCheckmarkButton ─── 對齊 src/components/HeaderCheckmarkButton.tsx
// SFSymbol "checkmark" 17px semibold，padding 10×10，color primary.main（disabled 用 text.disabled）
function HeaderCheckmarkButton({ onPress, disabled }) {
  return (
    <button onClick={onPress} disabled={disabled} style={{
      border: 'none', background: 'transparent',
      cursor: disabled ? 'default' : 'pointer',
      padding: '10px 10px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
    }}>
      <Glyph name="checkmark" size={17} color={disabled ? TOKENS.ink3 : TOKENS.p500} stroke={2.4}/>
    </button>
  );
}

// ─── HeaderIconButton ─── 對齊 src/components/HeaderIconButton.tsx
// 接 SF symbol name，padding 10×10，color 預設 label（ink），可覆蓋
function HeaderIconButton({ symbol, onPress, color }) {
  return (
    <button onClick={onPress} style={{
      border: 'none', background: 'transparent', cursor: 'pointer',
      padding: '10px 10px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Glyph name={symbol} size={17} color={color || TOKENS.ink} stroke={2.4}/>
    </button>
  );
}

// ─── DonutChart ─── 對齊 src/components/DonutChart.tsx
// SIZE 260, OUTER 100 INNER 76 thickness 24, CORNER 6, PAD_ANGLE 1deg
function DonutChart({ data, size = 260, outerRadius = 100, innerRadius = 76, cornerRadius = 6, padAngleDeg = 1, children }) {
  const cx = size / 2, cy = size / 2;
  const padAngleRad = (padAngleDeg * Math.PI) / 180;
  const total = data.reduce((s, d) => s + d.value, 0);

  // SVG arc path with rounded corners
  const polar = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];

  function arcPath(startAngle, endAngle) {
    if (endAngle <= startAngle) return '';
    const ro = outerRadius, ri = innerRadius;
    const cr = Math.min(cornerRadius, (ro - ri) / 2);
    const a0 = startAngle, a1 = endAngle;
    // outer arc points
    const [x0, y0] = polar(ro, a0);
    const [x1, y1] = polar(ro, a1);
    // inner arc points
    const [x2, y2] = polar(ri, a1);
    const [x3, y3] = polar(ri, a0);
    const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
    // simplified path without corner radius for fidelity-vs-complexity tradeoff
    // 但加 padAngle gap 視覺對齊
    return `M ${x0} ${y0} A ${ro} ${ro} 0 ${largeArc} 1 ${x1} ${y1} L ${x2} ${y2} A ${ri} ${ri} 0 ${largeArc} 0 ${x3} ${y3} Z`;
  }

  if (total <= 0 || data.length === 0) {
    return (
      <div style={{ width: size, height: size, borderRadius: size / 2, background: TOKENS.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    );
  }

  let acc = 0;
  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const start = acc + padAngleRad / 2;
    const end = acc + sweep - padAngleRad / 2;
    acc += sweep;
    return { start, end, color: d.color, key: d.key };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
        {slices.map((s, i) => {
          if (s.end - s.start <= 0) return null;
          return <path key={s.key + '_' + i} d={arcPath(s.start, s.end)} fill={s.color} stroke={s.color} strokeWidth={cornerRadius * 0.6} strokeLinejoin="round"/>;
        })}
      </svg>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── FocusCard ─── 對齊 src/screens/Home/components/FocusCard.tsx
// padding 12 12, radius lg=12, border 1.5px (transparent inactive)
// inactive: bg surface_hover, swatchBg surface, color text.secondary
// active:   bg surface, swatchBg primary[100], color text.primary
function FocusCard({ kind, amount, active, onPress, formatAmount }) {
  const iconName = kind === 'expense' ? 'minus' : 'plus';
  return (
    <button onClick={onPress} disabled={active} style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: SPACING[2],
      paddingTop: SPACING[3], paddingBottom: SPACING[3],
      paddingLeft: SPACING[3], paddingRight: SPACING[3],
      borderRadius: RADIUS.lg,
      borderWidth: 1.5, borderStyle: 'solid',
      borderColor: active ? TOKENS.p500 : 'transparent',
      background: active ? TOKENS.surface : TOKENS.surface2,
      cursor: active ? 'default' : 'pointer', fontFamily: 'inherit',
      boxShadow: `0 1px 2px rgba(0,0,0,${active ? 0.08 : 0.04})`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: RADIUS.md,
        background: active ? TOKENS.p100 : TOKENS.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Glyph name={iconName} size={14} color={active ? TOKENS.p500 : TOKENS.ink2}/>
      </div>
      <span style={{
        flex: 1, textAlign: 'right',
        fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium,
        color: active ? TOKENS.ink : TOKENS.ink2,
        fontVariantNumeric: 'tabular-nums',
      }}>{formatAmount ? formatAmount(amount) : fmt(amount)}</span>
    </button>
  );
}

// ─── FloatingActionBar ─── 對齊 src/components/FloatingActionBar.tsx
// 208×72 glass pill, bottom SPACING[6]=24
// actions: 3 buttons 56×56 with paddingHorizontal SPACING[2]=8
// undo: timer circle 32×32 rgba(0,0,0,0.06) + 14px medium primary text;
//       undo text base 16 medium centered;
//       X icon FontAwesome "times" 24px primary.main
function FloatingActionBar({ mode = 'actions', visible = true, onExpensePress, onIncomePress, onTransferPress, undoMessage, remainingTime = 5, onUndoClose }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: SPACING[6], left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      zIndex: 10, pointerEvents: 'none',
      opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : 150}px)`,
      transition: 'opacity 200ms, transform 240ms cubic-bezier(0.2, 1.2, 0.4, 1)',
    }}>
      <GlassView pill style={{
        width: 208, height: 72,
        pointerEvents: 'auto',
      }}>
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: SPACING[2], paddingRight: SPACING[2],
        }}>
          {mode === 'actions' ? (
            <>
              <button onClick={onExpensePress} style={fabBtn}><Glyph name="minus" size={24} color={TOKENS.p500}/></button>
              <button onClick={onTransferPress} style={fabBtn}><Glyph name="exchange" size={24} color={TOKENS.p500} stroke={2.4}/></button>
              <button onClick={onIncomePress} style={fabBtn}><Glyph name="plus" size={24} color={TOKENS.p500}/></button>
            </>
          ) : (
            <>
              <div style={fabBtn}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: 'rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.ink }}>{remainingTime}</span>
                </div>
              </div>
              <span style={{
                flex: 1, marginLeft: 8, marginRight: 8,
                fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium,
                color: TOKENS.ink, textAlign: 'center',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{undoMessage || '已刪除'}</span>
              <button onClick={onUndoClose} style={fabBtn}><Glyph name="x" size={24} color={TOKENS.p500} stroke={2.4}/></button>
            </>
          )}
        </div>
      </GlassView>
    </div>
  );
}
const fabBtn = {
  width: 56, height: 56, border: 'none',
  background: 'transparent', cursor: 'pointer',
  borderRadius: RADIUS.full,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─── BottomSearchBar ─── 對齊 src/components/BottomSearchBar.tsx
// GlassView pill, MCI "magnify" 20px secondary, no X button (native clearButtonMode)
function BottomSearchBar({ value, onChangeText, placeholder = '搜尋...', autoFocus }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingLeft: SEARCH_BAR_TOKENS.PADDING_HORIZONTAL,
      paddingRight: SEARCH_BAR_TOKENS.PADDING_HORIZONTAL,
      paddingTop: SEARCH_BAR_TOKENS.PADDING_VERTICAL,
      paddingBottom: SEARCH_BAR_TOKENS.PADDING_VERTICAL,
      zIndex: 10, pointerEvents: 'box-none',
    }}>
      <GlassView pill style={{ height: SEARCH_BAR_TOKENS.PILL_HEIGHT }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          height: '100%',
          paddingLeft: SEARCH_BAR_TOKENS.PILL_PADDING_HORIZONTAL,
          paddingRight: SEARCH_BAR_TOKENS.PILL_PADDING_HORIZONTAL,
          gap: SEARCH_BAR_TOKENS.ICON_GAP,
        }}>
          <Glyph name="magnify" size={SEARCH_BAR_TOKENS.ICON_SIZE} color={TOKENS.ink2} stroke={2}/>
          <input value={value || ''} onChange={(e) => onChangeText && onChangeText(e.target.value)}
            placeholder={placeholder} autoFocus={autoFocus}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: SEARCH_BAR_TOKENS.INPUT_FONT_SIZE,
              color: TOKENS.ink, fontFamily: 'inherit',
              paddingTop: 0, paddingBottom: 0,
            }}/>
        </div>
      </GlassView>
    </div>
  );
}

// ─── CalculatorKeypad ─── 對齊 src/components/CalculatorKeypad.tsx
// 4×4 grid: 1 2 3 + / 4 5 6 - / 7 8 9 * / . 0 = /
// 字元用 ASCII 不用 Unicode（impl 用 +, -, *, /）
// container: padding SPACING[2], bg surface, borderTop 1px border.base
// row marginBottom SPACING[2], key flex 1 height 60 marginHorizontal SPACING[1]
// operator keys: GlassView with primary[100]*0.5 tint
function CalculatorKeypad({ onPress }) {
  const KEYS = [
    ['1', '2', '3', '+'],
    ['4', '5', '6', '-'],
    ['7', '8', '9', '*'],
    ['.', '0', '=', '/'],
  ];
  const OPERATORS = new Set(['+', '-', '*', '/', '=']);
  return (
    <div style={{
      padding: SPACING[2],
      background: TOKENS.surface,
      borderTop: `1px solid ${TOKENS.border}`,
    }}>
      {KEYS.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: ri === KEYS.length - 1 ? 0 : SPACING[2],
        }}>
          {row.map(k => {
            const isOp = OPERATORS.has(k);
            return (
              <button key={k} onClick={() => onPress && onPress(k)} style={{
                flex: 1, height: 60,
                marginLeft: SPACING[1], marginRight: SPACING[1],
                border: 'none',
                position: 'relative', overflow: 'hidden',
                borderRadius: RADIUS.md,
                cursor: 'pointer', fontFamily: 'inherit',
                background: 'transparent', padding: 0,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: RADIUS.md,
                  background: isOp ? `${TOKENS.p100}80` : GLASS.tint,
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                  border: `1px solid ${GLASS.border}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                }}/>
                <span style={{
                  position: 'relative', zIndex: 1,
                  fontSize: TYPOGRAPHY.size.xl,
                  fontWeight: TYPOGRAPHY.weight.medium,
                  color: isOp ? TOKENS.p500 : TOKENS.ink,
                }}>{k}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Switch ─── 對齊 RN Switch（iOS 樣式）
// impl 用 trackColor false=bg.surface_hover true=primary.main 或 status.success
function Switch({ value, onChange, trackColorOn = TOKENS.success }) {
  return (
    <button onClick={() => onChange && onChange(!value)} style={{
      width: 52, height: 32, borderRadius: 16, border: 'none',
      background: value ? trackColorOn : TOKENS.surface2,
      position: 'relative', cursor: 'pointer', padding: 0,
      transition: 'background 200ms',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? 22 : 2,
        width: 28, height: 28, borderRadius: 14, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 200ms',
      }}/>
    </button>
  );
}

// 通用 iconBtn 樣式（被 screens.jsx 引用過）
const iconBtn = {
  width: 36, height: 36, border: 'none', background: 'transparent',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

Object.assign(window, {
  Glyph, DynamicIconById, IconOutline,
  ListGroupCard, GroupCard, ListSection, ListSectionTitle,
  ListItem, SelectionListItem, ReorderableListItem, SelectionGridItem,
  ListEmptyState, EmptyState,
  NavHeader, ModalHeader, ModalCloseButton, HeaderCheckmarkButton, HeaderIconButton,
  GlassView, DonutChart, FocusCard, FloatingActionBar, fabBtn,
  BottomSearchBar, Switch, CalculatorKeypad,
  iconBtn,
});
