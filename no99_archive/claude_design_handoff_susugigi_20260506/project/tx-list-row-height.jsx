// ─────────────────────────────────────────────────────────────
// Transaction list — Row Height 提案
//
// 問題：
//   實作（src/screens/Home/PeriodPage.tsx, transactionRow）每一筆交易/轉帳
//   的列高約 64–66px：
//     paddingVertical = SPACING[3] = 12   → 上下共 24
//     rowLeftSlot     = 40×32
//     txNote          = 16px + marginBottom 2
//     txDate          = 14px
//   兩行內容含 padding 大概落在 64–66。在 4–5 筆以上的 section 裡，
//   一個畫面塞不下幾筆，掃視成本高。
//
// 對照基準（H0 · Current）：完全沿用 R10 prototype 的 R11_Row。
//   padding 12 / left 32×32 / primary 15 / secondary 12 — 約 60px。
//   （比實作再矮一點，因 prototype 用 15+12 不是 16+14。）
//
// 五個提案沿用 R10 的卡片外框（R11_SectionCard / R11_SectionHeader），
// 只改 row 內部，方便比對。每個提案在 label 上標 row height 預估值，
// 看單一畫面塞幾筆的差異。
// ─────────────────────────────────────────────────────────────

const RH_PAD_X = 16;
const RH_GAP = 14;

// 多幣別 row 的右欄輔助：主金額 + ≈ 換算金額（沿用 R5_AmountBlock 的概念，
// 但這裡專注 row height，不掛 recurring icon）
function RH_AmountCell({ tx, fontSize = 16, weight = 700 }) {
  const hasConverted = tx.convertedAmount !== undefined && tx.convertedAmount !== null;
  const color = tx.amount < 0 ? TOKENS.ink : TOKENS.success;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{
        fontSize, fontWeight: weight, color,
        fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
      }}>
        {fmt(tx.amount, tx.currency)}
      </span>
      {hasConverted && (
        <span style={{
          fontSize: 11, color: TOKENS.ink3,
          fontVariantNumeric: 'tabular-nums', marginTop: 1, lineHeight: 1.2,
        }}>
          ≈ {fmt(tx.convertedAmount, 'TWD')}
        </span>
      )}
    </div>
  );
}

// 共用：依日期分組外殼，每提案丟一個 RowComponent 進來
function makeByDate(RowComponent) {
  return ({ collapsed, onToggle }) => {
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
                const acc = ACC_BY_ID[tx.acc];
                return (
                  <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                    <RowComponent tx={tx} cat={cat} acc={acc}/>
                  </div>
                );
              })}
            </R11_SectionCard>
          );
        })}
      </div>
    );
  };
}

// ═════════════════════════════════════════════════════════════
// H0 · Current — R10 baseline，padding 12 / 32×32 / 15+12
//   兩行（note · account），row height ≈ 60px
// ═════════════════════════════════════════════════════════════
function Row_H0_Current({ tx, cat, acc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `12px ${RH_PAD_X}px`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.note || cat.name}
        </div>
        <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>
          {acc.name}
        </div>
      </div>
      <RH_AmountCell tx={tx}/>
    </div>
  );
}
const TxRH_H0_Current = makeByDate(Row_H0_Current);

// ═════════════════════════════════════════════════════════════
// H1 · Padding diet
//   只動 padding：12 → 8。其他完全同 H0。
//   row height ≈ 52px（省 8）
//   ‧ 改動最小、風險最低，但靠近上下分隔線會略擠
// ═════════════════════════════════════════════════════════════
function Row_H1_PadDiet({ tx, cat, acc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `8px ${RH_PAD_X}px`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.note || cat.name}
        </div>
        <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>
          {acc.name}
        </div>
      </div>
      <RH_AmountCell tx={tx}/>
    </div>
  );
}
const TxRH_H1_PadDiet = makeByDate(Row_H1_PadDiet);

