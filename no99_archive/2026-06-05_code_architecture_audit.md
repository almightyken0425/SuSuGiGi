# 2026-06-05 · 記帳 App Impl 程式碼架構審查

## Context

對 SuSuGiGi 記帳 App 的 Impl git（`no6_product_development/no2_accounting_app/`）做一次全面程式碼架構審查，目標是找出 `ISSUES.md` 既有清單看不到的**架構級系統性問題**。

- **範圍：** impl git `src/` 全部，144 個 TS/TSX 檔、約 24,000 行。技術棧 RN 0.79 CLI、React 19、WatermelonDB、Firebase Auth/Firestore、RevenueCat、React Navigation 7。
- **方法：** deep-research 式多 agent workflow——8 個架構維度並行深讀 → 跨維度語意去重與嚴重度校準 → 每條發現派獨立 skeptic 讀實際 code 對抗式驗證（critical/high 三票、need 2/3 推翻才砍，medium/low 單票）。共 67 個 agent、約 520 萬 token、24 分鐘。
- **去重前後：** 63 條原始發現 → 去重成 30 → 驗證後 30 條成立。
- **與 `ISSUES.md` 的關係：** 審查時把 `ISSUES.md` 全文餵給每個 agent、明令不重報那 16 個「點」，價值集中在架構根因。結論是：`ISSUES.md` 那 16 點大半是本報告數條架構缺陷的**表面症狀**。對應關係見文末「與 ISSUES.md 對應關係」。
- **路徑慣例：** 本報告所有 `src/...` 路徑相對 impl git root（`no6_product_development/no2_accounting_app/`）。

### 嚴重度定義

| 級別 | 含義 |
|---|---|
| 🔴 critical | 資料損毀 / 安全 / 付費繞過，正在或必然造成真實損失 |
| 🟠 high | 明確 bug 或重大架構債 |
| 🟡 medium | 可維護性 / 品質，會持續拖慢開發 |
| ⚪ low | 整潔度 / 局部一致性 |

### 驗證強度註記

- `v3/refuted0` = 三個獨立 skeptic 讀 code 後零推翻，信心最高。
- `v3/refuted1` = 三票中一票推翻、兩票確認，存活但保留討論空間。
- `v1` = medium/low 派單票深度驗證。
- **ARCH-02 人工還原：** 該條的三票 verify agent 全部技術性失敗（未正確呼叫輸出工具、計為 0 票），被存活判定式誤殺進 killed。其證據已親驗紮實，**人工還原為 critical confirmed**，不是被對抗式推翻。

---

## 摘要

| 級別 | 條數 | 編號 |
|---|---|---|
| 🔴 critical | 3 | ARCH-01、ARCH-02、ARCH-03 |
| 🟠 high | 3 | ARCH-04、ARCH-06、ARCH-10 |
| 🟡 medium | 9 | ARCH-05、07、08、09、11、13、14、19、24 |
| ⚪ low | 15 | ARCH-12、15、16、17、18、20、21、22、23、25、26、27、28、29、30 |

**一句話結論：** 問題不是 30 個孤立 bug，是 **5 個缺失的抽象地基**衍生出的 30 個症狀。`syncEngine` 與「金額／幣別處理」是兩大重災區，且都踩到記帳 App 最致命的一類——**資料正確性靜默損毀**。逐條修會打地鼠，修根因才一次清掉一票。

---

## 橫向根因（報告最大價值）

5 個系統性根因解釋了 30 條裡的大部分。修這 5 個地基，能直接消解或大幅簡化約一半條目。

1. **缺集中抽象層** → 衍生 ARCH-01、06、07、08、09、10、12。同一件事散在多檔各寫一份、各自漂移：幣別查表 6 份、命名轉換零集中、金額編解碼逐字重複、DB 存取無 repository。**對策：** 建 currency registry + Money codec + 命名 mapper + repository + schema gate 這 5 個地基。
2. **`syncEngine` 根本性殘缺** → ARCH-03（只上傳無下載）、04（裝置全域旗標）、21（盲推無衝突解決）、07（不驗證遠端資料）。這不是修 bug，是**同步契約要重新定義**。
3. **付費信任邊界全在 client** → ARCH-02、13、14。商業關鍵、可繞過。強制點必須下沉到 service + 伺服器規則。
4. **狀態三範式無選型章法** → ARCH-05、11、16、17、18、23、24。Context／module store／ad-hoc hook 並存無準則，`PeriodDataStore` 該 observe 化。
5. **資料正確性靜默損毀** → ARCH-01、08、09。記帳 App 的命脈，最該優先。

---

## 建議修復順序（三波）

| 波 | 目標 | 條目 | 理由 |
|---|---|---|---|
| **第一波** | 止血 | ARCH-01、02、09、03 | 資料損毀 + 付費繞過，正在或必然造成損失 |
| **第二波** | 建抽象地基 | ARCH-06、08、07、10、12 + currency registry(ARCH-01) | 5 個地基建好自動消解一票 medium/low |
| **第三波** | 同步重做 + 狀態收斂 + 清死碼 | ARCH-04、21（同步）、05、11、16、18（狀態）、其餘 low | 地基穩固後再處理 |

---

## 🔴 Critical

### ARCH-01 · 幣別 code↔id 映射零集中，跨幣別轉帳寫入錯誤匯率記錄（資料損毀）

