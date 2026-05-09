// ─────────────────────────────────────────────────────────────
// Atoms — Glyph icons, badges, etc
// ─────────────────────────────────────────────────────────────

function Glyph({ name, size = 16, color = '#fff', stroke = 2 }) {
  const s = size, c = color, sw = stroke;
  switch (name) {
    case 'fork':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="4" y="2" width="1.6" height="12" rx="0.8" fill={c}/><rect x="10.4" y="2" width="1.6" height="12" rx="0.8" fill={c}/><rect x="3" y="2" width="10" height="1.6" rx="0.8" fill={c}/></svg>);
    case 'car':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2" y="6" width="12" height="5" rx="1.5" fill={c}/><circle cx="5" cy="12" r="1.5" fill={c}/><circle cx="11" cy="12" r="1.5" fill={c}/></svg>);
    case 'bag':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="3" y="6" width="10" height="9" rx="1.5" fill={c}/><path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round"/></svg>);
    case 'play':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill={c}/><path d="M6.5 5.5L11 8L6.5 10.5z" fill="#fff"/></svg>);
    case 'house':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><path d="M2 8L8 2.5L14 8V13.5C14 14 13.5 14.5 13 14.5H3C2.5 14.5 2 14 2 13.5V8Z" fill={c}/></svg>);
    case 'plus-fat':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="6.8" y="2" width="2.4" height="12" rx="1" fill={c}/><rect x="2" y="6.8" width="12" height="2.4" rx="1" fill={c}/></svg>);
    case 'book':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" rx="1" fill={c}/><rect x="7.4" y="3" width="1.2" height="10" fill="#fff" opacity="0.5"/></svg>);
    case 'gift':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2.5" y="6" width="11" height="8" rx="1" fill={c}/><rect x="7.2" y="6" width="1.6" height="8" fill="#fff" opacity="0.5"/><rect x="2.5" y="4" width="11" height="2.5" rx="0.6" fill={c}/></svg>);
    case 'wallet':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="9" rx="1.5" fill={c}/><circle cx="11" cy="8.5" r="1.2" fill="#fff"/></svg>);
    case 'arrow-up':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><path d="M8 3L13 9H10V13H6V9H3L8 3Z" fill={c}/></svg>);
    case 'cash':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2" y="4.5" width="12" height="7" rx="1" fill="none" stroke={c} strokeWidth={sw}/><circle cx="8" cy="8" r="1.6" fill={c}/></svg>);
    case 'bank':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><path d="M8 2L14 5H2L8 2Z" fill={c}/><rect x="3" y="6" width="1.6" height="6" fill={c}/><rect x="7.2" y="6" width="1.6" height="6" fill={c}/><rect x="11.4" y="6" width="1.6" height="6" fill={c}/><rect x="2" y="12.5" width="12" height="1.6" rx="0.5" fill={c}/></svg>);
    case 'card':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" fill="none" stroke={c} strokeWidth={sw}/><rect x="1.5" y="6" width="13" height="1.6" fill={c}/></svg>);
    case 'chart':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2" y="9" width="2.4" height="5" rx="0.6" fill={c}/><rect x="6.8" y="6" width="2.4" height="8" rx="0.6" fill={c}/><rect x="11.6" y="3" width="2.4" height="11" rx="0.6" fill={c}/></svg>);
    case 'tag':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5H13.5V7L7 13.5L1.5 8L8 1.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><circle cx="10.5" cy="5" r="1" fill={c}/></svg>);
    case 'database':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="3.5" rx="5.5" ry="1.8" stroke={c} strokeWidth={sw}/><path d="M2.5 3.5V12c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8V3.5M2.5 7.7c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8" stroke={c} strokeWidth={sw}/></svg>);
    case 'gear':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.2" stroke={c} strokeWidth={sw}/><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'star':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.9 5.6L14.5 6.2L11.2 9.4L12 14L8 11.7L4 14L4.8 9.4L1.5 6.2L6.1 5.6L8 1.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'bug':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="9" rx="3.5" ry="4.5" stroke={c} strokeWidth={sw}/><path d="M8 4.5V2.5M5 5L3.5 3.5M11 5L12.5 3.5M3 9H5M11 9H13M3.5 13L5 12M12.5 13L11 12" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'shield':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5L13.5 4V8C13.5 11 11 13.5 8 14.5C5 13.5 2.5 11 2.5 8V4L8 1.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/></svg>);
    case 'minus':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="2.5" y="7" width="11" height="2" rx="1" fill={c}/></svg>);
    case 'plus':
      return (<svg width={s} height={s} viewBox="0 0 16 16"><rect x="7" y="2.5" width="2" height="11" rx="1" fill={c}/><rect x="2.5" y="7" width="11" height="2" rx="1" fill={c}/></svg>);
    case 'exchange':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 5h10l-2.5-2.5M13 11H3l2.5 2.5" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'calendar':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke={c} strokeWidth={sw}/><path d="M2 6h12M5 2v3M11 2v3" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'chevron-left':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'chevron-right':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'chevron-down':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 6L8 11L13 6" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'search':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={c} strokeWidth={sw}/><path d="M10.5 10.5L13.5 13.5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'x':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'merge':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 14V8c0-2 1-3 3-3M12 14V8c0-2-1-3-3-3M5 7L7 5L9 7M7 5V14" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case 'reorder':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 5h10M3 8h10M3 11h10" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    case 'filter':
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4.5 8h7M7 12h3" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>);
    default: return null;
  }
}

