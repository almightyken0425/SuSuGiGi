// ─────────────────────────────────────────────────────────────
// Transaction list — 第三輪
// 對應使用者第二輪 feedback：
//   1. 單筆 row bg 必須與整個 app bg 區隔 (R2/R4 失分點)
//   2. Morph header 真正做到「收合大字、展開小字、動畫過渡」
//      (R1 的 morph 概念被認為「沒做到」—— 字級差距過小且為靜態 demo)
//   3. 「用顏色分層」概念好，但 R3 tinted band 老氣 —— 改用低彩度 modern tint
//   4. 用 bg color 區隔結構 > vertical bar —— 探索其他 hierarchy 手法
//   5. R5 inverted band 收合 section 字太小幾乎看不到 —— 提高視覺重量
//
// 第三輪 4 個提案皆：
//   - row 在白底，與 app 灰底明顯區隔
//   - 點 header 可 toggle，即時播放 morph 動畫 (preview wrapper 提供 state)
//   - collapsed section 維持足夠高度與字重，明顯可見
// ─────────────────────────────────────────────────────────────

const R3_TRANSITION = 'all 280ms cubic-bezier(0.4, 0, 0.2, 1)';

// 統一的 row 視覺：白底 + 與 app bg 灰底分明
function Round3Row({ left, primary, secondary, right, rightColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{primary}</div>
        {secondary && <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>{secondary}</div>}
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: rightColor || TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{right}</span>
    </div>
  );
}

function CatIconLeft({ glyph }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Glyph name={glyph} size={16} color={TOKENS.ink2}/>
    </div>
  );
}