- **檔案：** `src/services/transferLogic.ts:18-30`、`:130-147`、`src/services/currencyService.ts:24-30`、`src/contexts/PreferenceContext.tsx:151-159`、`src/utils/currencyUtils.ts:15-27`、`src/services/syncEngine.ts:285`、`src/screens/Settings/CurrencyDetailConfigScreen.tsx:43`、`src/services/importService.ts:605`
- **問題：** `transferLogic.getCurrencyId` 是 switch 寫死 TWD/USD/JPY/EUR/GBP/CNY/HKD/KRW 八種、`default: return 901`。`Currency.json` 有 155 種，帳戶幣別可從下拉選任一種；落在那 8 種外時（佔 95%），`createTransfer` 把 `currency_from_id` 與 `currency_to_id` 都算成 901，跨幣別轉帳的正反兩筆匯率記錄都指向錯誤幣別對。讀回時用正確 id 查永遠對不上 → 靜默損毀，且匯率記錄 append-only 不刪（`transferLogic.ts:248-249`）→ 永久污染，並交叉污染無關 TWD 帳戶的換算。同一張查表散在 6 檔，miss 語意四種不一：`901` / `undefined` / `null` / `140`（而 id 140 在 JSON 根本不存在）。
- **根因：** 沒有單一 currency registry 作為 code/id/symbol/minorUnits 的唯一真相與 fallback 政策出處。`Currency.json` 被多檔各自 import 重寫 `find`，`transferLogic` 連資料源都不同（hardcode 而非讀 JSON）。
- **建議：** 建單一 `currencyRegistry`（讀 `Currency.json`，提供 codeToId/idToCode/getDefById/minorUnits，預建 Map 解線性搜尋，集中 fallback 與 TWD 0 位例外，miss 一致 throw 或回 undefined）。所有 caller 改呼叫它、禁止再各自 `StandardCurrencies.find`；transferLogic 對查不到的幣別必須 throw 而非 fallback 901。
- **對應 ISSUES.md：** 統攝「currencyCodeToId 線性搜尋」「TWD 幣別 id 魔法數字」「snake_case/camelCase 轉換散落」的 currency 面向。
- **驗證：** v3/refuted0。三個 skeptic 均端到端走完損毀鏈、實測硬編 8 種 id 與 JSON 吻合、147/155 種落在 default、id 140 不存在，零推翻。

### ARCH-02 · 付費等級全在 client，可一鍵自助升級（人工還原）

- **檔案：** `src/screens/Settings/SettingsScreen.tsx:103-111`、`src/contexts/PremiumContext.tsx:23-51`、`:67-70`、`firestore.rules:23-63`、`src/services/syncEngine.ts:69-72`、`src/services/premiumLogic.ts:46`
- **問題：** `SettingsScreen` 的 Mock Tier 項 onPress 直接 `setMockTier(LEVEL_1)`，整段 Debug 區**無 `__DEV__` 包裹**、會進 production bundle。`PremiumContext.refreshStatus` 有 mockTier 短路凌駕真實 IAP，`currentTier` 唯一來源是 client 端比對 productId、無 receipt 上傳驗證。`firestore.rules` 對 write 只檢查 owner、不看 tier；`syncEngine.sync` 只要有 auth 就放行寫雲端。任何正式版使用者點一下拿到 LEVEL_1，雲端同步這個付費賣點在伺服器層零保護。
- **根因：** 付費的信任邊界整條放在客戶端（攻擊者可控環境），Debug 工具與正式 entitlement 共用同一條 setter 且無編譯期隔離，伺服器對「誰付費」一無所知。
- **建議：** Mock Tier 與整個 Debug 區用 `__DEV__` 包裹、`setMockTier` 不進 production bundle。根本對策：IAP receipt 經 Cloud Function 驗證後寫入受保護的 `users/{uid}/entitlement`，`firestore.rules` 對 L3 write 加 `tier>=1` 條件，client tier 降為 UI 快取。
- **對應 ISSUES.md：** 統攝「IAP 訂閱需伺服器驗證」但範圍更廣——是整條授權鏈缺伺服器側。
- **驗證：** 原 3 票 verify agent 技術性失敗（0 票）被誤殺，證據親驗紮實，人工還原 critical。

### ARCH-03 · 同步只有上傳、完全沒有下載路徑，換機必丟雲端資料

- **檔案：** `src/services/syncEngine.ts:65-128`、`:100-120`、`:135-149`、`src/contexts/AuthContext.tsx:79-103`
- **問題：** `sync()` 註解自承 `upload only, no collection pull`（`syncEngine.ts:67`）。transactions/accounts/categories/transfers/currency_rates/schedules 六張表只有寫入 Firestore、無任何 `firestoreToModel` 反向映射。`detectRemoteUserData` 偵測到雲端已有資料時只標記 `INITIAL_DONE` 再對空本地 DB 跑 delta（等於什麼都沒做）而非回填。Firestore 端累積的資料**沒有任何消費者**，新裝置永遠不回填。
- **根因：** 同步引擎被定義為單向備份器（device→cloud），卻沿用 LWW / initial-vs-delta 雙向同步的詞彙與狀態機，造成「看似 sync 其實只是 backup」的抽象錯置。
- **建議：** 明確定義同步方向契約。若雙向同步：補 L3 pull（`firestoreToModel` 依 `updatedOn` LWW 寫回、處理 `deletedOn` tombstone），新裝置 `detectRemoteUserData` 命中時觸發 full restore。若僅雲端備份：移除 initial/delta 的 LWW 假象，UI 明說「僅備份、還原走匯入」。方向契約寫進 spec `no3_logics`。
- **對應 ISSUES.md：** 與「同步引擎競合條件」同源（syncEngine 重災區）。
- **驗證：** v3/refuted0。

---

## 🟠 High

### ARCH-04 · 同步狀態旗標與本地 DB 皆裝置全域、登出不清，同機切帳號靜默漏備

