# SuSuGiGi 使用者資料備份/蒐集 — no1+no2 解決方案總結與 Spec/Impl 落差盤點

> **建立時間：** 2026-04-29
> **性質：** 下游對齊路線圖（archive 工作追蹤筆記）
> **與既有 `alignment_report_user_data_20260429.md` 關係：** report 是 Product git 內 no1 / no2 自審，本 plan 是把 no1 / no2 決議向下注入 spec / impl 的執行路線圖
> **執行範圍：** 三個依序執行的子 plan（D0 上游修正 → D1 spec 對齊 → D2 impl 對齊）；本檔本身不直接修檔，只作為後續子 plan 的權威基準

## Context

SuSuGiGi 近期在 `no1_product_initiation/` 與 `no2_product_planning/` 對「使用者資料備份」「使用者資料蒐集」做了大幅度重構，引入分層備份模型（L2 PreferenceSync / L3 TransactionBackup / L4 FullBackupExport）、分層法律基礎（Contract + Consent + analyticsConsent flag）、取消多裝置即時同步等關鍵決策。這些決策目前還沒同步到 `no3_product_specs/` 與 `no5_product_development/`。本 plan 的目標：

1. 從 no1+no2 萃取「使用者資料蒐集 / 備份」的權威解決方案總結，作為下游 spec / impl 對齊的基準
2. 將總結與當前 no3 spec、no5 impl 比對，列出「規格缺什麼」「實作缺什麼」
3. 後續會以本 plan 為依據，分批生出 spec 修改 plan 與 impl 修改 plan（本 plan 本身不直接修檔）

---

## 上游層級審視（R-UPSTREAM-FIRST）

| 層級 | 範圍 | 結論 | 原因 |
| --- | --- | --- | --- |
| 提案層 `no1_product_initiation/` | `no1_root_mentality.md` / `no2_root_value.md` / `no3_business_model.md` | **不改** | LEVEL_0/1/2/3/B 訂閱模型、心智模型已定，本案僅是把這些已決策的內容向下注入；no3_business_model 的 RevenueCat 排除、LEVEL 切分仍正確 |
| 需求層 `no2_product_planning/no1_requirements/` | `no1_requirements.md` | **不改** | 認證、資料蒐集法律基礎、退出機制、隱私合規、匯率、本機資料庫選型、取消多裝置即時同步等決策皆已定稿並標 ★ 選用 |
| 整合層 Product Map `no2_product_planning/no2_product_map/` | `app/app_setting.md`、`app/cloud_sync.md` | **需改一處：launchMode 改為納入 L2 PreferenceSync** | 使用者澄清：所有 preference 相關設定都應參與雲端同步，原 `app_setting.md:89, 112, 115` 的「啟動模式為例外，屬裝置專屬偏好，不參與雲端同步」與「依時間或情境自動切換啟動模式」排除規則需移除；`cloud_sync.md:22-27` L2 PreferenceSync 功能列項需從「主貨幣 / 主題 / 語言 / 時區」改為「全部 preference 設定」或補上 launchMode |
| 整合層 Product Map（其餘） | `app/auth.md`、`app/recording_core.md`、`firebase/authentication.md`、`firebase/firestore.md`、`structure.md`、`cloud_service/analytics_pipeline.md` | **不改** | 三條備份軌道（除上述 launchMode 例外）、BackupEngine、QuotaManagement、SecurityRules、整體架構圖示均對齊需求層 |
| Roadmap `no2_product_planning/no3_dev_roadmap/` | `no3_dev_roadmap.md` | **不改** | 與本案無直接衝突 |
| 專案管理 `no4_project_management/` | — | **不改** | 本案屬規格/實作對齊，非排程議題 |

**上游需先補一個小修（D0）再進 D1 / D2。launchMode 修正屬 Product git 範疇，不涉及 spec/impl 兩層 git。**

---

## Part A — 使用者資料解決方案總結（取自 no1 + no2，不參考 spec）

以下所有路徑為相對於 SuSuGiGi 產品根目錄的引用。

### A1. 使用者帳號與認證

