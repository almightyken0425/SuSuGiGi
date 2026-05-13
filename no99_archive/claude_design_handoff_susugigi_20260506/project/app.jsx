// App shell — design canvas with all screens laid out side-by-side
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "_": null
}/*EDITMODE-END*/;

// Each screen runs its own internal navigation (push/pop) within its frame
// — but shows the screen named by `pinned`. Filter state can be shared so
// changes in one Filter frame propagate to the Home frame.
function ScreenFrame({ pinned, sharedFilter, setSharedFilter }) {
  const [stack, setStack] = React.useState([pinned]);
  const top = stack[stack.length - 1];
  const push = (s) => setStack(st => [...st, s]);
  const pop = () => setStack(st => st.length > 1 ? st.slice(0, -1) : [pinned]);

  const screen = (() => {
    switch (top) {
      case 'home':       return <HomeScreen filterState={sharedFilter}
                                  onSearch={() => push('search')} onSettings={() => push('settings')}
                                  onFilter={() => push('filter')}/>;
      case 'filter':     return <HomeFilterScreen_V9_NegativeSpace onBack={pop} filterState={sharedFilter} setFilterState={setSharedFilter}/>;
      case 'settings':   return <SettingsScreen onBack={pop} onAccounts={() => push('accounts')} onCategories={() => push('categories')}/>;
      case 'accounts':   return <AccountsScreen onBack={pop}/>;
      case 'categories': return <CategoriesScreen onBack={pop}/>;
      case 'search':     return <SearchScreen onBack={pop}/>;
      default:           return null;
    }
  })();

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: TOKENS.bg,
      fontFamily: '-apple-system, "SF Pro", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden',
    }} data-screen-label={pinned}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {screen}
      </div>
      {top === 'home' && <FloatingActionBar onExpense={()=>{}} onTransfer={()=>{}} onIncome={()=>{}}/>}
    </div>
  );
}

// ViewTabs — 浮在 viewport 頂部的分頁切換器，用 location.hash 同步。
// 4 個主題：#all / #filter / #tx-list / #recurring
const VIEW_TABS = [
  { id: 'all',        label: 'All Screens' },
  { id: 'filter',     label: 'Filter' },
  { id: 'tx-list',    label: 'Tx List' },
  { id: 'recurring',  label: 'Recurring' },
  { id: 'row-height', label: 'Row Height' },
];
const VALID_VIEWS = VIEW_TABS.map(t => t.id);

