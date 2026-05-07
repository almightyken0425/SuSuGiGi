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

function App() {
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
    <DesignCanvas>
      <DCSection id="all" title="SuSuGiGi — All Screens" subtitle="Pinned views; click expand to focus.">
        {screens.map(s => (
          <DCArtboard key={s.id} id={s.id} label={s.label} width={W} height={H}>
            <IOSDevice width={W} height={H}>
              <ScreenFrame pinned={s.id} sharedFilter={sharedFilter} setSharedFilter={setSharedFilter}/>
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>

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
    </DesignCanvas>
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
            <span style={{ fontSize:18, fontWeight:600, color:TOKENS.ink, marginLeft:2 }}>May 26</span>
            <Glyph name="chevron-right" size={14} color={TOKENS.ink3} stroke={2.5}/>
          </div>
          {/* Smaller donut so list gets more room */}
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
          {/* Variant body */}
          <Variant chartMode={chartMode} collapsed={collapsed}/>
        </div>
      </div>
      <FloatingActionBar/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
