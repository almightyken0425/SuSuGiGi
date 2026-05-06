// HomeFilterScreen 視覺區隔提案 — 5 個 variant
// 共用的選擇互動與資料邏輯,只改變視覺結構

const _F_TG_LABELS = { day: '今天', week: '本週', month: '本月', year: '今年', all: '全部' };
const _F_GM_LABELS = { category: '依分類', date: '依日期' };
const _F_TG_VALUES = ['day', 'week', 'month', 'year', 'all'];
const _F_GM_VALUES = ['category', 'date'];
const _cycle = (arr, cur) => arr[(arr.indexOf(cur) + 1) % arr.length];

// shared hook — gives all variants the same interaction
function useFilterController(filterState, setFilterState) {
  const { timeGranularity, groupBy, selectedAccountIds } = filterState;
  const setTG = (v) => setFilterState(s => ({ ...s, timeGranularity: v }));
  const setGB = (v) => setFilterState(s => ({ ...s, groupBy: v }));
  const toggleAcc = (id) => setFilterState(s => {
    const has = s.selectedAccountIds.includes(id);
    const isLast = has && s.selectedAccountIds.length === 1;
    if (isLast) return s;
    return { ...s, selectedAccountIds: has ? s.selectedAccountIds.filter(x => x !== id) : [...s.selectedAccountIds, id] };
  });
  const groups = React.useMemo(() => {
    const map = new Map(); const ordered = [];
    for (const a of ACCOUNTS) {
      if (!map.has(a.currency)) { const l = []; map.set(a.currency, l); ordered.push({ currency: a.currency, accounts: l }); }
      map.get(a.currency).push(a);
    }
    return ordered;
  }, []);
  const cycleTG = () => setTG(_cycle(_F_TG_VALUES, timeGranularity));
  const cycleGB = () => setGB(_cycle(_F_GM_VALUES, groupBy));
  return { timeGranularity, groupBy, selectedAccountIds, cycleTG, cycleGB, toggleAcc, groups };
}

// shared building blocks
function _Tile({ icon, label, onClick, big = false }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
      padding: big ? '16px 12px' : '12px 12px',
      borderRadius: 14, background: TOKENS.surface, border: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)', cursor: 'pointer', fontFamily: 'inherit',
    }}>
      <Glyph name={icon} size={16} color={TOKENS.ink2} stroke={2}/>
      <span style={{ fontSize: big ? 17 : 15, fontWeight: 600, letterSpacing: -0.2, color: TOKENS.ink }}>{label}</span>
    </button>
  );
}

function _AccountCard({ account, isSelected, isLastSelected, onClick, width }) {
  const swatchBg = isSelected ? TOKENS.p50 : '#EFEFF3';
  const swatchIconColor = isSelected ? TOKENS.p500 : TOKENS.ink3;
  const nameColor = isSelected ? TOKENS.ink : TOKENS.ink2;
  const currencyColor = isSelected ? TOKENS.ink2 : TOKENS.ink3;
  return (
    <button onClick={() => !isLastSelected && onClick()}
      style={{
        width, display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 12px', borderRadius: 12,
        border: `1.5px solid ${isSelected ? TOKENS.p500 : 'transparent'}`,
        background: isSelected ? TOKENS.surface : '#FAFAFA',
        boxShadow: isSelected ? '0 1px 2px rgba(67,35,160,0.08)' : 'none',
        cursor: isLastSelected ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: isLastSelected ? 0.85 : 1,
      }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: swatchBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph name={account.icon} size={17} color={swatchIconColor} stroke={1.6}/>
      </div>
      <span style={{
        flex: 1, fontSize: 13.5, fontWeight: 500, color: nameColor,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left',
      }}>{account.name}</span>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: currencyColor }}>
        {account.currency}
      </span>
    </button>
  );
}

// iOS section header (uppercase small label, like Settings section titles)
function _SectionHeader({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 400, color: TOKENS.ink2,
      textTransform: 'uppercase', letterSpacing: 0.6,
      padding: '0 4px 8px',
      ...style,
    }}>{children}</div>
  );
}

const cardW = (402 - 16*2 - 8) / 2;

