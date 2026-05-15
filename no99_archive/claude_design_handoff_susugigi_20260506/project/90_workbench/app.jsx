// ─────────────────────────────────────────────────────────────
// App shell · 設計工作台 router
//
// 頂部 5 個 tab：
//   #intro / #foundations / #components / #screens / #explorations
//
// SCREEN_META 中央定義每個 screen 的：
//   - title           NavBar 標題
//   - present         'push' | 'modal' | 'none'  → 對應 impl 的 navigation presentation
//   - headerLeftText  push 模式回上頁的文字（例如 '設定'）
//   - headerRight     header 右側元素（merge / search / settings 等）
//   - hasFAB          是否顯示 FloatingActionBar
//   - render          (ctx) => screen body JSX，ctx 提供 push / pop / sharedFilter 等
//
// SCREEN_LIST 是 Screens tab 要顯示的 pinned id 順序。
// 想要鳥瞰全貌：用畫布的縮放（trackpad 二指捏合 / Ctrl+滾輪）拉遠即可。
// ─────────────────────────────────────────────────────────────

function PushHeader({ title, leadingText, leadingAction, trailing }) {
  return <NavHeader title={title} leadingText={leadingText} leadingAction={leadingAction} trailing={trailing}/>;
}

const SCREEN_META = {
  // ─── Home ─── default / 邊界狀態
  home: {
    title: 'SuSuGiGi', present: 'push', hasFAB: true,
    render: (ctx) => <HomeScreen filterState={ctx.sharedFilter}/>,
    headerLeft: (ctx) => <HeaderIconButton symbol="line.3.horizontal.decrease" onPress={() => ctx.push('filter')}/>,
    headerRight: (ctx) => (
      <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
        <HeaderIconButton symbol="magnifyingglass" onPress={() => ctx.push('search')}/>
        <HeaderIconButton symbol="gearshape" onPress={() => ctx.push('settings')}/>
      </div>
    ),
  },
  'home-empty': {
    title: 'SuSuGiGi', present: 'push', hasFAB: true,
    render: (ctx) => <HomeScreen filterState={ctx.sharedFilter} variant="empty"/>,
    headerLeft: (ctx) => <HeaderIconButton symbol="line.3.horizontal.decrease" onPress={() => ctx.push('filter')}/>,
    headerRight: (ctx) => (
      <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
        <HeaderIconButton symbol="magnifyingglass" onPress={() => ctx.push('search')}/>
        <HeaderIconButton symbol="gearshape" onPress={() => ctx.push('settings')}/>
      </div>
    ),
  },
  // ─── Filter ─── default / no-accounts
  filter: {
    title: '顯示設定', present: 'modal',
    render: (ctx) => <HomeFilterScreen filterState={ctx.sharedFilter} setFilterState={ctx.setSharedFilter}/>,
  },
  'filter-no-accounts': {
    title: '顯示設定', present: 'modal',
    render: (ctx) => <HomeFilterScreen filterState={ctx.sharedFilter} setFilterState={ctx.setSharedFilter} variant="no-accounts"/>,
  },
  // ─── Search ─── default(initial) / with-results / no-results / loading
  search: {
    title: '搜尋', present: 'modal',
    render: () => <SearchScreen/>,
  },
  'search-with-results': {
    title: '搜尋', present: 'modal',
    render: () => <SearchScreen variant="with-results"/>,
  },
  'search-no-results': {
    title: '搜尋', present: 'modal',
    render: () => <SearchScreen variant="no-results"/>,
  },
  'search-loading': {
    title: '搜尋', present: 'modal',
    render: () => <SearchScreen variant="loading"/>,
  },
  // ─── Transaction Editor ─── default / income / error
  'tx-editor': {
    title: '新增支出', present: 'modal', save: true,
    render: () => <TransactionEditorScreen type="expense"/>,
  },
  'tx-editor-income': {
    title: '新增收入', present: 'modal', save: true,
    render: () => <TransactionEditorScreen type="income"/>,
  },
  'tx-editor-error': {
    title: '新增支出', present: 'modal', save: true,
    render: () => <TransactionEditorScreen type="expense" variant="error"/>,
  },
  transfer: {
    title: '新增轉帳', present: 'modal', save: true,
    render: () => <TransferEditorScreen/>,
  },
  // ─── Login ─── default / loading
  login: {
    title: '', present: 'none',
    render: () => <LoginScreen/>,
  },
  'login-loading': {
    title: '', present: 'none',
    render: () => <LoginScreen variant="loading"/>,
  },
  settings: {
    title: '設定', present: 'push', headerLeftText: '',
    render: (ctx) => <SettingsScreen
      onAccounts={() => ctx.push('accounts')}
      onCategories={() => ctx.push('categories')}
      onPreference={() => ctx.push('preference')}
      onPaywall={() => ctx.push('paywall')}
      onData={() => ctx.push('data-mgmt')}
      onDebug={() => ctx.push('debug')}
    />,
  },
  preference: {
    title: '偏好設定', present: 'push', headerLeftText: '',
    render: (ctx) => <PreferenceScreen
      onTheme={() => ctx.push('theme')}
      onLaunch={() => ctx.push('launchmode')}
      onCurrency={() => ctx.push('currency')}
      onCurrencyList={() => ctx.push('currlist')}
      onRateList={() => ctx.push('ratelist')}
      onLanguage={() => ctx.push('language')}
      onTimezone={() => ctx.push('timezone')}
    />,
  },
  // ─── Paywall ─── default / loading
  paywall: {
    title: '解鎖 Premium', present: 'modal',
    render: () => <PaywallScreen/>,
  },
  'paywall-loading': {
    title: '解鎖 Premium', present: 'modal',
    render: () => <PaywallScreen variant="loading"/>,
  },
  // ─── Accounts ─── default / empty
  accounts: {
    title: '帳戶', present: 'push', headerLeftText: '',
    render: (ctx) => <AccountListScreen onAdd={() => ctx.push('acc-editor')}/>,
    headerRight: () => <HeaderIconButton symbol="arrow.triangle.merge" color={TOKENS.p500} onPress={() => {}}/>,
  },
  'accounts-empty': {
    title: '帳戶', present: 'push', headerLeftText: '',
    render: (ctx) => <AccountListScreen onAdd={() => ctx.push('acc-editor')} variant="empty"/>,
    headerRight: () => <HeaderIconButton symbol="arrow.triangle.merge" color={TOKENS.p500} onPress={() => {}}/>,
  },
  'acc-editor': {
    title: '新增帳戶', present: 'modal', save: true,
    render: () => <AccountEditorScreen isNew/>,
  },
  'acc-editor-edit': {
    title: '編輯帳戶', present: 'modal', save: true,
    render: () => <AccountEditorScreen isNew={false}/>,
  },
  categories: {
    title: '類別', present: 'push', headerLeftText: '',
    render: (ctx) => <CategoryListScreen
      onAddExpense={() => ctx.push('cat-editor')}
      onAddIncome={() => ctx.push('cat-editor')}/>,
    headerRight: () => <HeaderIconButton symbol="arrow.triangle.merge" color={TOKENS.p500} onPress={() => {}}/>,
  },
  'cat-editor': {
    title: '新增類別', present: 'modal', save: true,
    render: () => <CategoryEditorScreen isNew type="expense"/>,
  },
  'cat-editor-edit': {
    title: '編輯類別', present: 'modal', save: true,
    render: () => <CategoryEditorScreen isNew={false} type="expense"/>,
  },
  theme: {
    title: '主題', present: 'modal', save: true,
    render: () => <ThemeSettingsScreen/>,
  },
  language: {
    title: '語言', present: 'modal', save: true,
    render: () => <LanguageSettingScreen/>,
  },
  timezone: {
    title: '時區', present: 'modal', save: true,
    render: () => <TimeZoneSettingScreen/>,
  },
  launchmode: {
    title: '啟動設定', present: 'modal', save: true,
    render: () => <LaunchModeSettingScreen/>,
  },
  currency: {
    title: '基準貨幣', present: 'modal', save: true,
    render: () => <BaseCurrencySettingScreen/>,
  },
  currlist: {
    title: '貨幣設定', present: 'push', headerLeftText: '',
    render: () => <CurrencyListScreen/>,
  },
  ratelist: {
    title: '匯率管理', present: 'push', headerLeftText: '',
    render: () => <CurrencyRateListScreen/>,
  },
  'ratelist-empty': {
    title: '匯率管理', present: 'push', headerLeftText: '',
    render: () => <CurrencyRateListScreen variant="empty"/>,
  },
  'data-mgmt': {
    title: '資料管理', present: 'push', headerLeftText: '',
    render: () => <DataManagementScreen/>,
  },
  debug: {
    title: 'Debug Info', present: 'push', headerLeftText: '',
    render: () => <DebugInfoScreen/>,
  },
};

