// ─────────────────────────────────────────────────────────────
// Transaction list — 第二輪 (5 個層次感探索)
// 每變體輸出 ByDate / ByCategory,接收 props: { collapsed: Set<sectionId> }
// 重點:不靠 card 與 divider 拉層次,改用 typography rhythm /
// indent / tinted band / left bar / inverted bg 等手法
// ─────────────────────────────────────────────────────────────


// ═════════════════════════════════════════════════════════════
// R1 · Morph header
//  收合 → 標題大字、靠近左側、總額靠右(類似 Card stack 的 header 大小)
//  展開 → 標題縮成 inline pill,留更多空間給 row
//  單畫面混搭呈現:第一段展開、其餘收合
//  動畫概念:點擊時 fontSize / padding / chip border-radius 過場
// ═════════════════════════════════════════════════════════════
function R1_DateHeader({ sec, c, onClick }) {
  // 共用過場樣式
  const transition = 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center',
      padding: c ? '14px 16px' : '12px 16px 6px',
      cursor: 'pointer',
      transition,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        gap: c ? 10 : 6,
        padding: c ? '0' : '4px 10px',
        background: c ? 'transparent' : TOKENS.surface,
        border: c ? '1px solid transparent' : `1px solid ${TOKENS.hairline2}`,
        borderRadius: c ? 0 : 999,
        transition,
      }}>
        <Glyph name={c ? 'chevron-right' : 'chevron-down'} size={c ? 14 : 11} color={c ? TOKENS.ink2 : TOKENS.ink3} stroke={2.5}/>
        <span style={{
          fontSize: c ? 18 : 12,
          fontWeight: c ? 700 : 600,
          color: c ? TOKENS.ink : TOKENS.ink2,
          letterSpacing: c ? -0.3 : 0.2,
          transition,
        }}>{sec.title}</span>
        {c && <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length} 筆</span>}
      </div>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 14 : 12,
        color: c ? TOKENS.ink2 : TOKENS.ink3,
        fontVariantNumeric: 'tabular-nums',
        transition,
      }}>{fmt(sec.total)}</span>
    </div>
  );
}

function R1_CatHeader({ sec, c, onClick }) {
  const transition = 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center',
      padding: c ? '14px 16px' : '12px 16px 6px',
      cursor: 'pointer',
      gap: 10,
      transition,
    }}>
      <Glyph name={c ? 'chevron-right' : 'chevron-down'} size={c ? 14 : 11} color={c ? TOKENS.ink2 : TOKENS.ink3} stroke={2.5}/>
      <div style={{
        width: c ? 28 : 20, height: c ? 28 : 20,
        borderRadius: c ? 8 : 5,
        background: TOKENS.p100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition,
      }}>
        <Glyph name={sec.iconGlyph} size={c ? 15 : 11} color={TOKENS.p500}/>
      </div>
      <span style={{
        fontSize: c ? 17 : 12,
        fontWeight: c ? 700 : 600,
        color: c ? TOKENS.ink : TOKENS.ink2,
        letterSpacing: c ? -0.2 : 0.2,
        transition,
      }}>{sec.title}</span>
      {c && <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length} 筆</span>}
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 14 : 12,
        color: c ? TOKENS.ink2 : TOKENS.ink3,
        fontVariantNumeric: 'tabular-nums',
        transition,
      }}>{fmt(sec.total)}</span>
    </div>
  );
}

