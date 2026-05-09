// ─────────────────────────────────────────────────────────────
// Screens — faithful to repo: Home (PeriodPage), Settings, Accounts, etc.
// ─────────────────────────────────────────────────────────────

// Native iOS-style header (stack nav header)
function NavHeader({ title, leadingText, leadingAction, trailing }) {
  return (
    <div style={{
      paddingTop: 60, paddingBottom: 8, paddingLeft: 8, paddingRight: 8,
      display: 'flex', alignItems: 'center',
      background: TOKENS.bg,
      position: 'relative', zIndex: 5,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {leadingText && (
          <button onClick={leadingAction} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: TOKENS.p500, fontSize: 17, fontWeight: 400,
            padding: '8px 8px', display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'inherit',
          }}>
            <Glyph name="chevron-left" size={16} color={TOKENS.p500} stroke={2.4}/>
            <span style={{ marginLeft: -2 }}>{leadingText}</span>
          </button>
        )}
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: 60, transform: 'translateX(-50%)',
        fontSize: 17, fontWeight: 600, color: TOKENS.ink,
        whiteSpace: 'nowrap',
      }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{trailing}</div>
    </div>
  );
}

// Donut Chart (replica of DonutChart.tsx — pie segments + center hole)
function DonutChart({ data, size = 200, thickness = 28, children }) {
  const r = (size - thickness) / 2;
  const cx = size/2, cy = size/2;
  const total = data.reduce((s, d) => s + d.value, 0);
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} stroke={TOKENS.hairline2} strokeWidth={thickness} fill="none"/>
        {data.map((d, i) => {
          const len = total > 0 ? (d.value / total) * circ : 0;
          const dash = `${len} ${circ - len}`;
          const offset = -acc;
          acc += len;
          return (
            <circle key={d.key || i}
              cx={cx} cy={cy} r={r}
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={dash} strokeDashoffset={offset}
              fill="none" strokeLinecap="butt"
              style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{children}</div>
    </div>
  );
}

// FocusCard — replica of components/FocusCard.tsx
function FocusCard({ kind, amount, active, onPress }) {
  const iconName = kind === 'expense' ? 'minus' : 'plus';
  const swatchColor = active ? TOKENS.p500 : TOKENS.ink2;
  return (
    <button onClick={onPress} style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 12px', borderRadius: 12,
      border: `1.5px solid ${active ? TOKENS.p500 : 'transparent'}`,
      background: active ? TOKENS.surface : TOKENS.surface2,
      cursor: 'pointer', fontFamily: 'inherit',
      boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: active ? TOKENS.p100 : TOKENS.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Glyph name={iconName} size={14} color={swatchColor}/>
      </div>
      <span style={{
        flex: 1, textAlign: 'right',
        fontSize: 16, fontWeight: 500,
        color: active ? TOKENS.ink : TOKENS.ink2,
        fontFeatureSettings: '"tnum" 1',
        fontVariantNumeric: 'tabular-nums',
      }}>{fmt(amount)}</span>
    </button>
  );
}

// Home / PeriodPage — faithful replica
function HomeScreen({ onSearch, onSettings, onFilter, filterState }) {
  const [chartMode, setChartMode] = React.useState('expense');
  const groupMode = filterState.groupBy;
  const [collapsed, setCollapsed] = React.useState(() => new Set());

  const totals = periodTotals(TX);
  const pData = pieData(TX);

  const toggle = (id) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <>
      <NavHeader
        title="記帳"
        trailing={
          <div style={{ display: 'flex' }}>
            <button onClick={onFilter} style={iconBtn} title="篩選">
              <Glyph name="filter" size={20} color={TOKENS.p500} stroke={2}/>
            </button>
            <button onClick={onSearch} style={iconBtn}>
              <Glyph name="search" size={20} color={TOKENS.p500} stroke={2}/>
            </button>
            <button onClick={onSettings} style={iconBtn}>
              <Glyph name="gear" size={20} color={TOKENS.p500} stroke={2}/>
            </button>
          </div>
        }
      />

      <div style={{ paddingBottom: 140, background: TOKENS.bg }}>
        {/* Period Switcher — chevron + calendar + label */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, paddingTop: 12, paddingBottom: 4,
        }}>
          <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Glyph name="chevron-left" size={14} color={TOKENS.ink3} stroke={2.5}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Glyph name="calendar" size={13} color={TOKENS.ink2} stroke={2}/>
            <span style={{
              fontSize: 18, fontWeight: 500, color: TOKENS.ink, marginLeft: 2,
            }}>May 26</span>
          </div>
          <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Glyph name="chevron-right" size={14} color={TOKENS.ink3} stroke={2.5}/>
          </div>
        </div>

        {/* Donut */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, padding: '8px 0' }}>
          <DonutChart data={pData.map(d => ({ key: d.id, value: d.value, color: d.color }))} size={200} thickness={28}>
            <div style={{ textAlign: 'center', width: 100 }}>
              <div style={{ fontSize: 14, color: TOKENS.ink2, marginBottom: 4 }}>結餘</div>
              <div style={{
                fontSize: 24, fontWeight: 500, color: TOKENS.ink,
                fontFeatureSettings: '"tnum" 1',
                fontVariantNumeric: 'tabular-nums',
              }}>{fmt(totals.balance)}</div>
            </div>
          </DonutChart>
        </div>

        {/* Focus Row — expense / income */}
        <div style={{ display: 'flex', gap: 12, padding: '4px 16px 12px' }}>
          <FocusCard kind="expense" amount={totals.expense} active={chartMode === 'expense'} onPress={() => setChartMode('expense')}/>
          <FocusCard kind="income"  amount={totals.income}  active={chartMode === 'income'}  onPress={() => setChartMode('income')}/>
        </div>

        {/* Sections — R10 outlined frame refined */}
        {groupMode === 'date'
          ? <TxR10_ByDate collapsed={collapsed} onToggle={toggle}/>
          : <TxR10_ByCategory collapsed={collapsed} onToggle={toggle} chartMode={chartMode}/>}
      </div>
    </>
  );
}

