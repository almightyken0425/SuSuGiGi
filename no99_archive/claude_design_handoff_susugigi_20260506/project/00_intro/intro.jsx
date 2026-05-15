// ─────────────────────────────────────────────────────────────
// Intro · 設計工作台使用說明
// 這個 tab 不是設計稿，是這份檔案的「目錄 + SOP」。
// 預期讀者：第一次打開這份檔案的設計師 / 工程師 / PM。
// ─────────────────────────────────────────────────────────────

function IntroSection() {
  return (
    <DCSection id="intro" title="SuSuGiGi · 設計工作台" subtitle="一份會持續迭代的設計檔案。本分頁是它的使用說明書。">
      {/* Artboards 是這個分頁的「卡片」，每張卡片回答一個問題。
          DCSection 預設用 horizontal flex 排 artboards，卡片寬度走每張的 width prop。 */}
      <DCArtboard id="purpose" label="這份檔案在幹嘛" width={520} height={680}>
        <IntroCard>
          <IntroTag>用途</IntroTag>
          <IntroTitle>SuSuGiGi 的設計工作台</IntroTitle>
          <IntroBody>
            <p>這是一份「<b>會持續迭代</b>」的設計檔案，不是某個版本的快照。它在三件事上替你保留現場：</p>
            <ol>
              <li><b>正式設計稿</b> — 對齊實際 impl 的所有畫面樣貌</li>
              <li><b>設計基礎</b> — token、icon、element 等可重用樣本</li>
              <li><b>探索素材</b> — 多版本提案的並陳空間（不刪歷史）</li>
            </ol>
            <p>這份檔案位於 SuSuGiGi 產品 Product git 的 <code>no99_archive/</code>，跟 spec / impl 平行，<b>不</b>是 spec 也<b>不</b>是 impl，是「工作筆記層」。</p>
          </IntroBody>
        </IntroCard>
      </DCArtboard>

      <DCArtboard id="tabs" label="每個分頁要幹嘛" width={520} height={680}>
        <IntroCard>
          <IntroTag>分頁地圖</IntroTag>
          <IntroTitle>5 個分頁、每個回答一個問題</IntroTitle>
          <IntroBody>
            <TabRow no="00" name="Intro" q="這份檔案是什麼？怎麼用？" dir="00_intro/"/>
            <TabRow no="10" name="Foundations" q="顏色、字體、間距、圓角的標準值是什麼？" dir="10_foundations/"/>
            <TabRow no="20" name="Components" q="按鈕、列、卡片元件長什麼樣？" dir="20_components/"/>
            <TabRow no="30" name="Screens" q="每個畫面長什麼樣？空 / 載入 / 錯誤狀態？想鳥瞰用畫布縮放。" dir="30_screens/"/>
            <TabRow no="50" name="Explorations" q="這個設計問題我想了好幾種做法。" dir="50_explorations/"/>
          </IntroBody>
        </IntroCard>
      </DCArtboard>

      <DCArtboard id="how-to-iterate" label="怎麼迭代" width={520} height={680}>
        <IntroCard>
          <IntroTag>迭代 SOP</IntroTag>
          <IntroTitle>發生什麼事的時候去動哪個分頁</IntroTitle>
          <IntroBody>
            <SOPRow when="impl 改了 token 或新增 icon"
              what="改 10_foundations/data.jsx 的 TOKENS / SPACING / TYPE_SCALE / ICON_LIBRARY；Foundations 分頁自動跟著更新。"/>
            <SOPRow when="impl 改了既有畫面的版型"
              what="改 30_screens/screens.jsx 對應 Screen function；Screens 分頁自動更新。"/>
            <SOPRow when="impl 新增一個畫面"
              what={`(1) 30_screens/screens.jsx 加新 ScreenComponent；(2) 90_workbench/app.jsx 的 SCREEN_META 加 meta、SCREEN_LIST 加一筆。`}/>
            <SOPRow when="新增可重用元件"
              what="加進 20_components/components.jsx，並在 20_components/components-showcase.jsx 加 artboard 展示。"/>
            <SOPRow when="某個設計問題我想了好幾種做法"
              what="在 50_explorations/ 開新主題目錄、放 README.md 與 variant jsx，再到 90_workbench/app.jsx 接 router。template 在 50_explorations/scaffold.jsx。"/>
            <SOPRow when="某個提案要被淘汰"
              what="不刪歷史，改該 artboard 的 label：移除 [Current] 改成 Superseded by X · YYYY-MM-DD，新提案標上 [Current]。"/>
          </IntroBody>
        </IntroCard>
      </DCArtboard>

      <DCArtboard id="status-vocab" label="決策狀態用語" width={520} height={680}>
        <IntroCard>
          <IntroTag>狀態詞彙</IntroTag>
          <IntroTitle>取代 FINAL，因為沒有真正的 FINAL</IntroTitle>
          <IntroBody>
            <StatusRow tag="[Current]" body="目前傾向採用。後綴 · YYYY-MM-DD 表示最後變動日期。"/>
            <StatusRow tag="Open question" body="這個問題還沒決定。"/>
            <StatusRow tag="Explored" body="看過、沒採用、保留參考，作為下一輪判斷素材。"/>
            <StatusRow tag="Superseded by V9 · YYYY-MM-DD" body="被某版本取代。"/>
            <StatusRow tag="Deprecated" body="完全淘汰。"/>
            <hr style={{ border: 'none', borderTop: `1px dashed ${TOKENS.divider}`, margin: '16px 0' }}/>
            <p style={{ fontSize: 13, color: TOKENS.ink2, lineHeight: 1.6 }}>口味換了就改日期、改狀態，不要刪歷史。歷史是判斷下一輪方向的素材。</p>
          </IntroBody>
        </IntroCard>
      </DCArtboard>

      <DCArtboard id="canvas-controls" label="畫布操作" width={520} height={680}>
        <IntroCard>
          <IntroTag>操作</IntroTag>
          <IntroTitle>這個畫布像 Figma 一樣可以平移、縮放、重排</IntroTitle>
          <IntroBody>
            <KeyRow keys="二指滑動" do="平移畫布"/>
            <KeyRow keys="二指捏合 / Ctrl+滾輪" do="縮放畫布"/>
            <KeyRow keys="滾輪" do="縮放（中鍵 drag 平移）"/>
            <KeyRow keys="左鍵 drag 畫布空白處" do="平移"/>
            <KeyRow keys="點 artboard 左上「六點」grip + drag" do="重排同一 section 內的 artboards"/>
            <KeyRow keys="點 artboard label / 右上箭頭" do="進入 focus mode 大畫面"/>
            <KeyRow keys="focus mode 內 ← / →" do="前後 artboard；↑↓ 跨 section"/>
            <KeyRow keys="Esc / 點背景" do="退出 focus mode"/>
            <hr style={{ border: 'none', borderTop: `1px dashed ${TOKENS.divider}`, margin: '16px 0' }}/>
            <p style={{ fontSize: 13, color: TOKENS.ink2, lineHeight: 1.6 }}>畫布上的 artboard 順序、自訂的 section 標題、artboard rename 都會自動存到 <code>.design-canvas.state.json</code>，下次打開就是上次排好的樣子。</p>
          </IntroBody>
        </IntroCard>
      </DCArtboard>

      <DCArtboard id="file-map" label="目錄結構速查" width={520} height={680}>
        <IntroCard>
          <IntroTag>檔案系統</IntroTag>
          <IntroTitle>數字前綴 = 顯示順序 = 概念順序</IntroTitle>
          <IntroBody>
            <pre style={fileTreeStyle}>{`project/
├── SuSuGiGi.html                  主入口
├── 00_intro/intro.jsx             這個分頁的內容
├── 10_foundations/
│   ├── data.jsx                   TOKENS / SPACING / TYPOGRAPHY / ICON_LIBRARY
│   └── foundations.jsx            視覺化展示
├── 20_components/
│   ├── components.jsx             元件實作
│   └── components-showcase.jsx    視覺化展示
├── 30_screens/screens.jsx         所有正式畫面
├── 50_explorations/
│   ├── scaffold.jsx               空架構 + 新增主題 SOP
│   └── <topic_slug>/...           各主題（目前無）
├── 90_workbench/
│   ├── app.jsx                    ViewTabs router + SCREEN_META + ScreenFrame
│   ├── design-canvas.jsx          DesignCanvas / DCSection / DCArtboard
│   └── ios-frame.jsx              IOSDevice 邊框
└── 99_deprecated/                 已淘汰`}</pre>
            <p style={{ fontSize: 13, color: TOKENS.ink2, lineHeight: 1.6, marginTop: 12 }}>
              數字前綴 <code>00 / 10 / 20 / 30 / 40 / 50 / 90 / 99</code> 保證檔案系統內的顯示順序與 tab 概念順序一致。新增分頁時挑空著的 10 倍數段落即可。
            </p>
          </IntroBody>
        </IntroCard>
      </DCArtboard>

      <DCArtboard id="impl-link" label="與 impl 的關係" width={520} height={680}>
        <IntroCard>
          <IntroTag>對齊規則</IntroTag>
          <IntroTitle>impl 是真相，設計稿追著對齊</IntroTitle>
          <IntroBody>
            <p>本檔案的所有 token / icon / 元件 / 畫面，<b>都對應到</b>：</p>
            <ul>
              <li><b>impl repo：</b><code>no5_product_development/no2_accounting_app/</code></li>
              <li><b>spec repo：</b><code>no3_product_specs/no2_accounting_app/</code></li>
            </ul>
            <p>每個 screens.jsx 內的 ScreenComponent 都標註對應的 impl 檔案（搜尋 <code>← src/screens/...</code> 即可找到）。</p>
            <hr style={{ border: 'none', borderTop: `1px dashed ${TOKENS.divider}`, margin: '16px 0' }}/>
            <p style={{ fontSize: 13, color: TOKENS.ink2, lineHeight: 1.6 }}><b>什麼時候要對齊？</b> impl 改 token / 改畫面 / 新增畫面時，先在這份檔案改完、跟相關人對齊視覺，再回去動 impl。或者 impl 已經改了，把這份檔案追上來作為下一輪迭代的起點。順序看當下情境，但兩邊不該長期偏離。</p>
          </IntroBody>
        </IntroCard>
      </DCArtboard>
    </DCSection>
  );
}

