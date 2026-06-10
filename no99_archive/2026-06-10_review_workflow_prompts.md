# 2026-06-10 · 記帳 App 多軸 Review Workflow Prompt 草稿（第 3–8 軸）

## Context

SuSuGiGi 記帳 app（module `no2_accounting_app`）分軸 review 的 workflow prompt 草稿。

- 全套 8 軸，本檔收第 3–8 軸。
- 第 1 軸 Product 層內部品質、第 2 軸四層對齊總盤點已定稿，不在此檔。
- 每支 prompt 對應一個獨立 session，複製貼上即用。
- session 開在 ai-company 根目錄，prompt 內路徑為 repo 相對路徑。
- 全部 read-only：只讀、不改檔、輸出報告；需要修的另開 worktree。
- 需對抗驗證的軸（4、7、8）內含 skeptic 段，壓假陽性。
- 不在這 8 軸內：simulator 視覺走 `/sim-review`、git 衛生走 `/game-over`，皆單線、不需 workflow。

## 軸索引

| 軸 | 主題 | 性質 |
|---|---|---|
| 3 | Spec 層內部品質 | 純 spec 內，術語與越界 |
| 4 | Impl 程式正確性 / bug | 純 code runtime 正確性，含 i18n |
| 5 | Design ↔ Impl 視覺對齊 | token / 元件 / layout 忠實度 |
| 6 | Spec ↔ Impl 行為 / 資料對齊 | 非視覺軸 |
| 7 | Impl 架構與分層品質 | code 組織與抽象 |
| 8 | Impl 安全性與信任邊界 | secrets / 後端授權 / 信任邊界 |

## 搭配建議

- 全 read-only，6 個 session 可同時開、互不干擾。
- 第 7、8 軸 verify 段較重、token 花費高；要省就在該 session 加一句「先跑 N 個樣本」。

---

## 第 3 軸 · Spec 層內部品質

```
用一個 workflow（多 agent 編排）審 SuSuGiGi 記帳 app 的 Spec 層品質。純 review：只讀、不改檔、輸出報告。

範圍：product/SuSuGiGi/no4_product_specs/no2_accounting_app/，約 47 份 md：
- no1_data_models/no1_data_models.md，Model 層
- no2_screens/，26 份，View 層
- no3_logics/，20 份，Logic 層

fan-out：每份 spec 一個 agent，各查兩件事：
1. 術語一致性：每個名詞是否在本檔或同 SuSuGiGiSpec 資料夾內定義過，列出用到但沒定義的詞；同一概念跨檔有沒有混用不同詞；交叉引用別份的名詞對方真的有定義
2. 跨層越界：
   - 往 Design：有沒有寫進色碼、間距數字、字級、圓角等具體視覺值
   - 往 Impl：有沒有寫進元件名、props、自定 hook、平台 API、第三方套件名、私有型別名
   - 允許例外：公開 API 與通用型別可出現，標清楚邊界

依該檔所在層套對應政策：no1_data_models→Model、no2_screens→View、no3_logics→Logic。再查結構完整：該有章節齊不齊、有無 TBD 或空章節。

每條發現回：檔案、行號、違規詞或片段、類別（未定義術語/用詞不一/越界Design/越界Impl/結構缺漏）、嚴重度、修法。最後彙總成表按類別排序。

可借力：spec_writer skill 分層政策、/spec-term-audit、~/.claude/skills/spec_writer/cross_layer_boundary_policy.md、~/.claude/skills/decision_framework_router/delivery_layer.md。不改檔，需要修的另開 worktree。
```

---

## 第 4 軸 · Impl 程式正確性 / bug

```
用一個 workflow（多 agent 編排）做 SuSuGiGi 記帳 app 的 impl 程式 review，找 runtime correctness bug。純 review：只讀、不改檔、輸出報告。不查架構與分層與共用抽取（另一軸），也不查安全繞過（另一軸）。

範圍：product/SuSuGiGi/no6_product_development/no2_accounting_app/src/。

fan-out 用 find→adversarial verify。第一段每個維度一個 finder agent：
1. 並發與生命週期：race、stale closure、useEffect 依賴錯、未取消 async、listener 與 timer 洩漏
2. 狀態管理：context/store 不一致更新、衍生狀態過期、re-render 正確性
3. 金額與幣別：浮點精度、換算 rounding、轉帳雙邊一致、base currency 一致，相關檔在 src/services/、src/contexts/、src/stores/
4. Firestore 與同步：離線佇列、配額耗盡、登出清理、衝突解法、冪等寫入、batch 回滾，src/services/ 同步相關模組
5. 帳本核心邏輯：recurring 生成、undo 還原、merge 合併、backup 與 restore，src/services/、src/contexts/
6. 訂閱付費牆邏輯正確性：tier 判定與過期狀態算對沒，不查能否繞過
7. 邊界值與錯誤處理：null/空清單/缺欄位、吞錯、未處理 promise rejection
8. navigation 與型別安全：路由參數型別、不安全 as/any cast
9. i18n 與在地化，src/locales/，i18n-js + react-native-localize + Intl，20 語言：
   - 以 en.json 為基準，其餘 19 個 locale 缺鍵/多鍵/namespace 結構不齊
   - UI 沒走 t() 的 hardcode 文字、漏翻
   - i18n-js 插值佔位符各語言一致、caller 傳齊，無缺參數破洞
   - 複數 key 各語言 .one/.other 齊全
   - 金額/數字/日期經 Intl 依 locale 格式化、沒寫死
   - react-native-localize 偵測值對得上 20 語言、fallback 正確；動態組 key 每分支都存在；切語言即時刷新

第二段：每個 finding 派 2-3 個獨立 skeptic agent 讀實際 code 試著反駁，多數推翻就砍，壓假陽性。每個存活 bug 回：檔案:行、重現條件、影響、修法方向、信心度。最後按嚴重度排序。不改檔，需要修的另開 worktree。
```