- **存取模型：Auth-First 強制登入牆（已選用）**
  - 未登入無法進入主頁；首次登入後 Firebase Auth 底層快取憑證以支援斷網離線運作
  - 排除 Local-First 訪客模式 → **沒有匿名帳號 / guest → upgrade 流程**
  - 來源：`no2_product_planning/no1_requirements/no1_requirements.md:116-146`、`no2_product_planning/no2_product_map/app/auth.md:1-46`
- **登入提供者：Google Sign-In 唯一**
  - 排除 Apple ID（Email 不可分享問題、合併困難）
  - 排除其他第三方社交登入
  - 來源：`no2_product_planning/no2_product_map/firebase/authentication.md:1-16`
- **首次登入初始化 PostAuthSetup**：自動建立預設帳戶與類別集

### A2. 資料儲存層級

| 訂閱層級 | 本機 | 雲端 | 備註 |
| --- | --- | --- | --- |
| LEVEL_0 免費 | WatermelonDB | Firestore（受 L2/L3 寫入） | **與 LEVEL_1 在資料機制上無差異** |
| LEVEL_1 付費 | WatermelonDB | Firestore（受 L2/L3 寫入） | 付費差異移至功能面（帳戶數、類別數、外幣、定期交易、匯入、Logic Engine 等） |

- **本機 ORM：WatermelonDB**（基於 SQLite，Sync Adapter 與 Lazy Loading）
- **雲端：Firestore Delta batch sync**（不使用 Real-time listener，成本控制）
- **Local-First 鐵律：App 嚴禁直接讀寫 Firestore 驅動 UI**，只有 Auth 流程是例外
- 來源：`no2_product_planning/no1_requirements/no1_requirements.md:89-100, 200-218, 317-336`、`no2_product_planning/no2_product_map/firebase/firestore.md:1-27`

### A3. 資料蒐集（Capture / Collection）

- **蒐集項目**：交易、轉帳、帳戶、類別、匯率、定期交易、偏好設定、analyticsConsent flag
- **蒐集機制**：
  - 手動建立（TransactionEditor / TransferEditor）
  - CSV 五步驟 Wizard 匯入（模板 → 選檔 → 欄位對應 → 內容比對 → 預覽確認）
  - App 啟動時自動補產定期交易（不依賴雲端、離線可運作）
  - 跨幣別轉帳時自動寫入隱含匯率
- **明確排除**：
  - 銀行 API 直接讀取
  - OS AI 自動爬取（郵件 / 簡訊 / 通知）
  - 自動分類建議（屬 LEVEL_3 AIAdvisor 範疇）
- 來源：`no2_product_planning/no1_requirements/no1_requirements.md:13-25`、`no2_product_planning/no2_product_map/app/recording_core.md:26-74`、`no2_product_planning/no2_product_map/app/app_setting.md:59-75`

### A4. 三條備份軌道

#### L2 PreferenceSync（全 user 享有）
- **範圍：所有 preference 相關設定全納入同步**（baseCurrency、theme、language、timeZone、launchMode、analyticsConsent，以及未來新增的任何 preference 欄位）
  - **與當前 no1+no2 不一致**：原 `app_setting.md:89, 112, 115` 將 launchMode 排除為裝置專屬，使用者已決策變更為「全部納入同步」，上游 D0 步驟先修
- 儲存：`users/{uid}/preferences`
- 觸發：設定變更即時寫入 + 背景排程
- **衝突解決：Last-Write-Wins（修改時間戳判定）**
- 來源：`no2_product_planning/no2_product_map/app/cloud_sync.md:20-42`、`app/app_setting.md:77-90`

#### L3 TransactionBackup（全 user 自動寫入，**含 LEVEL_0 免費版**）
- 範圍：transactions、transfers、accounts、categories、currency_rates、schedules
- 儲存：`users/{uid}/{collection}`，所有 collection 含「修改時間戳」+「軟刪除標記」兩個標準欄位
- **觸發**：
  - InitialBackup（首次完整上傳，偵測 Firestore 端無此 user）
  - Delta 增量上傳（背景排程，以 updatedOn 篩選）