// ─── 小元件 ───────────────────────────────────────────────────
function IntroCard({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', padding: '36px 36px',
      background: '#fff',
      fontFamily: '-apple-system, "SF Pro Text", "PingFang TC", "Noto Sans TC", system-ui, sans-serif',
      color: TOKENS.ink, overflow: 'auto',
    }}>{children}</div>
  );
}
function IntroTag({ children }) {
  return <div style={{
    fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: TOKENS.p500,
    textTransform: 'uppercase', marginBottom: 8,
  }}>{children}</div>;
}
function IntroTitle({ children }) {
  return <h2 style={{
    fontSize: 22, fontWeight: 600, margin: '0 0 20px',
    color: TOKENS.ink, letterSpacing: -0.3,
  }}>{children}</h2>;
}
function IntroBody({ children }) {
  return <div style={{ fontSize: 14, lineHeight: 1.6, color: TOKENS.ink }}>{children}</div>;
}

function TabRow({ no, name, q, dir }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: TOKENS.ink3, fontVariantNumeric: 'tabular-nums', width: 22 }}>{no}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink, width: 110 }}>{name}</div>
      <div style={{ flex: 1, fontSize: 13, color: TOKENS.ink2, lineHeight: 1.5 }}>
        {q}
        <code style={{ display: 'block', marginTop: 2, fontSize: 11, color: TOKENS.ink3 }}>{dir}</code>
      </div>
    </div>
  );
}

