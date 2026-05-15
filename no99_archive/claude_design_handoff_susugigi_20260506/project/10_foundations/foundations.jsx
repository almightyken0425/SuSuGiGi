// ─────────────────────────────────────────────────────────────
// Foundations · 設計基礎視覺化（對齊 impl src/constants/theme.ts）
// 改 data.jsx 的 token 值 → 此 tab 自動更新。
// ─────────────────────────────────────────────────────────────

function FoundationsSection() {
  return (
    <>
      <DCSection id="found-color" title="Color · 主題與調色盤" subtitle="對齊 src/constants/theme.ts。預設 Theme 1 = 經典紫，可在 偏好設定 → 主題 切換到 Theme 2 海洋藍。">
        <DCArtboard id="palette-theme1" label="Theme 1 · 經典紫" width={420} height={520}>
          <PaletteCard theme={THEME_1}/>
        </DCArtboard>
        <DCArtboard id="palette-theme2" label="Theme 2 · 海洋藍" width={420} height={520}>
          <PaletteCard theme={THEME_2}/>
        </DCArtboard>
        <DCArtboard id="palette-neutrals" label="Neutrals · PALETTE.neutral" width={420} height={580}>
          <NeutralsCard/>
        </DCArtboard>
        <DCArtboard id="palette-semantic" label="Semantic · Status / Surfaces / Text" width={420} height={680}>
          <SemanticCard theme={THEME_1}/>
        </DCArtboard>
      </DCSection>

      <DCSection id="found-type" title="Typography · 字級 / 字重" subtitle="3-weight aesthetic：light 300（安靜文字）/ regular 400 / medium 500（最高權重，header / amount / button）。系統字體：iOS = SF Pro, Android = Roboto。">
        <DCArtboard id="type-scale" label="TYPOGRAPHY.size · xs → 3xl" width={520} height={680}>
          <TypeScaleCard/>
        </DCArtboard>
        <DCArtboard id="type-weights" label="TYPOGRAPHY.weight · 3-weight system" width={520} height={520}>
          <WeightsCard/>
        </DCArtboard>
      </DCSection>

      <DCSection id="found-space" title="Spacing / Radius" subtitle="SPACING = 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 px。RADIUS = sm 4 / md 8 / lg 12 / full 9999。">
        <DCArtboard id="spacing" label="SPACING · 4-multiple baseline" width={520} height={520}>
          <SpacingCard/>
        </DCArtboard>
        <DCArtboard id="radius" label="RADIUS" width={520} height={420}>
          <RadiusCard/>
        </DCArtboard>
      </DCSection>

      <DCSection id="found-list-tokens" title="LIST_TOKENS · 列表 token 速查" subtitle="iOS 風格 grouped list 的視覺值，影響 ListItem / GroupCard / SelectionListItem / ListSection。">
        <DCArtboard id="list-tokens" label="LIST_TOKENS 表格" width={520} height={680}>
          <TokenTableCard tokens={LIST_TOKENS} title="LIST_TOKENS"/>
        </DCArtboard>
        <DCArtboard id="tx-list-tokens" label="TX_LIST_TOKENS · TxList 專用" width={520} height={620}>
          <TokenTableCard tokens={TX_LIST_TOKENS} title="TX_LIST_TOKENS"/>
        </DCArtboard>
        <DCArtboard id="search-tokens" label="SEARCH_BAR_TOKENS" width={520} height={420}>
          <TokenTableCard tokens={SEARCH_BAR_TOKENS} title="SEARCH_BAR_TOKENS"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="found-icon" title="Icons · IconDefinition.json" subtitle={`完整 ${ICON_LIBRARY.length} 個 icon（impl 使用 MaterialCommunityIcons + AntDesign）。canvas 用自製 SVG 對應；命名直接使用 impl 真名（uniqueName）。`}>
        <DCArtboard id="icon-account" label="account tag" width={520} height={580}>
          <IconWallCard icons={ICON_LIBRARY.filter(i => i.tags.includes('account'))}/>
        </DCArtboard>
        <DCArtboard id="icon-category" label="category tag" width={520} height={760}>
          <IconWallCard icons={ICON_LIBRARY.filter(i => i.tags.includes('category'))}/>
        </DCArtboard>
        <DCArtboard id="icon-ui" label="UI 元素（MCI / FontAwesome / SF Symbols）" width={520} height={680}>
          <UIGlyphWallCard/>
        </DCArtboard>
      </DCSection>

      <DCSection id="found-glass" title="Glass / Effects" subtitle="GlassView 對齊 src/components/GlassView.tsx。iOS 用 BlurView blurAmount 28 blurType light，canvas 用 CSS backdrop-filter 模擬。">
        <DCArtboard id="glass-card" label="GlassView · pill / rounded" width={520} height={420}>
          <GlassDemoCard/>
        </DCArtboard>
      </DCSection>
    </>
  );
}