- **使用者不可關閉、不可取回**（取回走 L4）
- **法律基礎：Contract（履行契約必要），不受 analyticsConsent 影響**
- 來源：`no2_product_planning/no2_product_map/app/cloud_sync.md:44-89`、`no2_product_planning/no1_requirements/no1_requirements.md:235-275`

#### L4 FullBackupExport（全 user 享有，唯一使用者可取回管道）
- 格式：JSON ZIP 全量檔
- 內容：Settings + 全部 entity + referential mapping
- 觸發：使用者手動於 Settings → DataManagement 按鈕觸發
- 輸出：**OS Share Intent**，user 自選去處（iCloud / Google Drive / Dropbox / AirDrop / Email / 任意位置）
- **與 analyticsConsent flag 完全脫鉤**，關閉分析後仍可 export
- 來源：`no2_product_planning/no2_product_map/app/cloud_sync.md:131-163`、`no2_product_planning/no1_requirements/no1_requirements.md:235-251`

### A5. 多裝置同步策略（重要決策變更）

- **取消多裝置即時資料同步**（原規劃為 LEVEL_1 付費差異 → 已廢）
- 跨裝置使用方式：使用者主動走 L4 export → 新裝置 CSV/JSON 匯入 → 若付費版則 BackupEngine 後續同步
- L3 TransactionBackup **是單向上傳，無下載同步路徑** → 從架構上避免衝突
- L2 Preference 才有雙向同步並採 LWW
- 來源：`no2_product_planning/no1_requirements/no1_requirements.md:317-336`

### A6. 配額與成本管控

- **本地計數追蹤**每日 Firestore writes，**單裝置 2,000 writes/day 上限**
- 跨日重置採 **UTC+0 00:00:00 統一基準**（不受裝置時區影響）
- 超限時暫停 Silent Backup（L3）
- 不使用 Real-time listener（避開 read 成本）
- 來源：`no2_product_planning/no2_product_map/app/cloud_sync.md:110-128`

### A7. 隱私與法律基礎

- **分層法律基礎**：
  - **Tier 1 Contract**：L3 TransactionBackup，user 不能拒絕、不能取回
  - **Tier 2 Consent**：分析 / 訓練 / 商業化用途；由 `analyticsConsent` flag 控制（**預設 true，opt-out 模式**）
- **analyticsConsent flag = false 時**，下游全停：firestore-bigquery-export 跳過此 user / 個人化分析 / AI 顧問訓練 / B2B 聚合資料變現
  - **L3 TransactionBackup 不受影響**（Contract 基礎）
- **隱私退出 4 步驟**：L4 export → ClearDatabase → 登出 → 法務流程處理 Firestore 殘留
- **K-Anonymity** 對外資料輸出隱私處理（LEVEL_B）
- **多租戶隔離**：Firestore Security Rules 以 Firebase UID 為 key
- **軟刪除**：所有 collection 設 `deletedOn` 標記，不物理刪除（供時光機回溯）
- **Undo 15 秒撤銷視窗**
- 來源：`no2_product_planning/no1_requirements/no1_requirements.md:235-336`、`no2_product_planning/no2_product_map/firebase/firestore.md:31-60`、`no2_product_planning/no2_product_map/app/recording_core.md:96-108`

### A8. 廢棄方案（不該再出現在 spec / impl 中）

| 廢棄項目 | 替代方案 |
| --- | --- |
| 多裝置即時同步（原 LEVEL_1 差異） | 手動 export/import + Preference LWW |
| 即時 Firestore Real-time listener（resource 監聽 doc 變更） | Delta batch sync（增量批次） |
| Apple ID 登入 | Google Sign-In 唯一 |
| RevenueCat IAP 中介 | 自建 IAP 封裝（StoreKit + Play Billing） |
| OS AI 自動記帳 | iOS Widget + 開啟預設扣帳畫面 |
| 外部即時匯率 API | Strict Direct Rate（手動 + 自動隱含匯率） |

---

## Part B — Spec（no3）落差盤點

> 比對基準：Part A 解決方案總結 vs `no3_product_specs/no1_user_management/` 與 `no3_product_specs/no2_accounting_app/` 現況。

### B1. 已對齊項目（spec 已寫到、且與 no1+no2 一致）

