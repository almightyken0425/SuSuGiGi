// ─────────────────────────────────────────────────────────────
// Components Showcase · 元件視覺化（對齊 impl src/components/*）
// 改 components.jsx 中的元件 → 此 tab 自動更新。
// ─────────────────────────────────────────────────────────────

function ComponentsShowcaseSection() {
  return (
    <>
      <DCSection id="comp-list" title="List · src/components/list/" subtitle="iOS 風格 grouped list 元件，是整個 app 最常用的構件。每個 row 都有 borderTop hairline，第一個被 ListGroupCard overflow: hidden clip 掉。">
        <DCArtboard id="comp-listitem" label="ListItem · 變體" width={402} height={620}>
          <CompFrame>
            <CompLabel>ListItem 不同組合</CompLabel>
            <div style={{ padding: SPACING[4] }}>
              <ListGroupCard>
                <ListItem leftIcon={<Glyph name="tag-outline" size={20} color={TOKENS.ink} stroke={1.8}/>}
                  title="只有 title"/>
                <ListItem leftIcon={<Glyph name="bank-outline" size={20} color={TOKENS.ink} stroke={1.8}/>}
                  title="title + subtitle" subtitle="輔助說明文字"/>
                <ListItem leftIcon={<Glyph name="cog-outline" size={20} color={TOKENS.ink} stroke={1.8}/>}
                  title="title + value + chevron" value="NT$1,200" showChevron/>
                <ListItem title="無 leftIcon · divider 縮到 16px" showChevron/>
                <ListItem leftIcon={<Glyph name="star-outline" size={20} color={TOKENS.p500} stroke={1.8}/>}
                  title="titleColor = primary" titleColor={TOKENS.p500} showChevron/>
                <ListItem leftIcon={<Glyph name="trash" size={20} color={TOKENS.error} stroke={1.8}/>}
                  title="destructive (error 色)" titleColor={TOKENS.error}/>
                <ListItem leftIcon={<Glyph name="bug-outline" size={20} color={TOKENS.ink} stroke={1.8}/>}
                  title="disabled state" disabled/>
              </ListGroupCard>
            </div>
          </CompFrame>
        </DCArtboard>

        <DCArtboard id="comp-selection-list" label="SelectionListItem · 選擇列" width={402} height={500}>
          <CompFrame>
            <CompLabel>用於 ThemeSettings / Language / Timezone</CompLabel>
            <div style={{ padding: SPACING[4] }}>
              <ListGroupCard>
                <SelectionListItem title="繁體中文" selected/>
                <SelectionListItem title="English"/>
                <SelectionListItem title="日本語"/>
              </ListGroupCard>
            </div>
          </CompFrame>
        </DCArtboard>

        <DCArtboard id="comp-reorderable" label="ReorderableListItem · 60px 拖拉列" width={402} height={500}>
          <CompFrame>
            <CompLabel>用於 AccountList / CategoryList — 無 drag handle（整列可拖）</CompLabel>
            <div style={{ padding: SPACING[4] }}>
              <ListGroupCard>
                {ACCOUNTS.map(a => (
                  <ReorderableListItem key={a.id}
                    leftIcon={<DynamicIconById iconId={a.iconId} size={20} color={TOKENS.ink}/>}
                    title={a.name} subtitle={a.currency}
                    style={{ height: 60 }}/>
                ))}
              </ListGroupCard>
            </div>
          </CompFrame>
        </DCArtboard>

        <DCArtboard id="comp-grid" label="SelectionGridItem · 卡片風格" width={402} height={500}>
          <CompFrame>
            <CompLabel>用於 ThemeSettings — preview 區（aspectRatio 1.4）+ title + check-circle 右上角</CompLabel>
            <div style={{ padding: SPACING[4], display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ width: '47%' }}>
                <SelectionGridItem title="經典紫 (Classic Purple)" selected onPress={()=>{}}>
                  <div style={{ flex: 1, background: THEME_1.primary[500] }}/>
                  <div style={{ flex: 1, background: THEME_1.primary[900] }}/>
                  <div style={{ flex: 1, background: THEME_1.bg.base }}/>
                </SelectionGridItem>
              </div>
              <div style={{ width: '47%' }}>
                <SelectionGridItem title="海洋藍 (Ocean Teal)" onPress={()=>{}}>
                  <div style={{ flex: 1, background: THEME_2.primary[500] }}/>
                  <div style={{ flex: 1, background: THEME_2.primary[900] }}/>
                  <div style={{ flex: 1, background: THEME_2.bg.base }}/>
                </SelectionGridItem>
              </div>
            </div>
          </CompFrame>
        </DCArtboard>

        <DCArtboard id="comp-section-title" label="ListSection · 標題" width={402} height={400}>
          <CompFrame>
            <CompLabel>ListSectionTitle 是可選的 — impl 大多 ListSection 都沒 title</CompLabel>
            <div style={{ padding: SPACING[4] }}>
              <ListSectionTitle>資料管理</ListSectionTitle>
              <ListGroupCard>
                <ListItem title="管理類別" showChevron/>
                <ListItem title="管理帳戶" showChevron/>
              </ListGroupCard>
            </div>
          </CompFrame>
        </DCArtboard>

        <DCArtboard id="comp-empty" label="ListEmptyState" width={402} height={500}>
          <CompFrame>
            <div style={{ padding: 80 }}>
              <ListEmptyState iconName="magnify" title="找不到結果" description="「USD」"/>
            </div>
          </CompFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="comp-nav" title="Navigation · header / FAB / search" subtitle="放在 screen 邊界的元件。Header 透明背景對齊 impl headerTransparent: true。">
        <DCArtboard id="comp-navheader" label="NavHeader · push 模式" width={402} height={120}>
          <CompFrame>
            <NavHeader title="設定" leadingText=""
              trailing={<HeaderIconButton symbol="arrow.triangle.merge" color={TOKENS.p500} onPress={() => {}}/>}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-navheader-home" label="NavHeader · Home" width={402} height={120}>
          <CompFrame>
            <NavHeader title="SuSuGiGi"
              trailing={
                <div style={{ display: 'flex', gap: 4 }}>
                  <HeaderIconButton symbol="line.3.horizontal.decrease" onPress={() => {}}/>
                  <HeaderIconButton symbol="magnifyingglass" onPress={() => {}}/>
                  <HeaderIconButton symbol="gearshape" onPress={() => {}}/>
                </div>
              }/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-modalheader" label="ModalHeader · fullScreenModal" width={402} height={120}>
          <CompFrame>
            <ModalHeader title="新增支出" onClose={()=>{}} onSave={()=>{}}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-fab-actions" label="FloatingActionBar · actions" width={402} height={160}>
          <CompFrame style={{ position: 'relative', height: 160, background: TOKENS.bg }}>
            <FloatingActionBar mode="actions" onExpensePress={()=>{}} onTransferPress={()=>{}} onIncomePress={()=>{}}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-fab-undo" label="FloatingActionBar · undo" width={402} height={160}>
          <CompFrame style={{ position: 'relative', height: 160, background: TOKENS.bg }}>
            <FloatingActionBar mode="undo" undoMessage="已刪除交易" remainingTime={4}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-search-pill" label="BottomSearchBar · GlassView pill" width={402} height={140}>
          <CompFrame style={{ position: 'relative', background: TOKENS.bg }}>
            <BottomSearchBar value="" onChangeText={()=>{}} placeholder="搜尋..."/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-modal-close" label="ModalCloseButton · X" width={402} height={80}>
          <CompFrame style={{ display: 'flex', alignItems: 'center', padding: 16 }}>
            <ModalCloseButton onPress={()=>{}}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-header-icon-btn" label="HeaderIconButton · SF Symbol" width={402} height={80}>
          <CompFrame style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 16 }}>
            <HeaderIconButton symbol="line.3.horizontal.decrease" color={TOKENS.p500} onPress={() => {}}/>
            <HeaderIconButton symbol="magnifyingglass" color={TOKENS.p500} onPress={() => {}}/>
            <HeaderIconButton symbol="gearshape" color={TOKENS.p500} onPress={() => {}}/>
            <HeaderIconButton symbol="arrow.triangle.merge" color={TOKENS.p500} onPress={() => {}}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-header-check" label="HeaderCheckmarkButton" width={402} height={80}>
          <CompFrame style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
            <HeaderCheckmarkButton onPress={()=>{}}/>
            <HeaderCheckmarkButton onPress={()=>{}} disabled/>
          </CompFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="comp-chart" title="Chart / Data display" subtitle="DonutChart 是 Home 中央視覺核心。SIZE 260, OUTER 100, INNER 76, CORNER 6, PAD_ANGLE 1deg。FocusCard 切換 expense / income 模式。">
        <DCArtboard id="comp-donut" label="DonutChart" width={402} height={360}>
          <CompFrame style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <DonutChart data={pieData(TX).map(d => ({ key: d.id, value: d.value, color: d.color }))}>
              <div style={{ textAlign: 'center', width: 100 }}>
                <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, marginBottom: 4 }}>餘額</div>
                <div style={{
                  fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.medium,
                  color: TOKENS.ink, fontVariantNumeric: 'tabular-nums',
                }}>{fmt(periodTotals(TX).balance)}</div>
              </div>
            </DonutChart>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-focus" label="FocusCard · active / inactive" width={402} height={180}>
          <CompFrame style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <FocusCard kind="expense" amount={4395} active onPress={()=>{}}/>
              <FocusCard kind="income"  amount={68000} active={false} onPress={()=>{}}/>
            </div>
          </CompFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="comp-input" title="Input / Controls" subtitle="Switch / CalculatorKeypad / GlassView。CalculatorKeypad 是完整四則運算鍵盤，operator 用 primary[100]*0.5 玻璃染色。">
        <DCArtboard id="comp-switch" label="Switch · iOS 樣式" width={402} height={140}>
          <CompFrame style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
            <SwitchDemo defaultValue={true}/>
            <SwitchDemo defaultValue={false}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-keypad" label="CalculatorKeypad · 1-2-3-+ / 4-5-6-− / 7-8-9-× / .-0-=-÷" width={402} height={320}>
          <CompFrame style={{ padding: 0 }}>
            <CalculatorKeypad onPress={()=>{}}/>
          </CompFrame>
        </DCArtboard>
        <DCArtboard id="comp-glass" label="GlassView · pill" width={402} height={140}>
          <CompFrame style={{ padding: 24, background: 'linear-gradient(135deg, #4323a0, #c0b6df)' }}>
            <GlassView pill style={{ padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Glyph name="line.3.horizontal.decrease" size={16} color={TOKENS.ink} stroke={2}/>
              <span style={{ color: TOKENS.ink, fontWeight: 500 }}>Glass pill</span>
            </GlassView>
          </CompFrame>
        </DCArtboard>
      </DCSection>
    </>
  );
}

function SwitchDemo({ defaultValue }) {
  const [v, setV] = React.useState(defaultValue);
  return <Switch value={v} onChange={setV}/>;
}

function CompFrame({ children, style = {} }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: TOKENS.bg, overflow: 'hidden',
      fontFamily: '-apple-system, "SF Pro Text", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      color: TOKENS.ink, ...style,
    }}>{children}</div>
  );
}
function CompLabel({ children }) {
  return (
    <div style={{
      padding: '12px 16px 6px',
      fontSize: 11, fontWeight: 600, letterSpacing: 1, color: TOKENS.ink3,
      textTransform: 'uppercase',
    }}>{children}</div>
  );
}

Object.assign(window, { ComponentsShowcaseSection });
