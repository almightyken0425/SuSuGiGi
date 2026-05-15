// ─────────────────────────────────────────────────────────────
// Explorations · 空架構 + 新增主題 SOP
// 本分頁保留作為「同一個設計問題並陳多版本提案」的空間。
// 目前沒有探索主題；下次有設計問題要展開時依下方 SOP 加。
// ─────────────────────────────────────────────────────────────

function ExplorationsScaffoldSection() {
  return (
    <>
      <DCSection id="explor-intro" title="Explorations · 還沒有任何主題" subtitle="這個分頁用來把『同一個設計問題的不同解法』並陳。目前沒有探索中的主題，下面是新增主題的 SOP 與 template。">
        <DCArtboard id="explor-empty" label="Empty state" width={520} height={520}>
          <ExplorCard>
            <ExplorTag>狀態</ExplorTag>
            <ExplorTitle>還沒有任何 explorations</ExplorTitle>
            <ExplorBody>
              <p>
                之前的探索（filter visual treatment / tx-list layout / recurring marker / row height）已歸檔到 git 歷史，本分頁清空為新一輪探索的起點。
              </p>
              <p style={{ color: TOKENS.ink2 }}>
                當有新的設計問題你想了好幾種做法時，照下一張卡片的 SOP 開新主題。
              </p>
            </ExplorBody>
          </ExplorCard>
        </DCArtboard>

        <DCArtboard id="explor-sop" label="SOP · 新增一個探索主題" width={520} height={680}>
          <ExplorCard>
            <ExplorTag>SOP</ExplorTag>
            <ExplorTitle>新增一個探索主題</ExplorTitle>
            <ExplorBody>
              <ol>
                <li>
                  <b>建子目錄。</b>
                  在 <code>50_explorations/</code> 建子目錄 <code>&lt;topic_slug&gt;/</code>，slug 用底線串小寫英文，如 <code>tx_list_layout</code>。
                </li>
                <li>
                  <b>寫 README.md。</b>
                  子目錄裡放 <code>README.md</code>，包含：
                  <ul>
                    <li>Problem statement：要解決什麼設計問題</li>
                    <li>Candidates 表格：每個方案 V1/V2/V3... 與簡述</li>
                    <li>Current direction：目前傾向採用哪個 + 日期</li>
                    <li>Decision log：每次決策變化都記一筆</li>
                  </ul>
                </li>
                <li>
                  <b>寫 variant jsx。</b>
                  子目錄裡放至少一個 <code>variants.jsx</code>，匯出每個 variant 的 React component。
                </li>
                <li>
                  <b>掛 router。</b>
                  到 <code>90_workbench/app.jsx</code> 的 <code>EXPLORATION_TOPICS</code> 陣列加一筆 <code>{`{ id: 'your-slug', label: '描述標籤' }`}</code>。
                </li>
                <li>
                  <b>畫 DCSection。</b>
                  在 <code>app.jsx</code> 的 <code>App()</code> 內加 <code>{`{view === 'explorations' && topic === 'your-slug' && (...)}`}</code> 區塊，包多個 DCArtboard。
                </li>
                <li>
                  <b>掛 script。</b>
                  到 <code>SuSuGiGi.html</code> 加 <code>&lt;script type="text/babel" src="50_explorations/&lt;slug&gt;/variants.jsx"&gt;</code>。
                </li>
              </ol>
            </ExplorBody>
          </ExplorCard>
        </DCArtboard>

        <DCArtboard id="explor-tab-distinction" label="跟其他 tab 的分工" width={520} height={520}>
          <ExplorCard>
            <ExplorTag>定位</ExplorTag>
            <ExplorTitle>Explorations vs Screens vs Foundations</ExplorTitle>
            <ExplorBody>
              <DistRow tab="Screens"
                desc="『同一個畫面的不同樣子』— 空 / 載入 / 錯誤 / 爆量等邊界狀態並排展示。" />
              <DistRow tab="Explorations"
                desc="『同一個設計問題的不同解法』— 多版本提案並陳，附決策狀態，不刪歷史。"/>
              <DistRow tab="Foundations / Components"
                desc="『已敲定的設計基礎與元件』— token 牆、元件樣本。"/>
              <hr style={{ border: 'none', borderTop: `1px dashed ${TOKENS.divider}`, margin: '16px 0' }}/>
              <p style={{ fontSize: 13, color: TOKENS.ink2 }}>
                判斷標準：如果你正在比較「方案 A 跟 B 哪個更好」→ 來 Explorations。如果你想看「這個畫面在 X 狀態下長怎樣」→ 去 Screens。
              </p>
            </ExplorBody>
          </ExplorCard>
        </DCArtboard>
      </DCSection>
    </>
  );
}

function ExplorCard({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', padding: '36px 36px',
      background: '#fff', overflow: 'auto',
      fontFamily: '-apple-system, "SF Pro Text", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      color: TOKENS.ink,
    }}>{children}</div>
  );
}
function ExplorTag({ children }) {
  return <div style={{
    fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: TOKENS.p500,
    textTransform: 'uppercase', marginBottom: 8,
  }}>{children}</div>;
}
function ExplorTitle({ children }) {
  return <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 20px', color: TOKENS.ink, letterSpacing: -0.3 }}>{children}</h2>;
}
function ExplorBody({ children }) {
  return <div style={{ fontSize: 14, lineHeight: 1.7, color: TOKENS.ink }}>{children}</div>;
}
function DistRow({ tab, desc }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, width: 140, flexShrink: 0 }}>{tab}</div>
      <div style={{ flex: 1, fontSize: 13, color: TOKENS.ink2, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

Object.assign(window, { ExplorationsScaffoldSection });