- Google Sign-In + Firebase Auth 雙層認證 — `no2_accounting_app/no3_logics/no2_login_logout_logic.md`
- Settings 表的 `lastSyncedAt` / `updatedOn` 欄位設計 — `no2_accounting_app/no1_data_models/no1_data_models.md:5-22`
- 軟刪除機制（`deletedOn` / `disabledOn`）— `no2_accounting_app/no1_data_models/no1_data_models.md:25-146`
- Firestore 配額管理（FirestoreQuotaLogic）— `no2_accounting_app/no3_logics/no12_firestore_quota_logic.md`
- 登入後初始化（PostAuthLogic）+ Settings LWW 同步 — `no2_accounting_app/no3_logics/no3_post_auth_logic.md`
- App 啟動流程（AppBootstrapLogic）— `no2_accounting_app/no3_logics/no1_app_bootstrap_logic.md`
- 資料匯入 Wizard（ImportWizardScreen）— `no2_accounting_app/no2_screens/no15_import_wizard_screen.md`
- 重新登入帳號比對流程（handleReLogin）— `no2_accounting_app/no3_logics/no2_login_logout_logic.md:29-38`

### B2. **Spec 與 no1+no2 不一致 — 必須修正**

| Spec 路徑 | 現況 | no1+no2 真相 | 修正方向 |
| --- | --- | --- | --- |
| `no2_accounting_app/no3_logics/no4_batch_sync_logic.md` | 描述「雙向增量同步：上傳本地 + 下載雲端」 + 「Firestore real-time listeners 用於背景同步」 | **L3 為單向上傳、無下載**；**不使用 Real-time listener**（成本控制） | 整份重寫：刪除 `pullChanges` / `startListeners` 概念；改為 L3 InitialBackup + Delta 上傳 + L2 Preference 雙向 LWW；明確標註不使用 listener |
| `no2_accounting_app/no3_logics/no4_batch_sync_logic.md` | 配額策略隱含「讀寫聯動判斷」 | **單裝置 2000 writes/day 上限、UTC+0 跨日重置、超限暫停 L3** | 補上具體數值與 UTC 基準 |
| `no2_accounting_app/no3_logics/no5_settings_management.md:27-41` | `updateUserPreferences` 「Premium 篩選 — 只有 triggerCloudSync 授權才能同步至雲端」 | **L2 PreferenceSync 全 user 享有**（含 LEVEL_0 免費） | 移除 Premium 篩選，全 user 都應寫 Firestore preferences |
| 整個 `no2_accounting_app/` 目錄 | 隱含「同步是付費差異」 | **資料機制全 user 一致**，付費差異在功能面 | 在資料模型 / Logic / Screen spec 描述中明確切割 |

### B3. **Spec 缺項 — 必須新增**

> **本輪範圍縮減**：使用者澄清目前只實作 Firestore 資料蒐集（L3），尚未做 BigQuery mirror 與後續資料分析管線（analytics_pipeline）。因此 analyticsConsent flag 對下游 BQ 的 propagation、AccountDeletion 觸發 BQ mirror 清理等議題本輪暫緩，待 analytics_pipeline 啟動時再開新 plan 補齊。

#### B3.1 user_management 模組層
1. **`no1_user_management/no3_logics/`** — 目前該模組 spec 樹無 logic 層；本輪需新增：
   - **L2 PreferenceSync Logic**：preference 變更 → 即時寫 Firestore + 背景同步 schedule、LWW 衝突解決規則、**所有 preference 欄位納入同步（含 launchMode）**
   - **暫緩（待 analytics_pipeline 啟動再補）：** analyticsConsent Logic、AccountDeletion Logic 暫不在本輪 spec 範圍

#### B3.2 accounting_app 模組層
2. **`no3_logics/`** 補新邏輯規格：
   - **L3 TransactionBackup Logic**：BackupEngine 規範、InitialBackup 偵測（Firestore 端無此 user）、Delta 增量篩選邏輯、寫入順序、配額預檢、單向上傳明示「無 pull 路徑」
   - **L4 FullBackup Logic**（單一檔涵蓋 export + import）：JSON ZIP 結構（Settings + entities + referential mapping）、OS Share Intent 觸發 export、JSON ZIP 還原入口（與既有 CSV import 區分）、export 與 import 共享之資料結構與版本相容性規則
   - **資料蒐集明示排除規格**：銀行 API / OS AI / 自動分類建議 → 明示禁止實作
