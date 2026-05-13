// ─────────────────────────────────────────────────────────────
// Recurring Marker 提案 — Round 2（icon 細節變體）
//
// 前提（Round 1 已敲定）：
//   - inline before amount（icon 在金額包左側）
//   - 「主金額 + ≈ 換算金額」視為一包
//   - icon 與整包垂直置中
//
// 本輪在已敲定結構內，圍繞 icon 本身的視覺細節做變體，方便比對：
//   1. Size       — 12 / 14 / 16 / 18 px
//   2. Color      — disabled / secondary / primary tint
//   3. Shape      — repeat / sync / refresh / clock
//   4. Background — none / gray fill / hairline outline
//   5. Gap to amount — 2 / 4 / 6 / 8 px
//
// 每個變體只改一個維度，其他維度保持 baseline；
// baseline = size 14 · secondary · repeat · none · gap 4
// 每變體只做依日期分組（避免重複的 ByCategory artboard）。
// ─────────────────────────────────────────────────────────────

const R5_PAD_X = 16;
const R5_GAP = 14;
const R5_TRANSITION = 'all 280ms cubic-bezier(0.4, 0, 0.2, 1)';

const R5_BASELINE = {
  size: 14,
  color: 'secondary',
  shape: 'repeat',
  background: 'none',
  gap: 4,
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║ 🎛  PLAYGROUND — 自己改下面參數，存檔後 reload 瀏覽器看效果       ║
// ║   對應 variant：app.jsx Round 3 的「Playground」section          ║
// ║   觀察 5/1 Netflix（多幣別 + recurring）那筆最直接                ║
// ╚═══════════════════════════════════════════════════════════════╝
const R5_PLAYGROUND = {
  // ─── icon 本體 ────────────────────────────────────────────────

  // size: icon glyph 的像素尺寸（建議 10~22）
  // 越大越顯眼，連帶 wrap 直徑也跟著變
  size: 14,

  // color: icon 顏色（語意 token，非 HEX）
  //   'disabled'  → 最淡（ink3 #BDBDBD）
  //   'secondary' → 中灰（ink2 #757575）
  //   'primary'   → 主色紫（p500 #4323a0）
  // 越深越搶眼，目前敲定 disabled
  color: 'disabled',

  // shape: icon 形狀（從 components.jsx Glyph 的 case 選一個）
  //   'repeat'  → 兩段錯位箭頭（強調「循環」）
  //   'sync'    → 上下半圓循環（強調「同步」）— 目前敲定
  //   'refresh' → 單向迴轉（強調「重新」）
  //   'clock'   → 時鐘（強調「定時」非循環）
  shape: 'repeat',

  // ─── wrap 容器（icon 周圍的圓圈/方塊）─────────────────────────

  // background: wrap 的填色
  //   'none'       → 透明，不畫 wrap（icon 直接裸著）
  //   'gray-fill'  → 淺灰底 TOKENS.bg #F2F2F7（目前敲定）
  //   'surface2'   → 更淡的灰 #F5F5F5
  //   'p50'        → 主色淡紫 #f0ecfa
  //   'ink3-alpha' → 半透明灰 rgba(189,189,189,0.3)
  //   'outline'    → 無填色，配 hairline 細邊（看起來像空心徽章）
  background: 'gray-fill',

  // wrapShape: wrap 的形狀
  //   'circle'     → 圓形（borderRadius = wrapSize/2，自動完整圓）— 目前敲定
  //   'rounded-6'  → 圓角 6px
  //   'rounded-4'  → 圓角 4px
  //   'square'     → 直角方形
  wrapShape: 'rounded-6',

  // wrapPadding: glyph 跟 wrap 邊的單側 padding（px，建議 2~6）
  // wrap 直徑 = size + wrapPadding × 2
  // padding 越大 wrap 越鬆、越像徽章；padding 0 等於 wrap 緊貼 glyph
  wrapPadding: 4,

  // wrapBorder: wrap 的邊框（疊在 background 之上）
  //   'none'              → 無邊（目前敲定）
  //   'hairline-divider'  → 淡邊 TOKENS.divider #E0E0E0
  //   'hairline-ink3'     → 中灰邊 TOKENS.ink3 #BDBDBD
  // 加邊框會讓 wrap 跟周圍切割更明顯
  wrapBorder: 'none',

  // ─── icon 跟金額包之間 ────────────────────────────────────────

  // gap: icon 跟「主金額 + 換算金額」整包的水平間距（px，建議 2~16）
  // 太緊看起來黏在金額、太鬆看起來無關，目前敲定 14
  gap: 16,
};

// ═════════════════════════════════════════════════════════════
// Recurring icon 元件 — 受 iconProps 控制
// 基本 5 維度：size / color / shape / background / gap
// 額外 wrap 細節（Round 3 用）：wrapShape / wrapPadding / wrapBorder
// ═════════════════════════════════════════════════════════════
function R5_RecurIcon({
  size, color, shape,
  background = 'none',         // 'none' | 'gray-fill' | 'surface2' | 'p50' | 'ink3-alpha' | 'outline'
  wrapShape = 'circle',        // 'circle' | 'rounded-6' | 'rounded-4' | 'square'
  wrapPadding = 3,             // glyph 與 wrap 邊的單側 padding (px)
  wrapBorder = 'none',         // 'none' | 'hairline-divider' | 'hairline-ink3'
}) {
  const iconColor =
    color === 'disabled' ? TOKENS.ink3 :
      color === 'secondary' ? TOKENS.ink2 :
        color === 'primary' ? TOKENS.p500 :
          TOKENS.ink2;

  // 解析 background fill
  const bgFill =
    background === 'gray-fill' ? TOKENS.bg :
      background === 'surface2' ? TOKENS.surface2 :
        background === 'p50' ? TOKENS.p50 :
          background === 'ink3-alpha' ? 'rgba(189,189,189,0.3)' :
            'transparent';
  const isFilled = bgFill !== 'transparent';
  const isOutlineOnly = background === 'outline';

  // 解析 border
  let borderCss = 'none';
  if (isOutlineOnly) borderCss = `1px solid ${TOKENS.divider}`;
  else if (wrapBorder === 'hairline-divider') borderCss = `1px solid ${TOKENS.divider}`;
  else if (wrapBorder === 'hairline-ink3') borderCss = `1px solid ${TOKENS.ink3}`;

  const hasWrap = isFilled || isOutlineOnly || wrapBorder !== 'none';
  const padding = hasWrap ? wrapPadding : 0;
  const wrapSize = size + padding * 2;

  // 解析 wrap shape → borderRadius
  let borderRadius = 0;
  if (wrapShape === 'circle') borderRadius = wrapSize / 2;
  else if (wrapShape === 'rounded-6') borderRadius = 6;
  else if (wrapShape === 'rounded-4') borderRadius = 4;
  else if (wrapShape === 'square') borderRadius = 0;

  const wrapStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: wrapSize, height: wrapSize,
    borderRadius,
    background: bgFill,
    border: borderCss,
    flexShrink: 0,
  };
  return (
    <span style={wrapStyle}>
      <Glyph name={shape} size={size} color={iconColor} stroke={2} />
    </span>
  );
}

