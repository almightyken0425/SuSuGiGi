// ─────────────────────────────────────────────────────────────
// Transaction list — 視覺探索變體 (含展開/收合)
// 每變體輸出兩個 component: *_ByDate / *_ByCategory
// 兩者都接收 props: { chartMode, collapsed }
//   collapsed: Set<sectionId> — 該 section 不渲染 row,只渲染 header
// ─────────────────────────────────────────────────────────────

function parseDate(d) {
  const [m, n] = d.split(' ');
  return { month: m, day: n };
}
const isCol = (collapsed, id) => collapsed && collapsed.has(id);

// chevron rotates: collapsed -> right; expanded -> down
function CollapseChev({ collapsed, color = TOKENS.ink3 }) {
  return <Glyph name={collapsed ? 'chevron-right' : 'chevron-down'} size={12} color={color} stroke={2.5}/>;
}


// ═════════════════════════════════════════════════════════════
// V1 · Timeline rail  (大字日期欄 + 垂直細線)
// ═════════════════════════════════════════════════════════════
// 收合態:整段壓成單行高,大字 day 和 month 改為水平 inline,線縮短
function TxV1_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const { month, day } = parseDate(sec.title);
        if (c) {
          return (
            <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${TOKENS.hairline2}`, background: TOKENS.bg }}>
              <div style={{ width: 44, display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{day}</span>
                <span style={{ fontSize: 10, color: TOKENS.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{month}</span>
              </div>
              <div style={{ width: 1, height: 14, background: TOKENS.hairline2, margin: '0 8px 0 4px' }}/>
              <span style={{ flex: 1, fontSize: 12, color: TOKENS.ink3 }}>{sec.data.length} 筆</span>
              <span style={{ fontSize: 14, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
              <CollapseChev collapsed={true}/>
            </div>
          );
        }
        return (
          <div key={sec.id} style={{ display: 'flex', padding: '14px 16px', borderBottom: `1px solid ${TOKENS.hairline2}`, background: TOKENS.bg }}>
            <div style={{ width: 44, flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{day}</div>
              <div style={{ fontSize: 11, color: TOKENS.ink3, marginTop: 4, letterSpacing: 0.6, textTransform: 'uppercase' }}>{month}</div>
              <div style={{ fontSize: 12, color: TOKENS.ink2, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</div>
            </div>
            <div style={{ width: 1, background: TOKENS.hairline2, margin: '0 14px 0 4px' }}/>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.data.map(tx => {
                const cat = CAT_BY_ID[tx.cat];
                return (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Glyph name={cat.glyph} size={18} color={tx.amount < 0 ? TOKENS.p500 : TOKENS.success}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                      <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 1 }}>{cat.name}</div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function TxV1_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        if (c) {
          return (
            <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${TOKENS.hairline2}`, background: TOKENS.bg }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Glyph name={sec.iconGlyph} size={15} color={TOKENS.p500}/>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink }}>{sec.title}</span>
              <span style={{ flex: 1, fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length} 筆</span>
              <span style={{ fontSize: 14, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
              <CollapseChev collapsed={true}/>
            </div>
          );
        }
        return (
          <div key={sec.id} style={{ display: 'flex', padding: '14px 16px', borderBottom: `1px solid ${TOKENS.hairline2}`, background: TOKENS.bg }}>
            <div style={{ width: 56, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: TOKENS.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Glyph name={sec.iconGlyph} size={18} color={TOKENS.p500}/>
              </div>
              <div style={{ fontSize: 12, color: TOKENS.ink2, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</div>
              <div style={{ fontSize: 11, color: TOKENS.ink3, marginTop: 2 }}>{sec.data.length} 筆</div>
            </div>
            <div style={{ width: 1, background: TOKENS.hairline2, margin: '0 14px 0 4px' }}/>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.data.map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                    <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 1 }}>{tx.date}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// V2 · Card stack
// ═════════════════════════════════════════════════════════════
function TxV2_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ background: TOKENS.surface, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: c ? '14px 16px' : '12px 16px 8px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <span style={{ fontSize: 17, fontWeight: 700, color: TOKENS.ink }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3 }}>· {sec.data.length} 筆</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 14, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && (
              <>
                <div style={{ height: 0.5, background: TOKENS.hairline, marginLeft: 16 }}/>
                {sec.data.map(tx => {
                  const cat = CAT_BY_ID[tx.cat];
                  return (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
function TxV2_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ background: TOKENS.surface, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: c ? '14px 16px' : '12px 16px 8px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Glyph name={sec.iconGlyph} size={15} color={TOKENS.p500}/>
              </div>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: TOKENS.ink }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3 }}>{sec.data.length} 筆</span>
              <span style={{ fontSize: 14, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && (
              <>
                <div style={{ height: 0.5, background: TOKENS.hairline, marginLeft: 16 }}/>
                {sec.data.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                    {/* 日期擺到 icon 位置,跟依日期模式對齊 */}
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: TOKENS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums', textAlign: 'center', lineHeight: 1.1 }}>{tx.date.split(' ')[1]}<br/><span style={{ fontSize: 9, color: TOKENS.ink3, fontWeight: 500 }}>{tx.date.split(' ')[0]}</span></span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// V3 · Pill header
// ═════════════════════════════════════════════════════════════
function TxV3_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ paddingBottom: 6 }}>
            <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                background: TOKENS.surface,
                border: `1px solid ${TOKENS.hairline2}`,
                borderRadius: 999,
                fontSize: 12, fontWeight: 600, color: TOKENS.ink2,
              }}>
                <CollapseChev collapsed={c} color={TOKENS.ink3}/>
                <span>{sec.title}</span>
              </div>
              <span style={{ fontSize: 12, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}{c ? ` · ${sec.data.length} 筆` : ''}</span>
            </div>
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
function TxV3_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ paddingBottom: 6 }}>
            <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px 4px 6px',
                background: TOKENS.surface,
                border: `1px solid ${TOKENS.hairline2}`,
                borderRadius: 999,
                fontSize: 12, fontWeight: 600, color: TOKENS.ink2,
              }}>
                <CollapseChev collapsed={c} color={TOKENS.ink3}/>
                <Glyph name={sec.iconGlyph} size={12} color={TOKENS.p500}/>
                <span>{sec.title}</span>
              </div>
              <span style={{ fontSize: 12, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)} · {sec.data.length}</span>
            </div>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                </div>
                <span style={{ fontSize: 12, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums', marginRight: 4 }}>{tx.date}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums', minWidth: 76, textAlign: 'right' }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// V4 · Header + bar
// ═════════════════════════════════════════════════════════════
function TxV4_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  const maxAbs = Math.max(...sections.map(s => Math.abs(s.total)), 1);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const pct = Math.abs(sec.total) / maxAbs;
        return (
          <div key={sec.id} style={{ padding: c ? '12px 16px' : '12px 16px 6px', borderBottom: `1px solid ${TOKENS.hairline2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <span style={{ flex: 1, fontSize: 18, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.2 }}>{sec.title}</span>
              {c && <span style={{ fontSize: 12, color: TOKENS.ink3 }}>{sec.data.length} 筆</span>}
              <span style={{ fontSize: 13, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            <div style={{ height: 3, background: TOKENS.hairline2, borderRadius: 2, overflow: 'hidden', marginBottom: c ? 0 : 8, marginLeft: 20 }}>
              <div style={{ width: `${pct*100}%`, height: '100%', background: TOKENS.p500 }}/>
            </div>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 6px 20px' }}>
                  <Glyph name={cat.glyph} size={14} color={TOKENS.ink3}/>
                  <span style={{ fontSize: 14, color: TOKENS.ink2, flexShrink: 0 }}>{cat.name}</span>
                  <span style={{ flex: 1, fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxV4_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  const maxAbs = Math.max(...sections.map(s => Math.abs(s.total)), 1);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        const pct = Math.abs(sec.total) / maxAbs;
        return (
          <div key={sec.id} style={{ padding: c ? '12px 16px' : '12px 16px 6px', borderBottom: `1px solid ${TOKENS.hairline2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <Glyph name={sec.iconGlyph} size={18} color={TOKENS.p500}/>
              <span style={{ flex: 1, fontSize: 18, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.2 }}>{sec.title}</span>
              {c && <span style={{ fontSize: 12, color: TOKENS.ink3 }}>{sec.data.length} 筆</span>}
              <span style={{ fontSize: 13, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            <div style={{ height: 3, background: TOKENS.hairline2, borderRadius: 2, overflow: 'hidden', marginBottom: c ? 0 : 8, marginLeft: 20 }}>
              <div style={{ width: `${pct*100}%`, height: '100%', background: TOKENS.p500 }}/>
            </div>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 6px 20px' }}>
                <span style={{ fontSize: 13, color: TOKENS.ink3, width: 50, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{tx.date}</span>
                <span style={{ flex: 1, fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// V5 · Ledger (dotted leaders)
// ═════════════════════════════════════════════════════════════
function TxV5_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ padding: '10px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: `1px solid ${TOKENS.ink}`, paddingBottom: 4, marginBottom: 6 }}>
              <span style={{ transform: 'translateY(2px)' }}><CollapseChev collapsed={c} color={TOKENS.ink}/></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: TOKENS.ink, letterSpacing: 1.5, textTransform: 'uppercase' }}>{sec.title}</span>
              {c && <span style={{ fontSize: 11, color: TOKENS.ink3, letterSpacing: 0.5 }}>· {sec.data.length} 筆</span>}
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: TOKENS.ink, letterSpacing: 1.2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '5px 0' }}>
                  <span style={{ fontSize: 14, color: TOKENS.ink2, flexShrink: 0 }}>{cat.name}</span>
                  <span style={{ fontSize: 14, color: TOKENS.ink, flexShrink: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</span>
                  <span style={{ flex: 1, borderBottom: `1px dotted ${TOKENS.ink3}`, transform: 'translateY(-3px)', minWidth: 16 }}/>
                  <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxV5_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id} style={{ padding: '10px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: `1px solid ${TOKENS.ink}`, paddingBottom: 4, marginBottom: 6 }}>
              <span style={{ transform: 'translateY(2px)' }}><CollapseChev collapsed={c} color={TOKENS.ink}/></span>
              <Glyph name={sec.iconGlyph} size={12} color={TOKENS.ink}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: TOKENS.ink, letterSpacing: 1.5, textTransform: 'uppercase' }}>{sec.title}</span>
              {c && <span style={{ fontSize: 11, color: TOKENS.ink3, letterSpacing: 0.5 }}>· {sec.data.length} 筆</span>}
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: TOKENS.ink, letterSpacing: 1.2, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)}</span>
            </div>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '5px 0' }}>
                <span style={{ fontSize: 12, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums', width: 50, flexShrink: 0 }}>{tx.date}</span>
                <span style={{ fontSize: 14, color: TOKENS.ink, flexShrink: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</span>
                <span style={{ flex: 1, borderBottom: `1px dotted ${TOKENS.ink3}`, transform: 'translateY(-3px)', minWidth: 16 }}/>
                <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// V6 · Number-first
// ═════════════════════════════════════════════════════════════
function TxV6_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: 6, background: TOKENS.bg }}>
              <CollapseChev collapsed={c} color={TOKENS.ink3}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink2, letterSpacing: 0.3 }}>{sec.title}</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 12, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)} · {sec.data.length} 筆</span>
            </div>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: `0.5px solid ${TOKENS.hairline}` }}>
                  <span style={{
                    fontSize: 18, fontWeight: 700, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
                    width: 110, textAlign: 'right', flexShrink: 0,
                  }}>{fmt(tx.amount).replace('NT$','')}</span>
                  <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                    <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 1 }}>{cat.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxV6_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: 8, background: TOKENS.bg }}>
              <CollapseChev collapsed={c} color={TOKENS.ink3}/>
              <Glyph name={sec.iconGlyph} size={14} color={TOKENS.p500}/>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TOKENS.ink2, letterSpacing: 0.3 }}>{sec.title}</span>
              <span style={{ fontSize: 12, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{fmt(sec.total)} · {sec.data.length} 筆</span>
            </div>
            {!c && sec.data.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: `0.5px solid ${TOKENS.hairline}` }}>
                <span style={{
                  fontSize: 18, fontWeight: 700, color: TOKENS.ink,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
                  width: 110, textAlign: 'right', flexShrink: 0,
                }}>{fmt(tx.amount).replace('NT$','')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                  <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{tx.date}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// V7 · Two-line
// ═════════════════════════════════════════════════════════════
function TxV7_ByDate({ collapsed }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.3 }}>{sec.title}</div>
                <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{sec.data.length} 筆 · {fmt(sec.total)}</div>
              </div>
            </div>
            {!c && sec.data.map(tx => {
              const cat = CAT_BY_ID[tx.cat];
              const acc = ACC_BY_ID[tx.acc];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `0.5px solid ${TOKENS.hairline}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.amount < 0 ? TOKENS.surface : '#E8F5E9', border: `0.5px solid ${TOKENS.hairline2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Glyph name={cat.glyph} size={16} color={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note || cat.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: TOKENS.ink2, padding: '2px 6px', background: TOKENS.surface, border: `0.5px solid ${TOKENS.hairline2}`, borderRadius: 4 }}>{cat.name}</span>
                      <span style={{ fontSize: 11, color: TOKENS.ink3 }}>{acc.name}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: tx.amount < 0 ? TOKENS.ink : TOKENS.success, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function TxV7_ByCategory({ collapsed }) {
  const sections = groupByCategory(TX, 'expense');
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <div key={sec.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 8px' }}>
              <CollapseChev collapsed={c} color={TOKENS.ink2}/>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: TOKENS.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Glyph name={sec.iconGlyph} size={18} color={TOKENS.p500}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.3 }}>{sec.title}</div>
                <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{sec.data.length} 筆 · {fmt(sec.total)}</div>
              </div>
            </div>
            {!c && sec.data.map(tx => {
              const acc = ACC_BY_ID[tx.acc];
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `0.5px solid ${TOKENS.hairline}` }}>
                  {/* 日期擺到 icon 位置,跟依日期模式對齊 */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: TOKENS.surface, border: `0.5px solid ${TOKENS.hairline2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{tx.date.split(' ')[1]}</span>
                    <span style={{ fontSize: 8, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{tx.date.split(' ')[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.note}</div>
                    <div style={{ fontSize: 11, color: TOKENS.ink3, marginTop: 4 }}>{acc.name}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: TOKENS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}


Object.assign(window, {
  TxV1_ByDate, TxV1_ByCategory,
  TxV2_ByDate, TxV2_ByCategory,
  TxV3_ByDate, TxV3_ByCategory,
  TxV4_ByDate, TxV4_ByCategory,
  TxV5_ByDate, TxV5_ByCategory,
  TxV6_ByDate, TxV6_ByCategory,
  TxV7_ByDate, TxV7_ByCategory,
});