// SCREEN_GROUPS — Screens tab 顯示結構
// 一種 screen = 一個 group = 一個 DCSection（水平列）；
// 同一 group 內排 default + 各種邊界狀態（空 / 載入 / 錯誤 / 模式變體）；
// 不同 screen 之間是垂直堆疊的 sections。
//
// 新增/移除 screen 時更新此陣列；要新邊界狀態同步加 SCREEN_META + 在對應 group.screens 加一筆。
const SCREEN_GROUPS = [
  {
    id: 'home',
    title: 'Home · 記帳',
    subtitle: '主畫面 PeriodPage（src/screens/Home/）。預設 + 空狀態（無交易紀錄時 donut 中央改顯示「尚無交易紀錄」）。',
    screens: [
      { id: 'home',       label: 'Default · 有交易' },
      { id: 'home-empty', label: 'Empty · 尚無交易紀錄' },
    ],
  },
  {
    id: 'home-filter',
    title: '顯示設定 · Home Filter',
    subtitle: 'Home 的篩選 modal（src/screens/Home/HomeFilterScreen.tsx）。',
    screens: [
      { id: 'filter',             label: 'Default · 有帳戶' },
      { id: 'filter-no-accounts', label: 'No accounts · 無可用帳戶' },
    ],
  },
  {
    id: 'search',
    title: 'Search · 搜尋',
    subtitle: '4 種狀態：初始提示輸入 / 載入中 / 有結果 / 找不到結果（src/screens/Search/SearchScreen.tsx）。',
    screens: [
      { id: 'search',              label: 'Initial · 提示輸入' },
      { id: 'search-loading',      label: 'Loading · 搜尋中' },
      { id: 'search-with-results', label: 'With results · 有結果' },
      { id: 'search-no-results',   label: 'No results · 找不到結果' },
    ],
  },
  {
    id: 'tx-editor',
    title: 'Transaction Editor · 記一筆交易',
    subtitle: '記一筆支出 / 收入 modal（src/screens/Transactions/TransactionEditorScreen.tsx）。驗證錯誤對應 impl Alert（畫成 inline banner）。',
    screens: [
      { id: 'tx-editor',        label: 'Default · 新增支出' },
      { id: 'tx-editor-income', label: '新增收入' },
      { id: 'tx-editor-error',  label: 'Error · 驗證錯誤' },
    ],
  },
  {
    id: 'transfer-editor',
    title: 'Transfer Editor · 轉帳',
    subtitle: '跨帳戶 / 跨幣別轉帳 modal（src/screens/Transactions/TransferEditorScreen.tsx）。',
    screens: [
      { id: 'transfer', label: 'Default · 跨幣別' },
    ],
  },
  {
    id: 'login',
    title: 'Login · 登入',
    subtitle: 'Google 登入畫面（src/screens/Auth/LoginScreen.tsx）。',
    screens: [
      { id: 'login',         label: 'Default' },
      { id: 'login-loading', label: 'Loading · 登入中' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings · 設定',
    subtitle: '設定總頁（src/screens/Settings/SettingsScreen.tsx）。',
    screens: [
      { id: 'settings', label: 'Default' },
    ],
  },
  {
    id: 'preference',
    title: 'Preference · 偏好設定',
    subtitle: '偏好設定總頁（src/screens/Settings/PreferenceScreen.tsx）。',
    screens: [
      { id: 'preference', label: 'Default' },
    ],
  },
  {
    id: 'paywall',
    title: 'Paywall · 解鎖 Premium',
    subtitle: 'IAP 訂閱頁（src/screens/Paywall/PaywallScreen.tsx）。',
    screens: [
      { id: 'paywall',         label: 'Default · 顯示產品' },
      { id: 'paywall-loading', label: 'Loading · 載入產品中' },
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts · 帳戶',
    subtitle: '帳戶列表（src/screens/Accounts/AccountListScreen.tsx）。empty 狀態：只顯示新增帳戶按鈕。',
    screens: [
      { id: 'accounts',       label: 'Default · 有帳戶' },
      { id: 'accounts-empty', label: 'Empty · 無帳戶' },
    ],
  },
  {
    id: 'account-editor',
    title: 'Account Editor · 編輯帳戶',
    subtitle: '帳戶編輯器（src/screens/Accounts/AccountEditorScreen.tsx）。新增模式無刪除按鈕；編輯模式有啟用開關 + 刪除。',
    screens: [
      { id: 'acc-editor',      label: '新增模式' },
      { id: 'acc-editor-edit', label: '編輯模式' },
    ],
  },
  {
    id: 'categories',
    title: 'Categories · 類別',
    subtitle: '類別列表（src/screens/Categories/CategoryListScreen.tsx）。支出 / 收入兩個區段。',
    screens: [
      { id: 'categories', label: 'Default' },
    ],
  },
  {
    id: 'category-editor',
    title: 'Category Editor · 編輯類別',
    subtitle: '類別編輯器（src/screens/Categories/CategoryEditorScreen.tsx）。',
    screens: [
      { id: 'cat-editor',      label: '新增模式' },
      { id: 'cat-editor-edit', label: '編輯模式' },
    ],
  },
  {
    id: 'theme',
    title: 'Theme Settings · 主題',
    subtitle: '雙主題切換（src/screens/Settings/ThemeSettingsScreen.tsx）。SelectionGridItem 卡片 + 顏色 preview。',
    screens: [
      { id: 'theme', label: 'Default' },
    ],
  },
  {
    id: 'language',
    title: 'Language Setting · 語言',
    subtitle: 'src/screens/Settings/LanguageSettingScreen.tsx',
    screens: [
      { id: 'language', label: 'Default' },
    ],
  },
  {
    id: 'timezone',
    title: 'TimeZone Setting · 時區',
    subtitle: '帶 BottomSearchBar（src/screens/Settings/TimeZoneSettingScreen.tsx）。',
    screens: [
      { id: 'timezone', label: 'Default' },
    ],
  },
  {
    id: 'launchmode',
    title: 'Launch Mode · 啟動設定',
    subtitle: 'src/screens/Settings/LaunchModeSettingScreen.tsx',
    screens: [
      { id: 'launchmode', label: 'Default' },
    ],
  },
  {
    id: 'base-currency',
    title: 'Base Currency · 基準貨幣',
    subtitle: '帶 BottomSearchBar（src/screens/Settings/BaseCurrencySettingScreen.tsx）。',
    screens: [
      { id: 'currency', label: 'Default' },
    ],
  },
  {
    id: 'currency-list',
    title: 'Currency List · 貨幣設定',
    subtitle: 'src/screens/Settings/CurrencyListScreen.tsx',
    screens: [
      { id: 'currlist', label: 'Default' },
    ],
  },
  {
    id: 'rate-list',
    title: 'Currency Rate List · 匯率管理',
    subtitle: '跨幣別匯率（src/screens/Settings/CurrencyRateListScreen.tsx）。empty 用 currency_rate.empty_state 字串。',
    screens: [
      { id: 'ratelist',       label: 'Default · 有匯率' },
      { id: 'ratelist-empty', label: 'Empty · 尚無匯率' },
    ],
  },
  {
    id: 'data-mgmt',
    title: 'Data Management · 資料管理',
    subtitle: '備份 / 匯入 / 匯出 / 清空（src/screens/Settings/DataManagementScreen.tsx）。',
    screens: [
      { id: 'data-mgmt', label: 'Default' },
    ],
  },
  {
    id: 'debug',
    title: 'Debug Info',
    subtitle: '帳戶活動統計（src/screens/Settings/DebugInfoScreen.tsx）。',
    screens: [
      { id: 'debug', label: 'Default' },
    ],
  },
];

const PINNED_WITH_FAB = new Set(['home']);

// ScreenFrame — device 內導覽容器
function ScreenFrame({ pinned, sharedFilter, setSharedFilter }) {
  const [stack, setStack] = React.useState([pinned]);
  React.useEffect(() => { setStack([pinned]); }, [pinned]);
  const top = stack[stack.length - 1];
  const push = (s) => setStack(st => [...st, s]);
  const pop = () => setStack(st => st.length > 1 ? st.slice(0, -1) : [pinned]);
  const meta = SCREEN_META[top];
  if (!meta) return null;

  const ctx = { push, pop, sharedFilter, setSharedFilter };
  const body = meta.render(ctx);
  const isModal = meta.present === 'modal';
  const isPush = meta.present === 'push';
  const headerRight = meta.headerRight ? meta.headerRight(ctx) : null;
  const leadingText = isPush ? (meta.headerLeftText ?? '') : undefined;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: TOKENS.bg,
      fontFamily: '-apple-system, "SF Pro", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden',
    }} data-screen-label={pinned}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {isModal && <ModalHeader title={meta.title} onClose={pop} onSave={meta.save ? pop : undefined}/>}
        {isPush && <PushHeader title={meta.title} leadingText={leadingText} leadingAction={stack.length > 1 ? pop : undefined} trailing={headerRight}/>}
        {body}
      </div>
      {(PINNED_WITH_FAB.has(top) || meta.hasFAB) && (
        <FloatingActionBar mode="actions"
          onExpensePress={() => push('tx-editor')}
          onTransferPress={() => push('transfer')}
          onIncomePress={() => push('tx-editor-income')}/>
      )}
    </div>
  );
}