3. **`no2_screens/`** 補新畫面規格：
   - **DataManagementScreen 擴充**：L4 FullBackup export 入口 + JSON ZIP 還原入口（目前該 screen 只有 CSV import/export + ClearDatabase）
   - **暫緩**：PrivacyScreen / SettingsPrivacy 區塊（analyticsConsent toggle、隱私退出引導、刪除帳號入口）待 analytics_pipeline 啟動再補
4. **`no1_data_models/`** 補欄位：
   - 所有同步 entity 確認含 `updatedOn` + `deletedOn` 標準欄位（已有就標記，沒有就補）
   - **暫緩**：Settings 加入 `analyticsConsent: boolean` 欄位待後端 BQ mirror 與 toggle UI 一起做

### B4. Spec 既存「明顯缺口」但 no1+no2 已決策的議題

| 議題 | no1+no2 立場 | spec 處理建議 |
| --- | --- | --- |
| 匿名 → 正式帳號升級 | **不支援**（Auth-First 已決策） | spec 明示「本產品不支援匿名模式」並引用 `requirements.md:116-146` |
| 多裝置即時同步衝突解決細節 | **不存在多裝置即時同步** | spec 明示「跨裝置走手動 export/import 銜接」 |
| 跨應用多端（web / desktop / mobile） | Web Console 走 JQL + ReportBuilder 唯讀路徑 | spec 標註此議題屬 Web Console 範疇，不在 accounting_app 內 |
| 配額耗盡後的重試 | UTC+0 跨日自動重置 + 暫停 L3 | spec 明示「不主動重試，等跨日重置」 |
| IAP 訂閱失效時的資料保護 | 資料機制全 user 一致 → **本機與 L3 都繼續正常運作**，只關閉付費功能旗標 | spec 明示「IAP 失效不影響資料」 |

> **B4 的 10 項缺口（B2 delivery agent 報告）大部分其實是「no1+no2 已給答案，spec 沒寫」**。spec 修改 plan 須優先把這些「已有答案的議題」一次補齊。

---

## Part C — Impl（no5）落差盤點

> 比對基準：Part A 解決方案總結 vs `no5_product_development/no2_accounting_app/` 現況。

### C1. 已對齊項目

- WatermelonDB 為本機 ORM、9 張表 schema 完整 — `src/database/schema.ts:1-144`
- Google Sign-In + Firebase Auth — `src/services/firebase.ts:1-199`、`src/contexts/AuthContext.tsx:1-157`
- Firestore 用戶文件同步 — `src/services/userService.ts:1-269`
- 配額服務 — `src/services/quotaService.ts:1-99`
- Soft delete（`deletedOn`）— firestore.rules 行 27-62 禁止 hard delete
- Settings LWW 拉取（`syncSettingsFromCloud`）— `src/services/userService.ts:158-177`
- CSV 匯出 — `src/services/exportService.ts:15-150`
- 合併邏輯 — `src/services/mergeService.ts:1-103`
- 交易 / 轉帳 / 帳戶 / 類別 / 排程 logic 服務齊全

### C2. **Impl 與 no1+no2 不一致 — 必須修正**