const iconBtn = {
  width: 36, height: 36, border: 'none', background: 'transparent',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// Settings — faithful replica
function SettingsScreen({ onBack, onAccounts, onCategories }) {
  return (
    <>
      <NavHeader title="設定" leadingText="" />
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <GroupCard>
          <ListItem leftIcon={<Glyph name="tag" size={20} color={TOKENS.ink} stroke={1.6}/>} title="分類管理" showChevron onPress={onCategories}/>
          <ListItem leftIcon={<Glyph name="bank" size={20} color={TOKENS.ink} stroke={1.6}/>} title="帳戶管理" showChevron onPress={onAccounts}/>
          <ListItem leftIcon={<Glyph name="database" size={20} color={TOKENS.ink} stroke={1.6}/>} title="資料管理" showChevron isLast/>
        </GroupCard>
        <GroupCard>
          <ListItem leftIcon={<Glyph name="gear" size={20} color={TOKENS.ink} stroke={1.6}/>} title="偏好設定" showChevron isLast/>
        </GroupCard>
        <GroupCard>
          <ListItem leftIcon={<Glyph name="star" size={20} color={TOKENS.p500} stroke={1.6}/>} title="升級訂閱" titleColor={TOKENS.p500} showChevron isLast/>
        </GroupCard>
        <GroupCard>
          <ListItem leftIcon={<Glyph name="bug" size={20} color={TOKENS.ink} stroke={1.6}/>} title="Debug Info by Account" showChevron/>
          <ListItem leftIcon={<Glyph name="tag" size={20} color={TOKENS.ink} stroke={1.6}/>} title="Debug Info by Category" showChevron/>
          <ListItem leftIcon={<Glyph name="database" size={20} color={TOKENS.ink} stroke={1.6}/>} title="Mock Data Settings" showChevron/>
          <ListItem leftIcon={<Glyph name="shield" size={20} color={TOKENS.ink} stroke={1.6}/>} title="Mock Tier: Level 0 (Free)" value="Toggle" isLast/>
        </GroupCard>
        <div style={{ textAlign: 'center', color: TOKENS.ink3, fontSize: 12, marginTop: 32 }}>Version 0.1.0-alpha</div>
      </div>
    </>
  );
}

// Account list — faithful replica
function AccountsScreen({ onBack }) {
  return (
    <>
      <NavHeader title="帳戶" leadingText="設定" leadingAction={onBack}
        trailing={
          <button style={iconBtn}>
            <Glyph name="merge" size={20} color={TOKENS.p500} stroke={2}/>
          </button>
        }/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <GroupCard>
          {ACCOUNTS.map((a, i) => (
            <ListItem key={a.id}
              leftIcon={<Glyph name={a.icon} size={20} color={TOKENS.ink} stroke={1.6}/>}
              title={a.name}
              subtitle={a.currency}
              isLast={i === ACCOUNTS.length - 1}
            />
          ))}
        </GroupCard>
        <GroupCard>
          <ListItem
            leftIcon={<Glyph name="plus" size={20} color={TOKENS.p500} stroke={2}/>}
            title="新增帳戶" titleColor={TOKENS.p500} isLast
          />
        </GroupCard>
      </div>
    </>
  );
}

// Categories — faithful replica (same group list pattern)
function CategoriesScreen({ onBack }) {
  const expenseCats = CATEGORIES.filter(c => c.type === 'expense');
  const incomeCats = CATEGORIES.filter(c => c.type === 'income');
  return (
    <>
      <NavHeader title="分類" leadingText="設定" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ fontSize: 13, color: TOKENS.ink2, padding: '12px 20px 6px', fontWeight: 400, letterSpacing: 0.5 }}>支出</div>
        <GroupCard>
          {expenseCats.map((c, i) => (
            <ListItem key={c.id}
              leftIcon={<Glyph name={c.glyph} size={20} color={TOKENS.ink} stroke={1.6}/>}
              title={c.name} showChevron
              isLast={i === expenseCats.length - 1}/>
          ))}
        </GroupCard>
        <div style={{ fontSize: 13, color: TOKENS.ink2, padding: '12px 20px 6px', fontWeight: 400, letterSpacing: 0.5 }}>收入</div>
        <GroupCard>
          {incomeCats.map((c, i) => (
            <ListItem key={c.id}
              leftIcon={<Glyph name={c.glyph} size={20} color={TOKENS.ink} stroke={1.6}/>}
              title={c.name} showChevron
              isLast={i === incomeCats.length - 1}/>
          ))}
        </GroupCard>
        <GroupCard>
          <ListItem
            leftIcon={<Glyph name="plus" size={20} color={TOKENS.p500} stroke={2}/>}
            title="新增分類" titleColor={TOKENS.p500} isLast/>
        </GroupCard>
      </div>
    </>
  );
}