function DateBadgeLeft({ date }) {
  const [m, d] = date.split(' ');
  return (
    <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{d}</span>
      <span style={{ fontSize: 7, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{m}</span>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R6 · Morph + Inverted band (R5 升級版)
//   結構承襲 R5 的「白卡裝 row、灰底 gap 分段」
//   但 header 真正 morph：
//     收合 → 22px 粗體標題 + 13px 統計 + 15px 總額（明顯可見）
//     展開 → 12px uppercase 小標 + 11px 統計 + 12px 總額（讓位給 row）
//   + 點 header 可 toggle，過場 280ms 看得到動畫
// ═════════════════════════════════════════════════════════════
function R6_Header({ children, c, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer',
      padding: c ? '14px 20px' : '6px 20px 6px',
      transition: R3_TRANSITION,
    }}>{children}</div>
  );
}

function R6_TitleStat({ title, count, total, c }) {
  return (
    <>
      <span style={{
        fontSize: c ? 22 : 12,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : TOKENS.ink2,
        letterSpacing: c ? -0.4 : 0.6,
        textTransform: c ? 'none' : 'uppercase',
        transition: R3_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3, transition: R3_TRANSITION }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 15 : 12,
        fontWeight: c ? 600 : 500,
        color: c ? TOKENS.ink : TOKENS.ink2,
        fontVariantNumeric: 'tabular-nums',
        transition: R3_TRANSITION,
      }}>{total}</span>
    </>
  );
}

function TxR6_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 12 }}>
            <R6_Header c={c} onClick={() => onToggle && onToggle(sec.id)}>
              <CollapseChev collapsed={c} color={c ? TOKENS.ink2 : TOKENS.ink3}/>
              <R6_TitleStat title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)} c={c}/>
            </R6_Header>
            {!c && (
              <div style={{ background: TOKENS.surface, margin: '0 16px', borderRadius: 14, overflow: 'hidden' }}>
                {sec.data.map((tx, i) => {
                  const cat = CAT_BY_ID[tx.cat];
                  return (
                    <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                      <Round3Row left={<CatIconLeft glyph={cat.glyph}/>} primary={tx.note || cat.name} secondary={cat.name} right={fmt(tx.amount)} rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TxR6_ByCategory({ collapsed, onToggle }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 12 }}>
            <R6_Header c={c} onClick={() => onToggle && onToggle(sec.id)}>
              <CollapseChev collapsed={c} color={c ? TOKENS.ink2 : TOKENS.ink3}/>
              <div style={{
                width: c ? 26 : 18, height: c ? 26 : 18,
                borderRadius: c ? 7 : 4,
                background: TOKENS.p100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: R3_TRANSITION,
              }}>
                <Glyph name={sec.iconGlyph} size={c ? 14 : 10} color={TOKENS.p500}/>
              </div>
              <R6_TitleStat title={sec.title} count={sec.data.length} total={fmt(sec.total)} c={c}/>
            </R6_Header>
            {!c && (
              <div style={{ background: TOKENS.surface, margin: '0 16px', borderRadius: 14, overflow: 'hidden' }}>
                {sec.data.map((tx, i) => (
                  <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                    <Round3Row left={<DateBadgeLeft date={tx.date}/>} primary={tx.note} right={fmt(tx.amount)}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R7 · Modern category tint (R3 老氣感修正)
//   - 用「顏色分層」概念：每個 section header 帶極低彩度的 tint bg
//     依日期：每段同一個 p50 主色 tint
//     依分類：每段用該類別代表色低飽 tint (warm peach / cool blue / sage 等)
//   - 沒有 R3 那種 border + 飽和 band 的舊感，現代低調
//   - row 在純白底，section 整段是「tint header + 白 row 區」一個圓角卡
//   - header morph + 點擊可 toggle
// ═════════════════════════════════════════════════════════════

const CAT_TINT = {
  food:   { soft: '#FFF1E8', accent: '#C46A3F' },
  trans:  { soft: '#EBF1FA', accent: '#4F71B0' },
  shop:   { soft: '#F2EBFA', accent: '#6E4FB0' },
  ent:    { soft: '#FBEBF2', accent: '#B0507A' },
  home:   { soft: '#EBF6EE', accent: '#3F8859' },
  health: { soft: '#FBEBEB', accent: '#B05050' },
  edu:    { soft: '#FBF4DA', accent: '#A88934' },
  gift:   { soft: '#EFEBFA', accent: '#5F4FB0' },
  salary: { soft: '#E8F5EE', accent: '#3F8859' },
  invest: { soft: '#E8F5EE', accent: '#3F8859' },
};
const DATE_TINT = { soft: TOKENS.p50, accent: TOKENS.p500 };

function R7_Header({ tint, c, onClick, leadingIcon, title, count, total }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      background: tint.soft,
      padding: c ? '14px 18px' : '8px 18px',
      transition: R3_TRANSITION,
      borderRadius: c ? 14 : '14px 14px 0 0',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <CollapseChev collapsed={c} color={tint.accent}/>
      {leadingIcon}
      <span style={{
        fontSize: c ? 20 : 12,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : tint.accent,
        letterSpacing: c ? -0.3 : 0.6,
        textTransform: c ? 'none' : 'uppercase',
        transition: R3_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3, transition: R3_TRANSITION }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 14 : 12,
        fontWeight: c ? 600 : 500,
        color: c ? TOKENS.ink : tint.accent,
        fontVariantNumeric: 'tabular-nums',
        transition: R3_TRANSITION,
      }}>{total}</span>
    </div>
  );
}

function TxR7_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ margin: '0 16px 10px', borderRadius: 14, overflow: 'hidden' }}>
            <R7_Header tint={DATE_TINT} c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && (
              <div style={{ background: TOKENS.surface }}>
                {sec.data.map((tx, i) => {
                  const cat = CAT_BY_ID[tx.cat];
                  return (
                    <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                      <Round3Row left={<CatIconLeft glyph={cat.glyph}/>} primary={tx.note || cat.name} secondary={cat.name} right={fmt(tx.amount)} rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TxR7_ByCategory({ collapsed, onToggle }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const tint = CAT_TINT[sec.cat] || DATE_TINT;
        const icon = (
          <div style={{
            width: c ? 24 : 18, height: c ? 24 : 18,
            borderRadius: c ? 6 : 4,
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: R3_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={tint.accent}/>
          </div>
        );
        return (
          <div key={sec.id} style={{ margin: '0 16px 10px', borderRadius: 14, overflow: 'hidden' }}>
            <R7_Header tint={tint} c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && (
              <div style={{ background: TOKENS.surface }}>
                {sec.data.map((tx, i) => (
                  <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                    <Round3Row left={<DateBadgeLeft date={tx.date}/>} primary={tx.note} right={fmt(tx.amount)}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R8 · Outlined frame
//   - 取代 R4 的 left bar：用「整段 1px hairline outline」框出 section
//   - row bg = 純白，outline 內也是白底，讓 section 像被「線稿」框住
//   - 比 R5 的 card stack 更輕、更幾何感，像 iOS 的 grouped table 但去除背景填色
//   - header morph + 點擊 toggle
// ═════════════════════════════════════════════════════════════
function R8_Header({ c, onClick, leadingIcon, title, count, total }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      padding: c ? '14px 18px' : '10px 18px',
      transition: R3_TRANSITION,
      display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: c ? 'none' : `0.5px solid ${TOKENS.hairline}`,
    }}>
      <CollapseChev collapsed={c} color={TOKENS.ink2}/>
      {leadingIcon}
      <span style={{
        fontSize: c ? 20 : 12,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : TOKENS.ink2,
        letterSpacing: c ? -0.3 : 0.6,
        textTransform: c ? 'none' : 'uppercase',
        transition: R3_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3, transition: R3_TRANSITION }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 14 : 12,
        fontWeight: c ? 600 : 500,
        color: c ? TOKENS.ink : TOKENS.ink2,
        fontVariantNumeric: 'tabular-nums',
        transition: R3_TRANSITION,
      }}>{total}</span>
    </div>
  );
}

function TxR8_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{
            margin: '0 16px 10px',
            background: TOKENS.surface,
            borderRadius: 14,
            border: `1px solid ${TOKENS.divider}`,
            overflow: 'hidden',
            transition: R3_TRANSITION,
          }}>
            <R8_Header c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <Round3Row left={<CatIconLeft glyph={cat.glyph}/>} primary={tx.note || cat.name} secondary={cat.name} right={fmt(tx.amount)} rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TxR8_ByCategory({ collapsed, onToggle }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const icon = (
          <div style={{
            width: c ? 24 : 18, height: c ? 24 : 18,
            borderRadius: c ? 6 : 4,
            background: TOKENS.p100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: R3_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.p500}/>
          </div>
        );
        return (
          <div key={sec.id} style={{
            margin: '0 16px 10px',
            background: TOKENS.surface,
            borderRadius: 14,
            border: `1px solid ${TOKENS.divider}`,
            overflow: 'hidden',
            transition: R3_TRANSITION,
          }}>
            <R8_Header c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <Round3Row left={<DateBadgeLeft date={tx.date}/>} primary={tx.note} right={fmt(tx.amount)}/>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R9 · Layered tone (三層明度做深度)
//   - 不靠顏色、不靠線、不靠卡片邊界
//   - 純粹用 3 層明度製造深度：
//       app bg = 較深 #E8E8ED （比 R5 的 #F2F2F7 更深）
//       section bg = 中 #F2F2F7（淺到比 app 亮）
//       row bg = 純白
//   - section 是個淺灰 wrapper，row 是白底浮在 section 上
//   - 結構區隔靠「明度差」，header morph
// ═════════════════════════════════════════════════════════════
const R9_APP_BG = '#E5E5EA';   // 比 TOKENS.bg 更深的 iOS systemGray6
const R9_SECTION_BG = '#F2F2F7'; // = TOKENS.bg（中明度）
const R9_ROW_BG = '#FFFFFF';

function R9_Header({ c, onClick, leadingIcon, title, count, total }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      padding: c ? '14px 16px' : '10px 16px 8px',
      transition: R3_TRANSITION,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <CollapseChev collapsed={c} color={TOKENS.ink2}/>
      {leadingIcon}
      <span style={{
        fontSize: c ? 20 : 12,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : TOKENS.ink2,
        letterSpacing: c ? -0.3 : 0.6,
        textTransform: c ? 'none' : 'uppercase',
        transition: R3_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3, transition: R3_TRANSITION }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 14 : 12,
        fontWeight: c ? 600 : 500,
        color: c ? TOKENS.ink : TOKENS.ink2,
        fontVariantNumeric: 'tabular-nums',
        transition: R3_TRANSITION,
      }}>{total}</span>
    </div>
  );
}

function TxR9_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div style={{ background: R9_APP_BG, padding: '4px 0 8px' }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{
            margin: '0 12px 8px',
            background: R9_SECTION_BG,
            borderRadius: 16,
            overflow: 'hidden',
            transition: R3_TRANSITION,
          }}>
            <R9_Header c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && (
              <div style={{ background: R9_ROW_BG, margin: '0 6px 6px', borderRadius: 12, overflow: 'hidden' }}>
                {sec.data.map((tx, i) => {
                  const cat = CAT_BY_ID[tx.cat];
                  return (
                    <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                      <Round3Row left={<CatIconLeft glyph={cat.glyph}/>} primary={tx.note || cat.name} secondary={cat.name} right={fmt(tx.amount)} rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TxR9_ByCategory({ collapsed, onToggle }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div style={{ background: R9_APP_BG, padding: '4px 0 8px' }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const icon = (
          <div style={{
            width: c ? 24 : 18, height: c ? 24 : 18,
            borderRadius: c ? 6 : 4,
            background: TOKENS.p100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: R3_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.p500}/>
          </div>
        );
        return (
          <div key={sec.id} style={{
            margin: '0 12px 8px',
            background: R9_SECTION_BG,
            borderRadius: 16,
            overflow: 'hidden',
            transition: R3_TRANSITION,
          }}>
            <R9_Header c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && (
              <div style={{ background: R9_ROW_BG, margin: '0 6px 6px', borderRadius: 12, overflow: 'hidden' }}>
                {sec.data.map((tx, i) => (
                  <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                    <Round3Row left={<DateBadgeLeft date={tx.date}/>} primary={tx.note} right={fmt(tx.amount)}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R10 · Outlined frame · refined (R8 升級版)
//   保留 R8 「白底 + 線框」核心，消除 5 個小瑕疵：
//     1. section gap 14（R8 是 10）：純白多 section 不再黏在一起
//     2. 統一 horizontal padding 16（R8 header 18 / row 16）：金額垂直對齊
//     3. 拿掉 header / row 之間的 hairline：靠字級層級區隔即可
//     4. icon 改 outline 風格（1px 邊框 + 白底）：與 section 同語言
//     5. 金額升級：row 16/700、header total 16/700：核心資訊被拉出
// ═════════════════════════════════════════════════════════════
const R10_PAD_X = 16;
const R10_GAP = 14;

function R10_Row({ left, primary, secondary, right, rightColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `12px ${R10_PAD_X}px` }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{primary}</div>
        {secondary && <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>{secondary}</div>}
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: rightColor || TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{right}</span>
    </div>
  );
}

function R10_CatIconLeft({ glyph }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: TOKENS.surface,
      border: `1px solid ${TOKENS.divider}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Glyph name={glyph} size={16} color={TOKENS.ink2}/>
    </div>
  );
}

function R10_DateBadgeLeft({ date }) {
  const [m, d] = date.split(' ');
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: TOKENS.surface,
      border: `1px solid ${TOKENS.divider}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{d}</span>
      <span style={{ fontSize: 7, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{m}</span>
    </div>
  );
}

function R10_Header({ c, onClick, leadingIcon, title, count, total }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      padding: c ? `14px ${R10_PAD_X}px` : `10px ${R10_PAD_X}px`,
      transition: R3_TRANSITION,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <CollapseChev collapsed={c} color={TOKENS.ink2}/>
      {leadingIcon}
      <span style={{
        fontSize: c ? 20 : 12,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : TOKENS.ink2,
        letterSpacing: c ? -0.3 : 0.6,
        textTransform: c ? 'none' : 'uppercase',
        transition: R3_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3, transition: R3_TRANSITION }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 16 : 13,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : TOKENS.ink2,
        fontVariantNumeric: 'tabular-nums',
        transition: R3_TRANSITION,
      }}>{total}</span>
    </div>
  );
}

function TxR10_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{
            margin: `0 16px ${R10_GAP}px`,
            background: TOKENS.surface,
            borderRadius: 14,
            border: `1px solid ${TOKENS.divider}`,
            overflow: 'hidden',
            transition: R3_TRANSITION,
          }}>
            <R10_Header c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <R10_Row left={<R10_CatIconLeft glyph={cat.glyph}/>} primary={tx.note || cat.name} secondary={cat.name} right={fmt(tx.amount)} rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TxR10_ByCategory({ collapsed, onToggle, chartMode = 'expense' }) {
  const sections = groupByCategory(TX, chartMode);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const icon = (
          <div style={{
            width: c ? 24 : 18, height: c ? 24 : 18,
            borderRadius: c ? 6 : 4,
            background: TOKENS.surface,
            border: `1px solid ${TOKENS.divider}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: R3_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.ink2}/>
          </div>
        );
        return (
          <div key={sec.id} style={{
            margin: `0 16px ${R10_GAP}px`,
            background: TOKENS.surface,
            borderRadius: 14,
            border: `1px solid ${TOKENS.divider}`,
            overflow: 'hidden',
            transition: R3_TRANSITION,
          }}>
            <R10_Header c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <R10_Row left={<R10_DateBadgeLeft date={tx.date}/>} primary={tx.note} right={fmt(tx.amount)}/>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// InteractiveTxPreview
//   與 round 1/2 用的 TxListPreviewFrame 等價，但 collapsed 狀態
//   為內部 useState，header onToggle 會真的更新並播放 morph 動畫。
//   App bg 可由 variant 自行覆寫（R9 用更深的 #E5E5EA）。
// ═════════════════════════════════════════════════════════════
function InteractiveTxPreview({ Variant, initialCollapsed = [], appBg }) {
  const [chartMode, setChartMode] = React.useState('expense');
  const [collapsed, setCollapsed] = React.useState(() => new Set(initialCollapsed));
  const totals = periodTotals(TX);
  const pData = pieData(TX);
  const toggle = (id) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: appBg || TOKENS.bg,
      fontFamily: '-apple-system, "SF Pro", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <NavHeader title="記帳" trailing={
          <div style={{ display: 'flex' }}>
            <button style={{ width:36, height:36, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}><Glyph name="filter" size={20} color={TOKENS.p500} stroke={2}/></button>
            <button style={{ width:36, height:36, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}><Glyph name="search" size={20} color={TOKENS.p500} stroke={2}/></button>
            <button style={{ width:36, height:36, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}><Glyph name="gear" size={20} color={TOKENS.p500} stroke={2}/></button>
          </div>
        }/>
        <div style={{ paddingBottom: 140 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, paddingTop:8, paddingBottom:4 }}>
            <Glyph name="chevron-left" size={14} color={TOKENS.ink3} stroke={2.5}/>
            <Glyph name="calendar" size={13} color={TOKENS.ink2} stroke={2}/>
            <span style={{ fontSize:18, fontWeight:600, color:TOKENS.ink, marginLeft:2 }}>May 26</span>
            <Glyph name="chevron-right" size={14} color={TOKENS.ink3} stroke={2.5}/>
          </div>
          <div style={{ display:'flex', justifyContent:'center', margin:'4px 0 8px' }}>
            <DonutChart data={pData.map(d => ({ key: d.id, value: d.value, color: d.color }))} size={140} thickness={20}>
              <div style={{ textAlign:'center', width:80 }}>
                <div style={{ fontSize:11, color:TOKENS.ink2 }}>結餘</div>
                <div style={{ fontSize:15, fontWeight:700, color:TOKENS.ink, fontVariantNumeric:'tabular-nums' }}>{fmt(totals.balance)}</div>
              </div>
            </DonutChart>
          </div>
          <div style={{ display:'flex', gap:12, padding:'0 16px 12px' }}>
            <FocusCard kind="expense" amount={totals.expense} active={chartMode==='expense'} onPress={()=>setChartMode('expense')}/>
            <FocusCard kind="income"  amount={totals.income}  active={chartMode==='income'}  onPress={()=>setChartMode('income')}/>
          </div>
          <Variant chartMode={chartMode} collapsed={collapsed} onToggle={toggle}/>
        </div>
      </div>
      <FloatingActionBar/>
    </div>
  );
}

Object.assign(window, {
  TxR6_ByDate, TxR6_ByCategory,
  TxR7_ByDate, TxR7_ByCategory,
  TxR8_ByDate, TxR8_ByCategory,
  TxR9_ByDate, TxR9_ByCategory,
  TxR10_ByDate, TxR10_ByCategory,
  InteractiveTxPreview,
});