- **檔案：** `src/services/syncEngine.ts:25-27`、`:107-120`、`:59-63`、`src/contexts/AuthContext.tsx:138-153`、`src/services/firebase.ts:111-128`
- **問題：** `LAST_PUSH_AT` / `INITIAL_DONE` / `LAST_SYNC_AT` 三個 key 都不含 uid、裝置全域。`resetSyncState`（唯一清這些 key 的函式）全 module 零呼叫。`signOut` 只做 firebase signOut + setUser(null)，不清 AsyncStorage 也不清 WatermelonDB。結果：帳號 A 同步後 `INITIAL_DONE=true`、`LAST_PUSH_AT=T1`；A 登出 B 登入，B 讀到 `INITIAL_DONE=true` 直接走 delta、since=T1，B 在 T1 前就存在的 seed 帳戶／分類**永遠不被備份**。
- **根因：** 同步進度與配額屬 per-user 狀態卻存成 per-device 全域 key，系統假設「一裝置一使用者終身不變」，登出流程無 per-user teardown。
- **建議：** 所有 sync/quota key 以 uid 前綴，或在 signOut 與帳號切換點呼叫 `resetSyncState`；至少保證新帳號首登（`detectRemoteUserData` 為空時）一定走 InitialBackup 而非繼承前帳號旗標。
- **對應 ISSUES.md：** 與「Firestore 監聽器未清除」同屬「登出不清理 per-user 狀態」根因。
- **驗證：** v3/refuted1（兩票確認，一票保留）。

### ARCH-06 · 命名轉換零集中，`modelToFirestore` 整段 47 個 `as any`，Firestore 型別形同虛設

- **檔案：** `src/services/syncEngine.ts:265-357`、`:283-296`、`src/services/schema/coreSchema.ts:1-119`、`src/services/userService.ts:20-38`
- **問題：** `modelToFirestore` 回傳 `any`、內部每欄位 `(model as any).xxx`（47 處 `as any` 為全 codebase 最高）。`coreSchema` 定義的 `FirestoreAccount`/`Transaction` 沒有一行 code 拿來約束 mapper 輸出，欄位改名一律不報、靜默寫 undefined 進 Firestore。`FirestoreUser` 被多處定義且形狀衝突。
- **根因：** 缺集中 mapper/serializer（snake_case raw ↔ domain model ↔ wire DTO 雙向）。WatermelonDB model 在 sync 層沒被賦予具體型別，映射只能 any 穿透。
- **建議：** 建單一 mapper 模組，每表一組 `toFirestore`/`fromFirestore`、簽名釘住兩端具體型別，移除 `as any`，改 `coreSchema` 欄位即編譯錯。幣別反查收斂到 ARCH-01 registry。此層補上後 ARCH-03 的 pull 有現成 `fromFirestore` 可用。
- **對應 ISSUES.md：** 統攝「any 濫用（syncEngine）」「snake_case/camelCase 轉換散落」。
- **驗證：** v3/refuted0。

### ARCH-10 · UI 層直接耦合 WatermelonDB，CRUD + soft-delete cascade 手刻在 screen

- **檔案：** `src/screens/Accounts/AccountEditorScreen.tsx:109-159`、`src/screens/Categories/CategoryEditorScreen.tsx:18`、`src/screens/Home/HomeScreen.tsx:69-109`、`src/components/AccountSelector.tsx:9`、`src/components/CategorySelector.tsx:9`、`src/screens/Accounts/AccountListScreen.tsx:15-22`、`src/services/localDbService.ts:12-19`
- **問題：** `database` 與 model 被 15 個 screen + 2 個可複用 component 直接 import，且不只讀還直接寫：`AccountEditorScreen` 在 `database.write` 內手刻 soft-delete + batch cascade + undo revert。Account/Category 完全沒有對應 logic 服務層（只有 Transaction/Transfer 有）。同一個 `AccountListScreen` 並存三種存取機制（`getAccounts` 讀 / `database`+model 直接寫 / `withObservables` reactive）。`localDbService` 只封了讀取一半，寫入一律繞過。persistence 任何變動波及約 17 個 UI 檔。
- **根因：** 全 app 沒有統一 repository/data-access 抽象。`localDbService` 只做了 read-only 一半、寫入從未收斂，每個 caller 各自選便宜方式。
- **建議：** 建統一 repository（擴充 `localDbService` 成完整 CRUD，或新增 `accountRepository`/`categoryRepository`），DB 讀寫只能經此層、screen/component 只接 plain 物件、不得 import `database` 與 model class；reactive 列表一律 `withObservables`、一次性讀寫走 repository。
- **對應 ISSUES.md：** 無直接對應，屬全新架構發現。
- **驗證：** v3/refuted0。

---

## 🟡 Medium

### ARCH-05 · PeriodDataStore 手動快取失效散落 7 檔 17 處，syncEngine 遠端寫入無失效路徑

- **檔案：** `src/stores/PeriodDataStore.ts:61-77`、`:119-191`、`src/screens/Home/HomeScreen.tsx:65-118`、四個 editor、`src/services/syncEngine.ts:242-251`
- **問題：** `processData` 直接 query DB（一次性 fetch、非 observe），結果存 Map cache、只在 `clearCache()` 失效。invalidation 靠呼叫端散彈式呼叫（至少 7 檔 17 處）。關鍵漏洞：`syncEngine` 直接寫 transactions/transfers/accounts 但無任何 `clearCache`——遠端同步下來的資料 cache 不會被清，首頁要等 `useFocusEffect` 才看得到。
- **根因：** 耦合方向反了。應是「DB 變更通知快取失效」(DB→store observe)，現在卻是「每個寫 DB 的 UI 端各自負責通知快取」(UI→手動 clearCache)。
- **建議：** 讓 `PeriodDataStore` 訂閱 `collection.observe()`，任何來源（UI/sync/import）寫入都自動觸發失效，移除 17 處手動 `clearCache`，並消解 `metadataVersion` 全 re-render 的需求。
- **對應 ISSUES.md：** 系統性根因，統攝「HomeScreen 用 metadataVersion 強制全 re-render」。
- **驗證：** v3/refuted0。

### ARCH-07 · 外部邊界全無 runtime schema 驗證：宣告 ajv 卻零使用