// ═════════════════════════════════════════════════════════════
// H2 · Single line · note + account 合併同行
//   去掉副行；帳戶名以「note · account」inline 接在後面，省一整行。
//   row height ≈ 44px（省 16）
//   ‧ 視覺最瘦；缺點是 note 較長時 account 會被 ellipsis 吃掉
//   ‧ 適合「使用者多半看 note + 金額」這類重點
// ═════════════════════════════════════════════════════════════
function Row_H2_SingleLine({ tx, cat, acc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `10px ${RH_PAD_X}px`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={cat.glyph} size={14} color={TOKENS.ink2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span style={{ fontSize: 15, color: TOKENS.ink, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.note || cat.name}
        </span>
        <span style={{ fontSize: 12, color: TOKENS.ink3, flexShrink: 0 }}>· {acc.name}</span>
      </div>
      <RH_AmountCell tx={tx}/>
    </div>
  );
}
const TxRH_H2_SingleLine = makeByDate(Row_H2_SingleLine);

// ═════════════════════════════════════════════════════════════
// H3 · Compact typography
//   保留兩行，但字級縮：primary 14 / secondary 11；padding 8；marginTop 1。
//   row height ≈ 46px（省 14）
//   ‧ 維持資訊密度，整體看起來「縮一號」
//   ‧ 缺點：金額也常跟著縮，數字辨識變吃力（這提案保留金額 16）
// ═════════════════════════════════════════════════════════════
function Row_H3_CompactType({ tx, cat, acc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: `8px ${RH_PAD_X}px`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={cat.glyph} size={14} color={TOKENS.ink2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.25 }}>
          {tx.note || cat.name}
        </div>
        <div style={{ fontSize: 11, color: TOKENS.ink3, marginTop: 1, lineHeight: 1.25 }}>
          {acc.name}
        </div>
      </div>
      <RH_AmountCell tx={tx} fontSize={15}/>
    </div>
  );
}
const TxRH_H3_CompactType = makeByDate(Row_H3_CompactType);

// ═════════════════════════════════════════════════════════════
// H4 · Secondary on right · account 移到金額下方
//   左中欄變單行；account 名以小字落在金額正下方。
//   row height ≈ 50px（省 10）
//   ‧ 把「次要 metadata」全部右靠，左側乾淨好掃 note
//   ‧ 注意：右下文字會跟「≈ 換算金額」打架，需要二擇一或上下堆疊
//     （此提案在多幣別 row 時把 account 收掉，只留 ≈ 換算金額）
// ═════════════════════════════════════════════════════════════
function Row_H4_RightMeta({ tx, cat, acc }) {
  const hasConverted = tx.convertedAmount !== undefined && tx.convertedAmount !== null;
  const color = tx.amount < 0 ? TOKENS.ink : TOKENS.success;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `10px ${RH_PAD_X}px`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={cat.glyph} size={16} color={TOKENS.ink2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.note || cat.name}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{
          fontSize: 16, fontWeight: 700, color,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
        }}>
          {fmt(tx.amount, tx.currency)}
        </span>
        <span style={{
          fontSize: 11, color: TOKENS.ink3,
          marginTop: 1, lineHeight: 1.2,
          fontVariantNumeric: hasConverted ? 'tabular-nums' : 'normal',
        }}>
          {hasConverted ? `≈ ${fmt(tx.convertedAmount, 'TWD')}` : acc.name}
        </span>
      </div>
    </div>
  );
}
const TxRH_H4_RightMeta = makeByDate(Row_H4_RightMeta);

// ═════════════════════════════════════════════════════════════
// H5 · Minimal · 單行 + 小圖示 + 極瘦
//   把 H2 推到極致：left 24×24、padding 6、primary 14、account 變 11。
//   row height ≈ 38px（省 22）
//   ‧ 一個畫面能塞最多筆；像「列表預覽」型
//   ‧ 缺點：點擊面積接近 44pt 下限，需要驗證觸控；老花眼字會太小
// ═════════════════════════════════════════════════════════════
function Row_H5_Minimal({ tx, cat, acc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: `6px ${RH_PAD_X}px`,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={cat.glyph} size={12} color={TOKENS.ink2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span style={{ fontSize: 14, color: TOKENS.ink, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.25 }}>
          {tx.note || cat.name}
        </span>
        <span style={{ fontSize: 11, color: TOKENS.ink3, flexShrink: 0, lineHeight: 1.25 }}>· {acc.name}</span>
      </div>
      <RH_AmountCell tx={tx} fontSize={14} weight={600}/>
    </div>
  );
}
const TxRH_H5_Minimal = makeByDate(Row_H5_Minimal);


// ═════════════════════════════════════════════════════════════
// Collapsed Section Header Height 提案（CH 系列）
//
// 問題：
//   實作的 collapsed section header（PeriodPage.tsx，sectionHeaderRow）
//   尺寸：paddingV 14 / icon outline 32 / title 17 / total 15
//   → row height ≈ 60px
//   by-category 模式收合多分類時，header 一筆筆堆疊起來很佔位。
//
// 對照基準（CH0 · Current）：完全沿用實作現行尺寸的等價物。
// CH1–CH5 沿用 R11_SectionCard 外框，只調 collapsed 狀態下的：
//   - paddingV
//   - icon outline 大小
//   - title fontSize
//   - total fontSize
//
// 各 artboard 預設把 6 個分類全部收合，看一個畫面塞幾個 header。
// ═════════════════════════════════════════════════════════════

const CH_INITIAL_COLLAPSED = ['cat_food','cat_trans','cat_shop','cat_ent','cat_home','cat_health'];

const CH_DEFAULTS = {
  collapsedPad: 14,
  collapsedTitle: 17,
  collapsedTotal: 15,
  iconSizeCollapsed: 32,
  iconGlyphCollapsed: 18,
};

function R11_SectionHeader_Tunable({ c, onClick, leadingIcon, title, count, total, opts }) {
  const cfg = { ...CH_DEFAULTS, ...opts };
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      padding: c ? `${cfg.collapsedPad}px ${R11_PAD_X}px` : `10px ${R11_PAD_X}px`,
      transition: R11_TRANSITION,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <CollapseChev collapsed={c} color={TOKENS.ink2}/>
      {leadingIcon}
      <span style={{
        fontSize: c ? cfg.collapsedTitle : 14,
        fontWeight: 500,
        color: TOKENS.ink,
        transition: R11_TRANSITION,
      }}>{title}</span>
      <span style={{ fontSize: c ? 13 : 11, color: TOKENS.ink3 }}>· {count}</span>
      <span style={{ flex: 1 }}/>
      <span style={{
        fontSize: c ? cfg.collapsedTotal : 13,
        fontWeight: 500,
        color: TOKENS.ink,
        fontVariantNumeric: 'tabular-nums',
      }}>{total}</span>
    </div>
  );
}