// ─── PaletteCard ────────────────────────────────────────────
function PaletteCard({ theme }) {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return (
    <FoundCard>
      <FoundLabel>{theme.name}</FoundLabel>
      <div style={{ fontSize: 12, color: TOKENS.ink2, marginBottom: 10 }}>primary[50…900], main = primary[500] = <code style={{ fontVariantNumeric: 'tabular-nums' }}>{theme.primary.main}</code></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {shades.map(s => <Swatch key={s} hex={theme.primary[s]} name={`primary ${s}`}/>)}
      </div>
      <FoundLabel style={{ marginTop: 20 }}>Chart series · primary[800→400]</FoundLabel>
      <div style={{ display: 'flex', gap: 4 }}>
        {theme.chart.map((c, i) => <div key={i} style={{ flex: 1, height: 40, background: c, borderRadius: 4 }}/>)}
      </div>
      <FoundLabel style={{ marginTop: 20 }}>Contrast</FoundLabel>
      <Swatch hex={theme.contrast} name="contrast"/>
    </FoundCard>
  );
}

function NeutralsCard() {
  const shades = [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
  return (
    <FoundCard>
      <FoundLabel>PALETTE.neutral · n0 → n1000</FoundLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {shades.map(s => <Swatch key={s} hex={PALETTE.neutral[s]} name={`neutral[${s}]`}/>)}
      </div>
    </FoundCard>
  );
}

function SemanticCard({ theme }) {
  return (
    <FoundCard>
      <FoundLabel>theme.status</FoundLabel>
      <Swatch hex={theme.status.success} name="status.success"/>
      <Swatch hex={theme.status.warning} name="status.warning"/>
      <Swatch hex={theme.status.error}   name="status.error"/>
      <FoundLabel style={{ marginTop: 16 }}>theme.bg</FoundLabel>
      <Swatch hex={theme.bg.base}    name="bg.base"          note="iOS systemGroupedBackground"/>
      <Swatch hex={theme.bg.surface} name="bg.surface"/>
      <Swatch hex={theme.bg.surface_hover} name="bg.surface_hover"/>
      <FoundLabel style={{ marginTop: 16 }}>theme.text</FoundLabel>
      <Swatch hex={theme.text.primary}   name="text.primary"   note="900"/>
      <Swatch hex={theme.text.secondary} name="text.secondary" note="600"/>
      <Swatch hex={theme.text.disabled}  name="text.disabled"  note="400"/>
      <Swatch hex={theme.text.divisor}   name="text.divisor"   note="300"/>
      <FoundLabel style={{ marginTop: 16 }}>theme.border</FoundLabel>
      <Swatch hex={theme.border.base}  name="border.base"  note="200"/>
      <Swatch hex={theme.border.focus} name="border.focus" note="primary[500]"/>
    </FoundCard>
  );
}

function Swatch({ hex, name, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 6, background: hex,
        border: `1px solid ${TOKENS.hairline}`, flexShrink: 0,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: TOKENS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 10, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums' }}>{hex}{note ? ` · ${note}` : ''}</div>
      </div>
    </div>
  );
}

// ─── TypeScale / Weights ───────────────────────────────────
function TypeScaleCard() {
  const entries = Object.entries(TYPOGRAPHY.size);
  return (
    <FoundCard>
      <FoundLabel>TYPOGRAPHY.size</FoundLabel>
      {entries.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
          <code style={{ fontSize: 11, color: TOKENS.ink3, width: 40 }}>{k}</code>
          <code style={{ fontSize: 11, color: TOKENS.ink3, width: 40, fontVariantNumeric: 'tabular-nums' }}>{v}px</code>
          <div style={{ flex: 1, fontSize: v, color: TOKENS.ink, fontWeight: 400 }}>記帳 SuSuGiGi {v}px</div>
        </div>
      ))}
    </FoundCard>
  );
}

