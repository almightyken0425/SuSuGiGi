// ─────────────────────────────────────────────────────────────
// Screens — impl 對齊（src/screens/*）
// 每個 screen 都標註 impl 對應檔案；視覺值取自 LIST_TOKENS / TX_LIST_TOKENS。
// ─────────────────────────────────────────────────────────────

const SCREEN_PAD = SPACING[4];

// Spinner — 模擬 RN ActivityIndicator，CSS spin animation
// 注入一次性 keyframe（id 防重複）
if (typeof document !== 'undefined' && !document.getElementById('screen-spinner-style')) {
  const s = document.createElement('style');
  s.id = 'screen-spinner-style';
  s.textContent = '@keyframes screen-spinner-rotate { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
function Spinner({ size = 24, color }) {
  const c = color || TOKENS.p500;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'screen-spinner-rotate 0.9s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={c} strokeOpacity="0.2" strokeWidth="3" fill="none"/>
      <path d="M12 2 a10 10 0 0 1 10 10" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════
// HomeScreen ← src/screens/Home/HomeScreen.tsx + PeriodPage.tsx
// ═════════════════════════════════════════════════════════════
const _HS_MORPH = `all ${TX_LIST_TOKENS.MORPH_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
const _HS_MONTH_TO_NUM = { Jan:'1',Feb:'2',Mar:'3',Apr:'4',May:'5',Jun:'6',Jul:'7',Aug:'8',Sep:'9',Oct:'10',Nov:'11',Dec:'12' };

// PeriodPage row 內的「主金額 + 換算金額」包，含 recurring icon
function PP_AmountCol({ recurring, amount, currency, convertedAmount }) {
  const hasConverted = convertedAmount !== undefined && convertedAmount !== null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {recurring && (
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: TOKENS.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Glyph name="repeat" size={14} color={TOKENS.ink3} stroke={2}/>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{
          fontSize: TX_LIST_TOKENS.ROW_AMOUNT_SIZE,
          fontWeight: TX_LIST_TOKENS.ROW_AMOUNT_WEIGHT,
          color: TOKENS.p900,
          fontVariantNumeric: 'tabular-nums',
        }}>{fmt(amount, currency)}</span>
        {hasConverted && (
          <span style={{
            fontSize: TYPOGRAPHY.size.xs, color: TOKENS.ink2,
            fontVariantNumeric: 'tabular-nums',
          }}>≈ {fmt(convertedAmount, 'TWD')}</span>
        )}
      </div>
    </div>
  );
}

function PP_DateBadge({ date }) {
  const [mStr, d] = date.split(' ');
  const m = _HS_MONTH_TO_NUM[mStr] || mStr;
  return (
    <div style={{
      width: TX_LIST_TOKENS.ROW_LEFT_SLOT_SIZE,
      height: TX_LIST_TOKENS.ROW_LEFT_SLOT_SIZE,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{
        fontSize: 12, fontWeight: TYPOGRAPHY.weight.medium,
        color: TOKENS.ink2, fontVariantNumeric: 'tabular-nums',
      }}>{m}/{d}</span>
    </div>
  );
}

function PP_TxRow({ left, primary, secondary, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: SPACING[3],
      paddingLeft: SPACING[4], paddingRight: SPACING[4],
      paddingTop: SPACING[3], paddingBottom: SPACING[3],
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: TX_LIST_TOKENS.ROW_NOTE_SIZE,
          color: TOKENS.ink, marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{primary}</div>
        {secondary && (
          <div style={{ fontSize: TX_LIST_TOKENS.ROW_SECONDARY_SIZE, color: TOKENS.ink2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{secondary}</div>
        )}
      </div>
      {right}
    </div>
  );
}

function PP_SectionHeader({ collapsed, onClick, iconId, title, total }) {
  const c = collapsed;
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      paddingLeft: TX_LIST_TOKENS.SECTION_HEADER_PADDING_H,
      paddingRight: TX_LIST_TOKENS.SECTION_HEADER_PADDING_H,
      paddingTop: c ? TX_LIST_TOKENS.SECTION_HEADER_PADDING_V_COLLAPSED : TX_LIST_TOKENS.SECTION_HEADER_PADDING_V_EXPANDED,
      paddingBottom: c ? TX_LIST_TOKENS.SECTION_HEADER_PADDING_V_COLLAPSED : TX_LIST_TOKENS.SECTION_HEADER_PADDING_V_EXPANDED,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: _HS_MORPH,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2], flex: 1, minWidth: 0 }}>
        <div style={{ width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `rotate(${c ? 0 : 90}deg)`, transition: _HS_MORPH }}>
          <Glyph name="chevron-right" size={12} color={TOKENS.ink2} stroke={2.5}/>
        </div>
        {iconId !== undefined && (
          <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DynamicIconById iconId={iconId} size={18} color={TOKENS.p500}/>
          </div>
        )}
        <span style={{
          fontSize: c ? TX_LIST_TOKENS.SECTION_HEADER_TITLE_SIZE_COLLAPSED : TX_LIST_TOKENS.SECTION_HEADER_TITLE_SIZE_EXPANDED,
          fontWeight: TX_LIST_TOKENS.SECTION_HEADER_TITLE_WEIGHT,
          color: TOKENS.ink, transition: _HS_MORPH,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</span>
      </div>
      <span style={{
        fontSize: c ? TX_LIST_TOKENS.SECTION_HEADER_TOTAL_SIZE_COLLAPSED : TX_LIST_TOKENS.SECTION_HEADER_TOTAL_SIZE_EXPANDED,
        fontWeight: TX_LIST_TOKENS.SECTION_HEADER_TOTAL_WEIGHT,
        color: TOKENS.ink, fontVariantNumeric: 'tabular-nums', transition: _HS_MORPH,
      }}>{total}</span>
    </div>
  );
}

function PP_SectionCard({ section, collapsed, onToggle, mode }) {
  return (
    <div style={{
      marginLeft: TX_LIST_TOKENS.SECTION_CARD_HORIZONTAL_PADDING,
      marginRight: TX_LIST_TOKENS.SECTION_CARD_HORIZONTAL_PADDING,
      marginBottom: TX_LIST_TOKENS.SECTION_CARD_MARGIN_BOTTOM,
      background: TOKENS.surface,
      borderRadius: TX_LIST_TOKENS.SECTION_CARD_RADIUS,
      borderWidth: LIST_TOKENS.GROUP_CARD_BORDER_WIDTH, borderStyle: 'solid',
      borderColor: LIST_TOKENS.GROUP_CARD_BORDER_COLOR,
      overflow: 'hidden', transition: _HS_MORPH,
    }}>
      <PP_SectionHeader
        collapsed={collapsed}
        onClick={() => onToggle && onToggle(section.id)}
        iconId={mode === 'category' ? section.iconId : undefined}
        title={section.title}
        total={fmt(section.total)}/>
      {!collapsed && section.data.map((tx, i) => {
        const cat = CAT_BY_ID[tx.cat];
        const leftSlot = mode === 'category'
          ? <PP_DateBadge date={tx.date}/>
          : (
            <div style={{
              width: TX_LIST_TOKENS.ROW_LEFT_SLOT_SIZE, height: TX_LIST_TOKENS.ROW_LEFT_SLOT_SIZE,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {cat && <DynamicIconById iconId={cat.iconId} size={20} color={TOKENS.p500}/>}
            </div>
          );
        const acc = ACC_BY_ID[tx.acc];
        const primary = tx.note || '無備註';
        const secondary = mode === 'category' ? null : (acc ? acc.name : '');
        return (
          <div key={tx.id} style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${TOKENS.hairline}` }}>
            <PP_TxRow left={leftSlot} primary={primary} secondary={secondary}
              right={<PP_AmountCol recurring={tx.recurring} amount={tx.amount} currency={tx.currency} convertedAmount={tx.convertedAmount}/>}/>
          </div>
        );
      })}
    </div>
  );
}