- **檔案：** `src/services/schema/coreSchema.ts:1-119`、`src/services/userService.ts:135-183`、`src/services/iapService.ts:117-129`、`src/services/importService.ts:67-73`、`:235-254`、`src/database/models/User.ts:18-37`
- **問題：** `package.json` 宣告 ajv 但全 src 無任何 `import Ajv`；被命名為 schema 的 `coreSchema.ts` 只 export interface 與常數、無 validate 函式。外部進入點全靠 cast：`doc.data() as FirestoreUser`、IAP `p as any`、`iap_*_json` 直接 `JSON.parse` 當 any。具體爆點：`syncSettingsFromCloud` 直接解未驗證的 `remote.preferences.language`，缺失時即 TypeError 中斷整個 sync。CSV 端全程 `any[]` 流轉。
- **根因：** 所有越界資料（Firestore、IAP、CSV、AsyncStorage JSON）缺統一 schema gate。`strict:true` 只保障 app 內部自洽，對跨邊界進來的 any 毫無防護。
- **建議：** 用既有 ajv 對每個 Firestore collection、IAP product、CSV row 寫 schema，回傳一律先 validate 再 cast。先補 `users/{uid}` 與 IAP product 兩個最高風險入口。
- **對應 ISSUES.md：** 統攝「processRemoteChange 未驗證 Firestore 結構」「any 濫用（iapService）」。
- **驗證：** v3/refuted0。

### ARCH-08 · 全系統缺 Money 抽象：金額編解碼在 screen 逐字重複，換算不量化致浮點誤差

- **檔案：** `src/screens/Transactions/TransactionEditorScreen.tsx:141-238`、`src/screens/Transactions/TransferEditorScreen.tsx:121-287`、`src/services/transactionLogic.ts:20-78`、`src/contexts/PreferenceContext.tsx:357-386`、`src/stores/PeriodDataStore.ts:362-527`、`src/services/transferLogic.ts:99-102`、`src/services/importService.ts:450`
- **問題：** 金額 domain encoding（顯示值↔minor units、含 TWD 0 位與 K-mode 千元）沒有單一 encode/decode，散在兩個 editor 的 handleSave/load 各抄一份完全相同的乘除，正負號規則只活在 UI、service 無從校驗。換算側 `convertAmount` 回 `amount*rate`、rate 是未量化 float，`PeriodDataStore` 整條彙總鏈零 `Math.round` 直接累加 → balance 出現非整數分偏差。`impliedRate` 在 transferLogic 與 importService 各算一份、未考慮兩端 minorUnits 差異（100 USD 換 3000 JPY 被算成 rate 0.3，差兩量級）。
- **根因：** 用裸 number 表示金額，沒有 Money 型別或「換算後立即量化到該幣別 minorUnits」的集中規則。
- **建議：** 建 money codec 層（`toMinorUnits`/`fromMinorUnits` 吃幣別 config），service 入口統一轉 minor units 與決定正負號，editor 只收集輸入；`convertAmount` 回傳前依目標幣別 minorUnits round；`computeImpliedRate` 集中一處。
- **對應 ISSUES.md：** 與「交易輸入驗證不足」相關（金額邊界）。
- **驗證：** v3/refuted0。

### ARCH-09 · convertAmount 查無匯率時靜默回原金額，外幣被當主幣計入總額

- **檔案：** `src/contexts/PreferenceContext.tsx:357-386`、`src/services/currencyService.ts:99-122`、`:159-163`、`src/stores/PeriodDataStore.ts:351-353`
- **問題：** `convertAmount` 對「未知幣別」與「查無匯率」兩處都 `return amount`（原值）。`getAccumulatedValue` 在多幣別取 converted，於是一筆 100 USD(10000 分) 無匯率時被當 10000 分 TWD 直接加進總額，使用者看到的跨幣別總額是不同幣別的「分」硬加在一起的無意義數字、無任何警告。另存兩套語義相反的換算實作（context 記憶體 vs service 查 DB，對「查不到」一個回原值、一個回 undefined）。
- **根因：** 換算層把「無匯率」這個明確的領域錯誤狀態降級成 silent fallback，呼叫端無從區分「真的 1:1」與「查不到」。需要同步快取的 read-path 被迫複製一份簡化版換算，兩套各自演化。
- **建議：** 抽單一 conversion 模組（純函式吃 rate snapshot），缺率策略二擇一明確只實作一次。`convertAmount` 改回 `number|null` 或 `{value,isFallback}`，`PeriodDataStore` 對 null 標記該期「匯率不完整」並 UI 警示。
- **對應 ISSUES.md：** 系統性根因，統攝「convertAmount 無匯率時靜默返回原值」。
- **驗證：** v3/refuted0。

### ARCH-11 · PeriodDataStore god-object：資料存取 + 財務聚合 + 呈現邏輯混在單例，三方法各 11 個位置參數

- **檔案：** `src/stores/PeriodDataStore.ts:95-131`、`:253-668`、`src/screens/Home/PeriodPage.tsx:79-184`、`src/screens/Home/HomeScreen.tsx:64-118`、`src/contexts/PreferenceContext.tsx:12`
- **問題：** `processData` 一手包辦 query DB + 收支聚合 + 指派 `theme.chart` 顏色與 `i18n.t` 標題（三層揉一類）。三個方法各帶 11 個重複位置參數，`PeriodPage` 至少 7 處逐一重打。store 活在 React 外拿不到 context，只能靠 11-arg 硬轉依賴方向，`PreferenceContext` 又反向 import 此 store 形成雙向耦合。
- **根因：** 讀取側缺對應寫入側的 query/aggregation service 層，所有彙整與配色塞進一個 UI-aware 單例。
- **建議：** 拆三層（純資料查詢 / 純財務聚合 / 呈現映射）。環境依賴透過一次性 `configure` 注入，查詢方法改 options 物件。
- **對應 ISSUES.md：** 無直接對應。
- **驗證：** v1/refuted0。