function WeightsCard() {
  const meanings = {
    light: '安靜文字（ListItem.title、value、note）',
    regular: 'body / 段落文字',
    medium: '最高權重 — NavBar、modal title、button、amount、heading、CTA',
  };
  return (
    <FoundCard>
      <FoundLabel>TYPOGRAPHY.weight</FoundLabel>
      {Object.entries(TYPOGRAPHY.weight).map(([k, v]) => (
        <div key={k} style={{ padding: '12px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
            <code style={{ fontSize: 11, color: TOKENS.ink3 }}>{k}</code>
            <code style={{ fontSize: 11, color: TOKENS.ink3 }}>{v}</code>
          </div>
          <div style={{ fontSize: 22, fontWeight: v, color: TOKENS.ink }}>記帳 SuSuGiGi · The quick brown fox</div>
          <div style={{ fontSize: 12, color: TOKENS.ink2, marginTop: 4 }}>{meanings[k]}</div>
        </div>
      ))}
    </FoundCard>
  );
}

// ─── Spacing / Radius ─────────────────────────────────────
function SpacingCard() {
  return (
    <FoundCard>
      <FoundLabel>SPACING</FoundLabel>
      {Object.entries(SPACING).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
          <code style={{ fontSize: 11, color: TOKENS.ink3, width: 24, fontVariantNumeric: 'tabular-nums' }}>{k}</code>
          <code style={{ fontSize: 11, color: TOKENS.ink3, width: 40, fontVariantNumeric: 'tabular-nums' }}>{v}px</code>
          <div style={{ height: 14, background: TOKENS.p500, width: v, borderRadius: 3 }}/>
        </div>
      ))}
    </FoundCard>
  );
}

function RadiusCard() {
  return (
    <FoundCard>
      <FoundLabel>RADIUS</FoundLabel>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 8 }}>
        {Object.entries(RADIUS).map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{
              width: 70, height: 70,
              borderRadius: v === 9999 ? 9999 : v,
              background: TOKENS.p100, border: `1.5px solid ${TOKENS.p500}`,
            }}/>
            <code style={{ fontSize: 11, color: TOKENS.ink2, display: 'block', marginTop: 6 }}>{k}</code>
            <code style={{ fontSize: 11, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums' }}>{v === 9999 ? 'full' : `${v}px`}</code>
          </div>
        ))}
      </div>
    </FoundCard>
  );
}

// ─── TokenTableCard ───────────────────────────────────────
function TokenTableCard({ tokens, title }) {
  const entries = Object.entries(tokens);
  return (
    <FoundCard>
      <FoundLabel>{title}</FoundLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 12, rowGap: 4 }}>
        {entries.map(([k, v]) => (
          <React.Fragment key={k}>
            <code style={{ fontSize: 11, color: TOKENS.ink, lineHeight: 1.6 }}>{k}</code>
            <code style={{ fontSize: 11, color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums', lineHeight: 1.6, textAlign: 'right', whiteSpace: 'nowrap' }}>
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </code>
          </React.Fragment>
        ))}
      </div>
    </FoundCard>
  );
}

// ─── IconWall / UIGlyphWall ────────────────────────────────
function IconWallCard({ icons }) {
  return (
    <FoundCard>
      <FoundLabel>{`${icons.length} 個 icon · 命名 = IconDefinition.json uniqueName`}</FoundLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 8 }}>
        {icons.map(i => (
          <div key={i.id} style={{
            padding: '12px 6px', borderRadius: 8,
            background: TOKENS.surface2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <DynamicIconById iconId={i.id} size={24} color={TOKENS.ink}/>
            <code style={{ fontSize: 9.5, color: TOKENS.ink2, textAlign: 'center', wordBreak: 'break-word' }}>{i.uniqueName}</code>
            <code style={{ fontSize: 8, color: TOKENS.ink3 }}>id {i.id}</code>
          </div>
        ))}
      </div>
    </FoundCard>
  );
}