| Impl 位置 | 現況 | no1+no2 真相 | 修正方向 |
| --- | --- | --- | --- |
| `src/services/syncEngine.ts:60-547` | 含 `pullChanges`、`pullCollection`、`processRemoteChange`、Real-time `onSnapshot` listener（行 240-292） | **L3 為單向上傳、不使用 listener** | 移除 pull 路徑 + listener；保留 push 路徑作為 L3 BackupEngine |
| `src/services/syncEngine.ts:77-133` | sync 主入口同時做 push + pull + listener | 應拆為 L2 Preference 雙向 LWW + L3 單向上傳兩個明確分支 | 重構分流 |
| `src/contexts/AuthContext.tsx:38, 147` | 含 `email === 'guest@susugigi.app'` 匿名使用者支持 | **Auth-First 不支援匿名** | 移除 guest 處理；驗證是否殘留 mock / 測試用途，若有改用 `IS_FIREBASE_MOCK` 旗標 |
| 設定變更 → Firestore 同步路徑 | `userService.ts:158-177` 只在 `handlePostAuth` 執行一次拉取，PreferenceContext 無雙向自動同步 | **L2 PreferenceSync 應雙向**：本機變更 → 即時寫 Firestore；雲端變更 → 進來時 LWW | 補 PreferenceContext 變更觸發器寫入 Firestore；按 LWW 接收下行 |
| 配額限制 | `quotaService.ts` 計數但未見 2000/day 硬上限與 UTC+0 跨日邏輯（需驗證） | 單裝置 2000 writes/day、UTC+0 重置 | 驗證並補上明示常數 + UTC 基準 |

### C3. **Impl 缺項 — 必須新增**

> **本輪範圍縮減**：analyticsConsent / AccountDeletion / PrivacyScreen 因 BigQuery mirror 後端尚未實作，本輪暫緩。

| 主題 | 目前狀態 | 需要補的 | 本輪是否做 |
| --- | --- | --- | --- |
| **L4 FullBackup export + import（JSON ZIP）** | 缺 — 只有 CSV per-table export 與 CSV import | 新增單一 JSON 全量 export/import service：Share Intent 觸發 export + ZIP 打包 Settings + 全 entity + referential mapping；JSON ZIP 還原入口與 ImportScreen 銜接 | ✅ 做 |
| **L3 InitialBackup 偵測** | 缺 — 目前 push 不分首次 / 增量 | 新增「Firestore 端無此 user」的偵測邏輯，觸發完整上傳；之後切 Delta 模式 | ✅ 做 |
| **launchMode 納入 L2 同步** | 目前 launchMode 走 AsyncStorage `preference_launch_mode`（PreferenceContext.tsx:145, 290），不寫 Firestore | 將 launchMode 改為走 PreferenceContext + Firestore preferences；移除 AsyncStorage 路徑（或保留為快取但不做為 source of truth）| ✅ 做 |
| **Strict Direct Rate 匯率規則檢核** | 部分（CurrencyRates 表已有） | 確認跨幣別轉帳時自動寫入隱含匯率邏輯 + 報表計算缺直接匯率時的錯誤處理 | ✅ 做 |
| **analyticsConsent flag** | 缺 — schema 與 PreferenceContext 都無此欄位 | DB schema + PreferenceContext + Firestore preferences + 對 firestore-bigquery-export 的 propagation | ⏸ 暫緩（與 BQ mirror 啟動同步做） |
| **AccountDeletion 流程（GDPR/CCPA）** | 缺 — 只有登出（保留本地） | Settings Screen 入口 + 強制 L4 export 提示 + ClearDatabase + 登出 + Firestore 法務標記 | ⏸ 暫緩（與 BQ mirror 啟動同步做） |
| **PrivacyScreen / Settings 隱私區** | 缺 | analyticsConsent toggle + 隱私退出引導 + 刪除帳號入口 | ⏸ 暫緩 |
| **下游 firestore-bigquery-export 條件篩選** | 缺 — 屬另一 Cloud Function repo | 後端工作 | ⏸ 不在本 repo |

### C4. 待驗證項目（grep 未明確）

- `src/services/syncEngine.ts` 是否有 IAP 自動推送路徑（C3 obvious gap 提到「無自動推送」）
- AsyncStorage 中是否有殘留 multi-device 同步狀態
- 是否存在 `linkWithCredential` / `linkWithProvider` 殘留代碼（理論上不該有）
- mergeService 行為是否與 L3 單向上傳一致（合併產生的 update 須跟著 push）

---

## Part D — 後續執行建議（不在本 plan 直接做）

本 plan **只是盤點報告**，不直接修改 spec / impl。後續依序產生三份子 plan：