function makeTxCH(opts) {
  const cfg = { ...CH_DEFAULTS, ...opts };
  return ({ collapsed, onToggle, chartMode = 'expense' }) => {
    const sections = groupByCategory(TX, chartMode);
    return (
      <div>
        {sections.map(sec => {
          const c = isCol(collapsed, sec.id);
          const iconOutlineSize = c ? cfg.iconSizeCollapsed : 18;
          const glyphSize = c ? cfg.iconGlyphCollapsed : 10;
          const icon = (
            <div style={{
              width: iconOutlineSize, height: iconOutlineSize,
              borderRadius: c ? 8 : 4,
              background: TOKENS.surface,
              border: `1px solid ${TOKENS.divider}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: R11_TRANSITION,
            }}>
              <Glyph name={sec.iconGlyph} size={glyphSize} color={TOKENS.ink2}/>
            </div>
          );
          return (
            <R11_SectionCard key={sec.id}>
              <R11_SectionHeader_Tunable c={c} onClick={() => onToggle && onToggle(sec.id)}
                leadingIcon={icon} title={sec.title} count={sec.data.length} total={fmt(sec.total)}
                opts={cfg}/>
              {!c && sec.data.map((tx, i) => (
                <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                  <R11_Row
                    left={<R12_DateBadgeLeft date={tx.date}/>}
                    primary={tx.note} right={fmt(tx.amount, tx.currency)}/>
                </div>
              ))}
            </R11_SectionCard>
          );
        })}
      </div>
    );
  };
}

// CH0 · Current — 實作現行 collapsed 尺寸
//   pad 14 / icon 32 / title 17 / total 15 → ≈ 60px
const TxCH_CH0_Current = makeTxCH({});

// CH1 · Padding diet — 只縮 paddingV
//   pad 10 / icon 32 / title 17 / total 15 → ≈ 52px
const TxCH_CH1_PadDiet = makeTxCH({ collapsedPad: 10 });

// CH2 · Icon shrink — icon outline 縮一號
//   pad 14 / icon 28 / title 17 / total 15 → ≈ 56px
const TxCH_CH2_IconShrink = makeTxCH({ iconSizeCollapsed: 28, iconGlyphCollapsed: 16 });

// CH3 · Match data row — pad + icon 同步調，跟 H0 data row 60px 對齊
//   pad 12 / icon 32 / title 17 / total 15 → ≈ 56–60px（同 row）
const TxCH_CH3_MatchRow = makeTxCH({ collapsedPad: 12 });

// CH4 · Compact — pad + icon + title 全部縮一號
//   pad 10 / icon 24 / title 15 / total 14 → ≈ 44px
const TxCH_CH4_Compact = makeTxCH({
  collapsedPad: 10,
  collapsedTitle: 15,
  collapsedTotal: 14,
  iconSizeCollapsed: 24,
  iconGlyphCollapsed: 14,
});

// CH5 · Tight — 推到極瘦
//   pad 8 / icon 22 / title 14 / total 13 → ≈ 38px
const TxCH_CH5_Tight = makeTxCH({
  collapsedPad: 8,
  collapsedTitle: 14,
  collapsedTotal: 13,
  iconSizeCollapsed: 22,
  iconGlyphCollapsed: 13,
});


Object.assign(window, {
  TxRH_H0_Current,
  TxRH_H1_PadDiet,
  TxRH_H2_SingleLine,
  TxRH_H3_CompactType,
  TxRH_H4_RightMeta,
  TxRH_H5_Minimal,
  RH_AmountCell,
  TxCH_CH0_Current,
  TxCH_CH1_PadDiet,
  TxCH_CH2_IconShrink,
  TxCH_CH3_MatchRow,
  TxCH_CH4_Compact,
  TxCH_CH5_Tight,
  CH_INITIAL_COLLAPSED,
});