function TxR1_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <R1_DateHeader sec={sec} c={c}/>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
                  <Glyph name={cat.glyph} size={18} color={TOKENS.ink}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TxR1_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <R1_CatHeader sec={sec} c={c}/>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
                {/* 日期方塊跟依日期模式 icon 對齊 */}
                <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.surface, border: `0.5px solid ${TOKENS.hairline2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{tx.date.split(' ')[1]}</span>
                  <span style={{ fontSize: 7, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{tx.date.split(' ')[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R2 · Indent rhythm
//  純靠 typography 階層 + 縮排製造分組感
//  - section header: 大字、靠左、無框
//  - row: 多 16px indent,字稍細稍小,色階退一階
//  - section 之間靠 vertical gap 與字級對比區分,沒有任何線
// ═════════════════════════════════════════════════════════════
function TxR2_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div style={{ paddingTop: 4 }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '6px 16px 4px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink3}/>
              <span style={{ fontSize: 22, fontWeight: 800, color: TOKENS.ink, letterSpacing: -0.4 }}>{sec.title}</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 13, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{sec.data.length} 筆 · {fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 16px 7px 36px' }}>
                  <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
                  <span style={{ flex: 1, fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</span>
                  <span style={{ fontSize: 14, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxR2_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div style={{ paddingTop: 4 }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px 4px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink3}/>
              <Glyph name={sec.iconGlyph} size={18} color={TOKENS.p500}/>
              <span style={{ fontSize: 20, fontWeight: 800, color: TOKENS.ink, letterSpacing: -0.4 }}>{sec.title}</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 13, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{sec.data.length} 筆 · {fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 16px 7px 42px' }}>
                <span style={{ fontSize: 12, color: TOKENS.ink3, width: 50, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{tx.date}</span>
                <span style={{ flex: 1, fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</span>
                <span style={{ fontSize: 14, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R3 · Tinted band
//  section header 是一條淡色背景帶(滿版,p50 / 淺灰漸變),row 在白底
//  視覺上 header 自帶顏色,不靠卡片邊界也清楚分組
// ═════════════════════════════════════════════════════════════
function TxR3_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div style={{ background: TOKENS.surface }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              background: TOKENS.p50,
              borderTop: `0.5px solid ${TOKENS.p100}`,
              borderBottom: `0.5px solid ${TOKENS.p100}`,
            }}>
              <CollapseChev collapsed={c} color={TOKENS.p500}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.p700, letterSpacing: 0.2 }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.p500, opacity: 0.7 }}>· {sec.data.length} 筆</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.p700, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <Glyph name={cat.glyph} size={18} color={TOKENS.ink2}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                    <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>{cat.name}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxR3_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div style={{ background: TOKENS.surface }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px',
              background: TOKENS.p50,
              borderTop: `0.5px solid ${TOKENS.p100}`,
              borderBottom: `0.5px solid ${TOKENS.p100}`,
            }}>
              <CollapseChev collapsed={c} color={TOKENS.p500}/>
              <Glyph name={sec.iconGlyph} size={15} color={TOKENS.p500}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.p700, letterSpacing: 0.2 }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.p500, opacity: 0.7 }}>· {sec.data.length} 筆</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.p700, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{tx.date.split(' ')[1]}</span>
                  <span style={{ fontSize: 7, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{tx.date.split(' ')[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R4 · Left bar accent
//  section 整段左側有一條 3px 主色 bar(從 header 延伸到最後一筆 row)
//  row 沒卡沒線,純粹靠左色條 + spacing 做分組
//  收合時色條只剩 header 高
// ═════════════════════════════════════════════════════════════
function TxR4_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{
              position: 'absolute',
              left: 16, top: 14, bottom: 6,
              width: 3, borderRadius: 2,
              background: TOKENS.p500,
            }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px 6px 28px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <span style={{ fontSize: 17, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.2 }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length} 筆</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 13, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 28px' }}>
                  <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                    <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 1 }}>{cat.name}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxR4_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{
              position: 'absolute',
              left: 16, top: 14, bottom: 6,
              width: 3, borderRadius: 2,
              background: TOKENS.p500,
            }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px 6px 28px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <Glyph name={sec.iconGlyph} size={17} color={TOKENS.p500}/>
              <span style={{ fontSize: 17, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.2 }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length} 筆</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 13, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 28px' }}>
                <span style={{ fontSize: 12, color: TOKENS.ink3, width: 46, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{tx.date}</span>
                <span style={{ flex: 1, fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R5 · Inverted band (背景反轉)
//  整面是淺灰底(沿用 TOKENS.bg #F2F2F7)
//  section header 維持淺灰, row 包在連續白色塊裡 (一段共一個白塊,類似 card stack 但 header 在白塊上方 & 不在白塊裡)
//  section 之間靠淺灰 gap 區分,header 不靠線
//  與 V2 Card stack 不同點:header 在卡上方,不擠在卡內;白塊只裝 row
// ═════════════════════════════════════════════════════════════
function TxR5_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 20px 8px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink3}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length}</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 12, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && (
              <div style={{ background: TOKENS.surface, margin: '0 16px', borderRadius: 14, overflow: 'hidden' }}>
                {sec.data.map((tx, i) => {
                  const cat = CAT_BY_ID[tx.cat];
                  return (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                        <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>{cat.name}</div>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
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
function TxR5_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 20px 8px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink3}/>
              <Glyph name={sec.iconGlyph} size={14} color={TOKENS.p500}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length}</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 12, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && (
              <div style={{ background: TOKENS.surface, margin: '0 16px', borderRadius: 14, overflow: 'hidden' }}>
                {sec.data.map((tx, i) => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{tx.date.split(' ')[1]}</span>
                      <span style={{ fontSize: 7, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{tx.date.split(' ')[0]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
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


Object.assign(window, {
  TxR1_ByDate, TxR1_ByCategory,
  TxR2_ByDate, TxR2_ByCategory,
  TxR3_ByDate, TxR3_ByCategory,
  TxR4_ByDate, TxR4_ByCategory,
  TxR5_ByDate, TxR5_ByCategory,
});