---

## 第 5 軸 · Design ↔ Impl 視覺對齊

```
用一個 workflow（多 agent 編排）查 SuSuGiGi 記帳 app（module no2_accounting_app）impl UI 是否照 design 做。純 review：只讀、不改檔、輸出報告。

配對，design 仲裁、impl 跟進：
- design token: no3_product_designs/no2_accounting_app/project/10_foundations/，含 no1_atomic_tokens、no2_canvas_tokens、no3_typography、no4_layout_tokens、no5_platform_tokens、no6_icon_library、component_tokens/
- design 元件: project/20_components/components.jsx
- design 畫面: project/30_screens/<screen>/，26 個 no1-no26
- impl: no6_product_development/no2_accounting_app/src/screens/**、src/components/**、src/constants/theme.ts

關鍵：三層編號不一致、impl 把 26 畫面收進 9 個 feature 夾，照畫面名稱配對。

fan-out：每個畫面一個 agent，同時讀 design 側與 impl 側比對：
1. Token 值對齊：impl 用的色彩/間距/字級/圓角/陰影對得上 design token
2. Hardcode 偵測：impl 寫死的數字或色碼沒走 theme.ts
3. Token 來源同步：theme.ts 的值同步自 design 10_foundations
4. 元件結構：impl component 組成與層級對齊 design 20_components
5. 畫面 layout：排列/間距節奏/對齊/grouping 對齊 design 30_screens
6. 狀態樣式：空/loading/error/selected/disabled 視覺有照 design
7. icon 對齊 design no6_icon_library
8. 多出與缺漏：impl 有 design 沒有的視覺元素或反之
9. 平台與主題：iOS liquid glass header、深淺色模式 token

每條 mismatch 回：畫面、檔案:行、impl 值、design 對應值、類別、嚴重度。最後按畫面分組彙總。

可借力：products_registry.md 的 sub_mapping，foundations→theme.ts、components→src/components、screens→src/screens。不改檔，需要修的另開 worktree。
```

---

## 第 6 軸 · Spec ↔ Impl 行為 / 資料對齊

```
用一個 workflow（多 agent 編排）查 SuSuGiGi 記帳 app（module no2_accounting_app）impl 行為與資料層是否照 Spec。純 review：只讀、不改檔、輸出報告。

配對，spec 仲裁、impl 跟進：
- data model: spec no4_product_specs/no2_accounting_app/no1_data_models/ ↔ impl src/database/models/、src/database/schema.ts
- logic: spec no3_logics/，20 份 ↔ impl src/contexts/**、src/services/**、src/hooks/**

20 份 logic 涵蓋 bootstrap、login/logout、post-auth、batch sync、currency conversion、transfer、transaction、recurring、undo、firestore quota、home report、category、account、merge、subscription gate、preference sync、transaction backup、full backup 等。

fan-out：每條 logic 一個 agent、data model 另一組 agent，各自比對 spec 側與 impl 側：
1. 行為覆蓋：spec 描述的每個行為 impl 有對應實作
2. 邊界忠實：spec 列的 edge case 如 quota 滿/離線/登出清理/衝突/冪等，impl 有照做
3. 流程與狀態機：auth、sync、import wizard 步驟的狀態轉換與 spec 一致
4. invariant：spec 要求的冪等與一致性 impl 有保證
5. 失敗路徑：spec 定義的失敗處理 impl 有實作
6. 反向 gap：impl 做了 spec 沒寫的行為，spec 該補
7. 矛盾：impl 行為與 spec 明確衝突
8. 授權對齊：spec 定義的 action id authorization 規則 impl 有實作；能否繞過屬安全軸，這裡只看有沒有照 spec
9. data model：欄位名/型別/可空/預設值/關聯對齊 spec

每條 gap 回：spec 條目、impl 位置、落差類型（未實作/不一致/spec缺漏/矛盾）、嚴重度。最後彙總。不改檔，需要修的另開 worktree。
```