// ═════════════════════════════════════════════════════════════
// 主金額 + 換算金額包；icon 並列左側垂直置中（Round 1 敲定的結構）
// ═════════════════════════════════════════════════════════════
function R5_AmountBlock({ recurring, amount, currency, convertedAmount, rightColor, iconProps }) {
  const cfg = { ...R5_BASELINE, ...iconProps };
  const hasConverted = convertedAmount !== undefined && convertedAmount !== null;
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: cfg.gap }}>
      {recurring && <R5_RecurIcon size={cfg.size} color={cfg.color} shape={cfg.shape} background={cfg.background} wrapShape={cfg.wrapShape} wrapPadding={cfg.wrapPadding} wrapBorder={cfg.wrapBorder} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{
          fontSize: 16, fontWeight: 700, color: rightColor || TOKENS.ink,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {fmt(amount, currency)}
        </span>
        {hasConverted && (
          <span style={{
            fontSize: 12, color: TOKENS.ink3,
            fontVariantNumeric: 'tabular-nums', marginTop: 2,
          }}>
            ≈ {fmt(convertedAmount, 'TWD')}
          </span>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 共用 Row（同 Round 1 R5_Row 等價，重新命名為 R5b_Row 避免衝突）
// ═════════════════════════════════════════════════════════════
function R5b_Row({ left, primary, secondary, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `12px ${R5_PAD_X}px`,
      transition: R5_TRANSITION,
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{primary}</div>
        {secondary && <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 2 }}>{secondary}</div>}
      </div>
      {right}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Maker function：接 iconProps，產出 ByDate variant
// 沿用 Round 1 已有的 R11_SectionCard / R11_SectionHeader / R12_CatIconLeft
// ═════════════════════════════════════════════════════════════
function makeTxR5(iconProps) {
  return ({ collapsed, onToggle }) => {
    const sections = groupByDate(TX);
    return (
      <div>
        {sections.map(sec => {
          const c = isCol(collapsed, sec.id);
          return (
            <R11_SectionCard key={sec.id}>
              <R11_SectionHeader c={c} onClick={() => onToggle && onToggle(sec.id)}
                title={sec.title} count={`${sec.data.length} 筆`} total={fmt(sec.total)} />
              {!c && sec.data.map((tx, i) => {
                const cat = CAT_BY_ID[tx.cat];
                return (
                  <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
                    <R5b_Row
                      left={<R12_CatIconLeft glyph={cat.glyph} />}
                      primary={tx.note || cat.name} secondary={cat.name}
                      right={
                        <R5_AmountBlock
                          recurring={tx.recurring}
                          amount={tx.amount}
                          currency={tx.currency}
                          convertedAmount={tx.convertedAmount}
                          rightColor={tx.amount < 0 ? TOKENS.ink : TOKENS.success}
                          iconProps={iconProps} />
                      } />
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
// Size 系列（baseline = 14）
// ═════════════════════════════════════════════════════════════
// PLAYGROUND variant — 用上面 R5_PLAYGROUND 的設定渲染
const TxR5_Playground = makeTxR5(R5_PLAYGROUND);

const TxR5_Size12 = makeTxR5({ size: 12 });
const TxR5_Size14 = makeTxR5({ size: 14 }); // ★
const TxR5_Size16 = makeTxR5({ size: 16 });
const TxR5_Size18 = makeTxR5({ size: 18 });

// ═════════════════════════════════════════════════════════════
// Color 系列（baseline = secondary）
// ═════════════════════════════════════════════════════════════
const TxR5_ColorDisabled = makeTxR5({ color: 'disabled' });
const TxR5_ColorSecondary = makeTxR5({ color: 'secondary' }); // ★
const TxR5_ColorPrimary = makeTxR5({ color: 'primary' });

// ═════════════════════════════════════════════════════════════
// Shape 系列（baseline = repeat）
// ═════════════════════════════════════════════════════════════
const TxR5_ShapeRepeat = makeTxR5({ shape: 'repeat' }); // ★
const TxR5_ShapeSync = makeTxR5({ shape: 'sync' });
const TxR5_ShapeRefresh = makeTxR5({ shape: 'refresh' });
const TxR5_ShapeClock = makeTxR5({ shape: 'clock' });

// ═════════════════════════════════════════════════════════════
// Background 系列（baseline = none）
// ═════════════════════════════════════════════════════════════
const TxR5_BgNone = makeTxR5({ background: 'none' }); // ★
const TxR5_BgFill = makeTxR5({ background: 'gray-fill' });
const TxR5_BgOutline = makeTxR5({ background: 'outline' });

// ═════════════════════════════════════════════════════════════
// Gap 系列（baseline = 4）
// ═════════════════════════════════════════════════════════════
const TxR5_Gap2 = makeTxR5({ gap: 2 });
const TxR5_Gap4 = makeTxR5({ gap: 4 }); // ★
const TxR5_Gap6 = makeTxR5({ gap: 6 });
const TxR5_Gap8 = makeTxR5({ gap: 8 });

// ═════════════════════════════════════════════════════════════
// Combined preview — 使用者選定組合
//   size 16 / background gray-fill / shape sync / color disabled (ink3) / gap 14
// 在這組合上比較 gap 4 / 10 / 12 / 14
// ═════════════════════════════════════════════════════════════
const R5_COMBINED = {
  size: 16,
  background: 'gray-fill',
  shape: 'sync',
  color: 'disabled',
  gap: 14,
};
const TxR5_Combined_Gap4 = makeTxR5({ ...R5_COMBINED, gap: 4 });
const TxR5_Combined_Gap10 = makeTxR5({ ...R5_COMBINED, gap: 10 });
const TxR5_Combined_Gap12 = makeTxR5({ ...R5_COMBINED, gap: 12 });
const TxR5_Combined_Gap14 = makeTxR5({ ...R5_COMBINED, gap: 14 }); // ★ 敲定

// ═════════════════════════════════════════════════════════════
// Round 3 · Icon Wrap 細節變體（全部基於 R5_COMBINED）
// 圍繞 wrap 本身的 shape / padding / bg color / border
// ═════════════════════════════════════════════════════════════

// Wrap Shape：circle ★ / rounded 6px / rounded 4px / square sharp
const TxR5_Wrap_ShapeCircle = makeTxR5({ ...R5_COMBINED, wrapShape: 'circle' });
const TxR5_Wrap_ShapeRounded6 = makeTxR5({ ...R5_COMBINED, wrapShape: 'rounded-6' });
const TxR5_Wrap_ShapeRounded4 = makeTxR5({ ...R5_COMBINED, wrapShape: 'rounded-4' });
const TxR5_Wrap_ShapeSquare = makeTxR5({ ...R5_COMBINED, wrapShape: 'square' });

// Wrap Padding：2 / 3 ★ / 4 / 5
const TxR5_Wrap_Padding2 = makeTxR5({ ...R5_COMBINED, wrapPadding: 2 });
const TxR5_Wrap_Padding3 = makeTxR5({ ...R5_COMBINED, wrapPadding: 3 });
const TxR5_Wrap_Padding4 = makeTxR5({ ...R5_COMBINED, wrapPadding: 4 });
const TxR5_Wrap_Padding5 = makeTxR5({ ...R5_COMBINED, wrapPadding: 5 });

// Background color：gray bg ★ / surface2 / p50（紫淡底）/ ink3-alpha
const TxR5_Wrap_BgGray = makeTxR5({ ...R5_COMBINED, background: 'gray-fill' });
const TxR5_Wrap_BgSurface2 = makeTxR5({ ...R5_COMBINED, background: 'surface2' });
const TxR5_Wrap_BgP50 = makeTxR5({ ...R5_COMBINED, background: 'p50' });
const TxR5_Wrap_BgInk3Alpha = makeTxR5({ ...R5_COMBINED, background: 'ink3-alpha' });

// Border：none ★ / hairline divider / hairline ink3
const TxR5_Wrap_BorderNone = makeTxR5({ ...R5_COMBINED, wrapBorder: 'none' });
const TxR5_Wrap_BorderDivider = makeTxR5({ ...R5_COMBINED, wrapBorder: 'hairline-divider' });
const TxR5_Wrap_BorderInk3 = makeTxR5({ ...R5_COMBINED, wrapBorder: 'hairline-ink3' });


Object.assign(window, {
  TxR5_Playground,
  TxR5_Size12, TxR5_Size14, TxR5_Size16, TxR5_Size18,
  TxR5_ColorDisabled, TxR5_ColorSecondary, TxR5_ColorPrimary,
  TxR5_ShapeRepeat, TxR5_ShapeSync, TxR5_ShapeRefresh, TxR5_ShapeClock,
  TxR5_BgNone, TxR5_BgFill, TxR5_BgOutline,
  TxR5_Gap2, TxR5_Gap4, TxR5_Gap6, TxR5_Gap8,
  TxR5_Combined_Gap4, TxR5_Combined_Gap10, TxR5_Combined_Gap12, TxR5_Combined_Gap14,
  TxR5_Wrap_ShapeCircle, TxR5_Wrap_ShapeRounded6, TxR5_Wrap_ShapeRounded4, TxR5_Wrap_ShapeSquare,
  TxR5_Wrap_Padding2, TxR5_Wrap_Padding3, TxR5_Wrap_Padding4, TxR5_Wrap_Padding5,
  TxR5_Wrap_BgGray, TxR5_Wrap_BgSurface2, TxR5_Wrap_BgP50, TxR5_Wrap_BgInk3Alpha,
  TxR5_Wrap_BorderNone, TxR5_Wrap_BorderDivider, TxR5_Wrap_BorderInk3,
  R5_RecurIcon, R5_AmountBlock,
});
