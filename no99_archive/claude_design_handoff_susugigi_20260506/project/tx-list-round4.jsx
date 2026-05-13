// ─────────────────────────────────────────────────────────────
// Transaction list — 第四輪
// 主題：recurring（定期）紀錄的視覺標記
//
// 問題：
//   現行 list 中，由定期排程產生的實例（scheduleId != null）
//   與一般紀錄長一模一樣，使用者無法從列表辨識。
//
// 三個對照方案（皆基於 R10 · Outlined frame refined 的視覺骨架）：
//   R11 · Badge          — 在 left slot 主視覺右下角疊小循環徽章
//                          兩種分組模式視覺對稱、空間占用最小（主推）
//   R12 · Inline tag     — primary 文字前 prepend 一個 inline ↻ 圖示
//                          對照「徽章 vs inline」哪個更易掃視
//   R13 · Tint row       — recurring 紀錄整列底色用極低彩度 tint
//                          對照「徽章 vs 底色」哪個更易掃視
//
// 共通決定（A–E）：
//   A. transfer 同樣套規則（範例資料無 transfer，標 row 為 expense/income recurring）
//   B. 標記位置貼齐 left slot（兩模式視覺一致，使用者學一次）
//   C. 用次文字色（白底 + 細邊 + ink2/ink3 glyph），避免和類別主色搶眼
//   D. 點按列維持進 editor，徽章無獨立行為，避免誤觸
//   E. 行為層 buildPeriodReport 需把 scheduleId / isRecurring 帶到 View
// ─────────────────────────────────────────────────────────────

const R11_TRANSITION = 'all 280ms cubic-bezier(0.4, 0, 0.2, 1)';
const R11_PAD_X = 16;
const R11_GAP = 14;

// ═════════════════════════════════════════════════════════════
// 共用 atoms（R11–R13 共用列高、字級、外框等基底，差異僅標記方式）
// ═════════════════════════════════════════════════════════════
function R11_Row({ left, primary, secondary, right, rightColor, rowBg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `12px ${R11_PAD_X}px`,
      background: rowBg || 'transparent',
      transition: R11_TRANSITION,
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{primary}</div>
        {secondary && <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>{secondary}</div>}
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 16, fontWeight: 700, color: rightColor || TOKENS.ink,
        fontVariantNumeric: 'tabular-nums',
      }}>{right}</span>
    </div>
  );
}

function R11_SectionHeader({ c, onClick, leadingIcon, title, count, total }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      padding: c ? `14px ${R11_PAD_X}px` : `10px ${R11_PAD_X}px`,
      transition: R11_TRANSITION,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <CollapseChev collapsed={c} color={TOKENS.ink2}/>
      {leadingIcon}
      <span style={{
        fontSize: c ? 17 : 14,
        fontWeight: 500, color: TOKENS.ink,
        transition: R11_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3, transition: R11_TRANSITION }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? 15 : 13,
        fontWeight: 500, color: TOKENS.ink,
        fontVariantNumeric: 'tabular-nums',
        transition: R11_TRANSITION,
      }}>{total}</span>
    </div>
  );
}

function R11_SectionCard({ children }) {
  return (
    <div style={{
      margin: `0 16px ${R11_GAP}px`,
      background: TOKENS.surface,
      borderRadius: 14,
      border: `1px solid ${TOKENS.divider}`,
      overflow: 'hidden',
      transition: R11_TRANSITION,
    }}>{children}</div>
  );
}


// ═════════════════════════════════════════════════════════════
// R11 · Badge（主推）
//   left slot 的主視覺右下角疊一個 12px 圓形徽章：
//     白底 + 1px divider 邊框 + 8px ↻ glyph（次文字色 ink2）
//   - 日期分組：徽章疊在類別圖示右下角
//   - 類別分組：徽章疊在 date badge 右下角
//   - 兩種分組模式視覺對稱，使用者學一次
// ═════════════════════════════════════════════════════════════
const RECUR_BADGE_SIZE = 12;
const RECUR_BADGE_GLYPH = 8;