### ARCH-13 · 付費閘門散落 6+ 處且只在 UI，mutation 層不複查，非 FAB 入口可繞過限額

- **檔案：** `src/navigation/AppNavigator.tsx:109-133`、`src/screens/Accounts/AccountListScreen.tsx:65`、`src/screens/Categories/CategoryListScreen.tsx:131`、`src/screens/Settings/ImportScreen.tsx:465`、`src/services/transactionLogic.ts:54`、`src/services/transferLogic.ts:83`、`src/screens/Transactions/TransactionEditorScreen.tsx:334`
- **問題：** `canUserPerformAction` 呼叫點全在 UI，但實際寫資料的 `createTransaction`/`createTransfer` 內部完全無 tier 檢查。`AppNavigator` 進場前 gate 擋去 Paywall，但 `editor.handleSave` 不重跑 → 任何非 FAB 入口（deep link、recurring 補產、未來新 caller）繞過限額。
- **根因：** entitlement 被當成「導航前 UI 守門」而非 domain invariant，檢查點與真正寫入點分離。與 ARCH-02 互為表裡。
- **建議：** 把限額檢查下沉成 service 寫入邊界前置條件（`createTransaction` 入口統一 assert，或包 `guardedMutation`），UI 只負責把 `QuotaExceeded` 轉成導去 Paywall。
- **對應 ISSUES.md：** 無直接對應。
- **驗證：** v2/refuted0。

### ARCH-14 · ActionId 表與實際 enforcement 脫節：4 個 entitlement 宣告付費卻從不強制

- **檔案：** `src/services/premiumLogic.ts:12-46`、`src/contexts/PremiumContext.tsx:53-91`、`src/services/syncEngine.ts:69-72`、`src/screens/Transactions/TransferEditorScreen.tsx:375-383`、`src/screens/Settings/ImportScreen.tsx:462-472`、`src/constants/limits.ts:4-19`
- **問題：** `triggerCloudSync`/`useForeignCurrency`/`importData`/`checkIsPremium` 四個 entitlement 宣告為付費卻從不或停用強制：`triggerCloudSync` 零呼叫點、`useForeignCurrency` 全專案無 caller（跨幣別轉帳實際不設防）、`importData` 的 `navigation.replace('Paywall')` 被註解掉、`checkIsPremium` 函式體無條件 `return false` 且零 caller。
- **根因：** ActionId enum 充當「假的 single source of truth」——列出意圖中的付費邊界但無機制保證每個 ActionId 被實際檢查。
- **建議：** 確為付費功能則接上 `canUserPerformAction`，否則從 ActionId 移除以免誤導；刪除 `checkIsPremium` 死碼、premium 判定統一走 PlanTier。本條為 ARCH-13 的具體死規則清單。
- **對應 ISSUES.md：** 無直接對應。
- **驗證：** v1/refuted0。

### ARCH-19 · Selector / Editor / list-item 全是逐行雙胞胎，缺泛型抽象

- **檔案：** `src/components/AccountSelector.tsx`、`src/components/CategorySelector.tsx`、四個 Editor screen、`src/components/list/ListItem.tsx:124-165`、`src/screens/Accounts/AccountListScreen.tsx:27-94`
- **問題：** `AccountSelector`/`CategorySelector` 各約 280 行幾乎全是 Account→Category 機械改名。四個 Editor 的 `createStyles`（約 70 行）逐字相同、`handleDelete` 的「軟刪→cascade→showUndo」骨架各出現一次。五個 list-item 各自重刻語意相同的 row。`updateSortOrder` 共三份逐字相同。
- **根因：** 缺多層泛型抽象（`EntitySelector<T>`、`useEntityEditor`、`useSoftDeleteWithUndo`、`ListRowBase`、`ReorderableEntityList<T>`）。
- **建議：** 抽上述泛型，現有 selector/editor/list-item 退化成薄包裝。
- **對應 ISSUES.md：** 無直接對應。
- **驗證：** v3/refuted0。

### ARCH-24 · HomeFilterContext 把 70 行選取業務決策塞進 DB observe 的 setState updater

- **檔案：** `src/contexts/HomeFilterContext.tsx:36`、`:54-118`
- **問題：** 在 `query.observe().subscribe` callback 內同時做兩層事：把 DB accounts 投影成 `availableAccounts`，並在 `setSelectedAccountIds` 的 updater（逾 40 行）塞滿「首次全選 / 偵測新帳戶自動加入 / 全部失效 fallback / 避免覆寫使用者手動取消」業務決策，還靠 `useRef` 跨 emission 比對 diff。註解本身留多段自我懷疑 reasoning。
- **根因：** 單一 context 把「帳戶資料的反應式訂閱」與「使用者選取意圖的衍生規則」兩關注點耦合在同一 callback。
- **建議：** 訂閱只提供 accounts；選取規則抽成純函式 `reconcileSelection(prev,accounts,prevIds)` 單獨單測。
- **對應 ISSUES.md：** 無直接對應。
- **驗證：** v1/refuted0。

---

## ⚪ Low

### ARCH-12 · domain 型別分裂三套（types/index vs WatermelonDB model vs Firestore wire）

- **檔案：** `src/types/index.ts:1-66`、`src/services/schema/coreSchema.ts:70-80`、`src/services/userService.ts:12-38`、`src/contexts/AuthContext.tsx:84-90`、`src/database/models/User.ts:1-40`
- **問題：** Transaction/Account/User 三套欄位命名各行其是。`FirestoreUser` 定義 3 次且衝突，`UserPreferences` 兩處 `timeZone` vs `timezone`。`AuthContext` 用 `as unknown as` 強轉。任一邊改欄位另兩邊不編譯錯，schema drift 靜默。
- **建議：** 確立 WatermelonDB model 為 app 內 domain 單一真相、`coreSchema` 為 Firestore wire 唯一來源，刪除 `types/index.ts` 重複 entity。搭配 ARCH-06 mapper 與 ARCH-07 ajv 共用同一份定義。
- **驗證：** v1/refuted0。