function UIGlyphWallCard() {
  // impl 在 UI 上用的 icon name（非分類/帳戶 icon）
  const uiIcons = [
    { name: 'line.3.horizontal.decrease', lib: 'SF' },
    { name: 'magnifyingglass',            lib: 'SF' },
    { name: 'gearshape',                  lib: 'SF' },
    { name: 'arrow.triangle.merge',       lib: 'SF' },
    { name: 'xmark',                      lib: 'SF' },
    { name: 'checkmark',                  lib: 'SF' },
    { name: 'chevron.right',              lib: 'SF' },
    { name: 'plus',                       lib: 'FA' },
    { name: 'minus',                      lib: 'FA' },
    { name: 'exchange',                   lib: 'FA' },
    { name: 'times',                      lib: 'FA' },
    { name: 'check',                      lib: 'FA' },
    { name: 'magnify',                    lib: 'MCI' },
    { name: 'calendar-blank-outline',     lib: 'MCI' },
    { name: 'tag-outline',                lib: 'MCI' },
    { name: 'bank-outline',               lib: 'MCI' },
    { name: 'cog-outline',                lib: 'MCI' },
    { name: 'star-outline',               lib: 'MCI' },
    { name: 'bug-outline',                lib: 'MCI' },
    { name: 'shield-account-outline',     lib: 'MCI' },
    { name: 'database-cog-outline',       lib: 'MCI' },
    { name: 'database-refresh-outline',   lib: 'MCI' },
    { name: 'archive-arrow-up-outline',   lib: 'MCI' },
    { name: 'archive-arrow-down-outline', lib: 'MCI' },
    { name: 'file-import-outline',        lib: 'MCI' },
    { name: 'file-export-outline',        lib: 'MCI' },
    { name: 'swap-horizontal',            lib: 'MCI' },
    { name: 'calendar-clock',             lib: 'MCI' },
    { name: 'backspace-outline',          lib: 'MCI' },
    { name: 'repeat',                     lib: 'MCI' },
    { name: 'arrow-right',                lib: 'MCI' },
    { name: 'arrow-left',                 lib: 'MCI' },
    { name: 'chevron-down',               lib: 'MCI' },
    { name: 'chevron-up',                 lib: 'MCI' },
    { name: 'help-circle-outline',        lib: 'MCI' },
  ];
  return (
    <FoundCard>
      <FoundLabel>UI Glyphs · 真實 icon name（impl）</FoundLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 8 }}>
        {uiIcons.map(g => (
          <div key={g.name} style={{
            padding: '12px 6px', borderRadius: 8,
            background: TOKENS.surface2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <Glyph name={g.name} size={22} color={TOKENS.ink} stroke={1.8}/>
            <code style={{ fontSize: 9.5, color: TOKENS.ink2, textAlign: 'center', wordBreak: 'break-word' }}>{g.name}</code>
            <code style={{ fontSize: 8, color: TOKENS.ink3 }}>{g.lib}</code>
          </div>
        ))}
      </div>
    </FoundCard>
  );
}

// ─── GlassDemoCard ────────────────────────────────────────
function GlassDemoCard() {
  return (
    <FoundCard style={{ background: 'linear-gradient(135deg, #4323a0, #c0b6df)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GlassView pill style={{ display: 'inline-flex', padding: '12px 20px', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <Glyph name="magnifyingglass" size={16} color={TOKENS.ink} stroke={2}/>
          <span style={{ color: TOKENS.ink, fontWeight: 500 }}>GlassView pill</span>
        </GlassView>
        <GlassView style={{ padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: 12, color: TOKENS.ink, fontWeight: 500 }}>GLASS token</div>
          <div style={{ fontSize: 11, color: TOKENS.ink2, marginTop: 6, fontVariantNumeric: 'tabular-nums', lineHeight: 1.7 }}>
            blurAmount: {GLASS.blurAmount}<br/>
            tint: {GLASS.tint}<br/>
            border: {GLASS.border}<br/>
            shadowOpacity: {GLASS.shadowOpacity}
          </div>
        </GlassView>
      </div>
    </FoundCard>
  );
}

// ─── Shared layout ─────────────────────────────────────────
function FoundCard({ children, style }) {
  return (
    <div style={{
      width: '100%', height: '100%', padding: '24px 24px',
      background: '#fff', overflow: 'auto',
      fontFamily: '-apple-system, "SF Pro Text", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      color: TOKENS.ink, ...(style || {}),
    }}>{children}</div>
  );
}
function FoundLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: 1, color: TOKENS.p500,
      textTransform: 'uppercase', marginBottom: 10, ...(style || {}),
    }}>{children}</div>
  );
}

Object.assign(window, { FoundationsSection });