// ─── Top view tabs ───────────────────────────────────────────
const VIEW_TABS = [
  { id: 'intro',        label: 'Intro' },
  { id: 'foundations',  label: 'Foundations' },
  { id: 'components',   label: 'Components' },
  { id: 'screens',      label: 'Screens' },
  { id: 'explorations', label: 'Explorations' },
];
const VALID_VIEWS = VIEW_TABS.map(t => t.id);

// 舊 hash 別名（向後相容）
const LEGACY_HASH_ALIASES = {
  'overview':   { view: 'screens' },   // Overview tab 已併入 Screens
  'flows':      { view: 'screens' },   // Flows tab 已移除
  'all':        { view: 'screens' },
  'filter':     { view: 'screens' },
  'tx-list':    { view: 'screens' },
  'recurring':  { view: 'screens' },
  'row-height': { view: 'screens' },
};

function ViewTabs({ view, setView }) {
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, padding: 4,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
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
            padding: '8px 14px', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 500,
            color: active ? '#fff' : '#212121',
            background: active ? TOKENS.p500 : 'transparent',
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

function App() {
  const parseHash = () => {
    const h = window.location.hash.replace('#', '');
    if (LEGACY_HASH_ALIASES[h]) return LEGACY_HASH_ALIASES[h];
    if (VALID_VIEWS.includes(h)) return { view: h };
    return { view: 'intro' };
  };
  const [view, setView] = React.useState(() => parseHash().view);
  React.useEffect(() => {
    const onHashChange = () => setView(parseHash().view);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const updateView = (v) => { if (v !== view) window.location.hash = v; };

  const [sharedFilter, setSharedFilter] = React.useState({
    timeGranularity: 'month',
    groupBy: 'date',
    selectedAccountIds: ACCOUNTS.map(a => a.id),
  });

  const W = 402, H = 874;

  return (
    <>
      <ViewTabs view={view} setView={updateView}/>
      <DesignCanvas>
        {view === 'intro'        && <IntroSection/>}
        {view === 'foundations'  && <FoundationsSection/>}
        {view === 'components'   && <ComponentsShowcaseSection/>}
        {view === 'screens' && SCREEN_GROUPS.map(group => (
          <DCSection key={group.id} id={`screens-${group.id}`} title={group.title} subtitle={group.subtitle}>
            {group.screens.map(s => (
              <DCArtboard key={s.id} id={s.id} label={s.label} width={W} height={H}>
                <IOSDevice width={W} height={H}>
                  <ScreenFrame pinned={s.id} sharedFilter={sharedFilter} setSharedFilter={setSharedFilter}/>
                </IOSDevice>
              </DCArtboard>
            ))}
          </DCSection>
        ))}
        {view === 'explorations' && <ExplorationsScaffoldSection/>}
      </DesignCanvas>
    </>
  );
}

Object.assign(window, { SCREEN_META, SCREEN_GROUPS, ScreenFrame });

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