// ─────────────────────────────────────────────────────────────
// V1 — Section headers (iOS grouped list pattern)
// 用最小成本加入 SECTION header 文字,讓兩區清楚分節
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V1_SectionHeaders({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <_SectionHeader>檢視</_SectionHeader>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <_SectionHeader>帳戶</_SectionHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={cardW}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V2 — Container card wrap (兩個獨立卡片容器)
// 把帳戶區包進有底色的容器,跟上方獨立 tile 自然分層
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V2_ContainerWrap({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <div style={{
          background: '#EBEBEF',
          borderRadius: 18, padding: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 500, color: TOKENS.ink2,
            padding: '4px 6px 0',
          }}>選擇帳戶</div>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={(402 - 16*2 - 12*2 - 8) / 2}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V3 — Hairline divider + 大間距
// 在兩區之間放一條細線,加大上下間距
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V3_Divider({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <div style={{
          height: 0.5, background: TOKENS.hairline,
          margin: '0 -16px 28px',
        }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={cardW}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V4 — Inset tray (帳戶區凹陷感)
// 上方 tile 維持白色卡片浮起感,下方帳戶區用 inset (微暗底色 + inner shadow)
// 形成「浮起 vs 凹陷」的層次差異
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V4_InsetTray({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <div style={{
          background: '#E8E8EC',
          borderRadius: 16, padding: '14px 12px 12px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: TOKENS.ink2,
            textTransform: 'uppercase', letterSpacing: 0.8,
            padding: '0 4px 10px',
          }}>帳戶</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {c.groups.map((g) => (
              <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.accounts.map((a) => (
                  <_AccountCard key={a.id} account={a} width={(402 - 16*2 - 12*2 - 8) / 2}
                    isSelected={c.selectedAccountIds.includes(a.id)}
                    isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                    onClick={() => c.toggleAcc(a.id)}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V5 — Pill summary bar + scoped sheet
// 把上方 tile 改成精簡的 inline pill summary (像 iOS Mail 的篩選條),
// 下方帳戶區則保留主視覺空間,看起來像「次要控制 + 主要選擇」
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V5_PillSummary({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        {/* Pill summary row — 精簡 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={c.cycleTG} style={pillStyle}>
            <Glyph name="calendar" size={13} color={TOKENS.p500} stroke={2}/>
            <span>{_F_TG_LABELS[c.timeGranularity]}</span>
            <Glyph name="chevron-down" size={10} color={TOKENS.ink3} stroke={2.5}/>
          </button>
          <button onClick={c.cycleGB} style={pillStyle}>
            <Glyph name="tag" size={13} color={TOKENS.p500} stroke={2}/>
            <span>{_F_GM_LABELS[c.groupBy]}</span>
            <Glyph name="chevron-down" size={10} color={TOKENS.ink3} stroke={2.5}/>
          </button>
        </div>
        <_SectionHeader>帳戶</_SectionHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={cardW}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const pillStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 12px', borderRadius: 999,
  background: TOKENS.surface, border: `0.5px solid ${TOKENS.divider}`,
  fontSize: 14, fontWeight: 500, color: TOKENS.ink,
  cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
};

// ─────────────────────────────────────────────────────────────
// V6 — Short inset divider (短分隔線,左右留 padding)
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V6_ShortDivider({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <div style={{ height: 0.5, background: TOKENS.hairline, margin: '0 24px 24px' }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={cardW}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V7 — Center dot divider (中央三點/圓點,輕量符號分隔)
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V7_DotDivider({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 5, padding: '14px 0 18px',
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 3, height: 3, borderRadius: '50%',
              background: TOKENS.ink3, opacity: 0.6,
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={cardW}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V8 — Symmetric trays (兩區都用 inset tray,對稱)
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V8_SymmetricTrays({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  const trayStyle = {
    background: '#E8E8EC', borderRadius: 16, padding: 12,
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
  };
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ ...trayStyle, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
            <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
          </div>
        </div>
        <div style={trayStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {c.groups.map((g) => (
              <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.accounts.map((a) => (
                  <_AccountCard key={a.id} account={a} width={(402 - 16*2 - 12*2 - 8) / 2}
                    isSelected={c.selectedAccountIds.includes(a.id)}
                    isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                    onClick={() => c.toggleAcc(a.id)}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// V9 — Negative space gap (純粹用大留白,不用任何分隔元件)
// ─────────────────────────────────────────────────────────────
function HomeFilterScreen_V9_NegativeSpace({ onBack, filterState, setFilterState }) {
  const c = useFilterController(filterState, setFilterState);
  return (
    <>
      <NavHeader title="篩選" leadingText="返回" leadingAction={onBack}/>
      <div style={{ padding: 16, paddingBottom: 100, background: TOKENS.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          <_Tile icon="calendar" label={_F_TG_LABELS[c.timeGranularity]} onClick={c.cycleTG} big/>
          <_Tile icon="tag" label={_F_GM_LABELS[c.groupBy]} onClick={c.cycleGB} big/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {c.groups.map((g) => (
            <div key={g.currency} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.accounts.map((a) => (
                <_AccountCard key={a.id} account={a} width={cardW}
                  isSelected={c.selectedAccountIds.includes(a.id)}
                  isLastSelected={c.selectedAccountIds.includes(a.id) && c.selectedAccountIds.length === 1}
                  onClick={() => c.toggleAcc(a.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  HomeFilterScreen_V1_SectionHeaders,
  HomeFilterScreen_V2_ContainerWrap,
  HomeFilterScreen_V3_Divider,
  HomeFilterScreen_V4_InsetTray,
  HomeFilterScreen_V5_PillSummary,
  HomeFilterScreen_V6_ShortDivider,
  HomeFilterScreen_V7_DotDivider,
  HomeFilterScreen_V8_SymmetricTrays,
  HomeFilterScreen_V9_NegativeSpace,
});