function SOPRow({ when, what }) {
  return (
    <div style={{ padding: '12px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: TOKENS.ink, marginBottom: 4 }}>當 {when}</div>
      <div style={{ fontSize: 13, color: TOKENS.ink2, lineHeight: 1.5 }}>→ {what}</div>
    </div>
  );
}

function StatusRow({ tag, body }) {
  return (
    <div style={{ padding: '10px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
      <code style={{
        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
        background: TOKENS.p50, color: TOKENS.p500, fontSize: 12, fontWeight: 500,
        marginBottom: 4,
      }}>{tag}</code>
      <div style={{ fontSize: 13, color: TOKENS.ink2, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

function KeyRow({ keys, do: doStr }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderTop: `1px solid ${TOKENS.hairline}` }}>
      <code style={{
        padding: '3px 8px', borderRadius: 5,
        background: TOKENS.surface2, color: TOKENS.ink,
        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
      }}>{keys}</code>
      <div style={{ flex: 1, fontSize: 13, color: TOKENS.ink2, lineHeight: 1.5 }}>{doStr}</div>
    </div>
  );
}

const fileTreeStyle = {
  fontFamily: '"SF Mono", "Menlo", "Consolas", monospace',
  fontSize: 11.5, lineHeight: 1.55, color: TOKENS.ink,
  background: TOKENS.surface2, padding: '14px 16px', borderRadius: 8,
  margin: 0, whiteSpace: 'pre',
};

Object.assign(window, { IntroSection });