### ARCH-15 · AuthContext/PremiumContext 成 orchestration god-context

- **檔案：** `src/contexts/AuthContext.tsx:20-32`、`:79-103`、`src/contexts/PremiumContext.tsx:21-94`、`:53-91`
- **問題：** IAP tier 判定雙寫（兩 context 各一份），`runPostAuth` 直接驅動 `generateMissingInstances`（把補產定期交易綁在 auth context），`PremiumContext` 在 `refreshStatus` 與 AppState 監聽內各自 `import('syncEngine').then(s=>s.sync())`。
- **建議：** context 收斂為只暴露 state。IAP→tier 判定收進單一函式；登入後補產 + 觸發 sync 移到 post-auth orchestration。順帶解掉「動態 import 與 sync() Promise 未 catch」。
- **對應 ISSUES.md：** 統攝「PremiumContext Promise 未處理」。
- **驗證：** v1/refuted0。

### ARCH-16 · PreferenceContext 肥大 god context，value 未 memo 致全樹 re-render

- **檔案：** `src/contexts/PreferenceContext.tsx:37-63`、`:168-218`、`:319-422`、`:428-454`
- **問題：** 458 行 context 一次曝露 22 個成員、混四種職責（偏好狀態 / Firestore 雙向同步 / 貨幣換算引擎 / i18n）。value 是 inline literal 未 `useMemo`，改 `launchMode` 一個欄位會讓依賴 `convertAmount` 的整個首頁列表 re-render。
- **建議：** 拆瘦偏好 context；換算/格式化抽成 `CurrencyContext` 或純函式（與 ARCH-09 共用）；至少先把 value 用 `useMemo` 包起來。
- **驗證：** v1/refuted0。

### ARCH-17 · PeriodDataStore cache key 漏 baseCurrencyCode，換基準幣別後命中舊值

- **檔案：** `src/stores/PeriodDataStore.ts:197-206`、`:119-138`、`src/contexts/PreferenceContext.tsx:258-278`
- **問題：** `getCacheKey` 沒有 baseCurrencyCode 也沒有匯率版本，但 `processData` 輸出強烈依賴幣別。`setBaseCurrencyId` 只做 setState、完全沒 `clearCache`。改基準幣別後 cache 仍命中同一 key，總額顯示舊幣別換算值，直到下次 focus 才蓋掉。
- **建議：** 把 baseCurrencyCode 與匯率版本納入 `getCacheKey`，或在 `setBaseCurrencyId` 補 `clearCache`。與 ARCH-05 反應式失效一併解決。
- **驗證：** v3/refuted0。

### ARCH-18 · 三套狀態範式並存無選型章法，PeriodDataStore 的 subscribe API 是死碼

- **檔案：** `src/stores/PeriodDataStore.ts:61-195`、`:180-195`、`src/contexts/HomeContext.tsx:14-22`、`src/screens/Home/PeriodPage.tsx:96-218`
- **問題：** 狀態用三種互不相容範式（6 個 Context / module singleton / ad-hoc hook）。`PeriodDataStore` 定義完整 `subscribe`/`notifyListeners` 觀察者模式但全 codebase 零訂閱者——整段死碼。實際 UI 更新走另一條 poll 路線（local useState + focus 時 `clearCache` + bump version）。一個 store 有 push 與 poll 兩套設計、留 push 卻用 poll。
- **建議：** 二選一收斂角色——刪 subscribe 死碼定義為純被動快取（invalidation 由 ARCH-05 的 observe 驅動），或讓 `PeriodPage` 改用 `useSyncExternalStore` 真正訂閱。補一份「狀態選型準則」文件。
- **驗證：** v3/refuted0。

### ARCH-20 · 編輯排程交易走 delete+create 土法、產生孤兒 Schedule，且補產無併發鎖、不感知時區

- **檔案：** `src/screens/Transactions/TransactionEditorScreen.tsx:282-321`、`src/services/recurringLogic.ts:63-193`、`:233-344`、`src/contexts/AuthContext.tsx:95-99`、`src/database/helpers/mockData.ts:504`、`src/utils/timeHelper.ts:95-129`
- **問題：** 編輯既有排程交易時 screen `deleteTransaction` 後 `createSchedule` 新建，但舊 Schedule 從未被 `endOn` 截斷 → 新舊並存、舊的繼續生實例（service 的 `updateSchedule` 有正確處理但此路徑繞過）。`generateMissingInstances` 被三個非同步入口呼叫、無 mutex，並發兩迴圈讀到相同 `lastGenerationDate` 各自往後生重複實例。完全不碰 timeZone（month-end 錨點漂移、跨時區多生或少生一天）。
- **建議：** screen 統一走 `updateSchedule`；`generateMissingInstances` 加 per-user 序列化或對 `(scheduleId, instanceDate)` 加唯一鍵使 create 冪等；接受 timeZone 在 zoned time 算日期推進。
- **驗證：** v1/refuted0。

### ARCH-21 · 純 client model id 直接當 Firestore doc id 且盲推 merge，無衝突解決

- **檔案：** `src/services/syncEngine.ts:207-260`、`src/services/transactionLogic.ts:61-64`、`src/services/mergeService.ts:25-101`、`src/services/transferLogic.ts:96-102`
- **問題：** `pushBatches` 用 model.id 當 Firestore doc id、`batch.set(...,{merge:true})` 盲推，沒讀 `remote.updatedOn` 比對 → 較舊裝置可覆蓋較新欄位。L2 settings 尚做 LWW，L3 集合完全沒有。另外 merge 帳戶後不重算被改寫轉帳的 `impliedRate`（USD→JPY 被 merge 成 TWD→JPY 後 amount 與新幣別不對應）。
- **建議：** L3 寫入比照 L2 做 `updatedOn` 條件（runTransaction 讀 remote 後才覆蓋），至少在 spec 聲明「同一帳號不應多裝置並發編輯」；merge 跨幣別轉帳時判斷新舊幣別、不一致則重算 `impliedRate`。
- **對應 ISSUES.md：** 與「同步引擎競合條件」同源。
- **驗證：** v1/refuted0。