### D0. 上游修正 plan（最先做、範圍極小）
- 範圍：Product git 的 `no2_product_planning/no2_product_map/app/app_setting.md`、`no2_product_planning/no2_product_map/app/cloud_sync.md`
- 內容：
  - `app_setting.md:89, 112, 115` 移除 launchMode 排除規則
  - `cloud_sync.md:22-27` L2 PreferenceSync 功能列項補上 launchMode 或改為「全部 preference 設定」
- Branch：`feat/<r-id>-upstream-launchmode-include`（Product git 單層）
- D0 完成 + merge 之前，D1 不能開工

### D1. Spec 修改 plan（D0 完成後）
- 範圍：`no3_product_specs/no1_user_management/` + `no3_product_specs/no2_accounting_app/`
- Branch：`feat/<r-id>-spec-align-user-data-solution`（兩個 module spec git 共用同一 branch 名）
- 涵蓋 Part B 標為「本輪做」的修正 + 新增項
- 修改順序建議：
  1. 先補 Data Model 標準欄位確認（`updatedOn` / `deletedOn`）
  2. 重寫 BatchSyncLogic（移除 pull / listener、L3 改單向上傳） + SettingsManagement（移除 Premium 篩選）
  3. 補 L3 TransactionBackup Logic、L4 FullBackup Logic（單檔涵蓋 export+import）
  4. 補 user_management 模組的 L2 PreferenceSync Logic（含 launchMode 納入）
  5. 補 DataManagementScreen 的 L4 入口擴充
  6. 補資料蒐集明示排除規格

### D2. Impl 修改 plan（D1 完成後）
- 範圍：`no5_product_development/no2_accounting_app/`
- Branch：`feat/<r-id>-impl-align-user-data-solution`（與 spec branch 同名以對齊三層 git）
- 涵蓋 Part C 標為「✅ 做」的修正 + 新增項
- 修改順序建議：
  1. syncEngine 拆分（移除 pull / listener，分流 L2 / L3）
  2. launchMode 改走 PreferenceContext + Firestore（移除 AsyncStorage 為 source of truth 的路徑）
  3. 補 L4 FullBackup export/import service（單一 JSON ZIP）
  4. 補 L3 InitialBackup 偵測
  5. 移除 guest 匿名殘留
  6. 配額硬上限 + UTC+0 校正
  7. Strict Direct Rate 規則檢核

### D3.（未來）BQ mirror 啟動時補做的範圍（暫緩）
- analyticsConsent flag（schema + PreferenceContext + Firestore + UI toggle）
- AccountDeletion 流程（GDPR/CCPA）
- PrivacyScreen
- Settings 加入 `analyticsConsent` 欄位
- 與 firestore-bigquery-export 後端 Cloud Function 對接

> D0 → D1 → D2 三主題分批，按「一主題一 branch」規則前一主題完整跑完 review + commit + merge + push 才開下一個 branch。D3 屬未來 phase，本 plan 不展開細節。

### D4. Verification（給後續修改 plan 用）

- **Spec 端**：執行 `spec-term-audit` skill 對 `no3_product_specs/no2_accounting_app/` 與 `no3_product_specs/no1_user_management/` 全掃；執行 `universal_writing_linter` 對所有改動 .md
- **Impl 端**：`npm run tsc`、`npm run lint`、`npm run test`；以 mock Firestore 跑 `__tests__/` 既有測試；新增 syncEngine、L4 export、AccountDeletion 對應單元測試
- **跨層**：跑 `tri-tier-alignment-auditor` agent 對 SuSuGiGi 做盤點，確認 spec / impl branch 與 Product Map 已對齊

---

## 執行階段需遵照的 skill 與規則

> 此章節依 R-PLAN-MUST-LIST-SKILLS（`feedback_plan_must_list_skills`）寫出，給未來執行 D1 / D2 子 plan 的 session 直接遵循。

### 需呼叫的 skill
- **`decision_framework_router`**：強制啟動。本案碰 SuSuGiGi 路徑，每次 session 啟動先跑此 skill 確認上游審視已過（本 plan 已過）
- **`universal_writing_linter`**：強制啟動。每寫 / 改任何 .md 之前與之後都要跑（spec 修改階段尤其密集）
- **`spec_writer`**：D1 階段強制啟動。改 `no3_product_specs/` 時須遵守 Model / Screen / Logic 三層政策（`~/.claude/skills/spec_writer/`）
- **`spec-term-audit`**：D1 階段強制啟動。改 spec 後 / commit 前必跑
- **`tri-tier-alignment-auditor`**：D1、D2 各 merge 前各跑一次，確認三層對齊
- **不適用**：`rn-native-header`（本案不碰 Header 元件）、`fewer-permission-prompts`（與本案無關）