// Inset card (iOS grouped)
function GroupCard({ children, style = {} }) {
  return (
    <div style={{
      background: TOKENS.surface,
      borderRadius: 14,             // LIST_TOKENS.GROUP_CARD_RADIUS
      border: `1px solid ${TOKENS.divider}`,
      marginBottom: 35,             // LIST_TOKENS.GROUP_CARD_MARGIN_BOTTOM
      overflow: 'hidden',
      ...style,
    }}>{children}</div>
  );
}

// Generic list item — matches LIST_TOKENS spec
function ListItem({ leftIcon, title, subtitle, value, titleColor, showChevron, onPress, isLast }) {
  const [active, setActive] = React.useState(false);
  return (
    <div
      onClick={onPress}
      onPointerDown={() => setActive(true)}
      onPointerUp={() => setActive(false)}
      onPointerLeave={() => setActive(false)}
      style={{
        display: 'flex', alignItems: 'center',
        minHeight: 58,                                    // ITEM_MIN_HEIGHT
        padding: '17px 16px',                             // ITEM_PADDING
        gap: 12,                                          // ITEM_GAP_HORIZONTAL
        cursor: onPress ? 'pointer' : 'default',
        position: 'relative',
        background: active ? 'rgba(0,0,0,0.04)' : 'transparent',
        userSelect: 'none',
      }}>
      {leftIcon && (
        <div style={{
          width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{leftIcon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 17, fontWeight: 300, color: titleColor || TOKENS.ink,
          letterSpacing: '-0.43px',
        }}>{title}</div>
        {subtitle && <div style={{
          fontSize: 13, color: TOKENS.ink2, marginTop: 2,
        }}>{subtitle}</div>}
      </div>
      {value && <span style={{
        fontSize: 17, color: TOKENS.ink2,
        fontFeatureSettings: '"tnum" 1',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>}
      {showChevron && <Glyph name="chevron-right" size={13} color={TOKENS.ink3} stroke={2.5}/>}
      {!isLast && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          left: leftIcon ? (16 + 20 + 12) : 16,            // DIVIDER_INSET
          height: 0.5, background: TOKENS.hairline,
        }}/>
      )}
    </div>
  );
}

Object.assign(window, { Glyph, GroupCard, ListItem });