### ARCH-22 · Firebase 存取無統一抽象：Firestore 雙 API 風格永久並存

- **檔案：** `src/services/syncEngine.ts:2-11`、`src/services/userService.ts:1-47`、`src/services/firebase.ts:153`
- **問題：** Firestore 被兩 service 各自存取且風格不同（syncEngine 用 modular API、userService 用 namespaced API）。`firebase.ts` 只封裝 Auth 未封裝 Firestore，且 `syncEngine` 直接 import SDK 的 `getAuth` 繞過自家 wrapper。SDK 遷移做一半、兩風格永久並存。
- **建議：** 建單一 firestore 存取模組統一 modular API，`syncEngine` 改用自家 `getAuth`，隔離未來版本升級爆炸半徑。
- **驗證：** v1/refuted0。

### ARCH-23 · HomeFilterProvider 自我巢狀錯位，致首頁日檢視新增交易不預填當日（user-facing bug）

- **檔案：** `App.tsx:14-24`、`src/navigation/AppNavigator.tsx:91-188`、`:124-129`、`src/contexts/HomeFilterContext.tsx:25`
- **問題：** Provider 樹拆兩處（App.tsx 與 AppNavigator）。`NavigatorContent` 在元件頂層（行 94）呼叫 `useHomeFilter()`，但 `<HomeFilterProvider>` 在同元件 return JSX（行 188）才渲染——provider 是 consumer 的子孫而非祖先，`timeGranularity` 恆 undefined。連鎖致行 124 的 `if(...timeGranularity==='day')` 永遠 false，**從首頁日檢視按 FAB 新增交易不帶當日日期**。
- **建議：** 把所有 Provider 收斂到單一 `AppProviders` 元件（Auth>Premium>Preference>Undo>Home>HomeFilter），確保 `HomeFilterProvider` 在所有 consumer 的祖先層。修正後驗證日檢視新增交易會預填當日。
- **驗證：** v3/refuted0。

### ARCH-25 · deleted_on 未建索引，但軟刪除過濾是全 app 最高頻讀取路徑

- **檔案：** `src/database/schema.ts:33-145`、`src/services/localDbService.ts:12-68`、`src/screens/Home/HomeScreen.tsx:72-90`、`src/contexts/HomeFilterContext.tsx:54`
- **問題：** schema 所有表的 `deleted_on` 只是 `{type:'number',isOptional:true}` 無 `isIndexed`（對照 user_id/外鍵/date 都有索引），但軟刪除過濾 `Q.where('deleted_on', null)` 無所不在、都是隨資料量線性成長的熱路徑。
- **建議：** 對 transactions/transfers/accounts/categories 的 `deleted_on` 加 `isIndexed:true`（經新 migration 與 schema 同步），或改用 status 欄位 + 複合索引。
- **驗證：** v1/refuted0。

### ARCH-26 · quotaService 為與付費平行未整合的第二套配額系統

- **檔案：** `src/services/quotaService.ts:8-98`、`src/services/syncEngine.ts:101-143`、`:231`
- **問題：** `MAX_DAILY_READS/WRITES=2000` 註解自承 per-device、防 runaway loop，與 `PremiumContext` tier 完全無交集（免費與付費同 2000 上限）。reset 以本地日界，但 syncEngine 註解卻說 UTC reset、語意不一致。
- **建議：** 明確定位為純防失控工程護欄並改名（如 `syncRateLimiter`）、與付費 entitlement 解耦；或若意圖是付費分級配額則接上 `currentTier`。修正 local-day vs UTC 不一致。
- **驗證：** v1/refuted0。

### ARCH-27 · Context 缺 provider 防護策略不一致（{} as T 強轉 vs throw guard 並存）

- **檔案：** `src/contexts/AuthContext.tsx:41`、`src/contexts/PreferenceContext.tsx:65`、`src/contexts/PremiumContext.tsx:12`、`src/contexts/HomeFilterContext.tsx:25`、`src/contexts/HomeContext.tsx:8-30`、`src/contexts/UndoContext.tsx:31-105`
- **問題：** 四個 context 用 `createContext<T>({} as T)`，漏掛 provider 時消費端讀到 undefined 欄位靜默壞掉（這正是 ARCH-23 能靜默發生的型別層成因）。`HomeContext`/`UndoContext` 相反用 `undefined` default + throw guard。兩種防呆並存。
- **建議：** 統一採 throw-guard，移除 `{} as T`，讓缺 provider 一律 fail-fast。
- **驗證：** v1/refuted0。

### ARCH-28 · 轉帳支出/收入語意散落在 PeriodDataStore 600 行 processData，用 transfer_ 魔法字串前綴

- **檔案：** `src/stores/PeriodDataStore.ts:440-441`、`:547-550`、`:615-623`
- **問題：** 用 `transfer_${externalAccountId}` 當分類聚合 key，下游 `startsWith('transfer_')`、`replace('transfer_','')` 多處反解。轉帳該算支出或收入的判斷只活在 600 行 `processData`、沒抽成可測純函式。
- **建議：** 用 discriminated union 或顯式欄位（`groupKind:'category'|'transferAccount'`）取代字串前綴；把方向判斷抽成純函式。
- **驗證：** v1/refuted0。

### ARCH-29 · 已宣告廢除的手刻 row/header 仍殘留正式畫面，CLAUDE.md header 元件名與實作漂移