### 需遵守的全域規則（`~/.claude/CLAUDE.md`）
- **路徑引用規則**：禁 OS 絕對路徑；.md 內文必須用 `~/.claude/...` 或產品根目錄相對路徑
- **規格文件術語規則**：D1 改 `no3_product_specs/` 時 .md 只能用本文件或同 `{產品}Spec/` 已定義的名詞；依 `no1_data_models/` / `no2_screens/` / `no3_logics/` 各自選對應政策
- **修改流程規範**：從目標 git 的 main 開 `feat/<r-id>-<slug>` branch，跑靜態檢查，working tree 留 review，**不主動 commit / merge / push**
- **多主題分批**：D1 和 D2 是兩個主題，必須 D1 完整跑完（spec branch 跑完 commit + merge + push）才開 D2 branch；不在同 branch 同時改 spec 與 impl
- **目錄移動安全規則**：本案不涉及目錄移動，本規則不觸發

### 需遵守的 memory 規則
- **R-UPSTREAM-FIRST（`feedback_upstream_review_first`）**：本 plan 已執行；D1、D2 各自的子 plan 仍須各自執行 upstream + delivery 平行 Explore（即使結論可能同樣是「上游不改」也要明列）
- **R-WORKING-TREE-REVIEW（`feedback_review_in_working_tree`）**：D1 / D2 改完留 working tree，不主動 commit
- **R-ONE-TOPIC-PER-BRANCH（`feedback_one_topic_per_branch`）**：D1 / D2 分屬兩主題，分批執行
- **R-PLAN-MUST-LIST-SKILLS（`feedback_plan_must_list_skills`）**：D1 / D2 子 plan 末段也要重複此清單
- **agent/config 檔案語言規則（`feedback_language`）**：所有產出 .md 一律繁體中文

### 三層 git 範圍說明
本案涉及 SuSuGiGi 三層 git **的全部三層**，但分三個主題依序處理：

| Git 層 | 是否涉及 | 主題 / Branch |
| --- | --- | --- |
| **Product git**（SuSuGiGi 頂層）| **涉及** — D0 處理（launchMode 納入同步） | `feat/<r-id>-upstream-launchmode-include` |
| **Module Spec git** `no3_product_specs/no1_user_management/` | **涉及** — D1 處理 | `feat/<r-id>-spec-align-user-data-solution` |
| **Module Spec git** `no3_product_specs/no2_accounting_app/` | **涉及** — D1 處理 | `feat/<r-id>-spec-align-user-data-solution`（與上一行同名） |
| **Module Impl git** `no5_product_development/no2_accounting_app/` | **涉及** — D2 處理 | `feat/<r-id>-impl-align-user-data-solution` |

**branch 命名一致性要求**：
- D0 只動 Product git 單層，branch 名單獨
- D1 同時碰兩個 Module Spec git（user_management + accounting_app），兩個 git 的 branch **名稱完全一致**，含前綴、連字號、大小寫；commit subject + body **完全相同**
- D2 只動一個 Impl git，與 D1 為不同主題、可用不同 branch 名（仍須前綴 `feat/`）
- D0 / D1 / D2 三主題的 commit message 互不要求一致（不同主題）

### 不在本 plan 處理的事項
- 後端 Cloud Function（`firestore-bigquery-export` 條件篩選實作）— 屬另一 repo，需另開 plan
- Web Console 端的相關處理 — 屬另一模組
- LEVEL_2 Logic Engine / LEVEL_3 AIAdvisor / LEVEL_B MacroData 落地 — 屬未來 phase
- analyticsConsent flag、AccountDeletion 流程、PrivacyScreen — 待 BigQuery mirror 啟動時與後端一起做（D3 範疇，本輪 D0/D1/D2 不展開）