function RecurBadge() {
  return (
    <div style={{
      position: 'absolute', right: -3, bottom: -3,
      width: RECUR_BADGE_SIZE, height: RECUR_BADGE_SIZE,
      borderRadius: RECUR_BADGE_SIZE / 2,
      background: TOKENS.surface,
      border: `1px solid ${TOKENS.divider}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <Glyph name="repeat" size={RECUR_BADGE_GLYPH} color={TOKENS.ink2} stroke={2}/>
    </div>
  );
}

function R11_CatIconLeft({ glyph, recurring }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Glyph name={glyph} size={16} color={TOKENS.ink2}/>
      </div>
      {recurring && <RecurBadge/>}
    </div>
  );
}

function R11_DateBadgeLeft({ date, recurring }) {
  const [m, d] = date.split(' ');
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{d}</span>
        <span style={{ fontSize: 7, color: TOKENS.ink3, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' }}>{m}</span>
      </div>
      {recurring && <RecurBadge/>}
    </div>
  );
}

function TxR11_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <R11_Row
                    left={<R11_CatIconLeft glyph={cat.glyph} recurring={tx.recurring}/>}
                    primary={tx.note || cat.name} secondary={cat.name}
                    right={fmt(tx.amount, tx.currency)}
                    rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                </div>
              );
            })}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}

function TxR11_ByCategory({ collapsed, onToggle, chartMode = 'expense' }) {
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
            transition: R11_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.ink2}/>
          </div>
        );
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <R11_Row
                  left={<R11_DateBadgeLeft date={tx.date} recurring={tx.recurring}/>}
                  primary={tx.note} right={fmt(tx.amount, tx.currency)}/>
              </div>
            ))}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R12 · Inline tag
//   在 primary 文字前 prepend 一個 11px ↻ icon（ink3 色）
//   - 比徽章更明顯，但占用 row 文字寬度
//   - 對照 R11 用於評估「徽章太隱形 vs inline 太吵」
// ═════════════════════════════════════════════════════════════
function RecurInlineTag() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 13, height: 13, marginRight: 2, flexShrink: 0,
    }}>
      <Glyph name="repeat" size={11} color={TOKENS.ink3} stroke={2}/>
    </span>
  );
}

function R12_CatIconLeft({ glyph }) {
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

function R12_DateBadgeLeft({ date }) {
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

function TxR12_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <R11_Row
                    left={<R12_CatIconLeft glyph={cat.glyph}/>}
                    primary={<>{tx.recurring && <RecurInlineTag/>}{tx.note || cat.name}</>}
                    secondary={cat.name}
                    right={fmt(tx.amount, tx.currency)}
                    rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                </div>
              );
            })}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}

function TxR12_ByCategory({ collapsed, onToggle, chartMode = 'expense' }) {
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
            transition: R11_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.ink2}/>
          </div>
        );
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <R11_Row
                  left={<R12_DateBadgeLeft date={tx.date}/>}
                  primary={<>{tx.recurring && <RecurInlineTag/>}{tx.note}</>}
                  right={fmt(tx.amount, tx.currency)}/>
              </div>
            ))}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R13 · Tint row
//   recurring 紀錄整列底色用 TOKENS.bg（最低彩度灰），
//   row 仍維持白底 + 與 bg 對比。
//   - 掃視時最直接，可不必看 icon
//   - 風險：和「分組標題色」「Action Mode / Undo Mode」的底色語言疊加
//     視覺密度高的列表可能變雜
// ═════════════════════════════════════════════════════════════
const R13_RECUR_TINT = TOKENS.bg; // #F2F2F7

function TxR13_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <R11_Row
                    left={<R12_CatIconLeft glyph={cat.glyph}/>}
                    primary={tx.note || cat.name} secondary={cat.name}
                    right={fmt(tx.amount, tx.currency)}
                    rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}
                    rowBg={tx.recurring ? R13_RECUR_TINT : null}/>
                </div>
              );
            })}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}

function TxR13_ByCategory({ collapsed, onToggle, chartMode = 'expense' }) {
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
            transition: R11_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.ink2}/>
          </div>
        );
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <R11_Row
                  left={<R12_DateBadgeLeft date={tx.date}/>}
                  primary={tx.note} right={fmt(tx.amount, tx.currency)}
                  rowBg={tx.recurring ? R13_RECUR_TINT : null}/>
              </div>
            ))}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// R14 · Inline tag · before amount（主推 ★）
//   把 R12 的 ↻ icon 從 primary 文字前移到金額左側。
//   - 比 R12（文字前）少和備註文字爭注意力
//   - 金額是使用者掃視 list 的主要錨點，icon 放這裡視線會自然帶到
//   - 兩種分組模式共用，視覺位置一致
// ═════════════════════════════════════════════════════════════
function TxR14_ByDate({ collapsed, onToggle }) {
  const sections = groupByDate(TX);
  return (
    <div>
      {sections.map(sec => {
        const c = isCol(collapsed, sec.id);
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => {
              const cat = CAT_BY_ID[tx.cat];
              return (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <R11_Row
                    left={<R12_CatIconLeft glyph={cat.glyph}/>}
                    primary={tx.note || cat.name} secondary={cat.name}
                    right={<>{tx.recurring && <RecurInlineTag/>}{fmt(tx.amount, tx.currency)}</>}
                    rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}/>
                </div>
              );
            })}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}

function TxR14_ByCategory({ collapsed, onToggle, chartMode = 'expense' }) {
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
            transition: R11_TRANSITION,
          }}>
            <Glyph name={sec.iconGlyph} size={c ? 13 : 10} color={TOKENS.ink2}/>
          </div>
        );
        return (
          <R11_SectionCard key={sec.id}>
            <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
              leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}/>
            {!c && sec.data.map((tx, i) => (
              <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                <R11_Row
                  left={<R12_DateBadgeLeft date={tx.date}/>}
                  primary={tx.note}
                  right={<>{tx.recurring && <RecurInlineTag/>}{fmt(tx.amount, tx.currency)}</>}/>
              </div>
            ))}
          </R11_SectionCard>
        );
      })}
    </div>
  );
}


Object.assign(window, {
  TxR11_ByDate, TxR11_ByCategory,
  TxR12_ByDate, TxR12_ByCategory,
  TxR13_ByDate, TxR13_ByCategory,
  TxR14_ByDate, TxR14_ByCategory,
  RecurBadge, RecurInlineTag,
});