function ViewTabs({ view, setView }) {
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, padding: 4,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: 999,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.06)',
      zIndex: 100,
      fontFamily: '-apple-system, "SF Pro", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
    }}>
      {VIEW_TABS.map(t => {
        const active = view === t.id;
        return (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            border: 'none', borderRadius: 999,
            padding: '8px 16px', cursor: 'pointer',
            fontSize: 14, fontWeight: 500,
            color: active ? '#fff' : '#212121',
            background: active ? '#4323a0' : 'transparent',
            transition: 'background 180ms, color 180ms',
            fontFamily: 'inherit',
          }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// Recurring Marker tab 內的 sub-nav，切換 round
function RecurringRoundNav({ round, setRound }) {
  const rounds = [
    { id: 'round1', label: 'Round 1 · 標記方式' },
    { id: 'round2', label: 'Round 2 · icon 細節' },
    { id: 'round3', label: 'Round 3 · wrap 細節' },
  ];
  return (
    <div style={{
      position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, padding: 3,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: 999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.06)',
      zIndex: 99,
      fontFamily: '-apple-system, "SF Pro", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
    }}>
      {rounds.map(r => {
        const active = round === r.id;
        return (
          <button key={r.id} onClick={() => setRound(r.id)} style={{
            border: 'none', borderRadius: 999,
            padding: '6px 12px', cursor: 'pointer',
            fontSize: 12, fontWeight: 500,
            color: active ? '#fff' : '#212121',
            background: active ? '#4323a0' : 'transparent',
            transition: 'background 180ms, color 180ms',
            fontFamily: 'inherit',
          }}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function App() {
  // hash router：#all / #filter / #tx-list / #recurring
  const [view, setView] = React.useState(() => {
    const h = window.location.hash.replace('#', '');
    return VALID_VIEWS.includes(h) ? h : 'all';
  });
  React.useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      setView(VALID_VIEWS.includes(h) ? h : 'all');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const updateView = (v) => { if (v !== view) window.location.hash = v; };

  // Recurring Marker tab 內的 round sub-nav state
  const [recurRound, setRecurRound] = React.useState('round1');

  // Shared filter state across the Home + Filter frames
  const [sharedFilter, setSharedFilter] = React.useState({
    timeGranularity: 'month',
    groupBy: 'date',
    selectedAccountIds: ACCOUNTS.map(a => a.id),
  });

  const W = 402, H = 874;
  const screens = [
    { id: 'home',       label: 'Home — 記帳' },
    { id: 'filter',     label: 'Home Filter — 篩選' },
    { id: 'search',     label: 'Search — 搜尋' },
    { id: 'settings',   label: 'Settings — 設定' },
    { id: 'accounts',   label: 'Accounts — 帳戶' },
    { id: 'categories', label: 'Categories — 分類' },
  ];

  return (
    <>
      <ViewTabs view={view} setView={updateView}/>
      {view === 'recurring' && <RecurringRoundNav round={recurRound} setRound={setRecurRound}/>}
      <DesignCanvas>
        {view === 'all' && (
          <DCSection id="all" title="SuSuGiGi — All Screens" subtitle="Pinned views; click expand to focus.">
            {screens.map(s => (
              <DCArtboard key={s.id} id={s.id} label={s.label} width={W} height={H}>
                <IOSDevice width={W} height={H}>
                  <ScreenFrame pinned={s.id} sharedFilter={sharedFilter} setSharedFilter={setSharedFilter}/>
                </IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>
        )}

        {view === 'filter' && (
          <DCSection id="filter-proposals" title="Home Filter 提案" subtitle="V1–V5 第一輪視覺區隔，V6–V9 第二輪無文字 + 對稱化迭代。All Screens 採用 V9 · Negative space。">
        {[
          { id: 'fv1', label: 'V1 · Section headers',  V: HomeFilterScreen_V1_SectionHeaders },
          { id: 'fv2', label: 'V2 · Container wrap',   V: HomeFilterScreen_V2_ContainerWrap },
          { id: 'fv3', label: 'V3 · Hairline divider', V: HomeFilterScreen_V3_Divider },
          { id: 'fv4', label: 'V4 · Inset tray',       V: HomeFilterScreen_V4_InsetTray },
          { id: 'fv5', label: 'V5 · Pill summary',     V: HomeFilterScreen_V5_PillSummary },
          { id: 'fv6', label: 'V6 · Short divider',    V: HomeFilterScreen_V6_ShortDivider },
          { id: 'fv7', label: 'V7 · Dot divider',      V: HomeFilterScreen_V7_DotDivider },
          { id: 'fv8', label: 'V8 · Symmetric trays',  V: HomeFilterScreen_V8_SymmetricTrays },
          { id: 'fv9', label: 'V9 · Negative space ★', V: HomeFilterScreen_V9_NegativeSpace },
        ].map(v => (
          <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
            <IOSDevice width={W} height={H}>
              <FilterVariantFrame Variant={v.V}/>
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>
        )}

        {view === 'tx-list' && (
          <DCSection id="tx-list-proposals" title="Transaction List 提案" subtitle="第一輪 V1/V2/V7 結構初探 → 第二輪 R1–R5 層次感探索 → 第三輪 R6–R10 morph + 區隔修正（可點 header 收合，含 morph 動畫）。All Screens 採用 R10 · Outlined frame refined。">
        {[
          { id: 'tx1', label: 'V1 · Timeline rail',  Date: TxV1_ByDate, Cat: TxV1_ByCategory },
          { id: 'tx2', label: 'V2 · Card stack',     Date: TxV2_ByDate, Cat: TxV2_ByCategory },
          { id: 'tx7', label: 'V7 · Two-line',       Date: TxV7_ByDate, Cat: TxV7_ByCategory },
          { id: 'r1',  label: 'R1 · Morph header',   Date: TxR1_ByDate, Cat: TxR1_ByCategory },
          { id: 'r2',  label: 'R2 · Indent rhythm',  Date: TxR2_ByDate, Cat: TxR2_ByCategory },
          { id: 'r3',  label: 'R3 · Tinted band',    Date: TxR3_ByDate, Cat: TxR3_ByCategory },
          { id: 'r4',  label: 'R4 · Left bar',       Date: TxR4_ByDate, Cat: TxR4_ByCategory },
          { id: 'r5',  label: 'R5 · Inverted band',  Date: TxR5_ByDate, Cat: TxR5_ByCategory },
        ].flatMap(v => [
          <DCArtboard key={v.id+'-d'} id={v.id+'-d'} label={v.label + ' — 依日期'} width={W} height={H}>
            <IOSDevice width={W} height={H}><TxListPreviewFrame Variant={v.Date} collapsedIds={['date_Apr 30','date_Apr 29']}/></IOSDevice>
          </DCArtboard>,
          <DCArtboard key={v.id+'-c'} id={v.id+'-c'} label={v.label + ' — 依分類'} width={W} height={H}>
            <IOSDevice width={W} height={H}><TxListPreviewFrame Variant={v.Cat} collapsedIds={['cat_health','cat_ent','cat_trans']}/></IOSDevice>
          </DCArtboard>,
        ])}
        {[
          { id: 'r6',  label: 'R6 · Morph + Inverted band',     Date: TxR6_ByDate,  Cat: TxR6_ByCategory },
          { id: 'r7',  label: 'R7 · Modern category tint',      Date: TxR7_ByDate,  Cat: TxR7_ByCategory },
          { id: 'r8',  label: 'R8 · Outlined frame',            Date: TxR8_ByDate,  Cat: TxR8_ByCategory },
          { id: 'r9',  label: 'R9 · Layered tone',              Date: TxR9_ByDate,  Cat: TxR9_ByCategory, appBg: '#E5E5EA' },
          { id: 'r10', label: 'R10 · Outlined frame refined ★', Date: TxR10_ByDate, Cat: TxR10_ByCategory },
        ].flatMap(v => [
          <DCArtboard key={v.id+'-d'} id={v.id+'-d'} label={v.label + ' — 依日期'} width={W} height={H}>
            <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.Date} initialCollapsed={['date_Apr 30','date_Apr 29']} appBg={v.appBg}/></IOSDevice>
          </DCArtboard>,
          <DCArtboard key={v.id+'-c'} id={v.id+'-c'} label={v.label + ' — 依分類'} width={W} height={H}>
            <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.Cat} initialCollapsed={['cat_health','cat_ent','cat_trans']} appBg={v.appBg}/></IOSDevice>
          </DCArtboard>,
        ])}
      </DCSection>
        )}

        {view === 'row-height' && <>
          <DCSection id="tx-list-row-height-data" title="Data Row Height 提案 (H 系列)" subtitle="現行實作 transactionRow 約 64–66px / Prototype R10 baseline 約 60px。H0 為 R10 對照組（敲定）；H1–H5 依不同策略往下減高（padding diet / 合併單行 / 縮字級 / 右靠 metadata / 極簡）。每個 artboard 標題後標 row 預估高度。">
            {[
              { id: 'rh-h0', label: 'H0 · Current ★（R10 baseline，~60px，已敲定）', V: TxRH_H0_Current },
              { id: 'rh-h1', label: 'H1 · Padding diet（padding 12→8，~52px）',      V: TxRH_H1_PadDiet },
              { id: 'rh-h2', label: 'H2 · Single line（note · account 合併，~44px）', V: TxRH_H2_SingleLine },
              { id: 'rh-h3', label: 'H3 · Compact type（字級縮一號，~46px）',         V: TxRH_H3_CompactType },
              { id: 'rh-h4', label: 'H4 · Right meta（account 移到金額下方，~50px）', V: TxRH_H4_RightMeta },
              { id: 'rh-h5', label: 'H5 · Minimal（極瘦，~38px）',                   V: TxRH_H5_Minimal },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>

          <DCSection id="tx-list-row-height-collapsed" title="Collapsed Section Header Height 提案 (CH 系列)" subtitle="實作 collapsed section header 約 60px（pad 14 / icon 32 / title 17 / total 15）。每個 artboard 預設把 6 個分類全部收合，看一個畫面塞幾個 header；by-category 模式為主，因為 header 數量最多。CH0 為對照；CH1–CH5 依不同策略往下減高。">
            {[
              { id: 'rh-ch0', label: 'CH0 · Current（pad 14 / icon 32 / title 17，~60px）',    V: TxCH_CH0_Current },
              { id: 'rh-ch1', label: 'CH1 · Padding diet（pad 14→10，~52px）',                  V: TxCH_CH1_PadDiet },
              { id: 'rh-ch2', label: 'CH2 · Icon shrink（icon 32→28，~56px）',                  V: TxCH_CH2_IconShrink },
              { id: 'rh-ch3', label: 'CH3 · Match data row（pad 14→12，~56px，跟 H0 對齊）',     V: TxCH_CH3_MatchRow },
              { id: 'rh-ch4', label: 'CH4 · Compact（pad 10 / icon 24 / title 15，~44px）',      V: TxCH_CH4_Compact },
              { id: 'rh-ch5', label: 'CH5 · Tight（pad 8 / icon 22 / title 14，~38px）',         V: TxCH_CH5_Tight },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={CH_INITIAL_COLLAPSED}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>
        </>}

        {view === 'recurring' && <>
        {recurRound === 'round1' && (
          <DCSection id="tx-list-recurring-round1" title="Recurring Marker · Round 1（標記方式，已收斂）" subtitle="比較標記方式。R11 徽章太小、R13 底色不直觀皆已否決；R12（文字前）與 R14（金額左）為 inline tag 對照。收斂結論：採 R14 — icon 並列「主金額 + 換算金額」整包左側、垂直置中。Mock 中 5/2 捷運月票、4/30 4 月薪資、4/29 電費、5/1 Netflix 為 recurring。">
            {[
              { id: 'r14-d', label: 'R14 · Inline · before amount ★（金額前，主推）', V: TxR14_ByDate },
              { id: 'r12-d', label: 'R12 · Inline · before primary（文字前，對照）',  V: TxR12_ByDate },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>
        )}

        {recurRound === 'round2' && (
          <DCSection id="tx-list-recurring-round2-final" title="Recurring Marker · Round 2（icon 細節，已收斂）" subtitle="size / color / shape / background / gap 5 維度個別比較後敲定。Baseline = size 14 / secondary / repeat / none / gap 4；Final ★ = size 16 / sync / ink3 / gray fill / gap 14。觀察 5/1 Netflix（多幣別 + recurring）一行。">
            {[
              { id: 'r5-baseline', label: 'Baseline（size 14 / secondary / repeat / none / gap 4）',  V: TxR5_Size14 },
              { id: 'r5-final',    label: 'Final ★（size 16 / sync / ink3 / gray fill / gap 14）',    V: TxR5_Combined_Gap14 },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>
        )}

        {recurRound === 'round3' && <>
          <DCSection id="tx-list-recurring-round3-playground" title="Recurring Marker · Round 3 · 🎛 Playground（自己調參數）" subtitle="改 tx-list-round5.jsx 頂端的 R5_PLAYGROUND 物件，存檔後 reload 瀏覽器看結果。每個 key 都有註解說明可選值與影響。下面 4 個 section 是固定變體，這個是即時可調的。">
            {[
              { id: 'r5-playground', label: '🎛 Playground（看 R5_PLAYGROUND）', V: TxR5_Playground },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>

          <DCSection id="tx-list-recurring-round3-wrap-shape" title="Recurring Marker · Round 3 · Wrap Shape" subtitle="在 Round 2 敲定組合上比較 wrap 形狀。Circle ★ 為現行；rounded square 兩種半徑 + 直角方形作對照。觀察 5/1 Netflix 那筆 wrap 的外形語意。">
            {[
              { id: 'r5-ws-c',  label: 'Circle ★（現行）',     V: TxR5_Wrap_ShapeCircle },
              { id: 'r5-ws-r6', label: 'Rounded 6px',         V: TxR5_Wrap_ShapeRounded6 },
              { id: 'r5-ws-r4', label: 'Rounded 4px',         V: TxR5_Wrap_ShapeRounded4 },
              { id: 'r5-ws-sq', label: 'Square sharp',        V: TxR5_Wrap_ShapeSquare },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>

          <DCSection id="tx-list-recurring-round3-wrap-padding" title="Recurring Marker · Round 3 · Wrap Padding" subtitle="glyph 跟 wrap 邊的單側 padding。3px ★ 為現行（總 wrap 直徑 = 16 + 6 = 22px）。padding 越大 wrap 越鬆、像徽章；越小越緊湊。">
            {[
              { id: 'r5-wp-2', label: 'Padding 2px（緊）',          V: TxR5_Wrap_Padding2 },
              { id: 'r5-wp-3', label: 'Padding 3px ★（現行）',      V: TxR5_Wrap_Padding3 },
              { id: 'r5-wp-4', label: 'Padding 4px',               V: TxR5_Wrap_Padding4 },
              { id: 'r5-wp-5', label: 'Padding 5px（鬆）',          V: TxR5_Wrap_Padding5 },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>

          <DCSection id="tx-list-recurring-round3-wrap-bg" title="Recurring Marker · Round 3 · Wrap Background Color" subtitle="比較 wrap 填色。Gray bg ★ 為現行（TOKENS.bg = #F2F2F7）。Surface2 更淡、p50 帶主色紫淡、ink3-alpha 用 ink3 加透明度。">
            {[
              { id: 'r5-wb-g',  label: 'Gray bg ★（現行，#F2F2F7）',          V: TxR5_Wrap_BgGray },
              { id: 'r5-wb-s2', label: 'Surface2（#F5F5F5，更淡）',           V: TxR5_Wrap_BgSurface2 },
              { id: 'r5-wb-p',  label: 'P50（主色淡紫 #f0ecfa）',              V: TxR5_Wrap_BgP50 },
              { id: 'r5-wb-a',  label: 'Ink3 alpha（rgba(189,189,189,0.3)）', V: TxR5_Wrap_BgInk3Alpha },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>

          <DCSection id="tx-list-recurring-round3-wrap-border" title="Recurring Marker · Round 3 · Wrap Border" subtitle="在 gray fill 之上疊邊框。None ★ 為現行（只填色）。Hairline divider 是淡邊、Hairline ink3 是中灰邊，會把 wrap 跟周圍視覺切得更清楚。">
            {[
              { id: 'r5-wbr-n', label: 'None ★（現行）',           V: TxR5_Wrap_BorderNone },
              { id: 'r5-wbr-d', label: 'Hairline divider（淡邊）',  V: TxR5_Wrap_BorderDivider },
              { id: 'r5-wbr-i', label: 'Hairline ink3（中灰邊）',   V: TxR5_Wrap_BorderInk3 },
            ].map(v => (
              <DCArtboard key={v.id} id={v.id} label={v.label} width={W} height={H}>
                <IOSDevice width={W} height={H}><InteractiveTxPreview Variant={v.V} initialCollapsed={[]}/></IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>
        </>}
        </>}
      </DesignCanvas>
    </>
  );
}

// Each filter variant gets its own isolated state so 5 frames don't share a
// selection — lets you compare interactions independently.
function FilterVariantFrame({ Variant }) {
  const [filterState, setFilterState] = React.useState({
    timeGranularity: 'month',
    groupBy: 'date',
    selectedAccountIds: ACCOUNTS.map(a => a.id),
  });
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: TOKENS.bg,
      fontFamily: '-apple-system, "SF Pro", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <Variant onBack={()=>{}} filterState={filterState} setFilterState={setFilterState}/>
      </div>
    </div>
  );
}

// TxListPreviewFrame — gives each tx-list variant the SAME context as the
// real Home screen (header + period switcher + small donut + focus row),
// then renders the variant body below. Keeps the comparison apples-to-apples.
function TxListPreviewFrame({ Variant, collapsedIds = [] }) {
  const [chartMode, setChartMode] = React.useState('expense');
  const collapsed = React.useMemo(() => new Set(collapsedIds), [collapsedIds.join(',')]);
  const totals = periodTotals(TX);
  const pData = pieData(TX);
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: TOKENS.bg,
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
          {/* Period switcher */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, paddingTop:8, paddingBottom:4 }}>
            <Glyph name="chevron-left" size={14} color={TOKENS.ink3} stroke={2.5}/>
            <Glyph name="calendar" size={13} color={TOKENS.ink2} stroke={2}/>
            <span style={{ fontSize:18, fontWeight:500, color:TOKENS.ink, marginLeft:2 }}>May 26</span>
            <Glyph name="chevron-right" size={14} color={TOKENS.ink3} stroke={2.5}/>
          </div>
          {/* Smaller donut so list gets more room */}
          <div style={{ display:'flex', justifyContent:'center', margin:'4px 0 8px' }}>
            <DonutChart data={pData.map(d => ({ key: d.id, value: d.value, color: d.color }))} size={140} thickness={20}>
              <div style={{ textAlign:'center', width:80 }}>
                <div style={{ fontSize:11, color:TOKENS.ink2 }}>結餘</div>
                <div style={{ fontSize:15, fontWeight:500, color:TOKENS.ink, fontVariantNumeric:'tabular-nums' }}>{fmt(totals.balance)}</div>
              </div>
            </DonutChart>
          </div>
          <div style={{ display:'flex', gap:12, padding:'0 16px 12px' }}>
            <FocusCard kind="expense" amount={totals.expense} active={chartMode==='expense'} onPress={()=>setChartMode('expense')}/>
            <FocusCard kind="income"  amount={totals.income}  active={chartMode==='income'}  onPress={()=>setChartMode('income')}/>
          </div>
          {/* Variant body */}
          <Variant chartMode={chartMode} collapsed={collapsed}/>
        </div>
      </div>
      <FloatingActionBar/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