- **檔案：** `src/screens/Home/FilterPopover.tsx:77-124`、`src/screens/Settings/MockDataSettingsScreen.tsx:124-237`、`src/screens/Settings/CurrencyRateEditorScreen.tsx:303-494`、`src/components/list/DataListItem.tsx:1-124`、`src/navigation/headerItems.tsx:38-83`、`src/constants/uiGlyphs.ts:9`
- **問題：** CLAUDE.md 明列廢除 `optionRow`/`rowButton`/`pickerItem`/`currencyItem`，但 `FilterPopover`（正式 Home 篩選 popover）仍用 `optionRow` 手刻、`MockDataSettings` 用 `rowButton`、`CurrencyRateEditor` 內嵌手刻 modalHeader 重現已廢除 ModalFormHeader 形狀。`DataListItem` 屬官方 barrel 卻零畫面 import、是孤兒。CLAUDE.md「Header 元件」寫的 `HeaderIconButton`/`HeaderCheckmarkButton`/`ModalCloseButton` 全 repo 無定義，實際是 `headerItems.tsx` 的工廠函式。
- **建議：** `FilterPopover` 改用 `SelectionListItem`、`MockDataSettings` 改用 `ListItem`、刪 `CurrencyRateEditor` 死樣式並把幣別選擇器升成 navigation modal screen；更新 CLAUDE.md「Header 元件」段為實際工廠名並註明採 descriptor。
- **建議補充：** 廢除宣告應加 lint/guard 防回潮。
- **驗證：** v1/refuted0。

### ARCH-30 · 分層倒置與死模組殘留：database/helpers 反向 import services 形成 require cycle

- **檔案：** `src/database/helpers/mockData.ts:18-20`、`src/database/helpers/seed.ts:12-24`、`src/services/settingsService.ts:1-13`、`src/components/list/ListSection.tsx:12-36`、`src/screens/Categories/CategoryListScreen.tsx:222-233`、`src/screens/Home/FilterPopover.tsx:111-120`
- **問題：** 低層 `database/helpers/mockData` 反向 import 高層 service（`createTransaction` 等），而這些 service 又 import `../database` → 形成 `database/helpers→services→database` 環。`seed.ts` 的 TODO 顯示規劃成正式 onboarding，屆時倒置進生產關鍵路徑。`settingsService` 整檔 deprecated stub、零 caller。`ListSection` 已封裝但 `CategoryListScreen`/`FilterPopover` 各自 inline 重刻。
- **建議：** 把 mockData/seed 遷到 `services/seedService.ts` 使依賴方向恢復 services→database 單向；刪除 `settingsService.ts`；標題改用 `ListSection`。
- **驗證：** v1/refuted0。

---

## 與 ISSUES.md 對應關係

`ISSUES.md` 16 點裡，約 11 點是本報告數條架構缺陷的表面症狀（修架構根因會一併解決），約 5 點無更深架構根因、照原樣逐點修即可。

| ISSUES.md 項目 | 對應 ARCH | 性質 |
|---|---|---|
| IAP 訂閱需伺服器驗證 | ARCH-02 | 症狀（根因範圍更廣）|
| 交易輸入驗證不足 | ARCH-07 / ARCH-08 | 症狀 |
| HomeScreen metadataVersion 全 re-render | ARCH-05 | 症狀 |
| syncEngine 競合條件 | ARCH-03 / 04 / 21 | 症狀（同步重災區）|
| PremiumContext Promise 未 catch | ARCH-15 | 症狀 |
| convertAmount 無匯率靜默返回 | ARCH-09 | 症狀 |
| currencyCodeToId 線性搜尋 | ARCH-01 | 症狀 |
| Firestore 監聽器未清除 | ARCH-04 | 相關（登出不清 per-user 狀態）|
| processRemoteChange 未驗證結構 | ARCH-07 | 症狀 |
| any 濫用（AuthContext / iapService / syncEngine）| ARCH-12 / 07 / 06 | 症狀 |
| 魔法數字（TWD id / Undo timeout）| ARCH-01（TWD id 面向）| 部分症狀 |
| 命名 snake/camel 散落 | ARCH-01 / 06 | 症狀 |
| 缺全域 Error Boundary | 無 | 獨立項，逐點修 |
| console.log 正式環境洩露 | 無 | 獨立項，逐點修 |
| refreshRates 空函式 | 無 | 獨立項，逐點修 |
| Firestore 規則細粒度化（已完成）| ARCH-02（rules 仍不檢查 tier）| 已完成但 tier 維度仍缺 |

---

## 審查方法與限制

- **workflow 結構：** 8 維度 finder（分層 / 狀態 / 資料同步 / 記帳邏輯 / 付費配額 / 模組耦合 / 元件複用 / 型別邊界）並行 → triage 去重校準 → 對抗式 verify → 排序。
- **對抗式驗證：** critical/high 派 3 個視角不同的 skeptic（會不會真發生 / 是否已有防護 / 嚴重度是否名副其實），need 2/3 推翻才砍；medium/low 派 1 票。
- **已知限制：**
  - 4 個 verify agent 技術性失敗（未正確呼叫輸出工具），其中 3 個是 ARCH-02 的三票 → ARCH-02 被誤殺後人工還原。第 4 個是某 high 條目的一票、其餘兩票成功不影響存活。
  - v1（單票）的 low 條目驗證強度低於 v3，採用前可再人工確認。
  - 審查只讀 `src/`，未涵蓋 `firestore.rules` 全文、原生 iOS/Android 層、CI 設定。ARCH-02 引用的 `firestore.rules:23-63` 由 agent 讀過但未全檔審查。
- **後續：** 本報告為純審查、無檔案改動。要落地修復需依「動工前置」走正規 worktree 流程，並回頭更新 `ISSUES.md`（把被統攝的點標注對應 ARCH 編號）。