function HomeScreen({ filterState, variant = 'default' }) {
  const [chartMode, setChartMode] = React.useState('expense');
  const groupMode = filterState.groupBy;
  const [collapsed, setCollapsed] = React.useState(() => new Set());
  const isEmpty = variant === 'empty';
  const isLoading = variant === 'loading';
  const dataSource = isEmpty ? [] : TX;
  const totals = periodTotals(dataSource);
  const pData = pieData(dataSource);
  const toggle = (id) => setCollapsed(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const sections = groupMode === 'date' ? groupByDate(dataSource) : groupByCategory(dataSource, chartMode);

  return (
    <div style={{ paddingBottom: 140, background: TOKENS.bg }}>
      {/* Period switcher */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: SPACING[2],
        paddingTop: SPACING[3], paddingBottom: SPACING[1],
      }}>
        <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Glyph name="chevron-left" size={14} color={TOKENS.ink3} stroke={2.5}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[1] }}>
          <div style={{ marginRight: 2, display: 'flex', alignItems: 'center' }}>
            <Glyph name="calendar" size={13} color={TOKENS.ink2} stroke={2}/>
          </div>
          <span style={{
            fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.medium,
            color: TOKENS.ink,
          }}>2026年5月</span>
        </div>
        <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Glyph name="chevron-right" size={14} color={TOKENS.ink3} stroke={2.5}/>
        </div>
      </div>
      {/* Donut — 空狀態時內部文字改成「尚無交易紀錄」 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: SPACING[3] }}>
        <DonutChart data={pData.map(d => ({ key: d.id, value: d.value, color: d.color }))}>
          <div style={{ textAlign: 'center', width: 100 }}>
            {isEmpty ? (
              <div style={{ fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink2 }}>尚無交易紀錄</div>
            ) : isLoading ? (
              <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2 }}>載入中...</div>
            ) : (
              <>
                <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, marginBottom: SPACING[1] }}>餘額</div>
                <div style={{
                  fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.medium,
                  color: TOKENS.ink, fontVariantNumeric: 'tabular-nums', textAlign: 'center',
                }}>{fmt(totals.balance)}</div>
              </>
            )}
          </div>
        </DonutChart>
      </div>
      {/* Focus Row */}
      <div style={{
        display: 'flex', flexDirection: 'row', gap: SPACING[3],
        paddingLeft: SPACING[4], paddingRight: SPACING[4],
        paddingTop: SPACING[1], paddingBottom: SPACING[3],
      }}>
        <FocusCard kind="expense" amount={totals.expense} active={chartMode === 'expense'} onPress={() => setChartMode('expense')}/>
        <FocusCard kind="income"  amount={totals.income}  active={chartMode === 'income'}  onPress={() => setChartMode('income')}/>
      </div>
      {/* Sections */}
      {sections.map(sec => (
        <PP_SectionCard key={sec.id} section={sec}
          collapsed={collapsed.has(sec.id)} onToggle={toggle} mode={groupMode}/>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// HomeFilterScreen ← src/screens/Home/HomeFilterScreen.tsx
// ═════════════════════════════════════════════════════════════
const TIME_VALUES = ['day', 'week', 'month', 'year', 'all'];
const GROUP_VALUES = ['category', 'date'];
const TIME_LABELS = { day: '日', week: '週', month: '月', year: '年', all: '全' };
const GROUP_LABELS = { category: '類別', date: '日期' };
const cycle = (arr, c) => arr[(arr.indexOf(c) + 1) % arr.length];

function HomeFilterScreen({ filterState, setFilterState, variant = 'default' }) {
  const { timeGranularity, groupBy, selectedAccountIds } = filterState;
  const noAccounts = variant === 'no-accounts';
  const toggleAcc = (id) => setFilterState(s => {
    const has = s.selectedAccountIds.includes(id);
    if (has && s.selectedAccountIds.length === 1) return s;
    return { ...s, selectedAccountIds: has ? s.selectedAccountIds.filter(x=>x!==id) : [...s.selectedAccountIds, id] };
  });
  const groups = React.useMemo(() => {
    if (noAccounts) return [];
    const map = new Map(); const ordered = [];
    for (const a of ACCOUNTS) {
      if (!map.has(a.currency)) { const list = []; map.set(a.currency, list); ordered.push({ currency: a.currency, accounts: list }); }
      map.get(a.currency).push(a);
    }
    return ordered;
  }, [noAccounts]);
  const cardWidth = (402 - SPACING[4] * 2 - SPACING[2]) / 2;

  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, minHeight: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: SPACING[2], marginBottom: 40 }}>
        <button onClick={() => setFilterState(s => ({ ...s, timeGranularity: cycle(TIME_VALUES, timeGranularity) }))} style={filterTile}>
          <Glyph name="calendar-blank-outline" size={16} color={TOKENS.ink2} stroke={2}/>
          <span style={filterTileText}>{TIME_LABELS[timeGranularity]}</span>
        </button>
        <button onClick={() => setFilterState(s => ({ ...s, groupBy: cycle(GROUP_VALUES, groupBy) }))} style={filterTile}>
          <Glyph name="tag-outline" size={16} color={TOKENS.ink2} stroke={2}/>
          <span style={filterTileText}>{GROUP_LABELS[groupBy]}</span>
        </button>
      </div>
      {noAccounts && (
        <ListGroupCard>
          <ListItem title="無可用帳戶" disabled/>
        </ListGroupCard>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groups.map(g => (
          <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING[2] }}>
            {g.accounts.map(a => {
              const selected = selectedAccountIds.includes(a.id);
              const last = selected && selectedAccountIds.length === 1;
              const swatchIconColor = selected ? TOKENS.p500 : TOKENS.ink3;
              const nameColor = selected ? TOKENS.ink : TOKENS.ink2;
              const currencyColor = selected ? TOKENS.ink2 : TOKENS.ink3;
              return (
                <button key={a.id} onClick={() => !last && toggleAcc(a.id)} disabled={last} style={{
                  width: cardWidth, display: 'flex', alignItems: 'center',
                  gap: SPACING[2] + 2,
                  paddingTop: 14, paddingBottom: 14,
                  paddingLeft: SPACING[3], paddingRight: SPACING[3],
                  borderRadius: RADIUS.lg,
                  borderWidth: selected ? 1.5 : 1, borderStyle: 'solid',
                  borderColor: selected ? TOKENS.p500 : LIST_TOKENS.DIVIDER_COLOR_LIGHT,
                  background: TOKENS.surface,
                  cursor: last ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: RADIUS.md,
                    background: selected ? TOKENS.p50 : TOKENS.surface,
                    borderWidth: selected ? 0 : 1, borderStyle: 'solid',
                    borderColor: LIST_TOKENS.DIVIDER_COLOR_LIGHT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <DynamicIconById iconId={a.iconId} size={17} color={swatchIconColor}/>
                  </div>
                  <span style={{
                    flex: 1, textAlign: 'left',
                    fontSize: 13.5, fontWeight: TYPOGRAPHY.weight.medium, color: nameColor,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{a.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: TYPOGRAPHY.weight.medium,
                    letterSpacing: 0.4, color: currencyColor,
                  }}>{a.currency}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
const filterTile = {
  flex: 1, display: 'flex', alignItems: 'center', gap: SPACING[2],
  paddingTop: SPACING[4], paddingBottom: SPACING[4],
  paddingLeft: SPACING[3], paddingRight: SPACING[3],
  borderRadius: LIST_TOKENS.GROUP_CARD_RADIUS,
  background: TOKENS.surface, border: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  cursor: 'pointer', fontFamily: 'inherit',
};
const filterTileText = {
  fontSize: 17, fontWeight: TYPOGRAPHY.weight.medium,
  letterSpacing: -0.2, color: TOKENS.ink,
};

// ═════════════════════════════════════════════════════════════
// SearchScreen ← src/screens/Search/SearchScreen.tsx
// variant: 'default' (initial empty) | 'with-results' | 'no-results' | 'loading'
// ═════════════════════════════════════════════════════════════
function SearchScreen({ initialQuery = '', variant = 'default' }) {
  const presetQuery = variant === 'with-results' ? '咖啡'
    : variant === 'no-results' ? 'USD 旅遊'
    : variant === 'loading' ? '居家'
    : initialQuery;
  const [q, setQ] = React.useState(presetQuery);
  const baseResults = variant === 'with-results'
    ? TX.filter(t => (t.note || '').includes('咖啡') || (t.note || '').includes('居酒屋'))
    : variant === 'no-results' || variant === 'loading'
    ? []
    : q ? TX.filter(t => (t.note || '').toLowerCase().includes(q.toLowerCase())) : [];
  const results = baseResults.map(t => ({ ...t, _date: t.date }));
  const isLoading = variant === 'loading';
  const hasSearched = variant === 'no-results' || variant === 'with-results' || (q && variant === 'default');
  const showEmpty = !isLoading && results.length === 0;
  return (
    <div style={{ position: 'relative', minHeight: '100%', background: TOKENS.bg }}>
      {isLoading ? (
        <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: SPACING[3] }}>
          <Spinner size={32}/>
          <span style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2 }}>搜尋中...</span>
        </div>
      ) : showEmpty ? (
        <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center' }}>
          <ListEmptyState
            iconName="magnify"
            title={hasSearched ? '找不到結果' : '輸入關鍵字以搜尋交易'}
            description={hasSearched ? `「${q}」` : undefined}/>
        </div>
      ) : (
        <div style={{ paddingBottom: BOTTOM_SEARCH_BAR_TOTAL_HEIGHT + 40 }}>
          {results.map(tx => {
            const cat = CAT_BY_ID[tx.cat];
            const color = tx.amount < 0 ? TOKENS.error : tx.amount > 0 ? TOKENS.success : TOKENS.ink;
            return (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center',
                padding: SPACING[4],
                borderBottom: `1px solid ${TOKENS.surface}`,
              }}>
                <div style={{ marginRight: SPACING[4], width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DynamicIconById iconId={cat.iconId} size={24} color={color}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.ink }}>{cat.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {tx.recurring && (
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: TOKENS.bg, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Glyph name="repeat" size={14} color={TOKENS.ink3} stroke={2}/>
                        </div>
                      )}
                      <span style={{
                        fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium,
                        color, fontVariantNumeric: 'tabular-nums',
                      }}>{fmt(tx.amount, tx.currency)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ flex: 1, fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {highlightInText(tx.note || '', q)}
                    </span>
                    <span style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, marginLeft: 8 }}>{tx._date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <BottomSearchBar value={q} onChangeText={setQ} placeholder="搜尋..." autoFocus/>
    </div>
  );
}
function highlightInText(text, q) {
  if (!q.trim()) return text;
  const parts = text.split(new RegExp(`(${q})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase()
      ? <span key={i} style={{ color: TOKENS.p500, fontWeight: TYPOGRAPHY.weight.medium }}>{p}</span>
      : <span key={i}>{p}</span>
  );
}

// ═════════════════════════════════════════════════════════════
// SettingsScreen ← src/screens/Settings/SettingsScreen.tsx
// 4 個 ListSection（無 title），ListGroupCard 包裝
// ═════════════════════════════════════════════════════════════
function SettingsScreen({ onAccounts, onCategories, onPreference, onPaywall, onData, onDebug, onDebugByCategory, onMockData, onMockTier }) {
  const renderIcon = (name, color = TOKENS.ink) =>
    <Glyph name={name} size={LIST_TOKENS.ICON_SIZE_SMALL} color={color} stroke={1.8}/>;
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100 }}>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('tag-outline')} title="管理類別" showChevron onPress={onCategories}/>
          <ListItem leftIcon={renderIcon('bank-outline')} title="管理帳戶" showChevron onPress={onAccounts}/>
          <ListItem leftIcon={renderIcon('database-cog-outline')} title="資料管理" showChevron onPress={onData}/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('cog-outline')} title="偏好設定" showChevron onPress={onPreference}/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('star-outline', TOKENS.p500)} title="升級至 Premium" titleColor={TOKENS.p500} showChevron onPress={onPaywall}/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('bug-outline')} title="Debug Info by Account" showChevron onPress={onDebug}/>
          <ListItem leftIcon={renderIcon('tag-outline')} title="Debug Info by Category" showChevron onPress={onDebugByCategory}/>
          <ListItem leftIcon={renderIcon('database-cog-outline')} title="Mock Data Settings" showChevron onPress={onMockData}/>
          <ListItem leftIcon={renderIcon('shield-account-outline')} title="Mock Tier: Level 0 (Free)" value="Toggle" onPress={onMockTier}/>
        </ListGroupCard>
      </ListSection>
      <div style={{
        marginTop: SPACING[8], marginBottom: SPACING[8],
        textAlign: 'center', color: TOKENS.ink3, fontSize: TYPOGRAPHY.size.xs,
      }}>Version 0.1.0-alpha</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PreferenceScreen ← src/screens/Settings/PreferenceScreen.tsx
// 4 個 ListSection（無 title），ListItem 都無 icon
// ═════════════════════════════════════════════════════════════
function PreferenceScreen({ onTheme, onLaunch, onCurrency, onCurrencyList, onRateList, onLanguage, onTimezone }) {
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100 }}>
      <ListSection>
        <ListGroupCard>
          <ListItem title="主題" value="經典紫 (Classic Purple)" showChevron onPress={onTheme}/>
          <ListItem title="啟動設定" value="首頁" showChevron onPress={onLaunch}/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem title="基準貨幣" value="TWD" showChevron onPress={onCurrency}/>
          <ListItem title="貨幣設定" showChevron onPress={onCurrencyList}/>
          <ListItem title="匯率管理" showChevron onPress={onRateList}/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem title="語言" value="繁體中文" showChevron onPress={onLanguage}/>
          <ListItem title="時區" value="Taipei" showChevron onPress={onTimezone}/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem title="登出" titleColor={TOKENS.error}/>
        </ListGroupCard>
      </ListSection>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// AccountListScreen ← src/screens/Accounts/AccountListScreen.tsx
// Header right = merge icon。Reorderable list + 新增帳戶 button 在另一個 GroupCard
// ═════════════════════════════════════════════════════════════
function AccountListScreen({ onAdd, onEdit, variant = 'default' }) {
  const accs = variant === 'empty' ? [] : ACCOUNTS;
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100 }}>
      {accs.length > 0 ? (
      <ListGroupCard>
        {accs.map(a => (
          <ReorderableListItem key={a.id}
            leftIcon={<DynamicIconById iconId={a.iconId} size={LIST_TOKENS.ICON_SIZE_SMALL} color={TOKENS.ink}/>}
            title={a.name} subtitle={a.currency}
            style={{ height: 60 }}/>
        ))}
      </ListGroupCard>
      ) : null}
      <ListGroupCard>
        <ListItem
          leftIcon={<Glyph name="plus" size={LIST_TOKENS.ICON_SIZE_SMALL} color={TOKENS.p500} stroke={2.4}/>}
          title="新增帳戶" titleColor={TOKENS.p500} onPress={onAdd}/>
      </ListGroupCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CategoryListScreen ← src/screens/Categories/CategoryListScreen.tsx
// 兩個 section，每個有自訂 section header + reorder card + add card
// ═════════════════════════════════════════════════════════════
function CategoryListScreen({ onAddExpense, onAddIncome }) {
  const expense = CATEGORIES.filter(c => c.type === 'expense');
  const income = CATEGORIES.filter(c => c.type === 'income');
  const renderAdd = (titleStr, onPress) => (
    <ListGroupCard>
      <ListItem
        leftIcon={<Glyph name="plus" size={LIST_TOKENS.ICON_SIZE_SMALL} color={TOKENS.p500} stroke={2.4}/>}
        title={titleStr} titleColor={TOKENS.p500} onPress={onPress}/>
    </ListGroupCard>
  );
  return (
    <div style={{ paddingLeft: SPACING[4], paddingRight: SPACING[4], background: TOKENS.bg, paddingTop: SPACING[3], paddingBottom: 100 }}>
      <CategorySectionTitle>支出</CategorySectionTitle>
      <ListGroupCard>
        {expense.map(c => (
          <ReorderableListItem key={c.id}
            leftIcon={<DynamicIconById iconId={c.iconId} size={LIST_TOKENS.ICON_SIZE_SMALL} color={TOKENS.ink}/>}
            title={c.name} style={{ height: 60 }}/>
        ))}
      </ListGroupCard>
      {renderAdd('新增支出類別', onAddExpense)}
      <CategorySectionTitle>收入</CategorySectionTitle>
      <ListGroupCard>
        {income.map(c => (
          <ReorderableListItem key={c.id}
            leftIcon={<DynamicIconById iconId={c.iconId} size={LIST_TOKENS.ICON_SIZE_SMALL} color={TOKENS.ink}/>}
            title={c.name} style={{ height: 60 }}/>
        ))}
      </ListGroupCard>
      {renderAdd('新增收入類別', onAddIncome)}
    </div>
  );
}
function CategorySectionTitle({ children }) {
  return (
    <div style={{
      paddingLeft: SPACING[4], paddingRight: SPACING[4],
      paddingTop: SPACING[3], paddingBottom: SPACING[1] + 2,
      fontSize: LIST_TOKENS.SECTION_TITLE_SIZE,
      fontWeight: LIST_TOKENS.SECTION_TITLE_WEIGHT,
      color: TOKENS.ink2, textTransform: 'uppercase',
      letterSpacing: LIST_TOKENS.SECTION_TITLE_LETTER_SPACING,
    }}>{children}</div>
  );
}

// ═════════════════════════════════════════════════════════════
// TransactionEditorScreen ← src/screens/Transactions/TransactionEditorScreen.tsx
// dateContainer + amountContainer + pickerRow + note + delete + AnimatedKeypad
// ═════════════════════════════════════════════════════════════
function TransactionEditorScreen({ type = 'expense', isEdit = false, variant = 'default' }) {
  const isError = variant === 'error';
  const [amount, setAmount] = React.useState(isError ? '' : '185');
  const [note, setNote] = React.useState(isError ? '' : '路易莎咖啡');
  const [recurring, setRecurring] = React.useState(false);
  const [accountId, setAccountId] = React.useState('credit');
  const [categoryId, setCategoryId] = React.useState('food');
  const [amountFocused, setAmountFocused] = React.useState(true);
  const acc = ACC_BY_ID[accountId];
  const symbol = acc.currency === 'TWD' ? 'NT$' : acc.currency === 'USD' ? 'US$' : acc.currency;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: TOKENS.bg }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: SPACING[4] }}>
        {/* validation error banner — 對應 impl Alert.alert 但畫成 inline banner 方便視覺對齊 */}
        {isError && (
          <div style={{
            background: `${TOKENS.error}15`,
            borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: TOKENS.error,
            padding: SPACING[3], borderRadius: 8,
            marginBottom: SPACING[4],
            display: 'flex', alignItems: 'flex-start', gap: SPACING[2],
          }}>
            <Glyph name="warning" size={18} color={TOKENS.error}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.error, marginBottom: 2 }}>錯誤</div>
              <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink }}>請輸入有效金額</div>
            </div>
          </div>
        )}
        {/* dateContainer */}
        <div style={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          marginBottom: SPACING[6],
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: TOKENS.surface,
            paddingTop: SPACING[2], paddingBottom: SPACING[2],
            paddingLeft: SPACING[4], paddingRight: SPACING[4],
            borderRadius: 20, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
            marginLeft: SPACING[4], marginRight: SPACING[4],
          }}>
            <span style={{ fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink, fontWeight: TYPOGRAPHY.weight.medium }}>
              2026/05/14  14:30
            </span>
          </div>
          <button onClick={() => setRecurring(!recurring)} style={{
            width: 40, height: 40, borderRadius: 20,
            background: TOKENS.surface,
            borderWidth: 1, borderStyle: 'solid',
            borderColor: recurring ? TOKENS.p500 : TOKENS.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
          }}>
            <Glyph name="repeat" size={24} color={recurring ? TOKENS.p500 : TOKENS.ink3} stroke={2}/>
          </button>
        </div>
        {/* RecurringOptions panel — impl 在 showRecurringOptions=true 時於 dateContainer 下方顯示 */}
        {recurring && <RecurringOptionsPanel/>}
        {/* amountContainer */}
        <div style={{ marginBottom: SPACING[6] }}>
          <div onClick={() => setAmountFocused(true)} style={{
            display: 'flex', alignItems: 'center',
            background: amountFocused ? TOKENS.bg : TOKENS.surface,
            padding: SPACING[4],
            borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid',
            borderColor: amountFocused ? TOKENS.p500 : TOKENS.border,
            cursor: 'pointer',
          }}>
            <span style={{
              fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.medium,
              color: TOKENS.ink, marginRight: SPACING[2],
            }}>{symbol}</span>
            <span style={{
              flex: 1,
              fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.medium,
              color: amount ? TOKENS.ink : TOKENS.ink3,
              fontVariantNumeric: 'tabular-nums',
            }}>{amount || '0.00'}</span>
            <div style={{ padding: SPACING[2] }}>
              <Glyph name="backspace-outline" size={24} color={TOKENS.ink2} stroke={1.6}/>
            </div>
          </div>
        </div>
        {/* pickerRow */}
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: SPACING[6] }}>
          <StaticWheelPicker label={ACC_BY_ID[accountId].name} subLabel={ACC_BY_ID[accountId].currency}/>
          <div style={{ width: SPACING[4] }}/>
          <StaticWheelPicker label={CAT_BY_ID[categoryId].name} subLabel={CAT_BY_ID[categoryId].type === 'expense' ? '支出' : '收入'} accent={CAT_BY_ID[categoryId].type === 'expense' ? TOKENS.error : TOKENS.success}/>
        </div>
        {/* note */}
        <div style={{ marginBottom: SPACING[6] }}>
          <input value={note} onChange={(e) => { setNote(e.target.value); setAmountFocused(false); }}
            placeholder="新增備註"
            onFocus={() => setAmountFocused(false)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: TOKENS.surface,
              padding: SPACING[4],
              borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
              fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink,
              fontFamily: 'inherit', outline: 'none',
            }}/>
        </div>
        {isEdit && (
          <div style={{ marginTop: SPACING[4], display: 'flex', justifyContent: 'center' }}>
            <button style={{
              padding: SPACING[2], background: 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: TOKENS.error, fontSize: TYPOGRAPHY.size.base,
            }}>刪除交易</button>
          </div>
        )}
        <div style={{ height: 400 }}/>
      </div>
      {amountFocused && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: TOKENS.surface,
          borderTop: `1px solid ${TOKENS.border}`,
          paddingBottom: SPACING[6],
        }}>
          <CalculatorKeypad onPress={(k) => {
            if (k === '=') return;
            if (k === '.' || /^\d$/.test(k)) {
              setAmount(prev => (prev === '0' ? k : prev + k));
            }
          }}/>
        </div>
      )}
    </div>
  );
}

// RecurringOptionsPanel — 對齊 src/components/RecurringOptions.tsx
// container bg surface radius 12 padding SPACING[4] marginTop SPACING[2] marginBottom SPACING[4] border 1px border.base
// headerRow: title "定期設定" primary medium + Switch
// 內容（isEnabled=true 時）：頻率 4 button / 每隔 input + unit / 結束於 2 button
function RecurringOptionsPanel() {
  const [enabled, setEnabled] = React.useState(true);
  const [frequency, setFrequency] = React.useState('MONTHLY');
  const [endCondition, setEndCondition] = React.useState('NEVER');
  const freqs = [
    { v: 'DAILY',   label: '每日' },
    { v: 'WEEKLY',  label: '每週' },
    { v: 'MONTHLY', label: '每月' },
    { v: 'YEARLY',  label: '每年' },
  ];
  const unitText = { DAILY: '天', WEEKLY: '週', MONTHLY: '月', YEARLY: '年' }[frequency];
  const optionBtn = (label, selected, onClick) => (
    <button onClick={onClick} style={{
      paddingTop: SPACING[2], paddingBottom: SPACING[2],
      paddingLeft: SPACING[3], paddingRight: SPACING[3],
      borderRadius: 16,
      borderWidth: 1, borderStyle: 'solid',
      borderColor: selected ? TOKENS.p500 : TOKENS.border,
      marginRight: SPACING[2], marginBottom: SPACING[2],
      background: selected ? TOKENS.p500 : TOKENS.bg,
      cursor: 'pointer', fontFamily: 'inherit',
      color: selected ? '#fff' : TOKENS.ink,
      fontSize: TYPOGRAPHY.size.sm,
      fontWeight: selected ? TYPOGRAPHY.weight.medium : TYPOGRAPHY.weight.regular,
    }}>{label}</button>
  );
  return (
    <div style={{
      background: TOKENS.surface,
      borderRadius: 12, padding: SPACING[4],
      marginTop: SPACING[2], marginBottom: SPACING[4],
      borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
    }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[4] }}>
        <span style={{ fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.p500 }}>定期設定</span>
        <Switch value={enabled} onChange={setEnabled} trackColorOn={TOKENS.p500}/>
      </div>
      <div style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
        <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, marginTop: SPACING[2], marginBottom: SPACING[2] }}>頻率</div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING[2] }}>
          {freqs.map(f => optionBtn(f.label, frequency === f.v, () => setFrequency(f.v)))}
        </div>
        <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, marginTop: SPACING[2], marginBottom: SPACING[2] }}>每隔</div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: SPACING[2] }}>
          <input defaultValue="1" style={{
            background: TOKENS.bg, padding: SPACING[2],
            borderRadius: 8, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
            fontSize: TYPOGRAPHY.size.lg, width: 60, textAlign: 'center',
            marginRight: SPACING[3], color: TOKENS.ink, fontFamily: 'inherit', outline: 'none',
          }}/>
          <span style={{ fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink }}>{unitText}</span>
        </div>
        <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, marginTop: SPACING[2], marginBottom: SPACING[2] }}>結束於</div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {optionBtn('永不',       endCondition === 'NEVER',   () => setEndCondition('NEVER'))}
          {optionBtn('特定日期',   endCondition === 'ON_DATE', () => setEndCondition('ON_DATE'))}
        </div>
      </div>
    </div>
  );
}

// 靜態 wheel picker（display only）— mode='static' 的視覺對應
function StaticWheelPicker({ label, subLabel, accent }) {
  return (
    <div style={{
      flex: 1, height: 110,
      background: TOKENS.surface,
      borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: SPACING[2],
    }}>
      <div style={{
        fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink3, opacity: 0.6,
      }}>{subLabel ? `(${subLabel})` : ''}</div>
      <div style={{
        fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.medium,
        color: accent || TOKENS.ink, marginTop: 4, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink3, opacity: 0.6,
      }}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TransferEditorScreen ← src/screens/Transactions/TransferEditorScreen.tsx
// ═════════════════════════════════════════════════════════════
function TransferEditorScreen({ isEdit = false }) {
  const [fromAccount] = React.useState('bank');
  const [toAccount] = React.useState('usd_cash');
  const [activeField, setActiveField] = React.useState('from');
  const [recurring, setRecurring] = React.useState(false);
  const fromAcc = ACC_BY_ID[fromAccount];
  const toAcc = ACC_BY_ID[toAccount];
  const isCrossCurrency = fromAcc.currency !== toAcc.currency;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: TOKENS.bg }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: SPACING[4] }}>
        {/* date row */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING[6] }}>
          <div style={{
            background: TOKENS.surface, paddingTop: SPACING[2], paddingBottom: SPACING[2],
            paddingLeft: SPACING[4], paddingRight: SPACING[4],
            borderRadius: 20, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
            marginLeft: SPACING[4], marginRight: SPACING[4],
          }}>
            <span style={{ fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink, fontWeight: TYPOGRAPHY.weight.medium }}>
              2026/05/14  14:30
            </span>
          </div>
          <button onClick={() => setRecurring(!recurring)} style={{
            width: 40, height: 40, borderRadius: 20,
            background: TOKENS.surface, borderWidth: 1, borderStyle: 'solid',
            borderColor: recurring ? TOKENS.p500 : TOKENS.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
          }}>
            <Glyph name="repeat" size={24} color={recurring ? TOKENS.p500 : TOKENS.ink3} stroke={2}/>
          </button>
        </div>
        {recurring && <RecurringOptionsPanel/>}
        {/* amounts row */}
        <div style={{ marginBottom: SPACING[6] }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <AmountField active={activeField === 'from'} value="15,000" currency={fromAcc.currency}
                onPress={() => setActiveField('from')}/>
            </div>
            <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
              <Glyph name="arrow-right" size={24} color={TOKENS.ink2}/>
            </div>
            <div style={{ flex: 1 }}>
              <AmountField active={activeField === 'to' && isCrossCurrency} disabled={!isCrossCurrency}
                value="480" currency={toAcc.currency}
                onPress={() => isCrossCurrency && setActiveField('to')}/>
            </div>
          </div>
        </div>
        {/* picker row */}
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: SPACING[6], alignItems: 'flex-start' }}>
          <StaticWheelPicker label={fromAcc.name} subLabel={fromAcc.currency}/>
          <div style={{ width: SPACING[4], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ marginTop: 30 }}>
              <Glyph name="arrow-right" size={24} color={TOKENS.ink2}/>
            </div>
          </div>
          <StaticWheelPicker label={toAcc.name} subLabel={toAcc.currency}/>
        </div>
        {/* note */}
        <div style={{ marginBottom: SPACING[6] }}>
          <input placeholder="新增備註" style={{
            width: '100%', boxSizing: 'border-box',
            background: TOKENS.surface,
            padding: SPACING[4],
            borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
            fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink,
            fontFamily: 'inherit', outline: 'none',
          }}/>
        </div>
        {isEdit && (
          <div style={{ marginTop: SPACING[4], display: 'flex', justifyContent: 'center' }}>
            <button style={{
              padding: SPACING[2], background: 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: TOKENS.error, fontSize: TYPOGRAPHY.size.base,
            }}>刪除</button>
          </div>
        )}
        <div style={{ height: 400 }}/>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: TOKENS.surface,
        borderTop: `1px solid ${TOKENS.border}`,
        paddingBottom: SPACING[6],
      }}>
        <CalculatorKeypad/>
      </div>
    </div>
  );
}
function AmountField({ active, value, currency, disabled, onPress }) {
  // impl amountContainer: row + center justify + center align, height 80
  // 內含 flex:1 column (amount + currency) + 條件式 backspace (absolute right)
  return (
    <div onClick={onPress} style={{
      position: 'relative',
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      background: disabled ? TOKENS.bg : (active ? TOKENS.bg : TOKENS.surface),
      padding: SPACING[3],
      borderRadius: RADIUS.md,
      borderWidth: active ? 1 : (disabled ? 0 : 1), borderStyle: 'solid',
      borderColor: active ? TOKENS.p500 : TOKENS.border,
      height: 80, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.7 : 1,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.medium,
          color: disabled ? TOKENS.ink2 : (value ? TOKENS.ink : TOKENS.ink3),
          textAlign: 'center', fontVariantNumeric: 'tabular-nums',
        }}>{value || '0.00'}</span>
        {currency && (
          <span style={{
            fontSize: TYPOGRAPHY.size.xs, color: TOKENS.ink2,
            textAlign: 'center', marginTop: SPACING[1],
          }}>{currency}</span>
        )}
      </div>
      {active && !disabled && (
        <div style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          padding: SPACING[2],
        }}>
          <Glyph name="backspace-outline" size={24} color={TOKENS.ink2} stroke={1.6}/>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// AccountEditorScreen ← src/screens/Accounts/AccountEditorScreen.tsx
// formGroups with collapsible pickers
// ═════════════════════════════════════════════════════════════
function AccountEditorScreen({ isNew = true }) {
  const [name, setName] = React.useState(isNew ? '' : '玉山活儲');
  const [enabled, setEnabled] = React.useState(true);
  const [expanded, setExpanded] = React.useState(null);  // 'currency' | 'type' | 'icon' | null
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100, minHeight: '100%' }}>
      <FormGroup label="帳戶名稱 *">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：現金"
          style={formInput}/>
      </FormGroup>
      <FormGroup label="幣別 *">
        <CollapsiblePicker
          isExpanded={expanded === 'currency'}
          collapsedValue={isNew ? '選擇' : 'TWD'}
          onToggle={() => setExpanded(expanded === 'currency' ? null : 'currency')}
          disabled={!isNew}
        >
          <ListGroupCard style={{ marginBottom: 0 }}>
            <SelectionListItem title="TWD - New Taiwan Dollar" selected/>
            <SelectionListItem title="USD - US Dollar"/>
            <SelectionListItem title="JPY - Japanese Yen"/>
          </ListGroupCard>
        </CollapsiblePicker>
      </FormGroup>
      <FormGroup label="類型 *">
        <CollapsiblePicker
          isExpanded={expanded === 'type'}
          collapsedValue="現金"
          onToggle={() => setExpanded(expanded === 'type' ? null : 'type')}
        >
          <ListGroupCard style={{ marginBottom: 0 }}>
            <SelectionListItem title="現金" selected/>
            <SelectionListItem title="銀行帳戶"/>
            <SelectionListItem title="信用卡"/>
            <SelectionListItem title="投資"/>
          </ListGroupCard>
        </CollapsiblePicker>
      </FormGroup>
      <FormGroup label="圖示 *">
        <CollapsiblePicker
          isExpanded={expanded === 'icon'}
          collapsedValue={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DynamicIconById iconId={15} size={24} color={TOKENS.ink}/>
              <span style={{ marginLeft: 8 }}>ant-wallet</span>
            </div>
          }
          onToggle={() => setExpanded(expanded === 'icon' ? null : 'icon')}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', padding: SPACING[2], maxHeight: 150, overflowY: 'auto' }}>
            {ICON_LIBRARY.filter(i => i.tags.includes('account')).map((i, idx) => {
              const selected = idx === 1;  // ant-wallet for demo
              return (
                <div key={i.id} style={{
                  width: '25%', aspectRatio: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8,
                  background: selected ? TOKENS.p500 : 'transparent',
                  marginTop: 4, marginBottom: 4,
                }}>
                  <DynamicIconById iconId={i.id} size={24} color={selected ? '#fff' : TOKENS.ink}/>
                </div>
              );
            })}
          </div>
        </CollapsiblePicker>
      </FormGroup>
      {!isNew && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: TOKENS.surface, padding: SPACING[4],
            borderRadius: RADIUS.md, marginBottom: SPACING[6],
          }}>
            <span style={{ fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink }}>啟用帳戶</span>
            <Switch value={enabled} onChange={setEnabled}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              padding: SPACING[4], background: 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: TOKENS.error, fontSize: TYPOGRAPHY.size.base,
            }}>刪除帳戶</button>
          </div>
        </>
      )}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: SPACING[6] }}>
      {label && (
        <div style={{
          fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2,
          marginBottom: SPACING[2],
        }}>{label}</div>
      )}
      {children}
    </div>
  );
}
const formInput = {
  width: '100%', boxSizing: 'border-box',
  background: TOKENS.surface, padding: SPACING[3],
  borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
  fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink,
  fontFamily: 'inherit', outline: 'none',
};

function CollapsiblePicker({ isExpanded, collapsedValue, onToggle, children, disabled }) {
  if (!isExpanded) {
    return (
      <div onClick={disabled ? undefined : onToggle} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: TOKENS.surface, padding: SPACING[3],
        borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid', borderColor: TOKENS.border,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
        <div style={{ fontSize: TYPOGRAPHY.size.base, color: disabled ? TOKENS.ink3 : TOKENS.ink }}>{collapsedValue}</div>
        {!disabled && <Glyph name="chevron-down" size={20} color={TOKENS.ink2}/>}
      </div>
    );
  }
  return (
    <div style={{
      background: TOKENS.surface,
      borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'solid',
      borderColor: TOKENS.p500, maxHeight: 250, overflow: 'hidden',
    }}>
      <div onClick={onToggle} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING[3],
        borderBottom: `1px solid ${TOKENS.border}`,
        cursor: 'pointer',
      }}>
        <span style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, fontWeight: TYPOGRAPHY.weight.medium }}>選擇</span>
        <Glyph name="chevron-up" size={20} color={TOKENS.ink2}/>
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CategoryEditorScreen ← src/screens/Categories/CategoryEditorScreen.tsx
// ═════════════════════════════════════════════════════════════
function CategoryEditorScreen({ isNew = true, type = 'expense' }) {
  const [name, setName] = React.useState(isNew ? '' : '飲食');
  const [expanded, setExpanded] = React.useState(null);
  const [enabled, setEnabled] = React.useState(true);
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100, minHeight: '100%' }}>
      <FormGroup label="名稱 *">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="類別名稱"
          style={formInput}/>
      </FormGroup>
      <FormGroup label="標準類別對應">
        <CollapsiblePicker
          isExpanded={expanded === 'standard'}
          collapsedValue={type === 'expense' ? '飲食' : '薪資'}
          onToggle={() => setExpanded(expanded === 'standard' ? null : 'standard')}
        >
          <ListGroupCard style={{ marginBottom: 0 }}>
            {type === 'expense'
              ? ['飲食','交通','購物','娛樂','居家','醫療'].map((n, i) => (
                <SelectionListItem key={n} title={n} selected={i === 0}/>
              ))
              : ['薪資','投資','其他'].map((n, i) => (
                <SelectionListItem key={n} title={n} selected={i === 0}/>
              ))
            }
          </ListGroupCard>
        </CollapsiblePicker>
        <div style={{ fontSize: 12, color: TOKENS.ink3, marginTop: 4 }}>用於統計和分析</div>
      </FormGroup>
      <FormGroup label="圖示 *">
        <CollapsiblePicker
          isExpanded={expanded === 'icon'}
          collapsedValue={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DynamicIconById iconId={1} size={24} color={TOKENS.ink}/>
              <span style={{ marginLeft: 8 }}>mci-food</span>
            </div>
          }
          onToggle={() => setExpanded(expanded === 'icon' ? null : 'icon')}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', padding: SPACING[2], maxHeight: 200, overflowY: 'auto' }}>
            {ICON_LIBRARY.filter(i => i.tags.includes('category')).slice(0, 24).map((i, idx) => {
              const selected = idx === 0;
              return (
                <div key={i.id} style={{
                  width: '25%', aspectRatio: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8,
                  background: selected ? TOKENS.p500 : 'transparent',
                  marginTop: 4, marginBottom: 4,
                }}>
                  <DynamicIconById iconId={i.id} size={24} color={selected ? '#fff' : TOKENS.ink}/>
                </div>
              );
            })}
          </div>
        </CollapsiblePicker>
      </FormGroup>
      {!isNew && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: TOKENS.surface, padding: SPACING[4],
            borderRadius: RADIUS.md, marginBottom: SPACING[6],
          }}>
            <span style={{ fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink }}>啟用類別</span>
            <Switch value={enabled} onChange={setEnabled}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              padding: SPACING[4], background: 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: TOKENS.error, fontSize: TYPOGRAPHY.size.base,
            }}>刪除類別</button>
          </div>
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PaywallScreen ← src/screens/Paywall/PaywallScreen.tsx
// title (3xl center primary) + bullets + 2 product cards + buy/restore/close
// ═════════════════════════════════════════════════════════════
function PaywallScreen({ variant = 'default' }) {
  const [selected, setSelected] = React.useState('yearly');
  const products = [
    { id: 'yearly',  name: '年訂閱', price: 'NT$680 / 年' },
    { id: 'monthly', name: '月訂閱', price: 'NT$80 / 月' },
  ];
  if (variant === 'loading') {
    return (
      <div style={{
        padding: SPACING[6], background: TOKENS.bg, minHeight: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <Spinner size={48}/>
      </div>
    );
  }
  return (
    <div style={{
      padding: SPACING[6], background: TOKENS.bg, minHeight: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', paddingBottom: 80,
    }}>
      <div style={{
        fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.medium,
        marginBottom: SPACING[8], color: TOKENS.ink, textAlign: 'center',
      }}>解鎖 Premium</div>
      <div style={{ alignSelf: 'flex-start', marginBottom: SPACING[6], marginLeft: SPACING[4] }}>
        {['無限帳戶', '無限類別', '雲端同步', '多幣別支援'].map(b => (
          <div key={b} style={{
            fontSize: TYPOGRAPHY.size.lg,
            marginBottom: SPACING[4], color: TOKENS.ink2,
          }}>• {b}</div>
        ))}
      </div>
      <div style={{ width: '100%', marginBottom: SPACING[6] }}>
        {products.map(p => {
          const isSel = selected === p.id;
          return (
            <button key={p.id} onClick={() => setSelected(p.id)} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: SPACING[4], borderRadius: 12,
              borderWidth: 1, borderStyle: 'solid',
              borderColor: isSel ? TOKENS.p500 : TOKENS.border,
              background: isSel ? `${TOKENS.p100}33` : TOKENS.surface,
              marginBottom: SPACING[3], cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium,
                  color: isSel ? TOKENS.p500 : TOKENS.ink,
                }}>{p.name}</div>
                <div style={{
                  fontSize: TYPOGRAPHY.size.sm,
                  color: isSel ? TOKENS.p500 : TOKENS.ink2, marginTop: 2,
                }}>{p.price}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: 10,
                borderWidth: 2, borderStyle: 'solid',
                borderColor: isSel ? TOKENS.p500 : TOKENS.ink2,
                background: isSel ? TOKENS.p500 : 'transparent',
              }}/>
            </button>
          );
        })}
      </div>
      <button style={{
        width: '90%', padding: SPACING[4],
        background: TOKENS.p500, color: '#fff', borderRadius: 24, border: 'none',
        fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.medium,
        cursor: 'pointer', fontFamily: 'inherit', marginBottom: SPACING[4],
      }}>訂閱</button>
      <button style={{
        padding: SPACING[2], background: 'transparent', border: 'none',
        color: TOKENS.ink2, textDecorationLine: 'underline',
        fontSize: TYPOGRAPHY.size.base, cursor: 'pointer', fontFamily: 'inherit',
      }}>恢復購買</button>
      <button style={{
        marginTop: SPACING[2], padding: SPACING[2],
        background: 'transparent', border: 'none',
        color: TOKENS.ink2, fontSize: TYPOGRAPHY.size.base,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>不用了，謝謝</button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// LoginScreen ← src/screens/Auth/LoginScreen.tsx
// ═════════════════════════════════════════════════════════════
function LoginScreen({ variant = 'default' }) {
  const isLoading = variant === 'loading';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: TOKENS.bg, paddingTop: 50, paddingBottom: 0,
    }}>
      <div style={{
        flex: 2, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        paddingTop: SPACING[12],
      }}>
        <div style={{
          fontSize: 48, fontWeight: TYPOGRAPHY.weight.medium,
          color: TOKENS.p500, marginBottom: SPACING[3],
        }}>SuSuGiGi</div>
        <div style={{
          fontSize: TYPOGRAPHY.size.base, color: TOKENS.ink2,
          textAlign: 'center',
        }}>智慧記帳，輕鬆理財</div>
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        paddingLeft: SPACING[8], paddingRight: SPACING[8],
      }}>
        <button style={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          background: TOKENS.p500,
          paddingTop: SPACING[4], paddingBottom: SPACING[4],
          paddingLeft: SPACING[6], paddingRight: SPACING[6],
          borderRadius: 8, width: '100%', maxWidth: 320,
          border: 'none', cursor: isLoading ? 'default' : 'pointer', fontFamily: 'inherit',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          opacity: isLoading ? 0.6 : 1,
        }}>
          {isLoading ? (
            <Spinner size={20} color="#fff"/>
          ) : (
            <>
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: SPACING[3],
              }}>
                <span style={{ fontSize: 16, fontWeight: TYPOGRAPHY.weight.medium, color: TOKENS.p500 }}>G</span>
              </div>
              <span style={{
                color: '#fff', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.medium,
              }}>使用 Google 登入</span>
            </>
          )}
        </button>
        <div style={{
          marginTop: SPACING[6], fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2,
          textAlign: 'center', paddingLeft: SPACING[4], paddingRight: SPACING[4],
        }}>登入即表示您同意我們的服務條款與隱私政策</div>
      </div>
      <div style={{ paddingBottom: SPACING[8], display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: TYPOGRAPHY.size.xs, color: TOKENS.ink2 }}>© 2026 SuSuGiGi. All rights reserved.</span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ThemeSettingsScreen ← src/screens/Settings/ThemeSettingsScreen.tsx
// 2-col SelectionGridItem with 3-color preview row
// ═════════════════════════════════════════════════════════════
function ThemeSettingsScreen() {
  const [selected, setSelected] = React.useState('theme1');
  const themesList = [THEME_1, THEME_2];
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: LIST_TOKENS.GRID_GAP }}>
        {themesList.map(t => (
          <div key={t.id} style={{ width: '47%' }}>
            <SelectionGridItem title={t.name} selected={selected === t.id} onPress={() => setSelected(t.id)}>
              <div style={{ flex: 1, background: t.primary[500] }}/>
              <div style={{ flex: 1, background: t.primary[900] }}/>
              <div style={{ flex: 1, background: t.bg.base }}/>
            </SelectionGridItem>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// LaunchModeSettingScreen ← src/screens/Settings/LaunchModeSettingScreen.tsx
// ═════════════════════════════════════════════════════════════
function LaunchModeSettingScreen() {
  const [selected, setSelected] = React.useState('home');
  const options = [
    { value: 'home', label: '首頁' },
    { value: 'expense', label: '直接記帳 (支出)' },
    { value: 'income', label: '直接記帳 (收入)' },
    { value: 'transfer', label: '直接轉帳' },
  ];
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, minHeight: '100%', paddingBottom: SPACING[6] }}>
      <ListGroupCard>
        {options.map(o => (
          <SelectionListItem key={o.value} title={o.label} selected={selected === o.value} onPress={() => setSelected(o.value)}/>
        ))}
      </ListGroupCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// LanguageSettingScreen
// ═════════════════════════════════════════════════════════════
function LanguageSettingScreen() {
  const [selected, setSelected] = React.useState('zh-Hant');
  const options = [
    { value: 'zh-Hant', label: '繁體中文' },
    { value: 'en', label: 'English' },
  ];
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, minHeight: '100%', paddingBottom: SPACING[6] }}>
      <ListGroupCard>
        {options.map(o => (
          <SelectionListItem key={o.value} title={o.label} selected={selected === o.value} onPress={() => setSelected(o.value)}/>
        ))}
      </ListGroupCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TimeZoneSettingScreen ← src/screens/Settings/TimeZoneSettingScreen.tsx
// ListGroupCard + FlatList of timezones + BottomSearchBar
// ═════════════════════════════════════════════════════════════
function TimeZoneSettingScreen() {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState('Asia/Taipei');
  const zones = [
    { name: 'Asia/Taipei',      label: 'Taipei (UTC+8)' },
    { name: 'Asia/Tokyo',       label: 'Tokyo (UTC+9)' },
    { name: 'Asia/Singapore',   label: 'Singapore (UTC+8)' },
    { name: 'America/New_York', label: 'New York (UTC-4)' },
    { name: 'America/Los_Angeles', label: 'Los Angeles (UTC-7)' },
    { name: 'Europe/London',    label: 'London (UTC+1)' },
    { name: 'Europe/Berlin',    label: 'Berlin (UTC+2)' },
    { name: 'Australia/Sydney', label: 'Sydney (UTC+10)' },
  ];
  const filtered = q ? zones.filter(z => z.label.toLowerCase().includes(q.toLowerCase()) || z.name.toLowerCase().includes(q.toLowerCase())) : zones;
  return (
    <div style={{ position: 'relative', height: '100%', background: TOKENS.bg }}>
      <div style={{
        paddingLeft: SPACING[4], paddingRight: SPACING[4],
        paddingBottom: BOTTOM_SEARCH_BAR_TOTAL_HEIGHT + 16,
      }}>
        <ListGroupCard>
          {filtered.map(z => (
            <SelectionListItem key={z.name} title={z.label} selected={selected === z.name} onPress={() => setSelected(z.name)}/>
          ))}
        </ListGroupCard>
      </div>
      <BottomSearchBar value={q} onChangeText={setQ} placeholder="搜尋"/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// BaseCurrencySettingScreen ← src/screens/Settings/BaseCurrencySettingScreen.tsx
// ═════════════════════════════════════════════════════════════
function BaseCurrencySettingScreen() {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState('TWD');
  const currencies = [
    { code: 'TWD', name: 'New Taiwan Dollar' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
  ];
  const filtered = q ? currencies.filter(c => c.code.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase())) : currencies;
  return (
    <div style={{ position: 'relative', height: '100%', background: TOKENS.bg }}>
      <div style={{ paddingLeft: SPACING[4], paddingRight: SPACING[4], paddingBottom: BOTTOM_SEARCH_BAR_TOTAL_HEIGHT + 16 }}>
        <ListGroupCard style={{ marginBottom: 0 }}>
          {filtered.map(c => (
            <SelectionListItem key={c.code} title={`${c.code} - ${c.name}`} selected={selected === c.code} onPress={() => setSelected(c.code)}/>
          ))}
        </ListGroupCard>
      </div>
      <BottomSearchBar value={q} onChangeText={setQ} placeholder="搜尋"/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CurrencyListScreen ← src/screens/Settings/CurrencyListScreen.tsx
// ═════════════════════════════════════════════════════════════
function CurrencyListScreen() {
  const [q, setQ] = React.useState('');
  const currencies = [
    { code: 'TWD', name: 'New Taiwan Dollar' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
  ];
  const filtered = q ? currencies.filter(c => c.code.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase())) : currencies;
  return (
    <div style={{ position: 'relative', height: '100%', background: TOKENS.bg }}>
      <div style={{ paddingLeft: SPACING[4], paddingRight: SPACING[4], paddingBottom: BOTTOM_SEARCH_BAR_TOTAL_HEIGHT + 16 }}>
        <ListGroupCard style={{ marginBottom: 0 }}>
          {filtered.map(c => (
            <ListItem key={c.code} title={c.code} subtitle={c.name} showChevron/>
          ))}
        </ListGroupCard>
      </div>
      <BottomSearchBar value={q} onChangeText={setQ} placeholder="搜尋"/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CurrencyRateListScreen ← src/screens/Settings/CurrencyRateListScreen.tsx
// ═════════════════════════════════════════════════════════════
function CurrencyRateListScreen({ variant = 'default' }) {
  const [q, setQ] = React.useState('');
  const allPairs = variant === 'empty' ? [] : [
    { from: 'USD', to: 'TWD', rate: 32.1500 },
    { from: 'JPY', to: 'TWD', rate: 0.2100 },
    { from: 'EUR', to: 'TWD', rate: 34.5000 },
  ];
  const filtered = q ? allPairs.filter(p => p.from.toLowerCase().includes(q.toLowerCase()) || p.to.toLowerCase().includes(q.toLowerCase())) : allPairs;
  const isEmpty = filtered.length === 0;
  return (
    <div style={{ position: 'relative', height: '100%', background: TOKENS.bg }}>
      <div style={{ paddingLeft: SPACING[4], paddingRight: SPACING[4], paddingBottom: BOTTOM_SEARCH_BAR_TOTAL_HEIGHT + 16 }}>
        {isEmpty ? (
          <div style={{ paddingTop: 80 }}>
            <ListEmptyState
              iconName="magnify"
              title={q ? '找不到結果' : '尚無匯率'}
              description={q ? `「${q}」` : '當您新增外幣帳戶或進行跨幣別轉帳時，相關匯率將會顯示於此。'}/>
          </div>
        ) : (
          <ListGroupCard>
            {filtered.map(p => (
              <ListItem key={`${p.from}-${p.to}`} title={`1 ${p.from} = ${p.rate.toFixed(4)} ${p.to}`} showChevron/>
            ))}
          </ListGroupCard>
        )}
      </div>
      <BottomSearchBar value={q} onChangeText={setQ} placeholder="搜尋幣別"/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// DataManagementScreen ← src/screens/Settings/DataManagementScreen.tsx
// 4 sections: 完整備份 / 匯入 / 匯出 / 危險操作
// ═════════════════════════════════════════════════════════════
function DataManagementScreen() {
  const renderIcon = (name, color = TOKENS.ink) =>
    <Glyph name={name} size={LIST_TOKENS.ICON_SIZE_SMALL} color={color} stroke={1.8}/>;
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100 }}>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('archive-arrow-up-outline')} title="完整備份匯出" showChevron/>
          <ListItem leftIcon={renderIcon('archive-arrow-down-outline')} title="備份檔還原" showChevron/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('file-import-outline')} title="匯入收入/支出" showChevron/>
          <ListItem leftIcon={renderIcon('swap-horizontal')} title="匯入轉帳" showChevron/>
          <ListItem leftIcon={renderIcon('calendar-clock')} title="匯入定期交易" showChevron/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('file-export-outline')} title="匯出收入/支出" showChevron/>
          <ListItem leftIcon={renderIcon('swap-horizontal')} title="匯出轉帳" showChevron/>
          <ListItem leftIcon={renderIcon('calendar-clock')} title="匯出定期交易" showChevron/>
        </ListGroupCard>
      </ListSection>
      <ListSection>
        <ListGroupCard>
          <ListItem leftIcon={renderIcon('database-refresh-outline', TOKENS.error)} title="清空資料庫" titleColor={TOKENS.error} showChevron/>
        </ListGroupCard>
      </ListSection>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// DebugInfoScreen ← src/screens/Settings/DebugInfoScreen.tsx
// Info box + global stats + per-account stats with active/deleted/all blocks
// ═════════════════════════════════════════════════════════════
function DebugInfoScreen() {
  const accounts = ACCOUNTS.map(a => ({
    ...a,
    active: { expense: TX.filter(t => t.acc === a.id && t.amount < 0).length, income: TX.filter(t => t.acc === a.id && t.amount > 0).length },
  }));
  return (
    <div style={{ padding: SPACING[4], background: TOKENS.bg, paddingBottom: 100 }}>
      {/* Info box */}
      <div style={{ marginBottom: SPACING[4] }}>
        <div style={{
          background: TOKENS.p100,
          borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: TOKENS.p500,
          padding: SPACING[3], borderRadius: 8,
        }}>
          <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink, lineHeight: 1.4 }}>
            💡 HomeScreen 只顯示 Active 資料（未刪除的交易和轉帳）。Debug Info 中的 Active 數字應與 HomeScreen 一致。
          </div>
        </div>
      </div>
      {/* Global Statistics */}
      <div style={{ marginBottom: SPACING[6] }}>
        <div style={{
          fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium,
          color: TOKENS.ink2, marginBottom: SPACING[2], marginLeft: SPACING[2],
        }}>Global Statistics</div>
        <div style={{ background: TOKENS.surface, borderRadius: 12, padding: SPACING[4] }}>
          <DebugBlock title="✓ Active (顯示於 HomeScreen)" active>
            <div>Accounts: {ACCOUNTS.length}</div>
            <div>Transactions: {TX.length}</div>
            <div>Transfers: 0</div>
          </DebugBlock>
          <div style={debugDivider}/>
          <DebugBlock title="Deleted">
            <div>Accounts: 0</div>
            <div>Transactions: 0</div>
            <div>Transfers: 0</div>
          </DebugBlock>
          <div style={debugDivider}/>
          <DebugBlock title="All (Total)">
            <div>Accounts: {ACCOUNTS.length}</div>
            <div>Transactions: {TX.length}</div>
            <div>Transfers: 0</div>
          </DebugBlock>
        </div>
      </div>
      {/* Per-account */}
      {accounts.slice(0, 2).map(a => (
        <div key={a.id} style={{ marginBottom: SPACING[6] }}>
          <div style={{
            fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium,
            color: TOKENS.ink2, marginBottom: SPACING[2], marginLeft: SPACING[2],
          }}>{a.name} ({a.currency})</div>
          <div style={{ background: TOKENS.surface, borderRadius: 12, padding: SPACING[4] }}>
            <DebugBlock title="✓ Active" active>
              <div>Expense: {a.active.expense} txs</div>
              <div>Income: {a.active.income} txs</div>
            </DebugBlock>
          </div>
        </div>
      ))}
    </div>
  );
}
function DebugBlock({ title, active, children }) {
  return (
    <div style={{
      paddingTop: SPACING[2], paddingBottom: SPACING[2],
      background: active ? TOKENS.p100 : 'transparent',
      padding: active ? SPACING[2] : 0,
      borderRadius: active ? 8 : 0,
    }}>
      <div style={{
        fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium,
        color: active ? TOKENS.p600 : TOKENS.ink, marginBottom: SPACING[2],
      }}>{title}</div>
      <div style={{ fontSize: TYPOGRAPHY.size.sm, color: TOKENS.ink2, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
const debugDivider = {
  height: 1, background: TOKENS.divider, opacity: 0.2,
  marginTop: SPACING[3], marginBottom: SPACING[3],
};

Object.assign(window, {
  HomeScreen, HomeFilterScreen, SearchScreen,
  SettingsScreen, PreferenceScreen,
  AccountListScreen, AccountEditorScreen,
  CategoryListScreen, CategoryEditorScreen,
  TransactionEditorScreen, TransferEditorScreen,
  PaywallScreen, LoginScreen,
  ThemeSettingsScreen, LaunchModeSettingScreen,
  LanguageSettingScreen, TimeZoneSettingScreen,
  BaseCurrencySettingScreen, CurrencyListScreen, CurrencyRateListScreen,
  DataManagementScreen, DebugInfoScreen,
});