---

## 第 7 軸 · Impl 架構與分層品質

```
用一個 workflow（多 agent 編排）做 SuSuGiGi 記帳 app 的 impl 架構與分層 review，從零查。純 review：只讀、不改檔、輸出報告。查 code 組織與抽象，不查 runtime bug（另一軸）。

範圍：product/SuSuGiGi/no6_product_development/no2_accounting_app/src/。對照分層意圖：View=screens、Logic=contexts/services/hooks、Model=database/models。

fan-out 用 find→verify。第一段每個維度一個 finder agent：
1. 分層歸位：domain 與 business logic 跑進 screen 或 component，如畫面內直接做資料庫讀寫、金額或業務計算寫在 UI 元件裡，該下放 hooks/services/logic 層
2. 資料存取邊界：screen 或 component 直接 import database 與 model class 做讀寫，缺統一 repository 抽象
3. 依賴方向：view→logic→model 是否單向，有沒有反向 import 或 require cycle，如低層 helper 反向 import 高層 service
4. 共用抽取 UI：重複的 selector/editor/list-item/row 散在多檔，該拉泛型共用元件
5. 共用抽取邏輯：重複的計算/轉換/編解碼如幣別查表、命名轉換、金額編解碼散落多檔各寫一份，該收斂成 registry/codec/mapper/util
6. god object 與 god context：單一 store/context/screen 攬太多職責、方法帶大量位置參數
7. 死碼與孤兒：沒被引用的 component/service/util、已宣告廢除卻殘留的手刻樣式
8. 狀態管理選型：local state/context/module store 三範式有沒有選型章法、同一份狀態有沒有多來源、有無 push 與 poll 並存的死碼
9. 抽象地基缺失：歸納同一件事多檔各寫一份各自漂移的系統性根因

第二段：每個 finding 派 skeptic agent 讀 code 確認，critical/high 多票、medium/low 單票。輸出：發現清單（檔案、根因、影響、建議抽象）+ 橫向根因歸納（哪幾條同源、修一個地基消解一票）+ 建議修復順序。不改檔，需要修的另開 worktree。
```

---

## 第 8 軸 · Impl 安全性與信任邊界

```
用一個 workflow（多 agent 編排）做 SuSuGiGi 記帳 app 的 impl 安全性 review。純 review：只讀、不改檔、輸出報告。技術棧 RN + Firebase Auth/Firestore + Google Sign-In + IAP。

範圍：product/SuSuGiGi/no6_product_development/no2_accounting_app/，含 src/、firestore.rules、ios/、android/、.gitignore、package.json。

重要前提避免假陽性：Firebase client 設定金鑰（GoogleService-Info.plist 與 google-services.json 內的 AIza key）與 WEB_CLIENT_ID 是 public-by-design、不是 secret，且已被 .gitignore 排除，不要報這些為漏洞。真正要查的是後端規則與信任邊界。

fan-out 用 find→adversarial verify。第一段每個維度一個 finder agent：
1. 真 secret 裸奔：service account JSON、後端 API secret、付費平台 secret key、私鑰有沒有 hardcode 進 src 或 bundle 或 commit 歷史，區分真 secret vs 上述 public 設定
2. gitignore 與 bundle 衛生：google-services.json、GoogleService-Info.plist、keystore、.env 確實被 ignore，沒副本漏進 commit
3. 後端授權規則：讀 firestore.rules，有沒有真的 per-user owner-only + 付費 tier gate，不是只檢查有 auth 就放行；有無 App Check
4. client 信任邊界：付費等級/配額/權限判斷有沒有只在 client 可繞過；debug 或 mock 工具有沒有 __DEV__ 包裹、不進 production bundle
5. 授權強制點：實際寫資料的 service mutation 有沒有複查權限與配額，不是只在 UI 或 navigation 擋
6. log 洩漏：console.log 把 token/PII/帳務細節印進正式環境
7. 不安全儲存：AsyncStorage 或 WatermelonDB 有沒有存明文機敏如 token、個資，登出有沒有清
8. 外部輸入驗證：CSV 匯入、Firestore 回傳 doc、IAP payload、deep link 參數有沒有先驗證再用
9. 認證與 session：登出真的清 session 與本地敏感資料、帳號切換不殘留前帳號資料、token 刷新
10. 依賴弱點：package.json 第三方套件已知 CVE、明顯過期版本

第二段：每個 finding 派 2-3 個獨立 skeptic agent 讀 code 與 rules 試著反駁，問會不會真發生、是否已有防護、嚴重度是否名副其實，多數推翻才砍。輸出：漏洞清單（檔案:行、攻擊情境、影響、修法、嚴重度 critical/high/medium/low、信心度），按嚴重度排序。不改檔，需要修的另開 worktree。
```