// HomeFilterScreen — faithful replica of HomeFilterScreen.tsx
// Two cycling tiles (time granularity, group mode) + account selection grid by currency
const TIME_GRANULARITY_LABELS = {
  day: '今天', week: '本週', month: '本月', year: '今年', all: '全部',
};
const GROUP_MODE_LABELS = { category: '依分類', date: '依日期' };
const TIME_GRANULARITY_VALUES = ['day', 'week', 'month', 'year', 'all'];
const GROUP_MODE_VALUES = ['category', 'date'];

function cycle(arr, current) {
  const i = arr.indexOf(current);
  return arr[(i + 1) % arr.length];
}

function HomeFilterScreen({ onBack, filterState, setFilterState }) {
  const { timeGranularity, groupBy, selectedAccountIds } = filterState;

  const setTimeGranularity = (v) => setFilterState(s => ({ ...s, timeGranularity: v }));
  const setGroupBy = (v) => setFilterState(s => ({ ...s, groupBy: v }));
  const toggleAccountId = (id) => setFilterState(s => {
    const has = s.selectedAccountIds.includes(id);
    const isLast = has && s.selectedAccountIds.length === 1;
    if (isLast) return s;  // can't deselect last one
    return {
      ...s,
      selectedAccountIds: has
        ? s.selectedAccountIds.filter(x => x !== id)
        : [...s.selectedAccountIds, id],
    };
  });

  // Group accounts by currency
  const groups = React.useMemo(() => {
    const map = new Map();
    const ordered = [];
    for (const a of ACCOUNTS) {
      if (!map.has(a.currency)) {
        const list = [];
        map.set(a.currency, list);
        ordered.push({ currency: a.currency, accounts: list });
      }
      map.get(a.currency).push(a);
    }
    return ordered;
  }, []);

  // Card width: (deviceWidth - 16*2 - 8) / 2
  const cardWidth = (402 - 16*2 - 8) / 2;

  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        {/* Tile row — time granularity / group mode */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setTimeGranularity(cycle(TIME_GRANULARITY_VALUES, timeGranularity))}
            style={filterTile}>
            <Glyph name="calendar" size={16} color={TOKENS.ink2} stroke={2}/>
            <span style={filterTileText}>{TIME_GRANULARITY_LABELS[timeGranularity]}</span>
          </button>
          <button onClick={() => setGroupBy(cycle(GROUP_MODE_VALUES, groupBy))}
            style={filterTile}>
            <Glyph name="tag" size={16} color={TOKENS.ink2} stroke={2}/>
            <span style={filterTileText}>{GROUP_MODE_LABELS[groupBy]}</span>
          </button>
        </div>

        {/* Account selection grid, grouped by currency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => {
                const isSelected = selectedAccountIds.includes(a.id);
                const isLastSelected = isSelected && selectedAccountIds.length === 1;
                const swatchIconColor = isSelected ? TOKENS.p500 : TOKENS.ink3;
                const nameColor = isSelected ? TOKENS.ink : TOKENS.ink2;
                const currencyColor = isSelected ? TOKENS.ink2 : TOKENS.ink3;
                return (
                  <button key={a.id}
                    onClick={() => !isLastSelected && toggleAccountId(a.id)}
                    style={{
                      width: cardWidth,
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 12px',
                      borderRadius: 12,
                      border: isSelected ? `1.5px solid ${TOKENS.p500}` : `1px solid ${TOKENS.divider}`,
                      background: TOKENS.surface,
                      cursor: isLastSelected ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: isLastSelected ? 0.85 : 1,
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: isSelected ? TOKENS.p50 : TOKENS.surface,
                      border: isSelected ? 'none' : `1px solid ${TOKENS.divider}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Glyph name={a.icon} size={17} color={swatchIconColor} stroke={1.6}/>
                    </div>
                    <span style={{
                      flex: 1, fontSize: 13.5, fontWeight: 500, color: nameColor,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      textAlign: 'left',
                    }}>{a.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
                      color: currencyColor,
                    }}>{a.currency}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const filterTile = {
  flex: 1,
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '16px 12px',
  borderRadius: 14,
  background: TOKENS.surface,
  border: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
const filterTileText = {
  fontSize: 17, fontWeight: 600, letterSpacing: -0.2,
  color: TOKENS.ink,
};

// Search — replica of BottomSearchBar pattern
function SearchScreen({ onBack }) {
  const [q, setQ] = React.useState('');
  const filtered = q ? TX.filter(t => t.note.includes(q) || CAT_BY_ID[t.cat].name.includes(q)) : [];
  return (
    <>
      <NavHeader title="搜尋" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg, minHeight: 400 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: TOKENS.surface, border: `1px solid ${TOKENS.divider}`,
          borderRadius: 999, height: 44, padding: '0 12px',
        }}>
          <Glyph name="search" size={20} color={TOKENS.ink2} stroke={2}/>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋紀錄"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 16, color: TOKENS.ink,
              fontFamily: 'inherit',
            }}/>
          {q && <button onClick={() => setQ('')} style={{ background:'none', border:'none', cursor:'pointer', padding: 4 }}>
            <Glyph name="x" size={14} color={TOKENS.ink2} stroke={2}/>
          </button>}
        </div>
        {q ? (
          <div style={{ marginTop: 16 }}>
            <GroupCard>
              {filtered.map((tx, i) => {
                const cat = CAT_BY_ID[tx.cat];
                return (
                  <ListItem key={tx.id}
                    leftIcon={<Glyph name={cat.glyph} size={20} color={TOKENS.ink} stroke={1.6}/>}
                    title={tx.note || cat.name}
                    subtitle={`${cat.name} · ${tx.date}`}
                    value={fmt(tx.amount)}
                    isLast={i === filtered.length - 1}/>
                );
              })}
            </GroupCard>
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', color: TOKENS.ink2, padding: '60px 0', fontSize: 14 }}>沒有結果</div>
            )}
          </div>
        ) : (
          <div style={{ textAlign:'center', color: TOKENS.ink3, padding: '60px 0', fontSize: 14 }}>輸入關鍵字以搜尋</div>
        )}
      </div>
    </>
  );
}

// FloatingActionBar — replica of FloatingActionBar.tsx (208×72 glass pill)
function FloatingActionBar({ onExpense, onTransfer, onIncome }) {
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', zIndex: 30,
      pointerEvents: 'none',
    }}>
      <div style={{
        width: 208, height: 72, borderRadius: 36,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '0.5px solid rgba(255,255,255,0.85)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 8px', pointerEvents: 'auto',
      }}>
        <button onClick={onExpense} style={fabBtn}><Glyph name="minus" size={24} color={TOKENS.p500}/></button>
        <button onClick={onTransfer} style={fabBtn}><Glyph name="exchange" size={22} color={TOKENS.p500} stroke={2.4}/></button>
        <button onClick={onIncome} style={fabBtn}><Glyph name="plus" size={24} color={TOKENS.p500}/></button>
      </div>
    </div>
  );
}
const fabBtn = {
  width: 56, height: 56, borderRadius: 28, border: 'none',
  background: 'transparent', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

Object.assign(window, {
  NavHeader, DonutChart, FocusCard, FloatingActionBar,
  HomeScreen, HomeFilterScreen, SettingsScreen, AccountsScreen, CategoriesScreen, SearchScreen,
});
