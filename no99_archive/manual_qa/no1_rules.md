# SuSuGiGi 手動測試規則清單 V1

## 文件定位

- 手動 QA 覆蓋率的唯一真相
- 每列一條可判定的行為斷言
- 測試腳本文件以 cover 欄回指本清單 ID
- 覆蓋完整性由 qa_tools 內的覆蓋率腳本機械把關

---

## 欄位定義

- ID 格式為 R-前綴-三位流水號，前綴對應段落
- 面欄標記驗證面，複合面以 + 連接
    - UI 純畫面可見
    - DB 本機 sqlite 對賬
    - LOG runtime log 對賬
    - FB Firestore 與後端對賬
    - 實機 需實體 iPhone
- 級欄標記可測性
    - T1 操作者看畫面即可判定
    - T2 需 Claude 對賬 DB 或 log 或 Firestore
    - T3 需前置佈置才可測，處置欄載明佈置方式
    - T4 手動不可測，處置欄載明原因，登載為自動化債
- P 欄標記優先級
    - P0 資金流正確性與資料完整性
    - P1 常用路徑
    - P2 邊角
- 軌欄標記執行環境
    - A 單機 simulator，登入態沿用，不對雲端對賬
    - B simulator 加測試帳號，需雲端對賬或帳號切換
    - C 實機 IAP sandbox
    - 無 僅 T4 使用，不排場次

---

## 資料模型

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-DM-001 | Settings 表通常僅存在一筆記錄 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-002 | `launchMode` 預設值為 `home` | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-003 | `launchMode` 值域限 `home` `expense` `income` `transfer` | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-004 | `weekStart` 預設值為 `auto` | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-005 | `weekStart` 值域限 `auto` `sunday` `monday` | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-006 | `analyticsConsent` 預設值為 true | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-007 | 交易備份上傳完成後系統更新 `lastSyncedAt` | `no1_data_models` | DB+LOG | T2 | P1 | B | — |
| R-DM-008 | `lastSyncedAt` 為 Null 代表尚未上傳過 | `no1_data_models` | DB | T4 | P2 | 無 | 無法產生從未上傳的 null 狀態 |
| R-DM-009 | 偏好上傳不更新 `lastSyncedAt` | `no1_data_models` | DB+LOG | T2 | P2 | B | — |
| R-DM-010 | 雲端偏好鏡像永不下載套用回本機 | `no1_data_models` | FB | T3 | P1 | B | 手改 Firestore `preferences` 欄位後重啟 app 驗不套用 |
| R-DM-011 | 六項偏好欄位變更後系統上傳至 `preferences` | `no1_data_models` | FB | T2 | P1 | B | — |
| R-DM-012 | `baseCurrencyId` 上傳轉 ISO Code 寫 `preferences.currency` | `no1_data_models` | FB | T2 | P1 | B | — |
| R-DM-013 | 多裝置偏好各自上傳且最後寫入覆寫 | `no1_data_models` | FB | T3 | P2 | B | 重裝或雙模擬器先後上傳後查 Firestore |
| R-DM-014 | 帳戶名稱長度上限 60 字元 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-015 | 帳戶名稱寫入時去除前後空白 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-016 | 帳戶名稱全為空白視為空 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-017 | 帳戶圖示限 tags 含 account 的圖示 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-018 | 帳戶 `sortOrder` 預設值為 0 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-019 | 停用帳戶寫入 `disabledOn` 且啟用中為 Null | `no1_data_models` | DB | T2 | P1 | A | — |
| R-DM-020 | 類別名稱長度上限 60 字元 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-021 | 類別名稱寫入時去除前後空白 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-022 | 類別 `type` 值域限 `expense` 或 `income` | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-023 | 類別圖示限 tags 含 category 的圖示 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-024 | 類別 `sortOrder` 預設值為 0 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-025 | 停用類別寫入 `disabledOn` 且啟用中為 Null | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-026 | 交易金額以固定倍率縮放整數儲存 | `no1_data_models` | DB | T2 | P0 | A | — |
| R-DM-027 | 交易備註長度上限 200 字元 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-028 | 交易備註寫入時去除前後空白 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-029 | 交易日期可由操作者編輯 | `no1_data_models` | UI | T1 | P1 | A | — |
| R-DM-030 | 排程產生的交易與轉帳寫入 `scheduleId` 與實例日 | `no1_data_models` | DB | T2 | P1 | A | — |
| R-DM-031 | 轉帳轉出轉入金額以縮放整數儲存 | `no1_data_models` | DB | T2 | P0 | A | — |
| R-DM-032 | 轉帳備註長度上限 200 字元 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-033 | 轉帳備註寫入時去除前後空白 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-034 | `impliedRate` 同步時欄名轉 `impliedRateScaled` | `no1_data_models` | FB | T2 | P1 | B | — |
| R-DM-035 | 匯率生效時點含日期與時刻 | `no1_data_models` | DB | T2 | P1 | A | — |
| R-DM-036 | 匯率以主單位對主單位數值儲存 | `no1_data_models` | DB | T2 | P1 | A | — |
| R-DM-037 | `decimalPlaces` 為 Null 時採貨幣預設小數位 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-038 | `useThousandsUnit` 開啟時以千為單位顯示 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-039 | CurrencyConfig 不同步雲端僅存本地 | `no1_data_models` | FB | T2 | P2 | B | — |
| R-DM-040 | 排程 `interval` 數值上限 999 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-041 | 排程開始時點含日期與時刻 | `no1_data_models` | DB | T2 | P1 | A | — |
| R-DM-042 | 排程範本備註長度上限 200 字元 | `no1_data_models` | UI | T1 | P2 | A | — |
| R-DM-043 | 排程範本備註寫入時去除前後空白 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-044 | User 表 `id` 對應 Auth UID | `no1_data_models` | DB | T2 | P2 | B | — |
| R-DM-045 | 登入時系統更新 `lastLoginAt` | `no1_data_models` | DB | T2 | P2 | B | — |
| R-DM-046 | User 表 IAP 二欄為棄用殘欄，任何路徑不寫入、恆為 Null | `no1_data_models` | DB | T2 | P2 | C | 2026-07-17 spec 修訂改述；C-90 容器下載 sqlite 對賬 |
| R-DM-047 | `currentTier` 由伺服器端授權記錄解析，離線依 PremiumCache 推定 | `no1_data_models` | LOG | T2 | P1 | C | 2026-07-17 spec 修訂同步改述；C-02 已依授權記錄判定 |
| R-DM-048 | runtime tier 值域僅 LEVEL_0 至 LEVEL_2 | `no1_data_models` | LOG | T4 | P2 | 無 | 負向值域斷言無法窮舉驗證 |
| R-DM-049 | `isPremiumLoaded` 就緒前不以佔位 LEVEL_0 判定授權 | `no1_data_models` | LOG | T2 | P1 | A | — |
| R-DM-050 | 線上更新或離線回退完成後 `isPremiumLoaded` 為 true | `no1_data_models` | LOG | T2 | P2 | A | — |
| R-DM-051 | 登出後 `isPremiumLoaded` 維持 true | `no1_data_models` | LOG | T2 | P2 | B | — |
| R-DM-052 | 線上解析成功時授權寫入 PremiumCache | `no1_data_models` | LOG | T2 | P1 | C | — |
| R-DM-053 | 付費者離線依 PremiumCache 維持等級不降 LEVEL_0 | `no1_data_models` | LOG | T3 | P1 | C | 斷網重啟 app 後對賬 log |
| R-DM-054 | PremiumCache 以帳號為範圍不跨帳號沿用 | `no1_data_models` | LOG | T3 | P1 | C | 付費帳號與他帳號切換後對賬 log |
| R-DM-055 | 快取 `expirationDate` Null 代表無期限 | `no1_data_models` | LOG | T4 | P2 | 無 | 現有商品皆有期限無法產生 Null 案例 |
| R-DM-056 | 快取到期日早於等於當下視為失效 | `no1_data_models` | LOG | T3 | P1 | C | 調系統時鐘越過到期日 |
| R-DM-057 | 金額縮放整數上限為系統安全整數上界 | `no1_data_models` | DB | T4 | P2 | 無 | 上界值無法經正常輸入觸達 |
| R-DM-058 | 金額輸入位數上限確保縮放後不超上界 | `no1_data_models` | UI | T1 | P1 | A | — |
| R-DM-059 | 交易金額不得為 0 | `no1_data_models` | UI | T1 | P0 | A | — |
| R-DM-060 | 轉帳轉出與轉入金額皆須大於 0 | `no1_data_models` | UI | T1 | P0 | A | — |
| R-DM-061 | 本機所有時間欄位存 UTC Unix Timestamp 毫秒 | `no1_data_models` | DB | T2 | P2 | A | — |
| R-DM-062 | Entitlement 文件 id 為使用者 Auth UID | `no3_cloud_functions:no1_data_models` | FB | T2 | P1 | C | — |
| R-DM-063 | Entitlement client 唯讀且寫入限伺服器 | `no3_cloud_functions:no1_data_models` | FB | T3 | P1 | B | client 端嘗試寫入驗 rules 拒絕 |
| R-DM-064 | entitlement `tier` LEVEL_0 為 0 依層級遞增 | `no3_cloud_functions:no1_data_models` | FB | T2 | P2 | C | — |
| R-DM-065 | `expires_date` Null 代表非續訂型無期限 | `no3_cloud_functions:no1_data_models` | FB | T4 | P2 | 無 | 現有商品皆續訂型無 Null 案例可佈置 |
| R-DM-066 | 續訂沿用同一 `original_transaction_id` | `no3_cloud_functions:no1_data_models` | FB | T3 | P2 | C | sandbox 等待自動續訂後對賬 Firestore |
| R-DM-067 | `environment` 正確標記 Sandbox 或 Production | `no3_cloud_functions:no1_data_models` | FB | T2 | P2 | C | — |
| R-DM-068 | 購買驗證成功後 `status` 為 active | `no3_cloud_functions:no1_data_models` | FB | T2 | P1 | C | — |
| R-DM-069 | 退款後 `status` 為 refunded | `no3_cloud_functions:no1_data_models` | FB | T4 | P2 | 無 | sandbox 無法觸發退款 |
| R-DM-070 | 寬限期 `status` 為 grace_period | `no3_cloud_functions:no1_data_models` | FB | T4 | P2 | 無 | 寬限期情境無法手動佈置 |
| R-DM-071 | 扣款重試 `status` 為 billing_retry | `no3_cloud_functions:no1_data_models` | FB | T4 | P2 | 無 | 扣款失敗情境無法手動佈置 |
| R-DM-072 | 撤銷後 `status` 為 revoked | `no3_cloud_functions:no1_data_models` | FB | T4 | P2 | 無 | 撤銷情境無法手動佈置 |
| R-DM-073 | 訂閱到期後 `status` 為 expired | `no3_cloud_functions:no1_data_models` | FB | T3 | P2 | C | sandbox 等待訂閱到期後對賬 Firestore |
| R-DM-074 | `apple_signed_date` 作亂序覆寫防護排序鍵 | `no3_cloud_functions:no1_data_models` | FB | T4 | P2 | 無 | 亂序通知無法手動佈置 |
| R-DM-075 | 伺服器每次更新 entitlement 刷新 `updated_on` | `no3_cloud_functions:no1_data_models` | FB | T2 | P2 | C | — |
| R-DM-076 | client 讀 entitlement `tier` 判定授權落點 | `no3_cloud_functions:no1_data_models` | LOG+FB | T2 | P1 | C | — |
| R-DM-077 | TransactionIndex 文件 id 為原始交易編號 | `no3_cloud_functions:no1_data_models` | FB | T2 | P2 | C | — |
| R-DM-078 | 購買後 TransactionIndex 寫入 `uid` 對應 | `no3_cloud_functions:no1_data_models` | FB | T2 | P2 | C | — |
| R-DM-079 | 雲端文件時間欄位以 Unix Timestamp 毫秒儲存 | `no3_cloud_functions:no1_data_models` | FB | T2 | P2 | C | — |

---

## 啟動與本機資料庫與共用 UI

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-BS-001 | 啟動時未登入導航至 LoginScreen | `no1_app_bootstrap_logic` | UI | T1 | P1 | A | — |
| R-BS-002 | 啟動時已登入依 `launchMode` 導航至初始落點 | `no1_app_bootstrap_logic` | UI | T1 | P1 | A | — |
| R-BS-003 | 啟動判定攔截時先落初始落點再導航 PaywallScreen | `no1_app_bootstrap_logic` | UI | T3 | P1 | A | 佈置 LEVEL_0 超額資料觸發攔截 |
| R-BS-004 | 核心背景任務非同步執行不阻塞啟動主流程 | `no1_app_bootstrap_logic` | LOG | T4 | P2 | 無 | 阻塞與否無外顯判準 |
| R-BS-005 | 啟動時系統向 IAP 服務查憑證更新本地到期狀態 | `no1_app_bootstrap_logic` | 實機+DB | T2 | P1 | C | — |
| R-BS-006 | 定期補產生以絕對時刻判定到期不依時區日界 | `no1_app_bootstrap_logic` | DB | T3 | P0 | A | 調系統時鐘與時區交叉驗證 |
| R-BS-007 | 補產生自最後一筆已產生實例時刻往後推算 | `no1_app_bootstrap_logic` | DB | T3 | P0 | A | 調系統時鐘越過下一實例時刻後重啟 |
| R-BS-008 | 排程尚無任何實例時補產生自排程起始日起算 | `no1_app_bootstrap_logic` | DB | T3 | P1 | A | 佈置起始日在過去且無實例的排程 |
| R-BS-009 | 補產生涵蓋不晚於當前時刻且未超結束日的全部實例 | `no1_app_bootstrap_logic` | DB | T3 | P0 | A | 調系統時鐘跨多期後重啟對賬 |
| R-BS-010 | 同排程同實例時刻已存在紀錄不重複產生 | `no1_app_bootstrap_logic` | DB | T2 | P0 | A | — |
| R-BS-011 | 已刪除的排程實例不於補產生時重建 | `no1_app_bootstrap_logic` | DB | T3 | P0 | A | 刪除已產生實例後重啟 App 對賬 |
| R-BS-012 | 啟動核心背景任務委派 `runBackup` 觸發交易備份 | `no1_app_bootstrap_logic` | LOG | T2 | P1 | B | — |
| R-BS-013 | 前景恢復且已登入委派 `runBackup` 上傳本地變更 | `no1_app_bootstrap_logic` | LOG | T2 | P1 | B | — |
| R-BS-014 | 前景恢復觸發 `refreshStatus` 重新刷新訂閱狀態 | `no1_app_bootstrap_logic` | LOG | T2 | P2 | B | — |
| R-BS-015 | 前景恢復不補產生定期交易 | `no1_app_bootstrap_logic` | DB | T3 | P1 | A | 前景外跨過排程時刻後切回前景對賬 |
| R-BS-016 | 訂閱狀態就緒後才解析落點避免佔位 LEVEL_0 誤判 | `no1_app_bootstrap_logic` | LOG | T4 | P1 | 無 | 就緒時序 race 無法手動控制重現 |
| R-BS-017 | `launchMode` 為 home 時落點 HomeScreen 不攔截 | `no1_app_bootstrap_logic` | UI | T1 | P1 | A | — |
| R-BS-018 | `launchMode` 為 expense 且放行時落點支出編輯器 | `no1_app_bootstrap_logic` | UI | T1 | P1 | A | — |
| R-BS-019 | `launchMode` 為 income 且放行時落點收入編輯器 | `no1_app_bootstrap_logic` | UI | T1 | P1 | A | — |
| R-BS-020 | `launchMode` 為 transfer 且放行時落點轉帳編輯器 | `no1_app_bootstrap_logic` | UI | T1 | P1 | A | — |
| R-BS-021 | 指向編輯器且閘控禁止時落點改 HomeScreen 並攔截 | `no1_app_bootstrap_logic` | UI | T3 | P1 | A | 佈置 LEVEL_0 超額資料觸發禁止 |
| R-BS-022 | 訂閱受限僅攔截當次啟動不改寫 `launchMode` 設定值 | `no1_app_bootstrap_logic` | DB | T3 | P2 | A | 佈置超額觸發攔截後對賬設定值 |
| R-BS-023 | 本機資料庫保存所有曾登入使用者的資料 | `no23_local_database_logic` | DB | T3 | P1 | B | 兩測試帳號輪流登入後對賬資料庫 |
| R-BS-024 | 登出不清除本機資料 | `no23_local_database_logic` | DB | T2 | P0 | B | — |
| R-BS-025 | 清單查詢以 `userId` 限定僅回當前使用者記錄 | `no23_local_database_logic` | DB | T3 | P0 | B | 雙帳號各建資料後切換帳號對賬 |
| R-BS-026 | 單筆帳戶與類別查詢查無記錄回傳空值 | `no23_local_database_logic` | LOG | T4 | P2 | 無 | 內部查詢無獨立操作入口 |
| R-BS-027 | 單筆帳戶與類別查詢不套租戶過濾與軟刪排除 | `no23_local_database_logic` | LOG | T4 | P2 | 無 | 內部查詢無獨立操作入口 |
| R-BS-028 | 帳戶管理清單排除軟刪記錄仍納入停用記錄 | `no23_local_database_logic` | UI+DB | T1 | P1 | A | — |
| R-BS-029 | 帳戶管理清單依 `sortOrder` 遞增排序 | `no23_local_database_logic` | UI | T1 | P1 | A | — |
| R-BS-030 | 帳戶選擇器清單排除軟刪與停用記錄 | `no23_local_database_logic` | UI | T1 | P1 | A | — |
| R-BS-031 | 類別管理清單排除軟刪記錄仍納入停用記錄 | `no23_local_database_logic` | UI+DB | T1 | P1 | A | — |
| R-BS-032 | 類別管理清單依 `sortOrder` 遞增排序 | `no23_local_database_logic` | UI | T1 | P1 | A | — |
| R-BS-033 | 類別選擇器清單排除軟刪與停用記錄 | `no23_local_database_logic` | UI | T1 | P1 | A | — |
| R-BS-034 | `resetAllData` 批次軟刪帳戶類別收支轉帳匯率排程六表 | `no23_local_database_logic` | DB | T2 | P0 | A | — |
| R-BS-035 | `resetAllData` 僅標記當前使用者紀錄不動其他帳號 | `no23_local_database_logic` | DB | T3 | P0 | B | 雙帳號各建資料後重置其一對賬 |
| R-BS-036 | `resetAllData` 採軟刪除不實體刪除紀錄 | `no23_local_database_logic` | DB | T2 | P1 | A | — |
| R-BS-037 | `resetAllData` 軟刪除傳播雲端刪除標記 | `no23_local_database_logic` | FB | T2 | P0 | B | — |
| R-BS-038 | `resetAllData` 保留使用者設定貨幣顯示設定三表 | `no23_local_database_logic` | DB | T2 | P1 | A | — |
| R-BS-039 | 偏好設定屬裝置層級重置資料不清除 | `no23_local_database_logic` | UI | T1 | P1 | A | — |
| R-BS-040 | 交易與轉帳記錄日期採 Datetime 模式含時間選擇 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-041 | 定期結束日期採 Date-only 模式無時間選擇 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-042 | 點按觸發器 pill 彈出 dialog 進入日選擇子模式 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-043 | 日選擇子模式點標題列切換至月選擇子模式 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-044 | 日期格上下滑單月一頁放手吸附整頁 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-045 | 點按某一日即選定該日 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-046 | Datetime 模式轉動時間滾輪選定時與分 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-047 | 月選擇子模式點標題列切回日選擇子模式 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-048 | 月份格上下滑單年一頁放手吸附整頁 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-049 | 點按某月選定該月並停留月選擇子模式 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-050 | 點按 dialog 外部關閉 dialog | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-051 | 任一選擇立即反映呼叫畫面值無確認取消按鈕 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-052 | 觸發器與標題列文字依使用者語系格式顯示 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-053 | 星期列文字依使用者語系顯示 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-054 | 週起始日依 `weekStart` 偏好且 auto 時依語系慣例 | `date_picker_policy` | UI | T1 | P1 | A | — |
| R-BS-055 | 時間依使用者偏好以 24 小時制或 12 小時制顯示 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-056 | 月曆格僅顯當月日期相鄰月位置留白不可點 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-057 | 超出呼叫畫面指定上下限的日期不可選 | `date_picker_policy` | UI | T4 | P2 | 無 | CalendarDialog 無上下限 props 也無呼叫端指定範圍 |
| R-BS-058 | 呼叫畫面未指定上下限時日期可選範圍無限制 | `date_picker_policy` | UI | T1 | P2 | A | — |
| R-BS-059 | 刪除按鈕標籤一律為刪除不帶實體名稱 | `delete_button_policy` | UI | T1 | P2 | A | — |
| R-BS-060 | 四個 editor 僅編輯模式顯示刪除按鈕 | `delete_button_policy` | UI | T1 | P1 | A | — |
| R-BS-061 | 點按刪除按鈕觸發該畫面對應的刪除操作 | `delete_button_policy` | UI | T1 | P1 | A | — |
| R-BS-062 | 模式 A 列表頁含原生返回與標題列表類可附新增合併 | `header_policy` | UI | T1 | P2 | A | — |
| R-BS-063 | 模式 C 表單 modal 依序含關閉標題完成動作 | `header_policy` | UI | T1 | P1 | A | — |
| R-BS-064 | 模式 C 必填欄位未滿足時完成動作 disabled | `header_policy` | UI | T1 | P1 | A | — |
| R-BS-065 | 模式 D 純展示 modal 含關閉與標題動作元件留空 | `header_policy` | UI | T1 | P2 | A | — |
| R-BS-066 | 付費牆 header 僅關閉動作不設畫面標題 | `header_policy` | UI | T1 | P2 | A | — |
| R-BS-067 | 首頁 header 依序含篩選標題搜尋設定四元件 | `header_policy` | UI | T1 | P1 | A | — |
| R-BS-068 | 匯入精靈首步左動作為關閉其餘步驟為返回 | `header_policy` | UI | T1 | P1 | A | — |
| R-BS-069 | 匯入精靈末步右動作為送出其餘步驟為前進 | `header_policy` | UI | T1 | P1 | A | — |
| R-BS-070 | 匯入精靈當前步驟驗證未通過時右動作 disabled | `header_policy` | UI | T1 | P1 | A | — |
| R-BS-071 | 匯入精靈步驟導航由 header 承載不設底導航列 | `header_policy` | UI | T1 | P2 | A | — |
| R-BS-072 | header 自訂按鈕以 icon 表意不含任何文字 | `header_policy` | UI | T1 | P2 | A | — |
| R-BS-073 | 名稱備註金額輸入達上限後續輸入不更新欄位 | `input_field_policy` | UI | T1 | P1 | A | — |
| R-BS-074 | 輸入達上限採靜默阻擋不顯示錯誤訊息 | `input_field_policy` | UI | T1 | P2 | A | — |
| R-BS-075 | 名稱與備註寫入時去除前後空白 | `input_field_policy` | UI+DB | T2 | P1 | A | — |
| R-BS-076 | 全空白名稱視為未填由完成按鈕必填閘擋下 | `input_field_policy` | UI | T1 | P1 | A | — |
| R-BS-077 | 允許同名帳戶與分類並存無警告完成按鈕不鎖 | `input_field_policy` | UI | T1 | P2 | A | — |
| R-BS-078 | 金額超出可儲存範圍於存檔時驗證失敗 | `input_field_policy` | DB | T3 | P2 | A | 經匯入路徑注入超界金額；注入檔金額欄其餘值須全合法，否則欄位守門先擋 |
| R-BS-079 | 匯入路徑名稱超長截斷至上限後存入，不作驗證失敗 | `input_field_policy` | DB | T4 | P2 | 無 | 2026-07-17 spec 修訂改述為截斷語意；截斷落庫驗證歸自動化債 |
| R-BS-080 | 交易金額為 0 時金額門檻未達完成按鈕 disabled | `input_field_policy` | UI | T1 | P1 | A | — |
| R-BS-081 | 轉帳轉出轉入金額未大於 0 時完成按鈕 disabled | `input_field_policy` | UI | T1 | P1 | A | — |
| R-BS-082 | 轉帳轉出與轉入帳戶相同時完成按鈕 disabled | `input_field_policy` | UI | T1 | P1 | A | — |
| R-BS-083 | 輸入達長度上限不使完成按鈕 disabled | `input_field_policy` | UI | T1 | P2 | A | — |
| R-BS-084 | 模式 A 列表點擊跳轉下層或開啟 modal | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-085 | 模式 A 與 B 列表啟用按下回饋 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-086 | B-1 選中列 trailing 顯示勾選圖示 | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-087 | B-2 網格選中以右上 overlay 標示 | `list_policy` | UI | T4 | P2 | 無 | 操作者裁定 debug 面不驗 2026-07-11 A-11 步66, 唯一入口為 debug Theme 網格, 退回重分配 |
| R-BS-088 | visibility-toggle 格以視覺差異標示不用勾選 overlay | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-089 | visibility-toggle 點 tile 切換選取狀態 | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-090 | visibility-toggle 最後一個選取格不可取消 | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-091 | 模式 D 列表長按拖拉排序 | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-092 | 模式 D 列表點擊整列導向編輯 | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-093 | 模式 D 列表停用按下回饋避免拖拉手勢衝突 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-094 | disabled 列停用按下回饋 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-095 | 搜尋無結果空狀態 title 採 `common.no_results` | `list_policy` | UI | T1 | P1 | A | — |
| R-BS-096 | 搜尋無結果空狀態描述含搜尋字串原文 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-097 | 初始無資料顯示該畫面對應描述性訊息 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-098 | 載入中不顯示空狀態 | `list_policy` | UI | T4 | P2 | 無 | 載入瞬間完成難以人工捕捉 |
| R-BS-099 | 群組卡片搜尋列表兩態切換以動畫互換不硬切 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-100 | empty 態不渲染卡片底色避免視覺殘留 | `list_policy` | UI | T1 | P2 | A | — |
| R-BS-101 | 空狀態切換期間舊態不接受互動 | `list_policy` | UI | T4 | P2 | 無 | 切換動畫瞬時難以手動命中 |

---

## 首頁報表與期間狀態

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-HR-001 | 點按篩選按鈕導航至 HomeFilterScreen | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-002 | 點按搜尋按鈕導航至 SearchScreen | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-003 | 點按設定按鈕導航至 SettingsScreen | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-004 | 期間切換器含較舊較新切換按鈕與時間區間標題 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-005 | 環形圖同時呈現支出收入兩弧不受焦點切換影響 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-006 | 兩弧起點位於環形圖正上方 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-007 | 支出弧自起點向左生長 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-008 | 收入弧自起點向右生長 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-009 | 兩弧合計一圈且長度比例對應兩側納入分組金額 | `no2_home_screen` | UI | T3 | P1 | A | 佈置支出 300 元收入 100 元驗弧長比 3 比 1 |
| R-HR-010 | 兩弧交會位置由兩弧長度比例決定 | `no2_home_screen` | UI | T3 | P2 | A | 佈置已知比例後量測底部交會點位置 |
| R-HR-011 | 各側分組金額小者鄰近起點大者鄰近交會點 | `no2_home_screen` | UI | T3 | P2 | A | 佈置同側 3 分組金額遞增驗排列順序 |
| R-HR-012 | 分組金額低於總和 10/360 門檻時不繪製 | `no2_home_screen` | UI | T3 | P1 | A | 佈置一分組佔比恰低於一圈 10 度 |
| R-HR-013 | 門檻下分組移除後其餘分組依比例重新填滿一圈 | `no2_home_screen` | UI | T3 | P2 | A | 佈置含門檻下分組的已知金額組合 |
| R-HR-014 | 門檻以移除前比例判定僅一輪移除後不重算 | `no2_home_screen` | UI | T3 | P2 | A | 佈置移除後始跌破門檻的分組組合 |
| R-HR-015 | 僅有支出無收入時環形圖整圈由支出弧填滿 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-016 | 僅有收入無支出時環形圖整圈由收入弧填滿 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-017 | 支出收入皆無紀錄時環形圖不顯示 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-018 | 餘額數值顯示於環形圖中心 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-019 | 焦點篩選列兩張等寬卡並排各含圖示與合計金額 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-020 | 焦點卡永遠擇一啟用另一停用 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-021 | 點按當前啟用的焦點卡不變更 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-022 | 點按停用焦點卡後兩卡互換列表即時切換類型 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-023 | 切換焦點後各分組重置為預設收合 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-024 | 逐筆紀錄各分組預設為收合狀態 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-025 | 點按分組標題列展開或收合該分組 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-026 | 類別分組下一般類別標題顯示類別圖示與名稱 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-027 | 類別分組下轉帳分組標題顯示外部帳戶圖示與名稱 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-028 | 日期分組下分組標題顯示日期文字 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-029 | 分組標題列顯示該分組小計金額 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-030 | 一般交易於類別分組左輔助欄顯示日期文字 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-031 | 一般交易於日期分組左輔助欄顯示類別圖示 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-032 | 一般交易主文字顯示備註副文字顯示帳戶名稱 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-033 | 紀錄無備註時主文字不顯示內容 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-034 | 轉帳於類別分組副文字顯示另一方帳戶並列方向箭頭 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-035 | 轉帳於日期分組左輔助欄顯示方向圖示 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-036 | 轉帳於日期分組副文字依方向由來源至目的列兩帳戶 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-037 | 主金額以該筆原始幣別呈現 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-038 | 多幣別模式非主要貨幣筆顯示 `≈` 前綴換算副文字 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-039 | 單幣別模式或主要貨幣筆不顯示換算副文字 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-040 | 定期排程實例金額左側並列循環圖示 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-041 | 循環圖示不獨立互動點按列行為與一般紀錄相同 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-042 | 期間無紀錄時不顯示空狀態提示 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-043 | Undo Bar 啟用時覆蓋 Footer 暫代三顆新增按鈕 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-044 | 初始載入中顯示載入文字 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-045 | 點按一般交易列帶入紀錄導航至 TransactionEditorScreen | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-046 | 點按轉帳列帶入紀錄導航至 TransferEditorScreen | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-047 | 新增支出遭 `createTransaction` 禁止時導 PaywallScreen | `no2_home_screen` | UI | T3 | P1 | A | 佈置交易筆數達 LEVEL_0 配額上限 |
| R-HR-048 | 新增支出允許時帶今天日期開支出模式編輯器 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-049 | 新增收入遭 `createTransaction` 禁止時導 PaywallScreen | `no2_home_screen` | UI | T3 | P2 | A | 佈置交易筆數達 LEVEL_0 配額上限 |
| R-HR-050 | 新增收入允許時帶今天日期開收入模式編輯器 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-051 | 新增轉帳遭 `createTransfer` 禁止時導 PaywallScreen | `no2_home_screen` | UI | T3 | P2 | A | 佈置轉帳筆數達 LEVEL_0 配額上限 |
| R-HR-052 | 新增轉帳允許時帶今天日期開轉帳編輯器 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-053 | 主內容區水平分頁滑動每頁代表一個時間區間 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-054 | 時間粒度為全部時僅一頁不可滑動 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-055 | 無任何紀錄時僅顯示當前區間不可向兩側滑動 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-056 | 可滑動範圍涵蓋最早至最晚紀錄所在時間區間 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-057 | 當前時間區間恆在可滑動範圍內 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-058 | 向過去方向滑動時自動載入更多時間區間 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-059 | 時間區間標題跟隨水平滑動 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-060 | 向上捲動主內容區時環形圖區塊隨捲動消失 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-061 | 捲動回主內容區起點時環形圖區塊顯示 | `no2_home_screen` | UI | T1 | P2 | A | — |
| R-HR-062 | 返回首頁時重新載入報表反映他處紀錄與設定變動 | `no2_home_screen` | UI | T1 | P1 | A | — |
| R-HR-063 | 首頁篩選畫面由 HomeScreen 以 Modal 呈現 | `no3_home_filter_screen` | UI | T1 | P2 | A | — |
| R-HR-064 | 篩選摘要條依序為時間粒度分組方式兩卡平分並排 | `no3_home_filter_screen` | UI | T1 | P2 | A | — |
| R-HR-065 | 帳戶卡以 2 欄連續排列不依幣別分群 | `no3_home_filter_screen` | UI | T1 | P2 | A | — |
| R-HR-066 | 帳戶總數為奇數時尾端落單卡靠左右側留空 | `no3_home_filter_screen` | UI | T1 | P2 | A | — |
| R-HR-067 | 帳戶卡內含帳戶圖示名稱與幣別 badge | `no3_home_filter_screen` | UI | T1 | P2 | A | — |
| R-HR-068 | 帳戶卡依是否被選取切換選中未選兩態 | `no3_home_filter_screen` | UI | T1 | P1 | A | — |
| R-HR-069 | 無可用帳戶時帳戶 Grid 空白不顯示空狀態提示 | `no3_home_filter_screen` | UI | T3 | P2 | A | sqlite 停用全部帳戶後進入篩選頁 |
| R-HR-070 | 點按時間粒度卡切至下一粒度首頁報表即時更新 | `no3_home_filter_screen` | UI | T1 | P1 | A | — |
| R-HR-071 | 點按分組方式卡切至下一分組首頁報表即時更新 | `no3_home_filter_screen` | UI | T1 | P1 | A | — |
| R-HR-072 | 點按帳戶卡切換選取狀態首頁報表即時更新 | `no3_home_filter_screen` | UI | T1 | P1 | A | — |
| R-HR-073 | 點按關閉按鈕關閉 Modal | `no3_home_filter_screen` | UI | T1 | P2 | A | — |
| R-HR-074 | 圖表資料各分組依金額由大到小排序 | `no13_home_report_logic` | UI | T3 | P2 | A | 佈置多分組已知金額驗色票排序 |
| R-HR-075 | 累積達總和 5/6 或累加至第 2 分組先達成為截止點 | `no13_home_report_logic` | UI | T3 | P2 | A | 佈置跨門檻兩側的金額比例組合 |
| R-HR-076 | 截止點內分組依排名分配 `chart` 色票序列 | `no13_home_report_logic` | UI | T3 | P2 | A | 佈置 2 分組內即達 5/6 的金額組合 |
| R-HR-077 | 截止點外分組合併為其他分配 `primary[300]` | `no13_home_report_logic` | UI | T3 | P2 | A | 佈置 3 分組以上驗尾端合併為其他 |
| R-HR-078 | 所屬帳戶已停用的交易不列入報表計算 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-079 | 所屬分類已停用的交易不列入報表計算 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-080 | 停用後歷史交易資料留存僅自報表視圖隱藏 | `no13_home_report_logic` | UI+DB | T2 | P0 | A | — |
| R-HR-081 | 轉出轉入帳戶皆在已選清單的轉帳不列入計算 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-082 | 轉出轉入帳戶皆不在已選清單的轉帳不列入計算 | `no13_home_report_logic` | UI | T1 | P2 | A | — |
| R-HR-083 | 外部帳戶已刪除或已停用的轉帳不列入計算 | `no13_home_report_logic` | UI | T1 | P1 | A | — |
| R-HR-084 | 轉出帳戶在已選清單時以 amountFrom 列入支出合計 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-085 | 僅轉入帳戶在已選清單時以 amountTo 列入收入合計 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-086 | 已選帳戶幣別全同時走單幣別模式金額用原始幣別 | `no13_home_report_logic` | UI | T1 | P1 | A | — |
| R-HR-087 | 已選帳戶幣別不同時換算為主要貨幣後累計 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-088 | 支出收入合計不受圖表來源影響皆獨立計算 | `no13_home_report_logic` | UI | T1 | P1 | A | — |
| R-HR-089 | 分組清單僅含與圖表來源一致的類型 | `no13_home_report_logic` | UI | T1 | P1 | A | — |
| R-HR-090 | 類別分組依一致類型金額由大到小排序分組 | `no13_home_report_logic` | UI | T1 | P1 | A | — |
| R-HR-091 | 日期分組依日期由新到舊排序 | `no13_home_report_logic` | UI | T1 | P1 | A | — |
| R-HR-092 | 期間餘額為收入合計減支出合計 | `no13_home_report_logic` | UI | T1 | P0 | A | — |
| R-HR-093 | 期間偏移 0 為當期減 1 往過去一期加 1 往未來一期 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-094 | 以時區換算當下時間定位當期 | `no22_home_period_state_logic` | UI | T3 | P2 | A | 調系統時區驗當期跨日邊界 |
| R-HR-095 | 粒度日週月年時起訖為該粒度完整範圍 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-096 | 週起算日依 `weekStart` 偏好解析 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-097 | `weekStart` 為 `auto` 時週起始依使用者語系慣例 | `no22_home_period_state_logic` | UI | T3 | P2 | A | 調系統語系驗週起始跟隨慣例 |
| R-HR-098 | 粒度全部時起訖涵蓋全部時間且不受偏移影響 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-099 | 首次載入無既有選取時全選未刪除未停用帳戶 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-100 | 載入既有選取時過濾已刪除與已停用帳戶 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-101 | 帳戶新增或重新啟用後自動加入已選清單 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-102 | 帳戶刪除或停用後自動自已選清單移除 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-103 | 已選清單變空且仍有可用帳戶時回退為全選 | `no22_home_period_state_logic` | UI | T1 | P2 | A | — |
| R-HR-104 | 僅剩一個已選帳戶時取消該帳戶操作不生效 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-105 | 切換期間偏移或時間粒度不重設已選帳戶清單 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-HR-106 | 切換分組模式或圖表來源不重設已選帳戶清單 | `no22_home_period_state_logic` | UI | T1 | P2 | A | — |
| R-HR-107 | 快取鍵由全部輸入與當前使用者組成同鍵共用快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | A | — |
| R-HR-108 | 不同使用者即使輸入相同對應各自快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | B | — |
| R-HR-109 | 快取命中時更新該筆存取時間並回傳快取資料 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-110 | 同鍵已有進行中查詢時共用結果不重複查詢 | `no22_home_period_state_logic` | LOG | T4 | P2 | 無 | 併發查詢時序手動無法構造與觀察 |
| R-HR-111 | 未命中時推導期間聚合報表寫入快取並記錄存取時間 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-112 | 粒度年或全部的快取標記為優先保留 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-113 | 快取筆數超過十五筆時執行淘汰 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-114 | 有未標記快取時自未標記者淘汰最久未存取一筆 | `no22_home_period_state_logic` | LOG | T4 | P2 | 無 | LRU 存取順序手動無法精準控制 |
| R-HR-115 | 全部皆優先保留時自其中淘汰最久未存取一筆 | `no22_home_period_state_logic` | LOG | T4 | P2 | 無 | LRU 存取順序手動無法精準控制 |
| R-HR-116 | 清空快取一併清除存取時間優先標記進行中紀錄 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-117 | 交易或轉帳建立更新刪除後清空報表快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | A | — |
| R-HR-118 | 合併交易完成後清空報表快取 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-119 | 復原操作完成後清空報表快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | A | — |
| R-HR-120 | 帳戶建立或更新後清空報表快取 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-121 | 匯率異動後清空報表快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | A | — |
| R-HR-122 | 語系時區主要貨幣或週起始日變更後清空快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | A | — |
| R-HR-123 | 首頁重取焦點並重載帳戶類別資料後清空快取 | `no22_home_period_state_logic` | LOG | T2 | P2 | A | — |
| R-HR-124 | 登入登出或換帳號後清空報表快取 | `no22_home_period_state_logic` | LOG | T2 | P1 | B | — |

---

## 搜尋

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|----|------|------|----|----|---|---|------|
| R-SR-001 | 搜尋畫面以 Modal 形式呈現 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-002 | 操作者點擊首頁搜尋入口開啟搜尋畫面 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-003 | 導覽列顯示關閉按鈕與搜尋標題 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-004 | 搜尋框為空時顯示 `輸入關鍵字以搜尋交易` 提示 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-005 | 無符合結果時顯示 `找不到結果` 提示 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-006 | 無結果提示副標回顯當前搜尋關鍵字 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-007 | 備註含關鍵字的交易列入搜尋結果 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-008 | 備註含關鍵字的轉帳列入搜尋結果 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-009 | 結果列備註中的關鍵字以 highlight 標示 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-010 | 結果由群組卡片包覆且列間以 hairline 分隔 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-011 | 交易與轉帳各自最多顯示 50 筆 | `no4_search_screen` | UI+DB | T3 | P2 | A | sqlite 注入逾 50 筆含同關鍵字的交易與轉帳 |
| R-SR-012 | 搜尋結果依日期由新至舊排序 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-013 | 所屬帳戶已停用的交易不列入結果 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-014 | 所屬分類已停用的交易不列入結果 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-015 | 來源或目的帳戶已停用的轉帳不列入結果 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-016 | 停用排除後結果筆數可少於 50 筆上限 | `no4_search_screen` | UI+DB | T3 | P2 | A | sqlite 注入逾 50 筆且部分所屬帳戶停用的紀錄 |
| R-SR-017 | 結果列上列左側圖示置於 outline 框內 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-018 | 交易列顯示類別圖示且轉帳列顯示轉帳圖示 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-019 | 圖示一律採主色不依收支正負著色 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-020 | 交易列中央顯示類別名稱且右側顯示金額 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-021 | 轉帳列中央以方向箭頭分隔來源與目的帳戶名稱 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-022 | 結果列下列左側顯示備註右側顯示日期 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-023 | 金額一律採主文字色不依收支正負著色 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-024 | 交易收入金額不顯示正負號 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-025 | 交易支出於幣別符號與數字之間顯示負號 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-026 | 轉帳金額不顯示正負號 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-027 | 跨幣別轉帳並列顯示來源金額與目的金額 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-028 | 同幣別轉帳僅顯示單一金額 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-029 | 定期排程實例於金額左側並列循環圖示 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-030 | 循環圖示不獨立觸發互動點按列行為同一般紀錄 | `no4_search_screen` | UI | T1 | P2 | A | — |
| R-SR-031 | 操作者點按關閉按鈕關閉 Modal | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-032 | 輸入搜尋文字後系統自動觸發搜尋更新結果列表 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-033 | 輸入停止後經 debounce 延遲才執行搜尋 | `no4_search_screen` | UI | T4 | P2 | 無 | debounce 毫秒級時序手動無法量測 |
| R-SR-034 | 自編輯畫面返回且搜尋框非空時重新執行搜尋 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-035 | 復原完成且搜尋框非空時結果反映復原後資料 | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-036 | 重查觸發來源為監看 UndoLogic 復原完成計數 | `no4_search_screen` | UI | T4 | P2 | 無 | 內部監看訊號來源無法自畫面辨別 |
| R-SR-037 | 點按交易結果列導航至 TransactionEditorScreen | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-038 | 點按轉帳結果列導航至 TransferEditorScreen | `no4_search_screen` | UI | T1 | P1 | A | — |
| R-SR-039 | 搜尋列含前綴搜尋 icon 槽位與中央輸入框 | `search_policy` | UI | T1 | P2 | A | — |
| R-SR-040 | placeholder 文案為 `搜尋` 且各搜尋畫面共用 | `search_policy` | UI | T1 | P2 | A | — |
| R-SR-041 | clear 動作僅輸入框 focus 時顯示 | `search_policy` | UI | T1 | P1 | A | — |
| R-SR-042 | 點擊 clear 一鍵清空輸入並重新觸發搜尋 | `search_policy` | UI | T1 | P1 | A | — |
| R-SR-043 | 搜尋列固定畫面底部不隨 scroll 隱藏 | `search_policy` | UI | T1 | P1 | A | — |
| R-SR-044 | 搜尋列隨鍵盤上推且鍵盤收起後落回底部 | `search_policy` | UI | T1 | P1 | A | — |
| R-SR-045 | 搜尋頁進入時輸入框 autoFocus | `search_policy` | UI | T1 | P1 | A | — |
| R-SR-046 | 其餘搜尋畫面進入時不 autoFocus | `search_policy` | UI | T1 | P2 | A | — |
| R-SR-047 | 搜尋頁列表滾動時收起鍵盤 | `search_policy` | UI | T1 | P1 | A | — |
| R-SR-048 | 滾動期間列項點擊事件仍可命中 | `search_policy` | UI | T1 | P2 | A | — |
| R-SR-049 | modal 變體搜尋列內嵌 modal 頂部隨開關出現消失 | `search_policy` | UI | T4 | P2 | 無 | modal 變體搜尋列所在 modal UI 不可達 |
| R-SR-050 | modal 變體搜尋列固定 modal 頂部不隨鍵盤移動 | `search_policy` | UI | T4 | P2 | 無 | 同 R-SR-049，UI 不可達 |
| R-SR-051 | 貨幣語系時區等設定畫面搜尋列皆採 Bottom Pill | `search_policy` | UI | T1 | P2 | A | — |

---

## 交易轉帳與復原

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-TX-001 | 交易編輯器標題依型別顯示支出或收入 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-002 | 必填欄位未填妥時完成按鈕不可點按 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-003 | 交易屬排程時定期切換按鈕呈啟用視覺 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-004 | 交易不屬排程時定期切換按鈕呈停用視覺 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-005 | 交易日期選擇區為日期加時間模式 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-006 | 定期設定區展開時嵌入 `RecurringOptions` | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-007 | 金額達位數上限時輸入即時阻擋不再更新 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-008 | 備註達長度上限時輸入即時阻擋不再更新 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-009 | 交易備註前後空白於寫入時去除 | `no5_transaction_editor_screen` | DB | T2 | P2 | A | — |
| R-TX-010 | 編輯模式顯示刪除按鈕且新增模式不顯示 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-011 | 計算機鍵盤含數字小數點四則等號退格鍵 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-012 | 金額輸入框聚焦時顯示計算機鍵盤 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-013 | 備註聚焦時收起計算機鍵盤浮現系統鍵盤 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-014 | 編輯模式進入時依交易當前內容顯示各欄位 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-015 | 編輯排程交易時定期規則帶頻率間隔結束日期 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-016 | 編輯非排程交易或新增時當前定期規則為空 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-017 | 進入交易編輯器時定期設定區預設收合 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-018 | 進入交易編輯器時金額輸入框預設聚焦 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-019 | 操作者點按關閉按鈕後返回上一頁 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-020 | 點按定期切換按鈕切換定期設定區展開收合 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-021 | 計算機按鍵結果即時顯示於金額輸入框 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-022 | 完成排程交易時顯示定期編輯模式對話框 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-023 | 選僅此一筆或此筆及未來後系統執行 `updateSchedule` | `no5_transaction_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-024 | 新增交易且定期規則已設定時執行 `createSchedule` | `no5_transaction_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-025 | 編輯非排程交易且設定定期規則時轉為排程 | `no5_transaction_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-026 | 交易配額禁止時完成後導航至 `PaywallScreen` | `no5_transaction_editor_screen` | UI | T3 | P2 | A | sqlite 注入超額交易筆數 |
| R-TX-027 | 交易操作成功時顯示復原列並返回上一頁 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-028 | 交易操作失敗時顯示錯誤提示 | `no5_transaction_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-029 | 刪除排程交易時顯示定期刪除模式對話框 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-030 | 定期刪除選僅此一筆或此筆及未來執行 `deleteSchedule` | `no5_transaction_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-031 | 刪除一般交易時顯示刪除確認對話框 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-032 | 確認刪除後交易自列表消失並顯示復原列 | `no5_transaction_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-033 | 轉帳編輯器標題顯示轉帳 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-034 | 必填欄位未填妥時完成按鈕不可點按 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-035 | 轉出轉入帳戶相同時完成按鈕不可點按 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-036 | 定期切換按鈕依是否屬排程呈啟用或停用視覺 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-037 | 轉帳日期選擇區為日期加時間模式 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-038 | 轉出與轉入金額達位數上限即時阻擋輸入 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-039 | 同幣別轉帳時轉入金額輸入框為停用狀態 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-040 | 同幣別轉帳時轉入金額自動跟隨轉出金額 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-041 | 轉出轉入帳戶相同時帳戶框顯示錯誤狀態 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-042 | 轉帳備註達長度上限即時阻擋輸入 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-043 | 轉帳備註前後空白於寫入時去除 | `no6_transfer_editor_screen` | DB | T2 | P2 | A | — |
| R-TX-044 | 編輯模式顯示刪除按鈕且新增模式不顯示 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-045 | 轉出或轉入金額框聚焦時顯示計算機鍵盤 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-046 | 備註聚焦時收起計算機鍵盤浮現系統鍵盤 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-047 | 編輯模式進入時依轉帳當前內容顯示各欄位 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-048 | 編輯排程轉帳時定期規則帶頻率間隔結束日期 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-049 | 編輯非排程轉帳或新增時當前定期規則為空 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-050 | 進入轉帳編輯器時定期設定區預設收合 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-051 | 進入轉帳編輯器時轉出金額輸入框預設聚焦 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-052 | 操作者點按關閉按鈕後返回上一頁 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-053 | 點按定期切換按鈕切換定期設定區展開收合 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-054 | 跨幣別轉帳時轉入金額框可聚焦編輯 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-055 | 同幣別轉帳時點按轉入金額框無反應 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-056 | 計算機按鍵結果即時顯示於聚焦的金額框 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-057 | 完成排程轉帳時顯示定期編輯模式對話框 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-058 | 選僅此一筆或此筆及未來後系統執行 `updateSchedule` | `no6_transfer_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-059 | 新增轉帳且定期規則已設定時執行 `createSchedule` | `no6_transfer_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-060 | 編輯非排程轉帳且設定定期規則時轉為排程 | `no6_transfer_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-061 | 轉帳配額禁止時完成後導航至 `PaywallScreen` | `no6_transfer_editor_screen` | UI | T3 | P2 | A | sqlite 注入超額轉帳筆數 |
| R-TX-062 | 轉帳操作成功時顯示復原列並返回上一頁 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-063 | 轉帳操作失敗時顯示錯誤提示 | `no6_transfer_editor_screen` | UI | T1 | P2 | A | — |
| R-TX-064 | 刪除排程轉帳時顯示定期刪除模式對話框 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-065 | 定期刪除選僅此一筆或此筆及未來執行 `deleteSchedule` | `no6_transfer_editor_screen` | UI+DB | T2 | P1 | A | — |
| R-TX-066 | 刪除一般轉帳時顯示刪除確認對話框 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-067 | 確認刪除後轉帳自列表消失並顯示復原列 | `no6_transfer_editor_screen` | UI | T1 | P1 | A | — |
| R-TX-068 | `useThousandsUnit` 幣別輸入先乘一千再縮放儲存 | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-069 | 金額乘一萬縮放為整數存入 `amount` | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-070 | `expense` 交易 `amount` 儲存為負值 | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-071 | `income` 交易 `amount` 儲存為正值 | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-072 | `createTransaction` 缺必填欄位回傳驗證失敗 | `no9_transaction_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-073 | `createTransaction` 金額為 0 回傳驗證失敗 | `no9_transaction_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-074 | 建立交易金額超出可儲存範圍時存檔驗證失敗 | `no9_transaction_logic` | UI | T1 | P1 | A | — |
| R-TX-075 | `createTransaction` 驗證通過新增一筆至 `Transactions` | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-076 | `updateTransaction` 缺必填欄位回傳驗證失敗 | `no9_transaction_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-077 | `updateTransaction` 金額為 0 回傳驗證失敗 | `no9_transaction_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-078 | 更新交易金額超出可儲存範圍時存檔驗證失敗 | `no9_transaction_logic` | UI | T1 | P1 | A | — |
| R-TX-079 | `updateTransaction` 更新 `Transactions` 對應記錄 | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-080 | 更新交易未帶排程欄位時保留 `scheduleId` 原值 | `no9_transaction_logic` | DB | T2 | P1 | A | — |
| R-TX-081 | 更新輸入帶排程欄位時系統才改寫該欄位 | `no9_transaction_logic` | DB | T4 | P2 | 無 | 更新排程連結改寫分支需 harness 直呼，UI 僅測得保留半，列自動化債 |
| R-TX-082 | `deleteTransaction` 軟刪除記錄而非物理刪除 | `no9_transaction_logic` | DB | T2 | P0 | A | — |
| R-TX-083 | `createTransfer` 缺必填欄位回傳驗證失敗 | `no8_transfer_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-084 | `createTransfer` 金額小於等於 0 回傳驗證失敗 | `no8_transfer_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-085 | 建立轉帳金額超出可儲存範圍時存檔驗證失敗 | `no8_transfer_logic` | UI | T1 | P1 | A | — |
| R-TX-086 | `createTransfer` 轉出轉入帳戶相同回傳驗證失敗 | `no8_transfer_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-087 | 跨幣別隱含匯率為 `amountTo` 除以 `amountFrom` | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-088 | 建立時任一幣別代碼無法解析中止全部寫入 | `no8_transfer_logic` | DB | T4 | P1 | 無 | jest transferLogic 覆蓋 createTransfer 幣別守門 |
| R-TX-089 | `createTransfer` 驗證通過新增一筆至 `Transfers` | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-090 | 同幣別轉帳 `impliedRate` 寫入空值 | `no8_transfer_logic` | DB | T2 | P1 | A | — |
| R-TX-091 | 轉帳未帶排程欄位時 `scheduleId` 寫入空值 | `no8_transfer_logic` | DB | T2 | P2 | A | — |
| R-TX-092 | 跨幣別建立於 `CurrencyRates` 新增正反兩筆記錄 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-093 | 正向記錄為轉出對轉入幣別匯率為隱含匯率 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-094 | 反向記錄匯率為隱含匯率的倒數 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-095 | 兩筆匯率記錄生效時點皆為轉帳 `date` 值 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-096 | `updateTransfer` 缺必填欄位回傳驗證失敗 | `no8_transfer_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-097 | `updateTransfer` 金額小於等於 0 回傳驗證失敗 | `no8_transfer_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-098 | 更新轉帳金額超出可儲存範圍時存檔驗證失敗 | `no8_transfer_logic` | UI | T1 | P1 | A | — |
| R-TX-099 | `updateTransfer` 轉出轉入帳戶相同回傳驗證失敗 | `no8_transfer_logic` | LOG | T4 | P2 | 無 | logic 後備閘，jest validationGuards 覆蓋，UI 擋死不可手測 |
| R-TX-100 | 更新後以新金額重算隱含匯率寫入 `impliedRate` | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-101 | 更新改為同幣別時 `impliedRate` 寫入空值 | `no8_transfer_logic` | DB | T2 | P1 | A | — |
| R-TX-102 | 更新時任一幣別代碼無法解析中止全部寫入 | `no8_transfer_logic` | DB | T4 | P2 | 無 | 與 create 共用 resolveTransferCurrencyIds，jest 覆蓋 create 路徑 |
| R-TX-103 | 更新轉帳未帶排程欄位時保留記錄原值 | `no8_transfer_logic` | DB | T2 | P1 | A | — |
| R-TX-104 | 匯率日期或幣別對變動時補錄正反兩筆匯率 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-105 | 匯率日期幣別對皆未變時不新增匯率記錄 | `no8_transfer_logic` | DB | T2 | P1 | A | — |
| R-TX-106 | 換對手帳戶成新幣別對時金額日期不變仍補錄 | `no8_transfer_logic` | DB | T2 | P1 | A | — |
| R-TX-107 | 更新補錄的生效時點為更新後轉帳 `date` 值 | `no8_transfer_logic` | DB | T2 | P1 | A | — |
| R-TX-108 | `deleteTransfer` 軟刪除記錄而非物理刪除 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-109 | 刪除轉帳不刪除任何已產生的匯率記錄 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-TX-110 | 連續操作時後一筆復原等待取代前一筆 | `no11_undo_logic` | UI | T1 | P1 | A | — |
| R-TX-111 | 復原列顯示 4 秒無互動自動關閉 | `no11_undo_logic` | UI | T1 | P1 | A | — |
| R-TX-112 | 倒數自復原列可見後起算而非登記當下 | `no11_undo_logic` | UI | T4 | P2 | 無 | 起算時點差異目視無法判定 |
| R-TX-113 | 點按取消段後復原列關閉且操作記錄清除 | `no11_undo_logic` | UI | T1 | P1 | A | — |
| R-TX-114 | 復原建立操作後新增記錄軟刪除隱沒 | `no11_undo_logic` | DB | T2 | P0 | A | — |
| R-TX-115 | 復原編輯操作後欄位寫回更新前的值 | `no11_undo_logic` | DB | T2 | P0 | A | — |
| R-TX-116 | 復原刪除操作後記錄取消軟刪除還原 | `no11_undo_logic` | DB | T2 | P0 | A | — |
| R-TX-117 | 復原失敗時顯示失敗提示並關閉復原列 | `no11_undo_logic` | UI | T3 | P2 | A | sqlite 注入破壞復原目標記錄 |
| R-TX-118 | 復原成功後首頁與搜尋列表重新查詢更新 | `no11_undo_logic` | UI | T1 | P1 | A | — |
| R-TX-119 | 復原列覆蓋返回目的畫面底部且全域單一實例 | `undo_bar_policy` | UI | T1 | P2 | A | — |
| R-TX-120 | 交易與轉帳新增編輯刪除含定期皆觸發復原列 | `undo_bar_policy` | UI | T1 | P1 | A | — |
| R-TX-121 | 復原段倒數與固定復原標籤為單一觸發區 | `undo_bar_policy` | UI | T1 | P2 | A | — |
| R-TX-122 | 復原標籤顯示在地化復原字樣不隨操作變動 | `undo_bar_policy` | UI | T1 | P2 | A | — |

---

## 定期交易

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-RC-001 | 傳入定期規則為空時啟用開關初始為關 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-002 | 規則為空時設定內容區不可操作並顯示元件預設值 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-003 | 傳入規則非空時啟用開關初始為開 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-004 | 規則非空時內容區依規則顯示頻率間隔與結束條件 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-005 | 頻率選項列提供每日每週每月每年四個選項 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-006 | 間隔單位文字依頻率顯示 `Day` `Week` `Month` `Year` | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-007 | 結束日期選擇器為 Date-only 模式不含時間 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-008 | 結束日期選擇器初始顯示既有結束日期無則今天 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-009 | 結束日期可選任意過去或未來日期無上下限 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-010 | 結束條件為於指定日期時結束日期選擇器可操作 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-011 | 結束條件為永不時結束日期選擇器不可操作 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-012 | 切開關為開時啟用內容區並回傳目前規則至所在畫面 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-013 | 切開關為關時停用內容區並回傳清空狀態至所在畫面 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-014 | 點按頻率選項後當前頻率更新為該選項 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-015 | 間隔輸入僅接受數字字元非數字輸入不更新 | `no7_recurring_setting_screen` | UI | T1 | P1 | A | — |
| R-RC-016 | 間隔輸入開頭為 0 時不更新 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-017 | 間隔輸入達位數上限即時阻擋輸入不再更新 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-018 | 點按永不後結束日期選擇器顯示日期保留不變 | `no7_recurring_setting_screen` | UI | T1 | P2 | A | — |
| R-RC-019 | 點按永不後儲存的排程無結束日期 | `no7_recurring_setting_screen` | UI+DB | T2 | P1 | A | — |
| R-RC-020 | 點按於指定日期後結束日期設為選擇器當下顯示日期 | `no7_recurring_setting_screen` | UI+DB | T2 | P1 | A | — |
| R-RC-021 | 結束條件為於指定日期時變更選擇器結束日期同步更新 | `no7_recurring_setting_screen` | UI+DB | T2 | P1 | A | — |
| R-RC-022 | 結束條件為永不時變更選擇器日期結束日期維持為空 | `no7_recurring_setting_screen` | UI+DB | T2 | P2 | A | — |
| R-RC-023 | 建立排程於 `Schedules` 表新增一筆排程記錄 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-024 | 轉帳型排程首筆轉帳帶 `scheduleId` 與 `scheduleInstanceDate` | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-025 | 交易型排程首筆交易帶 `scheduleId` 與 `scheduleInstanceDate` | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-026 | 單筆轉排程後新排程與首筆實例存在且原紀錄軟刪 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-027 | 單筆轉排程順序固定先建排程後刪原紀錄 | `no10_recurring_transactions_logic` | DB | T4 | P0 | 無 | 順序中間態需失敗注入才可觀察 |
| R-RC-028 | 排程建立失敗時原紀錄保持完好操作以失敗結束 | `no10_recurring_transactions_logic` | DB | T4 | P0 | 無 | 需注入建立失敗手動無注入手段 |
| R-RC-029 | 原紀錄刪除失敗時不回滾已建排程容忍殘留 | `no10_recurring_transactions_logic` | DB | T4 | P2 | 無 | 需注入刪除失敗手動無注入手段 |
| R-RC-030 | 更新選僅此一筆時只更新該筆不影響 `Schedules` 表 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-031 | 更新選此筆及未來時原排程 `endOn` 截為此筆前一週期 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-032 | 更新選此筆及未來時軟刪原排程此筆日期起所有實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-033 | 更新後新排程 `startOn` 為此筆日期並補實例至當前時間 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-034 | 刪除選僅此一筆時只軟刪該筆實例排程不變 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-035 | 刪除選此筆及未來時原排程 `endOn` 截為前一週期 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-036 | 刪除選此筆及未來時軟刪此筆日期當日起所有實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-037 | 復原截斷後排程 `endOn` 寫回截斷前的值 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-038 | 復原截斷清除快照集合內每筆實例的軟刪標記 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-039 | 復原截斷不復活使用者先前自行刪除的實例 | `no10_recurring_transactions_logic` | DB | T3 | P0 | A | 截斷前先自行刪除一筆實例再截斷再復原 |
| R-RC-040 | 復原截斷全部變更單次原子提交 | `no10_recurring_transactions_logic` | DB | T4 | P0 | 無 | 原子性需失敗注入驗證 |
| R-RC-041 | 撤銷排程建立軟刪排程本體與名下未軟刪實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-042 | 撤銷排程建立單次原子提交 | `no10_recurring_transactions_logic` | DB | T4 | P1 | 無 | 原子性需失敗注入驗證 |
| R-RC-043 | 撤銷單筆轉排程清除原紀錄軟刪標記使其復活 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-044 | 撤銷單筆轉排程軟刪新排程本體與名下實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-045 | 撤銷單筆轉排程不出現原紀錄與排程雙亡中間態 | `no10_recurring_transactions_logic` | DB | T4 | P0 | 無 | 原子性需失敗注入驗證 |
| R-RC-046 | 正向刪除曾失敗時撤銷清除標記落於未刪紀錄無害 | `no10_recurring_transactions_logic` | DB | T4 | P2 | 無 | 前置為容忍失敗路徑手動無注入手段 |
| R-RC-047 | 撤銷排程更新原排程 `endOn` 寫回截斷前的值 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-048 | 撤銷排程更新清除快照集合內實例軟刪標記 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-049 | 撤銷更新且新排程存在時軟刪新排程與名下實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-050 | 撤銷排程更新單次原子提交不留半套復原 | `no10_recurring_transactions_logic` | DB | T4 | P0 | 無 | 原子性需失敗注入驗證 |
| R-RC-051 | 撤銷更新不復活使用者先前自行刪除的實例 | `no10_recurring_transactions_logic` | DB | T3 | P0 | A | 更新前先自行刪除一筆實例再更新再復原 |
| R-RC-052 | App 啟動或登入後補齊到期未產生的實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-053 | 重複呼叫同排程同 `instanceDate` 至多產生一筆實例 | `no10_recurring_transactions_logic` | DB | T4 | P0 | 無 | 重入時序手動不可控 |
| R-RC-054 | 同使用者並行補產生共用同一執行不重複起跑 | `no10_recurring_transactions_logic` | DB | T4 | P2 | 無 | 並行時序手動不可控 |
| R-RC-055 | 補產生依 `userId` 過濾僅處理此使用者的排程 | `no10_recurring_transactions_logic` | DB | T3 | P1 | B | 第二測試帳號建立排程後切回原帳號驗證 |
| R-RC-056 | 已軟刪除的排程不再補產生實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-057 | 已有實例時起點取最後實例含已軟刪往後推一期 | `no10_recurring_transactions_logic` | DB | T2 | P1 | A | — |
| R-RC-058 | 尚無實例的排程起點為 `startOn` | `no10_recurring_transactions_logic` | DB | T3 | P2 | A | sqlite 注入無實例排程後重啟 |
| R-RC-059 | 補產生逐期推進間隔為 `interval` 個頻率單位 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-060 | 每月每年推算日號錨定 `startOn` 原始日號 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-061 | 目標月天數不足時日號夾到該月最後一天 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-062 | 夾短僅當期生效下一期回原始日號重新推算 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-063 | 既有漂移實例不回溯改寫僅未來期套用錨定 | `no10_recurring_transactions_logic` | DB | T3 | P2 | A | sqlite 注入漂移日號實例後重啟 |
| R-RC-064 | `instanceDate` 晚於當前時間即停止不產生未來實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-065 | `instanceDate` 晚於 `endOn` 即停止不產生其後實例 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-066 | 已存在對應 `instanceDate` 的實例跳過不重複產生 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-067 | 已軟刪除的實例視為已存在不重新產生 | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-068 | 補產生實例帶 `scheduleId` 與 `scheduleInstanceDate` | `no10_recurring_transactions_logic` | DB | T2 | P0 | A | — |
| R-RC-069 | 單筆排程失敗跳過該筆不中斷其餘排程補產生 | `no10_recurring_transactions_logic` | DB | T4 | P1 | 無 | 單筆失敗需失敗注入 |
| R-RC-070 | 補產生依排程類型分別建立轉帳或交易實例 | `no10_recurring_transactions_logic` | DB | T2 | P1 | A | — |

---

## 類別帳戶與合併

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-CM-001 | 類別列表依類型分為支出區與收入區兩區顯示 | `no9_category_list_screen` | UI | T1 | P1 | A | — |
| R-CM-002 | 類別列表項目顯示圖示與名稱 | `no9_category_list_screen` | UI | T1 | P2 | A | — |
| R-CM-003 | 已停用類別於列表以停用樣式呈現 | `no9_category_list_screen` | UI | T1 | P1 | A | — |
| R-CM-004 | 類別列表點按返回按鈕返回上一頁 | `no9_category_list_screen` | UI | T1 | P2 | A | — |
| R-CM-005 | 點按合併按鈕以類別模式導航至 MergeEditorScreen | `no9_category_list_screen` | UI | T1 | P1 | A | — |
| R-CM-006 | 新增類別受 `canUserPerformAction` 禁止時導航至 PaywallScreen | `no9_category_list_screen` | UI | T3 | P1 | A | 佈置類別數達 LEVEL_0 上限 |
| R-CM-007 | 新增類別獲允許時導航至 CategoryEditorScreen 且類型預設支出 | `no9_category_list_screen` | UI | T1 | P1 | A | — |
| R-CM-008 | 點按類別列表項目導航至 CategoryEditorScreen 編輯模式 | `no9_category_list_screen` | UI | T1 | P1 | A | — |
| R-CM-009 | 類別編輯器標題依模式顯示新增類別或編輯類別 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-010 | 類別名稱未填妥時完成按鈕不可點按 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-011 | 類別名稱達長度上限即時阻擋輸入不再更新 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-012 | 類別名稱前後空白於寫入時去除 | `no10_category_editor_screen` | DB | T2 | P1 | A | — |
| R-CM-013 | 類別名稱全為空白視為空由完成按鈕必填閘擋下 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-014 | 類別不查重可與既有類別同名建立成功 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-015 | 類別類型選擇器僅提供支出與收入兩選項 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-016 | 類型選擇器收合時顯示所選類型名稱與展開指示器 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-017 | 新增模式類型預設選中支出且可修改 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-018 | 編輯模式類型選擇器呈停用樣式且點按無反應 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-019 | 類別圖示網格為 `tags` 含 `category` 的圖示清單 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-020 | 類別圖示網格常駐顯示無折疊狀態 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-021 | 新增模式預設選取圖示清單第一個 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-022 | 類別圖示清單為空時選取 fallback 圖示 | `no10_category_editor_screen` | UI | T4 | P2 | 無 | 圖示來源打包 JSON 常數，執行期無法清空 |
| R-CM-023 | 類別編輯器點按圖示即時更新預覽 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-024 | 類別編輯器點按關閉按鈕返回上一頁 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-025 | 新增模式選擇當前相同類型僅收合選擇器 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-026 | 新增模式切換類型保留選取圖示與名稱並收合 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-027 | 新增類別成功呼叫 showUndo 並返回上一頁 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-028 | 編輯類別保存成功呼叫 showUndo 並返回上一頁 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-029 | 編輯模式顯示停用開關與刪除按鈕新增模式不顯示 | `no10_category_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-030 | 點按刪除類別按鈕先顯示刪除確認對話框 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-031 | 確認刪除類別成功後呼叫 showUndo 並返回上一頁 | `no10_category_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-032 | 類別建立或更新失敗顯示錯誤提示 | `no10_category_editor_screen` | UI | T4 | P2 | 無 | 必填與長度閘於畫面先擋失敗路徑 UI 不可達 |
| R-CM-033 | createCategory 名稱去空白後超上限回傳驗證失敗 | `no14_category_logic` | UI | T4 | P2 | 無 | 畫面即時阻擋先行後備閘不可達且匯入路徑屬他段 |
| R-CM-034 | 新增類別寫入 `Categories` 一筆且 `type` 與所選一致 | `no14_category_logic` | DB | T2 | P1 | A | — |
| R-CM-035 | 新增類別寫入 `iconId` 為所選且引用 category 圖示定義 | `no14_category_logic` | DB | T2 | P2 | A | — |
| R-CM-036 | 編輯類別保存後 DB 的 `name` 與 `iconId` 更新 | `no14_category_logic` | DB | T2 | P1 | A | — |
| R-CM-037 | 編輯類別不可變更 `type` 且 DB 值維持原值 | `no14_category_logic` | DB | T2 | P1 | A | — |
| R-CM-038 | 停用類別保存後 DB 的 `disabledOn` 寫入 | `no14_category_logic` | DB | T2 | P1 | A | — |
| R-CM-039 | 刪除類別軟刪除 `Categories` 記錄 | `no14_category_logic` | DB | T2 | P0 | A | — |
| R-CM-040 | 刪除類別串聯軟刪除該類別所屬 `Transactions` | `no14_category_logic` | DB | T2 | P0 | A | — |
| R-CM-041 | 拖拉重排類別批次更新排序欄位且持久保存 | `no14_category_logic` | UI+DB | T2 | P1 | A | — |
| R-CM-042 | 帳戶列表項目顯示圖示與名稱 | `no11_account_list_screen` | UI | T1 | P2 | A | — |
| R-CM-043 | 已停用帳戶於列表以停用樣式呈現 | `no11_account_list_screen` | UI | T1 | P1 | A | — |
| R-CM-044 | 帳戶列表點按返回按鈕返回上一頁 | `no11_account_list_screen` | UI | T1 | P2 | A | — |
| R-CM-045 | 點按合併按鈕以帳戶模式導航至 MergeEditorScreen | `no11_account_list_screen` | UI | T1 | P1 | A | — |
| R-CM-046 | 新增帳戶受 `canUserPerformAction` 禁止時導航至 PaywallScreen | `no11_account_list_screen` | UI | T3 | P1 | A | 佈置帳戶數達 LEVEL_0 上限 |
| R-CM-047 | 新增帳戶獲允許時導航至 AccountEditorScreen | `no11_account_list_screen` | UI | T1 | P1 | A | — |
| R-CM-048 | 點按帳戶列表項目導航至 AccountEditorScreen 編輯模式 | `no11_account_list_screen` | UI | T1 | P1 | A | — |
| R-CM-049 | 帳戶編輯器標題依模式顯示新增帳戶或編輯帳戶 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-050 | 帳戶名稱為空時完成按鈕不可點按 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-051 | 帳戶名稱達長度上限即時阻擋輸入不再更新 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-052 | 帳戶名稱前後空白於寫入時去除 | `no12_account_editor_screen` | DB | T2 | P1 | A | — |
| R-CM-053 | 帳戶名稱全為空白視為空由完成按鈕必填閘擋下 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-054 | 帳戶不查重可與既有帳戶同名建立成功 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-055 | 幣別選擇器收合顯示 `alphabeticCode` 與 `name` | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-056 | 幣別展開為可搜尋清單輸入文字即時篩選 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-057 | 新增模式初始幣別為使用者 Base Currency | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-058 | 編輯模式幣別選擇器不可展開不可修改 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-059 | 帳戶圖示網格為 `tags` 含 `account` 的圖示清單 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-060 | 新增模式初始選取圖示網格第一筆 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-061 | 帳戶圖示網格為空時初始選取內建後備圖示 | `no12_account_editor_screen` | UI | T4 | P2 | 無 | 圖示來源打包 JSON 常數，執行期無法清空 |
| R-CM-062 | 選擇幣別項目後收合選擇器並更新顯示 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-063 | 帳戶編輯器點按圖示即時更新預覽 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-064 | 新增帳戶成功呼叫 showUndo 並返回上一頁 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-065 | 編輯帳戶保存成功呼叫 showUndo 並返回上一頁 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-066 | 帳戶編輯僅編輯模式顯示停用開關與刪除按鈕 | `no12_account_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-067 | 點按刪除帳戶按鈕先顯示刪除確認對話框 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-068 | 確認刪除帳戶成功後呼叫 showUndo 並返回上一頁 | `no12_account_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-069 | 帳戶建立或更新失敗顯示錯誤提示 | `no12_account_editor_screen` | UI | T4 | P2 | 無 | 必填與長度閘於畫面先擋失敗路徑 UI 不可達 |
| R-CM-070 | createAccount 名稱去空白後超上限回傳驗證失敗 | `no15_account_logic` | UI | T4 | P2 | 無 | 畫面即時阻擋先行後備閘不可達且匯入路徑屬他段 |
| R-CM-071 | 新增帳戶寫入 `Accounts` 一筆且 `iconId` 引用 account 圖示 | `no15_account_logic` | DB | T2 | P1 | A | — |
| R-CM-072 | 新增非主要貨幣帳戶時種入該幣別佔位匯率 | `no15_account_logic` | DB | T2 | P0 | A | — |
| R-CM-073 | 新增主要貨幣帳戶不種入佔位匯率 | `no15_account_logic` | DB | T2 | P2 | A | — |
| R-CM-074 | 編輯帳戶保存後 DB 的名稱與圖示更新 | `no15_account_logic` | DB | T2 | P1 | A | — |
| R-CM-075 | 停用帳戶保存後 DB 的 `disabledOn` 寫入 | `no15_account_logic` | DB | T2 | P1 | A | — |
| R-CM-076 | 刪除帳戶軟刪除 `Accounts` 記錄 | `no15_account_logic` | DB | T2 | P0 | A | — |
| R-CM-077 | 刪除帳戶串聯軟刪除該帳戶所屬 `Transactions` | `no15_account_logic` | DB | T2 | P0 | A | — |
| R-CM-078 | 刪除帳戶串聯軟刪除其為轉出或轉入方的 `Transfers` | `no15_account_logic` | DB | T2 | P0 | A | — |
| R-CM-079 | 拖拉重排帳戶批次更新排序欄位且持久保存 | `no15_account_logic` | UI+DB | T2 | P1 | A | — |
| R-CM-080 | 合併來源與目標相同時完成按鈕不可點按 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-081 | 目標項目圖示以主色強調表示保留端 | `no13_merge_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-082 | 來源與目標相同時外框以錯誤色標示衝突 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-083 | 雙選擇器常駐同框並排顯示不另彈出清單 | `no13_merge_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-084 | 來源選擇器列出全部未停用項目停用項不列 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-085 | 來源選擇器初始為清單第一項 | `no13_merge_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-086 | 類別模式目標僅列與來源同型別未停用類別 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-087 | 帳戶模式目標僅列與來源同幣別未停用帳戶 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-088 | 目標初始為相容清單首個不等於來源的項目 | `no13_merge_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-089 | 變更來源致目標不相容時目標重置為首個非來源項 | `no13_merge_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-090 | 相容清單僅來源一項時目標維持來源呈衝突 | `no13_merge_editor_screen` | UI | T1 | P2 | A | — |
| R-CM-091 | 帳戶模式完成合併成功呼叫 showUndo 並返回 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-092 | 類別模式完成合併成功呼叫 showUndo 並返回 | `no13_merge_editor_screen` | UI | T1 | P1 | A | — |
| R-CM-093 | 合併失敗顯示錯誤提示 | `no13_merge_editor_screen` | UI | T4 | P2 | 無 | 目標清單已濾不相容項失敗路徑 UI 不可達 |
| R-CM-094 | mergeAccounts 來源目標幣別不同回傳錯誤中止 | `no16_merge_logic` | UI+DB | T4 | P0 | 無 | UI 目標僅列同幣別前置檢查不可達 |
| R-CM-095 | 合併帳戶後來源全部 `Transactions` 改屬目標 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-096 | 合併帳戶後來源為轉出或轉入方 `Transfers` 改為目標 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-097 | 合併後轉出轉入相同的 `Transfers` 軟刪除 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-098 | 合併帳戶後來源 `Accounts` 記錄軟刪除 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-099 | mergeCategories 來源目標 `type` 不同回傳錯誤中止 | `no16_merge_logic` | UI+DB | T4 | P0 | 無 | UI 目標僅列同型別前置檢查不可達 |
| R-CM-100 | 合併類別後來源全部 `Transactions` 改屬目標 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-101 | 合併類別後來源 `Categories` 記錄軟刪除 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-102 | 復原合併清空來源 `deletedOn` 恢復來源 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-103 | 復原合併依快照逐 id 將 `Transactions` 移回來源 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-104 | 帳戶模式復原依快照將轉出轉入方改回來源 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-105 | 帳戶模式復原恢復合併時軟刪的冗餘 `Transfers` | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-CM-106 | 復原合併後目標原有記錄逐 id 比對維持不變 | `no16_merge_logic` | DB | T2 | P0 | A | — |

---

## 幣別與匯率

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-CU-001 | 進入主要貨幣畫面時目前選取貨幣置頂顯示 | `no19_base_currency_setting_screen` | UI | T1 | P2 | A | — |
| R-CU-002 | 進入後改選其他貨幣不重新排序，順序維持至離開畫面 | `no19_base_currency_setting_screen` | UI | T1 | P2 | A | — |
| R-CU-003 | 貨幣項目顯示 `alphabeticCode` 與 `name` | `no19_base_currency_setting_screen` | UI | T1 | P2 | A | — |
| R-CU-004 | 目前選取貨幣項目顯示選取標記 | `no19_base_currency_setting_screen` | UI | T1 | P2 | A | — |
| R-CU-005 | 點按關閉按鈕返回上一頁 | `no19_base_currency_setting_screen` | UI | T1 | P2 | A | — |
| R-CU-006 | 輸入搜尋文字依貨幣代碼或名稱即時篩選列表 | `no19_base_currency_setting_screen` | UI | T1 | P1 | A | — |
| R-CU-007 | 點按貨幣項目將其標為目前選取貨幣 | `no19_base_currency_setting_screen` | UI | T1 | P1 | A | — |
| R-CU-008 | 點按完成按鈕更新主要貨幣為所選並返回上一頁 | `no19_base_currency_setting_screen` | UI | T1 | P1 | A | — |
| R-CU-009 | 貨幣項目顯示 `alphabeticCode` 與 `name` 並帶後綴 chevron | `no20_currency_list_screen` | UI | T1 | P2 | A | — |
| R-CU-010 | 點按返回按鈕返回上一頁 | `no20_currency_list_screen` | UI | T1 | P2 | A | — |
| R-CU-011 | 輸入搜尋文字依貨幣代碼或名稱即時篩選列表 | `no20_currency_list_screen` | UI | T1 | P1 | A | — |
| R-CU-012 | 點按貨幣項目導航至貨幣顯示格式畫面 | `no20_currency_list_screen` | UI | T1 | P1 | A | — |
| R-CU-013 | 無搜尋結果時顯示找不到結果空狀態 | `no20_currency_list_screen` | UI | T1 | P2 | A | — |
| R-CU-014 | 導覽列標題顯示貨幣代碼，內文顯示貨幣 `name` | `no21_currency_detail_config_screen` | UI | T1 | P2 | A | — |
| R-CU-015 | 千分位開關開啟時顯示啟用狀態說明文字 | `no21_currency_detail_config_screen` | UI | T1 | P2 | A | — |
| R-CU-016 | 千分位開關關閉時顯示標準顯示說明文字 | `no21_currency_detail_config_screen` | UI | T1 | P2 | A | — |
| R-CU-017 | 小數位數選項固定為 0 至 3，目前選取位數帶選取標記 | `no21_currency_detail_config_screen` | UI | T1 | P2 | A | — |
| R-CU-018 | 重置為預設值列顯示該貨幣預設位數 | `no21_currency_detail_config_screen` | UI | T1 | P2 | A | — |
| R-CU-019 | 切換千分位開關即時更新目前千分位設定 | `no21_currency_detail_config_screen` | UI | T1 | P1 | A | — |
| R-CU-020 | 點按小數位數選項將其標為目前選取位數 | `no21_currency_detail_config_screen` | UI | T1 | P1 | A | — |
| R-CU-021 | 點按重置為預設值將選取位數回復為該貨幣預設位數 | `no21_currency_detail_config_screen` | UI | T1 | P1 | A | — |
| R-CU-022 | 點按完成套用顯示格式設定並返回上一頁 | `no21_currency_detail_config_screen` | UI | T1 | P1 | A | — |
| R-CU-023 | 點按關閉按鈕返回上一頁 | `no21_currency_detail_config_screen` | UI | T1 | P2 | A | — |
| R-CU-024 | 匯率列格式為 `1 主要貨幣代碼 = 數值 外幣代碼` | `no22_currency_rate_list_screen` | UI | T1 | P1 | A | — |
| R-CU-025 | 匯率數值依大小動態決定小數位，至少四位有效數字 | `no22_currency_rate_list_screen` | UI | T1 | P2 | A | — |
| R-CU-026 | 尚未設定任何匯率時顯示空狀態提示 | `no22_currency_rate_list_screen` | UI | T3 | P2 | A | 全新安裝僅建主要貨幣帳戶 |
| R-CU-027 | 點按返回按鈕返回上一頁 | `no22_currency_rate_list_screen` | UI | T1 | P2 | A | — |
| R-CU-028 | 輸入搜尋文字依外幣或主要貨幣代碼即時篩選列表 | `no22_currency_rate_list_screen` | UI | T1 | P2 | A | — |
| R-CU-029 | 點按匯率項目導航至匯率編輯器 | `no22_currency_rate_list_screen` | UI | T1 | P1 | A | — |
| R-CU-030 | 自編輯畫面返回時重新載入列表反映變動 | `no22_currency_rate_list_screen` | UI | T1 | P1 | A | — |
| R-CU-031 | 無搜尋結果時顯示找不到結果空狀態 | `no22_currency_rate_list_screen` | UI | T1 | P2 | A | — |
| R-CU-032 | 未指定幣別對開啟時為新增模式 | `no23_currency_rate_editor_screen` | UI | T4 | P2 | 無 | 匯率新增模式無 UI 入口 |
| R-CU-033 | 由匯率列表點選幣別對開啟時為更新模式 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-034 | 輸入欄位未填妥時完成按鈕不可點按 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-035 | 來源幣別鎖定為主要貨幣不可修改 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-036 | 新增模式點按目標幣別開啟幣別選擇 modal | `no23_currency_rate_editor_screen` | UI | T4 | P1 | 無 | 依賴新增模式，UI 無入口 |
| R-CU-037 | 更新模式目標幣別不可修改 | `no23_currency_rate_editor_screen` | UI | T1 | P2 | A | — |
| R-CU-038 | modal 幣別清單可搜尋，無結果依政策顯示空狀態 | `no23_currency_rate_editor_screen` | UI | T4 | P2 | 無 | 依賴新增模式幣別 modal，UI 無入口 |
| R-CU-039 | 點按 modal 幣別選項套用為目標幣別並關閉 modal | `no23_currency_rate_editor_screen` | UI | T4 | P1 | 無 | 依賴新增模式幣別 modal，UI 無入口 |
| R-CU-040 | 來源金額輸入框預設值為 1 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-041 | 更新模式目標金額預填 1 單位主要貨幣對應外幣數量 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-042 | 金額輸入即時只接受數字與單一小數點，其餘輸入不更新 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-043 | 金額輸入達字元上限即時阻擋，輸入不再更新 | `no23_currency_rate_editor_screen` | UI | T1 | P2 | A | — |
| R-CU-044 | 點按完成寫入匯率，成功時返回上一頁 | `no23_currency_rate_editor_screen` | UI | T1 | P1 | A | — |
| R-CU-045 | 寫入操作失敗時顯示錯誤提示 | `no23_currency_rate_editor_screen` | UI | T4 | P1 | 無 | 僅 DB 故障 throw，需故障注入 |
| R-CU-046 | 點按關閉按鈕返回上一頁 | `no23_currency_rate_editor_screen` | UI | T1 | P2 | A | — |
| R-CU-047 | 系統依幣別對回傳最新有效之主單位對主單位匯率 | `no7_currency_conversion_logic` | UI+DB | T2 | P0 | A | — |
| R-CU-048 | 匯率查找僅查直接記錄，不經中間幣別接力換算 | `no7_currency_conversion_logic` | UI+DB | T4 | P2 | 無 | jest currencyService 覆蓋無記錄回 1 不接力 |
| R-CU-049 | 幣別對無任何匯率記錄時回傳匯率 1 | `no7_currency_conversion_logic` | UI+DB | T3 | P1 | A | 匯入建立僅含交易的外幣帳戶 |
| R-CU-050 | 最新記錄為反向交易對時回傳其匯率倒數 | `no7_currency_conversion_logic` | UI+DB | T2 | P0 | A | — |
| R-CU-051 | 多筆記錄依生效時點倒序，取最新生效時點者 | `no7_currency_conversion_logic` | UI+DB | T2 | P0 | A | — |
| R-CU-052 | 同一生效時點多筆並存時以更新時間最新者為準 | `no7_currency_conversion_logic` | UI+DB | T2 | P0 | A | — |
| R-CU-053 | 匯率列表蒐集帳戶使用之外幣並去重，同幣別多帳戶僅一列 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-054 | 主要貨幣不出現在匯率列表 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-055 | 新建非主要貨幣帳戶時種入一筆匯率值 1 佔位記錄 | `no7_currency_conversion_logic` | UI+DB | T2 | P1 | A | — |
| R-CU-056 | 幣別對已有記錄時新建帳戶不重複種入佔位匯率 | `no7_currency_conversion_logic` | DB | T2 | P1 | A | — |
| R-CU-057 | 匯入不種入佔位匯率，跨幣別匯率僅由轉帳連動產生 | `no7_currency_conversion_logic` | DB | T2 | P2 | A | — |
| R-CU-058 | 手動新增匯率值為零時驗證失敗並提示原因 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-059 | 匯率為負數非數值或無限大時守門拒絕寫入 | `no7_currency_conversion_logic` | DB | T4 | P2 | 無 | 輸入過濾使該類值手動無法輸入 |
| R-CU-060 | 匯率無單一寫死上限，位數上限內高量級值可寫入 | `no7_currency_conversion_logic` | UI | T1 | P2 | A | — |
| R-CU-061 | 匯率驗證通過後新增一筆記錄至 `CurrencyRates` 表 | `no7_currency_conversion_logic` | DB | T2 | P0 | A | — |
| R-CU-062 | 轉出轉入帳戶皆在已選清單內之轉帳不顯示 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-063 | 轉出轉入帳戶皆不在已選清單之轉帳不顯示 | `no7_currency_conversion_logic` | UI | T1 | P2 | A | — |
| R-CU-064 | 僅轉出在清單且轉出幣別非主要貨幣時換算顯示支出 | `no7_currency_conversion_logic` | UI | T1 | P0 | A | — |
| R-CU-065 | 僅轉出在清單且轉出幣別為主要貨幣時以原金額顯示支出 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-066 | 僅轉入在清單且轉入幣別非主要貨幣時換算顯示收入 | `no7_currency_conversion_logic` | UI | T1 | P0 | A | — |
| R-CU-067 | 僅轉入在清單且轉入幣別為主要貨幣時以原金額顯示收入 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-068 | 無使用者設定時小數位取該貨幣 `minorUnits`，JPY 為 0 | `no7_currency_conversion_logic` | UI | T1 | P2 | A | — |
| R-CU-069 | 未知貨幣 `minorUnits` fallback 為 2，無任何貨幣特例 | `no7_currency_conversion_logic` | UI | T4 | P2 | 無 | 貨幣清單內建固定，手動造不出未知貨幣 |
| R-CU-070 | `minorUnits` 僅影響顯示，儲存縮放固定乘一萬 | `no7_currency_conversion_logic` | DB | T2 | P0 | A | — |
| R-CU-071 | 使用者設定之 `decimalPlaces` 優先於預設小數位生效 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-072 | TWD 無使用者設定時顯示小數位預設為 0 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-073 | TWD 經使用者設定 `decimalPlaces` 後覆寫例外 0 | `no7_currency_conversion_logic` | UI | T1 | P2 | A | — |
| R-CU-074 | 貨幣無對應 id 時回傳小數位 2 且千分位關閉 | `no7_currency_conversion_logic` | UI | T4 | P2 | 無 | 貨幣清單內建固定，手動造不出無 id 貨幣 |
| R-CU-075 | 無 CurrencyConfig 時千分位預設關閉 | `no7_currency_conversion_logic` | UI | T1 | P2 | A | — |
| R-CU-076 | 千分位啟用時金額先除以一千以 K 模式顯示 | `no7_currency_conversion_logic` | UI | T1 | P1 | A | — |
| R-CU-077 | 匯率查找換算與金額格式化皆純本地，斷網照常運作 | `no7_currency_conversion_logic` | UI | T3 | P2 | A | 斷網後執行換算與格式化操作驗證 |

---

## 匯入匯出與備份

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-IE-001 | 資料管理列表分匯入匯出清除三組且無分組標題 | `no14_data_management_screen` | UI | T1 | P2 | A | — |
| R-IE-002 | 資料管理點按返回按鈕返回上一頁 | `no14_data_management_screen` | UI | T1 | P2 | A | — |
| R-IE-003 | 點按匯入收入支出導航至匯入精靈交易模式 | `no14_data_management_screen` | UI | T1 | P1 | A | — |
| R-IE-004 | 點按匯入轉帳導航至匯入精靈轉帳模式 | `no14_data_management_screen` | UI | T1 | P1 | A | — |
| R-IE-005 | 匯出操作中阻擋重複觸發直到完成 | `no14_data_management_screen` | UI | T3 | P2 | A | 灌大量資料延長匯出時間 |
| R-IE-006 | 無交易資料時匯出收入支出顯示無資料對話框 | `no21_data_transfer_logic` | UI | T3 | P2 | A | 清除資料庫佈置空庫 |
| R-IE-007 | 無轉帳資料時匯出轉帳顯示無資料對話框 | `no21_data_transfer_logic` | UI | T3 | P2 | A | 清除資料庫佈置空庫 |
| R-IE-008 | 匯出失敗顯示匯出失敗對話框 | `no14_data_management_screen` | UI | T4 | P2 | 無 | 需故障注入製造匯出失敗 |
| R-IE-009 | 點按清除資料庫先顯示確認對話框 | `no14_data_management_screen` | UI | T1 | P0 | A | — |
| R-IE-010 | 取消清除確認後資料保持不變 | `no14_data_management_screen` | UI+DB | T2 | P0 | A | — |
| R-IE-011 | 確認清除成功後顯示已清除並提示重啟對話框 | `no14_data_management_screen` | UI+DB | T2 | P0 | A | — |
| R-IE-012 | 清除失敗顯示清除失敗對話框 | `no14_data_management_screen` | UI | T4 | P2 | 無 | 需故障注入製造清除失敗 |
| R-IE-013 | 匯入精靈以 Modal 呈現兩模式共用四步流程 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-014 | 選擇檔案步驟左動作為關閉其餘步驟為返回 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-015 | Header 標題隨步驟切換顯示對應步驟名 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-016 | 預覽步驟右動作為送出其餘步驟為前進 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-017 | 當前步驟驗證未通過時右動作不可點按 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-018 | 來源時區選擇器常駐展開預設帶目前偏好時區 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-019 | 點按關閉關閉整個 Modal | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-020 | 點按返回回到上一步驟 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-021 | 選擇非 CSV 檔案顯示僅支援 CSV 格式對話框 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-022 | 讀取檔案錯誤顯示讀取檔案失敗對話框 | `no21_data_transfer_logic` | UI | T4 | P2 | 無 | 需注入檔案讀取故障 |
| R-IE-023 | 選擇有效 CSV 後解析並顯示檔案名稱 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-024 | 系統依欄位型別合規性自動建議欄位對應 | `no21_data_transfer_logic` | UI | T1 | P1 | A | 可選欄空值視為合規、全空欄亦入候選；必填欄整欄合規才入候選，見 R-IE-067 |
| R-IE-025 | 欄位對應每系統欄位一列並帶必填標記 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-026 | 無符合格式可用欄位時顯示無符合欄位提示 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-027 | 選擇 CSV 欄位更新該系統欄位對應 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-028 | 帳戶比對相符時動作選項為沿用新建跳過 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-029 | 無相符帳戶時動作選項僅新建與跳過 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-030 | 交易模式顯示收支類別比對段轉帳模式不顯示 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-031 | 同名分屬收支的類別分列於支出段與收入段 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-032 | 選擇比對動作更新該帳戶或類別匯入動作 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-033 | 帳戶相符須名稱與幣別皆相同才可沿用 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-034 | 同名不同幣別 CSV 帳戶各自獨立一列比對 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-035 | 比對限當前使用者活躍紀錄排除已軟刪項 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-036 | 比對排除其他使用者的帳戶與類別 | `no21_data_transfer_logic` | UI | T1 | P1 | B | — |
| R-IE-037 | 預覽摘要顯示共匯入新增帳戶與略過筆數 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-038 | 預覽新增類別數僅交易模式顯示 | `no15_import_wizard_screen` | UI | T1 | P2 | A | — |
| R-IE-039 | 送出後操作中顯示載入狀態 | `no15_import_wizard_screen` | UI | T3 | P2 | A | 灌大量資料延長匯入時間 |
| R-IE-040 | 匯入成功顯示筆數對話框確認後關閉 Modal | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-041 | 匯入失敗顯示匯入失敗對話框 | `no15_import_wizard_screen` | UI | T4 | P2 | 無 | 需故障注入製造匯入失敗 |
| R-IE-042 | 交易 CSV 欄序為日期類別帳戶金額幣別備註 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-043 | 轉帳 CSV 欄序為日期轉出戶幣額轉入戶幣額備註 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-044 | 日期僅含日期時時間預設為 `00:00:00` | `no15_import_wizard_screen` | DB | T2 | P1 | A | — |
| R-IE-045 | 金額正值匯入為收入負值匯入為支出 | `no21_data_transfer_logic` | UI+DB | T2 | P0 | A | — |
| R-IE-046 | 金額以句點小數最多接受 4 位 | `no15_import_wizard_screen` | DB | T2 | P1 | A | — |
| R-IE-047 | 幣別代碼比對不分大小寫 | `no15_import_wizard_screen` | DB | T2 | P1 | A | — |
| R-IE-048 | 備註為可選欄空值列仍可匯入 | `no15_import_wizard_screen` | DB | T2 | P2 | A | — |
| R-IE-049 | 跨幣別轉帳缺轉入金額的列匯入時略過 | `no21_data_transfer_logic` | UI+DB | T2 | P0 | A | — |
| R-IE-050 | 同幣別轉帳省略轉入金額的列可匯入 | `no15_import_wizard_screen` | DB | T2 | P1 | A | — |
| R-IE-051 | 下載範本除標頭附合法範例列 | `no15_import_wizard_screen` | UI | T1 | P1 | A | — |
| R-IE-052 | 範本範例列原樣重匯可成功匯入不略過 | `no15_import_wizard_screen` | UI+DB | T2 | P1 | A | — |
| R-IE-053 | 下載範本觸發系統分享面板 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-054 | 交易範本檔名為 `$wish_transaction_template.csv` | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-055 | 轉帳範本檔名為 `$wish_transfer_template.csv` | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-056 | 下載說明觸發系統分享面板 | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-057 | 說明檔列各欄位名稱與必填或可選標示 | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-058 | 說明檔附注意事項段涵蓋略過與格式規則 | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-059 | 交易說明檔名為 `$wish_transaction_guide.txt` | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-060 | 轉帳說明檔名為 `$wish_transfer_guide.txt` | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-061 | 下載範本或說明失敗顯示下載失敗對話框 | `no15_import_wizard_screen` | UI | T4 | P2 | 無 | 需故障注入製造分享失敗 |
| R-IE-062 | 匯入建立標記新建的帳戶與類別 | `no21_data_transfer_logic` | UI+DB | T2 | P0 | A | — |
| R-IE-063 | 同名不同幣別帳戶各自建立且採該列幣別 | `no21_data_transfer_logic` | DB | T2 | P0 | A | — |
| R-IE-064 | 日期含時區偏移後綴優先以內嵌偏移解析 | `no21_data_transfer_logic` | DB | T2 | P1 | A | — |
| R-IE-065 | 無偏移後綴日期依所選來源時區解析 | `no21_data_transfer_logic` | DB | T2 | P1 | A | — |
| R-IE-066 | 每列配新主鍵匯出檔重匯新增獨立紀錄 | `no21_data_transfer_logic` | DB | T2 | P0 | A | — |
| R-IE-067 | 必填欄位含空值或非法格式的欄整欄不入候選 | `no21_data_transfer_logic` | UI | T1 | P0 | A | 守門尺管格式與儲存精度；超界金額屬存檔驗證，見 R-BS-078 |
| R-IE-068 | 日期解析失敗的列略過並計入略過數 | `no21_data_transfer_logic` | UI+DB | T2 | P0 | A | 金額格式壞值由欄位守門擋於對應，不進執行階段 |
| R-IE-069 | 比對動作選跳過的帳戶其資料列計入略過 | `no21_data_transfer_logic` | UI+DB | T2 | P1 | A | — |
| R-IE-070 | 文字欄位含逗號以雙引號包覆可正確匯入 | `no21_data_transfer_logic` | DB | T2 | P1 | A | — |
| R-IE-071 | 名稱前後空白於比對與匯入時忽略 | `no21_data_transfer_logic` | DB | T2 | P1 | A | — |
| R-IE-072 | 匯出僅含當前使用者活躍紀錄排除軟刪 | `no21_data_transfer_logic` | UI | T2 | P0 | A | — |
| R-IE-073 | 匯出以帳戶與類別名稱輸出而非識別碼 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-074 | 匯出欄位標頭與順序同範本可原樣重匯 | `no21_data_transfer_logic` | UI+DB | T2 | P0 | A | — |
| R-IE-075 | 匯出時間欄位帶 UTC 偏移字串 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-076 | 匯出金額以儲存精度輸出不依幣別截斷 | `no21_data_transfer_logic` | UI | T3 | P1 | A | `sqlite` 注入逾幣別小數位金額 |
| R-IE-077 | 匯出檔名依類型為 `transactions_` 或 `transfers_` 加時間戳 | `no21_data_transfer_logic` | UI | T1 | P2 | A | — |
| R-IE-078 | 匯出成功觸發系統分享面板 | `no21_data_transfer_logic` | UI | T1 | P1 | A | — |
| R-IE-079 | 備份上傳六集合至 `users/{uid}/{collection}` | `no19_transaction_backup_logic` | FB | T2 | P0 | B | — |
| R-IE-080 | LEVEL_0 也備份不受 analyticsConsent 影響 | `no19_transaction_backup_logic` | FB | T2 | P1 | B | — |
| R-IE-081 | 備份單向上傳無使用者端取回介面 | `no19_transaction_backup_logic` | UI | T1 | P2 | A | — |
| R-IE-082 | 備份不使用 Firestore Real-time listener | `no19_transaction_backup_logic` | LOG | T4 | P2 | 無 | 內部實作黑箱不可觀察 |
| R-IE-083 | App 啟動與重新登入觸發備份 | `no19_transaction_backup_logic` | LOG | T2 | P1 | B | — |
| R-IE-084 | 無登入使用者時備份直接返回 | `no19_transaction_backup_logic` | LOG | T2 | P2 | A | — |
| R-IE-085 | 備份進行中重入直接返回 | `no19_transaction_backup_logic` | LOG | T3 | P2 | B | 灌大量資料延長備份再重入觸發 |
| R-IE-086 | 距上次備份未滿 5 分鐘冷卻直接返回 | `no19_transaction_backup_logic` | LOG | T3 | P1 | B | 調系統時鐘或等待 5 分鐘 |
| R-IE-087 | 備份起始時間記錄至裝置層級持久化儲存 | `no19_transaction_backup_logic` | LOG | T2 | P2 | B | — |
| R-IE-088 | 冷卻時間戳跨 App 重啟不重置 | `no19_transaction_backup_logic` | LOG | T3 | P1 | B | 備份後 5 分鐘內重啟 App 再觸發 |
| R-IE-089 | 冷卻時間戳跨使用者切換不重置 | `no19_transaction_backup_logic` | LOG | T3 | P1 | B | 備份後 5 分鐘內切換帳號觸發 |
| R-IE-090 | lastSyncedAt 為 per-user 各使用者獨立 | `no19_transaction_backup_logic` | DB | T2 | P1 | B | — |
| R-IE-091 | 配額寫入禁止時跳過上傳等跨日重置 | `no19_transaction_backup_logic` | LOG | T3 | P1 | B | 佈置當日寫入配額達上限 |
| R-IE-092 | 遠端探測查 transactions 集合最多取 1 筆 | `no19_transaction_backup_logic` | LOG | T2 | P2 | B | — |
| R-IE-093 | 探測失敗保守視為無資料走初次備份 | `no19_transaction_backup_logic` | LOG | T4 | P2 | 無 | 需注入 Firestore 查詢故障 |
| R-IE-094 | 遠端無資料時走初次全量上傳 | `no19_transaction_backup_logic` | LOG+FB | T2 | P1 | B | — |
| R-IE-095 | 遠端有資料時走增量上傳 | `no19_transaction_backup_logic` | LOG | T2 | P1 | B | — |
| R-IE-096 | 遠端有資料且 lastSyncedAt 空走全量 Delta | `no19_transaction_backup_logic` | LOG | T3 | P2 | B | `sqlite` 清除 lastSyncedAt 值 |
| R-IE-097 | 上傳採 upsert 冪等重傳不產生重複文件 | `no19_transaction_backup_logic` | FB | T2 | P0 | B | — |
| R-IE-098 | 初次備份六集合遠端與本機資料一致 | `no19_transaction_backup_logic` | FB | T2 | P0 | B | — |
| R-IE-099 | 依集合分批寫入每批 500 筆 | `no19_transaction_backup_logic` | LOG | T3 | P2 | B | 灌逾 500 筆資料觀察分批 |
| R-IE-100 | 上傳筆數累計至當日寫入配額 | `no19_transaction_backup_logic` | LOG | T2 | P2 | B | — |
| R-IE-101 | 備份寫入完成後更新 lastSyncedAt 為當下 | `no19_transaction_backup_logic` | DB | T2 | P1 | B | — |
| R-IE-102 | 增量以 lastSyncedAt 篩選六集合變更上傳 | `no19_transaction_backup_logic` | FB | T2 | P0 | B | — |
| R-IE-103 | 增量無變更跳過上傳不更新 lastSyncedAt | `no19_transaction_backup_logic` | LOG+DB | T2 | P1 | B | — |
| R-IE-104 | 斷網觸發備份不崩潰後續可重試 | `no19_transaction_backup_logic` | LOG | T3 | P2 | B | 斷網後觸發備份 |
| R-IE-105 | Firestore 配額錯誤不致 App 崩潰 | `no19_transaction_backup_logic` | LOG | T4 | P2 | 無 | 需注入 Firestore 配額錯誤 |

---

## 設定與偏好

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-ST-001 | 設定列表分組以空白間距區隔且不顯示分組標題文字 | `no8_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-002 | 設定列表第一組含類別管理帳戶管理資料管理三入口 | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-003 | 設定列表第二組含偏好設定入口 | `no8_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-004 | 未訂閱付費版時顯示升級至付費版入口 | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-005 | 已訂閱付費版時不顯示升級至付費版入口 | `no8_settings_screen` | UI | T3 | P1 | B | 後端 Firestore 種入付費 entitlement |
| R-ST-006 | App 版本號置中錨定於設定畫面底部 | `no8_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-007 | 列表內容不足一頁時版本號仍貼齊畫面底部 | `no8_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-008 | 列表內容超過一頁時版本號接於列表末端隨內容捲動 | `no8_settings_screen` | UI | T3 | P2 | A | 換小螢幕模擬器製造內容超頁 |
| R-ST-009 | 設定畫面點按返回按鈕返回上一頁 | `no8_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-010 | 點按類別管理導航至 CategoryListScreen | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-011 | 點按帳戶管理導航至 AccountListScreen | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-012 | 點按資料管理導航至 DataManagementScreen | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-013 | 點按偏好設定導航至 PreferenceScreen | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-014 | 點按升級至付費版導航至 PaywallScreen | `no8_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-015 | 啟動模式入口顯示當前啟動模式 | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-016 | 主要貨幣入口顯示當前主要貨幣代碼 | `no16_preference_screen` | UI | T1 | P1 | A | — |
| R-ST-017 | 語系入口顯示當前 App 語言 | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-018 | 時區入口顯示當前設定的時區 | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-019 | 週起始日入口顯示當前週起始日選項 | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-020 | 分析同意開關顯示 `analyticsConsent` 目前狀態 | `no16_preference_screen` | UI | T1 | P1 | A | — |
| R-ST-021 | 點按啟動模式導航至 LaunchModeSettingScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-022 | 點按主要貨幣導航至 BaseCurrencySettingScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-023 | 點按貨幣格式設定導航至 CurrencyListScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-024 | 點按匯率管理導航至 CurrencyRateListScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-025 | 點按語系導航至 LanguageSettingScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-026 | 點按時區導航至 TimeZoneSettingScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-027 | 點按週起始日導航至 WeekStartSettingScreen | `no16_preference_screen` | UI | T1 | P2 | A | — |
| R-ST-028 | 切換分析同意開關即時生效無確認步驟 | `no16_preference_screen` | UI | T1 | P1 | A | — |
| R-ST-029 | 點按登出顯示登出確認對話框 | `no16_preference_screen` | UI | T1 | P1 | B | — |
| R-ST-030 | 登出對話框預告他帳號登入可清除本機資料且不可復原 | `no16_preference_screen` | UI | T1 | P1 | B | — |
| R-ST-031 | 確認登出且操作成功後導航至 LoginScreen | `no16_preference_screen` | UI | T1 | P1 | B | — |
| R-ST-032 | 登出操作失敗顯示錯誤提示 | `no16_preference_screen` | UI | T4 | P2 | 無 | 登出失敗提示僅 keychain 錯誤可誘發 |
| R-ST-033 | 主題設定以 Modal 呈現且偏好設定畫面無其入口 | `no17_theme_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-034 | 當前已選主題卡片右上顯示勾選圖示標示選中 | `no17_theme_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-035 | 點按主題卡片僅更新選取標示不即時套用主題 | `no17_theme_settings_screen` | UI | T1 | P2 | A | — |
| R-ST-036 | 主題設定點按關閉按鈕關閉 Modal 且不套用變更 | `no17_theme_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-037 | 主題設定點按完成套用選取主題並關閉 Modal | `no17_theme_settings_screen` | UI | T1 | P1 | A | — |
| R-ST-038 | 啟動模式列表含首頁新增支出新增收入新增轉帳四選項 | `no18_launch_mode_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-039 | 目前選取的啟動模式顯示選取標記 | `no18_launch_mode_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-040 | 啟動模式點按關閉返回上一頁且設定不變 | `no18_launch_mode_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-041 | 啟動模式點按完成儲存選取模式並返回上一頁 | `no18_launch_mode_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-042 | 語系列表提供 20 個支援語系依 BCP 47 代碼識別 | `no24_language_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-043 | 進入語系畫面選取語系置頂其餘依原生名稱字母序 | `no24_language_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-044 | 改選其他語系後列表不重新排序順序維持至離開畫面 | `no24_language_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-045 | 語系項目以原生名稱呈現不附中文譯名 | `no24_language_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-046 | 語系搜尋依語系代碼或原生名稱即時篩選列表 | `no24_language_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-047 | 語系搜尋無結果顯示找不到結果空狀態 | `no24_language_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-048 | 點按語系選項僅標為選取未按完成不生效 | `no24_language_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-049 | 語系畫面點按完成套用選取語系並返回上一頁 | `no24_language_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-050 | 語系畫面點按關閉返回上一頁且語系不變 | `no24_language_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-051 | 時區項目顯示城市名稱與 UTC 偏移 | `no25_time_zone_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-052 | 進入時區畫面目前選取時區置頂 | `no25_time_zone_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-053 | 改選其他時區後列表不重新排序順序維持至離開畫面 | `no25_time_zone_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-054 | 時區搜尋依時區名稱或城市名稱即時篩選列表 | `no25_time_zone_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-055 | 點按時區項目僅標為選取未按完成不生效 | `no25_time_zone_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-056 | 時區畫面點按完成儲存選取時區並返回上一頁 | `no25_time_zone_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-057 | 時區畫面點按關閉返回上一頁且時區不變 | `no25_time_zone_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-058 | 週起始日選項為跟隨語系週日週一三項 | `no27_week_start_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-059 | 跟隨語系選項依當前語系慣例決定週起始日 | `no27_week_start_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-060 | 目前選取的週起始日選項顯示選取標記 | `no27_week_start_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-061 | 週起始日點按完成儲存選取選項並返回上一頁 | `no27_week_start_setting_screen` | UI | T1 | P1 | A | — |
| R-ST-062 | 週起始日點按關閉返回上一頁且設定不變 | `no27_week_start_setting_screen` | UI | T1 | P2 | A | — |
| R-ST-063 | App 啟動時讀取 `Settings` 表 `theme` 並套用對應主題 | `no5_settings_management` | UI+DB | T2 | P1 | A | — |
| R-ST-064 | `theme` 不存在時採用固定預設主題 `theme1` | `no5_settings_management` | UI+DB | T3 | P2 | A | sqlite 清空 `theme` 欄位後重啟 |
| R-ST-065 | switchTheme 即時套用主題並非同步寫入 `Settings` 表 | `no5_settings_management` | UI+DB | T2 | P1 | A | — |
| R-ST-066 | switchTheme 委派上傳帶入 `theme` 欄位 | `no18_preference_upload_logic` | FB | T2 | P2 | B | — |
| R-ST-067 | setLaunchMode 更新 `Settings` 表 `launchMode` 為目標值 | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-068 | setLaunchMode 委派上傳帶入 `launchMode` 欄位 | `no5_settings_management` | FB | T2 | P2 | B | — |
| R-ST-069 | setBaseCurrency 更新 `Settings` 表 `baseCurrencyId` | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-070 | 換主幣時為異幣別既有帳戶種入對新主幣佔位匯率 | `no5_settings_management` | DB | T2 | P0 | A | — |
| R-ST-071 | 已有匯率紀錄的幣別不重複種入佔位匯率 | `no5_settings_management` | DB | T2 | P0 | A | — |
| R-ST-072 | setBaseCurrency 委派上傳帶入 `baseCurrencyId` 欄位 | `no5_settings_management` | FB | T2 | P2 | B | — |
| R-ST-073 | setLanguage 更新 `Settings` 表並即時切換介面語系 | `no5_settings_management` | UI+DB | T2 | P1 | A | — |
| R-ST-074 | setLanguage 委派上傳帶入 `language` 欄位 | `no5_settings_management` | FB | T2 | P2 | B | — |
| R-ST-075 | setTimeZone 更新 `Settings` 表 `timeZone` 為目標值 | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-076 | setTimeZone 委派上傳帶入 `timeZone` 欄位 | `no5_settings_management` | FB | T2 | P2 | B | — |
| R-ST-077 | setWeekStart 更新 `Settings` 表 `weekStart` 為目標值 | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-078 | setWeekStart 委派上傳帶入 `weekStart` 欄位 | `no5_settings_management` | FB | T2 | P2 | B | — |
| R-ST-079 | setAnalyticsConsent 更新 `Settings` 表 `analyticsConsent` | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-080 | setAnalyticsConsent 委派上傳帶入 `analyticsConsent` 欄位 | `no5_settings_management` | FB | T2 | P2 | B | — |
| R-ST-081 | setCurrencyFormat 有紀錄時更新小數位數與千分位設定 | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-082 | setCurrencyFormat 無紀錄時新增 `CurrencyConfig` 紀錄 | `no5_settings_management` | DB | T2 | P1 | A | — |
| R-ST-083 | resetCurrencyFormat 將 `decimalPlaces` 設 Null 回歸預設位數 | `no5_settings_management` | UI+DB | T2 | P1 | A | — |
| R-ST-084 | resetCurrencyFormat 無紀錄時新增位數 Null 千分位 false 紀錄 | `no5_settings_management` | DB | T2 | P2 | A | — |
| R-ST-085 | 偏好只上傳不下載雲端偏好值永不回套本機 | `no18_preference_upload_logic` | DB+FB | T3 | P1 | B | Firestore 注入異值驗本機不變 |
| R-ST-086 | 多裝置各自上傳偏好接受最後寫入覆寫 | `no18_preference_upload_logic` | FB | T4 | P2 | 無 | 需多實體裝置同帳號並行操作 |
| R-ST-087 | 偏好上傳全 user 適用不做 Premium 篩選 | `no18_preference_upload_logic` | FB | T2 | P2 | B | — |
| R-ST-088 | 無登入使用者時跳過雲端寫入且不報錯 | `no18_preference_upload_logic` | LOG | T2 | P2 | A | — |
| R-ST-089 | 偏好上傳以 dot notation 逐欄更新不覆寫整個物件 | `no18_preference_upload_logic` | FB | T2 | P1 | B | — |
| R-ST-090 | `baseCurrencyId` 上傳為遠端 `currency` 且轉 ISO 4217 字串 | `no18_preference_upload_logic` | FB | T2 | P1 | B | — |
| R-ST-091 | 幣別 ID 無法解析時略過 `currency` 欄位不寫入 | `no18_preference_upload_logic` | FB | T3 | P2 | B | sqlite 注入非法 `baseCurrencyId` |
| R-ST-092 | `timeZone` 上傳為遠端欄位 `timezone` 值直送 | `no18_preference_upload_logic` | FB | T2 | P2 | B | — |
| R-ST-093 | `launchMode` 非法值上傳前正規化為 `home` | `no18_preference_upload_logic` | FB | T3 | P2 | B | sqlite 注入非法 `launchMode` 值 |
| R-ST-094 | `weekStart` 非法值上傳前正規化為 `auto` | `no18_preference_upload_logic` | FB | T3 | P2 | B | sqlite 注入非法 `weekStart` 值 |
| R-ST-095 | `analyticsConsent` 為 Null 時視為 true 上傳 | `no18_preference_upload_logic` | FB | T3 | P2 | B | sqlite 注入 Null `analyticsConsent` |
| R-ST-096 | `theme` 與 `language` 欄位名與值皆直送上傳 | `no18_preference_upload_logic` | FB | T2 | P2 | B | — |
| R-ST-097 | 轉換後為空值或 Null 的欄位略過不寫入 | `no18_preference_upload_logic` | FB | T3 | P2 | B | sqlite 注入空值偏好欄位 |
| R-ST-098 | 每次偏好上傳自動更新文件根層 `updatedAt` 為當下時間 | `no18_preference_upload_logic` | FB | T2 | P2 | B | — |
| R-ST-099 | Firestore 偏好寫入失敗僅記 log 不阻塞 UI | `no18_preference_upload_logic` | LOG+FB | T3 | P1 | B | 斷網或 rules 拒寫觸發寫入失敗 |
| R-ST-100 | uploadAllPreferences 全量上傳七偏好欄位本機實際值 | `no18_preference_upload_logic` | DB+FB | T2 | P1 | B | — |
| R-ST-101 | BigQuery mirror 不納入 preference 資料 | `no18_preference_upload_logic` | FB | T2 | P2 | B | — |

---

## 登入授權與配額

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-AU-001 | 登入畫面顯示 Google 登入按鈕 條款連結與版權文字 | `no1_login_screen` | UI | T1 | P1 | A | — |
| R-AU-002 | 登入操作中按鈕顯示載入狀態並停用點擊 | `no1_login_screen` | UI | T1 | P2 | A | — |
| R-AU-003 | 登入成功導航至 resolveLaunchDestination 決定的初始落點 | `no1_login_screen` | UI | T1 | P1 | B | — |
| R-AU-004 | 登入成功且付費牆攔截時導航至 PaywallScreen | `no1_login_screen` | UI | T3 | P2 | B | 設啟動模式為付費限定落點後重登 |
| R-AU-005 | Google Sign-In 連線或認證失敗顯示連線異常提示 | `no2_login_logout_logic` | UI | T3 | P1 | A | 斷網後點按登入 |
| R-AU-006 | Firebase Auth 驗證失敗顯示連線異常提示 | `no2_login_logout_logic` | UI | T4 | P2 | 無 | 兩步毫秒窗切網，競態手動不可盲觸 |
| R-AU-007 | 點按使用條款連結開啟外部使用條款頁面 | `no1_login_screen` | UI | T1 | P2 | A | — |
| R-AU-008 | 點按隱私政策連結開啟外部隱私政策頁面 | `no1_login_screen` | UI | T1 | P2 | A | — |
| R-AU-009 | 登出保留本地帳務資料不執行清除 | `no2_login_logout_logic` | DB | T2 | P0 | B | — |
| R-AU-010 | 登出清除本地登入憑證並返回登入畫面 | `no2_login_logout_logic` | UI | T1 | P1 | B | — |
| R-AU-011 | Firebase Auth 登出失敗仍將本地登入狀態清為登出 | `no2_login_logout_logic` | UI | T4 | P2 | 無 | 登出失敗僅罕見 keychain 錯誤，斷網不觸發 |
| R-AU-012 | 重登相同帳號委派全量 preference 上傳 | `no2_login_logout_logic` | FB | T2 | P1 | B | — |
| R-AU-013 | 重登相同帳號委派交易備份 runBackup | `no2_login_logout_logic` | FB | T2 | P1 | B | — |
| R-AU-014 | 重登不同帳號須明示選擇保留或清除不自動清除 | `no2_login_logout_logic` | UI | T3 | P0 | B | 準備第二測試帳號重登 |
| R-AU-015 | 換帳號選清除時硬重置清空本機資料庫全部紀錄不分 `userId` | `no2_login_logout_logic` | DB | T3 | P0 | B | 第二帳號選清除後對賬 sqlite |
| R-AU-016 | 換帳號清除不傳播雲端刪除標記不動前帳號雲端資料 | `no2_login_logout_logic` | FB | T3 | P0 | B | 選清除後對賬前帳號 Firestore |
| R-AU-017 | 換帳號選清除時清前帳號授權快取不動當前帳號那份 | `no2_login_logout_logic` | LOG | T3 | P0 | B | 前帳號注入授權快取後換帳號選清除 |
| R-AU-018 | 換帳號選保留時本機資料保留直接繼續 | `no2_login_logout_logic` | DB | T3 | P1 | B | 第二帳號登入選保留 |
| R-AU-019 | 清除後重建新帳號的 User 與 Settings 紀錄 | `no2_login_logout_logic` | DB | T3 | P1 | B | 第二帳號選清除後對賬 sqlite |
| R-AU-020 | 登入不等待 IAP 服務回應 IAP 不可用仍完成登入 | `no3_post_auth_logic` | UI | T1 | P1 | B | — |
| R-AU-021 | 本機無此帳號紀錄時建立本機 Users 與 Settings | `no3_post_auth_logic` | DB | T2 | P1 | B | — |
| R-AU-022 | Firestore `users/{uid}` 不存在時建立雲端用戶文件 | `no3_post_auth_logic` | FB | T2 | P1 | B | — |
| R-AU-023 | 雲端文件已存在時上傳本機 preference 實際值覆寫雲端 | `no3_post_auth_logic` | FB | T2 | P1 | B | — |
| R-AU-024 | 登入後不下載不套用雲端 preference | `no3_post_auth_logic` | DB+FB | T3 | P1 | B | Firestore 手改 preference 後重登比對本機 |
| R-AU-025 | 首登主要貨幣從裝置 Locale 推導查無則預設 TWD | `no3_post_auth_logic` | DB | T3 | P1 | B | 調 simulator 地區設定後首登 |
| R-AU-026 | 首登語系從 Locale 推導比對支援清單匹配則採該語系 | `no3_post_auth_logic` | UI | T3 | P1 | B | 調 simulator 語言後首登 |
| R-AU-027 | 首登語系未匹配 fallback en 不做語族內 fallback | `no3_post_auth_logic` | UI | T3 | P2 | B | 設不支援語言後首登 |
| R-AU-028 | 首登時區讀取裝置時區寫入 Settings | `no3_post_auth_logic` | DB | T2 | P2 | B | — |
| R-AU-029 | 首登主題預設 theme1 | `no3_post_auth_logic` | UI | T1 | P2 | B | — |
| R-AU-030 | 首登啟動模式預設 home | `no3_post_auth_logic` | UI | T1 | P2 | B | — |
| R-AU-031 | 首登週起始日預設 auto 不做 Locale 推導 | `no3_post_auth_logic` | UI | T1 | P2 | B | — |
| R-AU-032 | 雲端用戶文件含 `uid` `email` `provider` `createdAt` `preferences` 欄位 | `no3_post_auth_logic` | FB | T2 | P2 | B | — |
| R-AU-033 | 雲端文件 preferences 取本機 Settings 實際值非寫死預設 | `no3_post_auth_logic` | FB | T3 | P2 | B | 改本機設定並刪雲端文件後重登 |
| R-AU-034 | 付費牆以 Modal 呈現由升級入口或存取付費功能觸發 | `no26_paywall_screen` | UI | T1 | P1 | B | — |
| R-AU-035 | 付費牆功能列表呈現帳戶與類別無上限 | `no26_paywall_screen` | UI | T1 | P2 | B | — |
| R-AU-036 | 訂閱選項載入中顯示載入狀態 | `no26_paywall_screen` | UI | T1 | P2 | C | — |
| R-AU-037 | 訂閱選項預設選取年度方案 | `no26_paywall_screen` | UI+實機 | T1 | P1 | C | — |
| R-AU-038 | 年度方案顯示動態年度價格與優惠標示 | `no26_paywall_screen` | UI+實機 | T1 | P1 | C | — |
| R-AU-039 | 月度方案顯示動態月度價格 | `no26_paywall_screen` | UI+實機 | T1 | P1 | C | — |
| R-AU-040 | 點按訂閱方案選取該方案 | `no26_paywall_screen` | UI | T1 | P2 | C | — |
| R-AU-041 | 未選方案或處理中時訂閱按鈕不可點按 | `no26_paywall_screen` | UI | T1 | P2 | C | — |
| R-AU-042 | 購買處理中訂閱按鈕顯示載入狀態 | `no26_paywall_screen` | UI | T1 | P2 | C | — |
| R-AU-043 | 購買成功呼叫 refreshStatus 並關閉付費牆 Modal | `no26_paywall_screen` | UI+實機 | T1 | P0 | C | — |
| R-AU-044 | 使用者取消購買不顯示購買失敗對話框 | `no26_paywall_screen` | UI+實機 | T1 | P1 | C | — |
| R-AU-045 | 購買失敗且非使用者取消顯示購買失敗對話框 | `no26_paywall_screen` | UI+實機 | T3 | P2 | C | 購買流程中斷網誘發失敗 |
| R-AU-046 | 恢復購買查到購買且當前帳號取得授權顯示恢復成功 | `no26_paywall_screen` | UI+實機 | T1 | P0 | C | — |
| R-AU-047 | 查無可還原購買顯示無可還原購買提示 | `no26_paywall_screen` | UI+實機 | T1 | P1 | C | — |
| R-AU-048 | 查到購買但當前帳號未取得授權顯示無可還原提示 | `no26_paywall_screen` | UI+實機 | T3 | P0 | C | 第二帳號還原已綁他帳號購買 |
| R-AU-049 | 恢復購買操作失敗顯示恢復失敗對話框 | `no26_paywall_screen` | UI+實機 | T4 | P2 | 無 | 還原查詢與等級判定全本地，離線不失敗；三路實測皆彈中性或成功提示，失敗前提不可達 |
| R-AU-050 | 點按關閉按鈕或暫不升級關閉付費牆 Modal | `no26_paywall_screen` | UI | T1 | P2 | B | — |
| R-AU-051 | 付費牆使用條款與隱私政策連結開啟外部頁面 | `no26_paywall_screen` | UI | T1 | P2 | B | — |
| R-AU-052 | 登入後訂閱後端 Entitlement 即時更新本機訂閱等級 | `no6_premium_logic` | UI+FB | T3 | P0 | B | Firestore 注入 Entitlement 文件 |
| R-AU-053 | 有 Entitlement 時等級與到期日寫入當前帳號授權快取 | `no6_premium_logic` | LOG | T3 | P1 | B | 注入 Entitlement 後對賬本地快取 |
| R-AU-054 | 無 Entitlement 時不直接降 LEVEL_0 以快取推定等級 | `no6_premium_logic` | UI+LOG | T3 | P1 | B | 注入授權快取後刪 Entitlement 文件 |
| R-AU-055 | 訂閱連線失敗離線以授權快取維持等級不誤降 | `no6_premium_logic` | UI+LOG | T3 | P0 | B | 注入授權快取後斷網啟動 |
| R-AU-056 | 無 Entitlement 且非連線失敗時觸發 reconcile 補寫購買 | `no6_premium_logic` | FB+實機 | T2 | P1 | C | — |
| R-AU-057 | 付費者啟動瞬間不因佔位 LEVEL_0 被導向付費牆 | `no6_premium_logic` | UI+實機 | T1 | P0 | C | — |
| R-AU-058 | 購買憑證送後端驗證後由訂閱更新本機等級不本機推定 | `no6_premium_logic` | FB+實機 | T2 | P0 | C | — |
| R-AU-059 | App 自背景恢復前景觸發 reconcile 補送未驗購買 | `no6_premium_logic` | FB+實機 | T2 | P2 | C | — |
| R-AU-060 | reconcile 查詢購買失敗不更新以快取維持等級 | `no6_premium_logic` | UI+實機 | T3 | P2 | C | 斷網後自背景恢復前景 |
| R-AU-061 | 待處理購買不送驗證不確認交易等待後續狀態更新 | `no6_premium_logic` | 實機 | T3 | P2 | C | sandbox 開啟購買前詢問 |
| R-AU-062 | 已完成購買確認交易後重啟不重複回拋該購買 | `no6_premium_logic` | 實機 | T1 | P1 | C | — |
| R-AU-063 | 確認交易失敗不阻斷送後端驗證 | `no6_premium_logic` | 實機 | T4 | P2 | 無 | 無法誘發平台確認交易失敗 |
| R-AU-064 | 無授權快取時離線推定 LEVEL_0 | `no6_premium_logic` | UI | T3 | P2 | B | 清空快取後斷網啟動 |
| R-AU-065 | 快取到期日早於等於當下時推定 LEVEL_0 | `no6_premium_logic` | UI+LOG | T3 | P0 | B | 注入過期到期日快取後斷網啟動 |
| R-AU-066 | 快取未記錄到期日視為無期限維持快取等級 | `no6_premium_logic` | UI+LOG | T3 | P2 | B | 注入無到期日快取後斷網啟動 |
| R-AU-067 | 取消訂閱後至到期日前維持原等級失效延遲上限為到期日 | `no6_premium_logic` | 實機 | T4 | P1 | 無 | 需真實時間流逝至訂閱到期 |
| R-AU-068 | 登出後訂閱等級降 LEVEL_0 換帳號不沿用前帳號等級 | `no6_premium_logic` | UI | T3 | P0 | B | 注入 Entitlement 帳號登出換免費帳號 |
| R-AU-069 | LEVEL_0 帳戶總數達 3 個後禁止新增帳戶 | `no17_subscription_gate_logic` | UI | T1 | P0 | B | — |
| R-AU-070 | LEVEL_0 類別總數達 7 個後禁止新增類別 | `no17_subscription_gate_logic` | UI | T1 | P0 | B | — |
| R-AU-071 | LEVEL_0 帳戶或類別等於上限仍允許新增交易與轉帳 | `no17_subscription_gate_logic` | UI | T1 | P1 | B | — |
| R-AU-072 | LEVEL_0 帳戶或類別超過上限時交易與轉帳連帶被擋 | `no17_subscription_gate_logic` | UI | T3 | P1 | B | 匯入超標資料使總數超上限 |
| R-AU-073 | 匯入不經配額判斷總數可超過上限 | `no17_subscription_gate_logic` | UI+DB | T1 | P1 | B | — |
| R-AU-074 | LEVEL_1 以上無總數限制全部建立動作允許 | `no17_subscription_gate_logic` | UI | T3 | P0 | B | 注入 LEVEL_1 Entitlement 後建超上限 |
| R-AU-075 | LEVEL_2 能力與 LEVEL_1 相同大於等於 LEVEL_1 即允許 | `no17_subscription_gate_logic` | UI | T3 | P2 | B | 注入 LEVEL_2 Entitlement |
| R-AU-076 | 配額計數計入未軟刪除所有列停用仍計入不退還配額 | `no17_subscription_gate_logic` | UI | T1 | P1 | B | — |
| R-AU-077 | 軟刪除列排除於配額計數刪除後可再新增 | `no17_subscription_gate_logic` | UI | T1 | P1 | B | — |
| R-AU-078 | 選擇器排除停用列但停用不影響配額計數 | `no17_subscription_gate_logic` | UI | T1 | P2 | B | — |
| R-AU-079 | 批次寫入成功後將文件總數累加至當日寫入計數 | `no12_quota_management_logic` | LOG | T2 | P1 | B | — |
| R-AU-080 | 當日寫入達 2000 次上限後禁止批次寫入 | `no12_quota_management_logic` | LOG+FB | T3 | P1 | B | 注入計數至上限後觸發備份 |
| R-AU-081 | 跨日以 UTC+0 為基準將當日寫入計數歸零 | `no12_quota_management_logic` | LOG | T3 | P2 | B | 調系統時鐘跨 UTC 日界 |
| R-AU-082 | Firestore 讀取不納入配額管控 | `no12_quota_management_logic` | LOG | T2 | P2 | B | — |
| R-AU-083 | runBackup 遠端存在性探測至多 1 read 不計入寫入計數 | `no12_quota_management_logic` | LOG | T2 | P2 | B | — |
| R-AU-084 | preference 上傳量級極小不計入配額 | `no12_quota_management_logic` | LOG | T2 | P2 | B | — |
| R-AU-085 | 未登入呼叫 verifyTransaction 拒絕請求 | `no1_iap_verification_logic` | FB | T3 | P1 | B | curl 未帶 Auth 直呼 function |
| R-AU-086 | Apple 簽章驗證失敗拒絕請求 | `no1_iap_verification_logic` | FB | T3 | P1 | B | 偽造簽章 payload 直呼 function |
| R-AU-087 | 交易缺原始交易編號拒絕請求不寫授權 | `no1_iap_verification_logic` | FB | T4 | P2 | 無 | 需 Apple 私鑰構造 JWS，密碼學不可構造 |
| R-AU-088 | 以原始交易編號宣告歸戶先寫入者得該交易 | `no1_iap_verification_logic` | FB+實機 | T2 | P0 | C | — |
| R-AU-089 | 原始交易編號已歸戶其他 UID 拒絕並回報已綁其他帳號 | `no1_iap_verification_logic` | FB+實機 | T3 | P0 | C | 第二帳號送驗同一購買 |
| R-AU-090 | 查無交易對應訂閱狀態拒絕不寫授權由 client 重試 | `no1_iap_verification_logic` | FB | T4 | P2 | 無 | 無法誘發 Apple 查無訂閱狀態 |
| R-AU-091 | 驗證成功寫入 Entitlement 回傳訂閱等級與到期日 | `no1_iap_verification_logic` | FB+實機 | T2 | P0 | C | — |
| R-AU-092 | 依產品識別碼對應訂閱等級寫入授權 | `no1_iap_verification_logic` | FB+實機 | T2 | P1 | C | — |
| R-AU-093 | ASSN 驗簽後以 TransactionIndex 歸戶更新對應 UID 授權 | `no1_iap_verification_logic` | FB | T4 | P1 | 無 | Apple 主動推送不可控 |
| R-AU-094 | ASSN 查無對應 UID 時結束不更新 | `no1_iap_verification_logic` | FB | T4 | P2 | 無 | Apple 主動推送不可控 |
| R-AU-095 | ASSN 查無訂閱狀態且非退款撤銷時不更新 | `no1_iap_verification_logic` | FB | T4 | P2 | 無 | Apple 主動推送不可控 |
| R-AU-096 | 退款或撤銷即時降 LEVEL_0 狀態 refunded 或 revoked | `no1_iap_verification_logic` | FB | T4 | P0 | 無 | 退款需 Apple 端處理不可控 |
| R-AU-097 | 寬限期內維持付費等級狀態 grace_period 附到期日 | `no1_iap_verification_logic` | FB | T4 | P1 | 無 | 需 Apple 計費重試進寬限期 |
| R-AU-098 | 訂閱過期授權推定 LEVEL_0 狀態 expired | `no1_iap_verification_logic` | FB | T4 | P1 | 無 | 需真實時間流逝至到期 |
| R-AU-099 | 簽章時間早於已存 apple_signed_date 略過寫入 | `no1_iap_verification_logic` | FB | T4 | P2 | 無 | 無法誘發亂序通知到達 |
| R-AU-100 | 簽章時間無從取得不寫 apple_signed_date | `no1_iap_verification_logic` | FB | T4 | P2 | 無 | 無法構造缺簽章時間事件 |

---

## 離線與網路異常

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-OF-001 | 已登入斷網下操作者新增交易，本機立即成功且介面不卡 | `impl` firestore fire-and-forget | UI+DB | T3 | P0 | B | simulator 關網路 |
| R-OF-002 | 離線期間備份上傳未完成，系統不前移 `lastSyncedAt` | `no19_transaction_backup_logic` | DB+FB | T3 | P0 | B | simulator 關網路，`lastSyncedAt` 以 sqlite 對賬 |
| R-OF-003 | 恢復連線後下次備份以 Delta 補上傳離線期間全部變更 | `no19_transaction_backup_logic` | DB+FB | T3 | P0 | B | simulator 關網路後恢復再觸發備份 |
| R-OF-004 | 遠端探測失敗時系統保守視為遠端無資料，改走 `runInitialBackup` | `no19_transaction_backup_logic` | FB+LOG | T4 | P2 | 無 | 探測瞬間的網路失敗時點無法手動控制 |
| R-OF-005 | 當日寫入配額禁止時系統跳過本次上傳，待 UTC+0 跨日重置 | `no19_transaction_backup_logic` | LOG+FB | T3 | P2 | B | 注入當日配額達上限，儲存位置需 impl 求證 |
| R-OF-006 | 離線啟動時付費帳號維持快取訂閱等級，不誤降 `LEVEL_0` | `no6_premium_logic` | UI | T3 | P1 | C | 實機關網路後冷啟動 |
| R-OF-007 | 訂閱連線失敗時系統不觸發 `reconcile` 補寫 | `no6_premium_logic` | LOG | T3 | P2 | C | 實機關網路後啟動，log 對賬，需 impl 求證 |
| R-OF-008 | 快取無訂閱到期日時視為無期限，離線維持快取等級 | `no6_premium_logic` | UI | T3 | P2 | C | 快取注入無到期日資料，快取位置需 impl 求證 |
| R-OF-009 | 離線且快取到期日早於當下時間，訂閱等級降為 `LEVEL_0` | `no6_premium_logic` | UI | T3 | P1 | C | 實機關網路加調系統時鐘越過到期日 |
| R-OF-010 | `reconcile` 查詢失敗例如無網路時不更新，維持快取等級 | `no6_premium_logic` | UI | T3 | P2 | C | 實機關網路後觸發付費牆還原入口 |
| R-OF-011 | 訂閱狀態就緒前系統不以 `LEVEL_0` 佔位判定授權 | `no6_premium_logic` | UI | T4 | P1 | 無 | 就緒時序毫秒級，手動無法攔截驗證 |
| R-OF-012 | 登入時第三方認證或 Firebase 驗證失敗，顯示連線異常提示 | `no2_login_logout_logic` | UI | T3 | P1 | B | simulator 關網路後執行登入 |
| R-OF-013 | Firebase Auth 登出失敗時本地登入狀態仍清為登出 | `no2_login_logout_logic` | UI | T4 | P1 | 無 | 登出失敗前提斷網無法觸發 |
| R-OF-014 | 偏好雲端寫入失敗僅記 log，介面不阻塞 | `no18_preference_upload_logic` | UI+LOG | T3 | P1 | B | simulator 關網路後改偏好，離線寫入不 settle 故 log 未必出現，需 impl 求證 |
| R-OF-015 | 同帳號重登入後系統補跑偏好全量上傳與交易備份 | `no2_login_logout_logic` | FB | T2 | P1 | B | 跨域鏡像 |
| R-OF-016 | 換帳號後離線不沿用前帳號訂閱等級，快取以帳號為範圍 | `no6_premium_logic` | UI | T3 | P1 | C | 換帳號後實機關網路冷啟動，跨域鏡像 |

---

## App 殺掉重開狀態恢復

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
|---|---|---|---|---|---|---|---|
| R-KR-001 | undo 倒數中殺掉 app，重開後被刪紀錄維持已刪態不自動還原 | `no11_undo_logic` | DB | T3 | P0 | A | 刪一筆後於倒數 4 秒內 simctl terminate；spec 未明定 |
| R-KR-002 | undo 倒數中殺掉 app，重開後復原列不重現且無可復原操作 | `no11_undo_logic` | UI | T3 | P2 | A | 刪一筆後於倒數中 simctl terminate；spec 未明定 |
| R-KR-003 | `executeImport` 寫入中殺掉 app，重開後匯入資料不留半套 | `no15_import_wizard_screen` | DB | T3 | P0 | A | 備大量列 CSV 於送出瞬間 simctl terminate；spec 未明定 |
| R-KR-004 | 匯入送出前任一步驟殺掉 app，重開後無新增帳戶類別與紀錄 | `no15_import_wizard_screen` | DB | T3 | P1 | A | 走到欄位對應步驟 simctl terminate |
| R-KR-005 | 匯入成功對話框出現後殺掉 app，重開後筆數與摘要一致 | `no15_import_wizard_screen` | DB | T3 | P1 | A | 成功對話框顯示後 simctl terminate |
| R-KR-006 | 首頁切至非當期後殺掉 app，重開後期間偏移還原行為應明定並測 | `no22_home_period_state_logic` | UI | T3 | P2 | A | 切至前一期後 simctl terminate；spec 未明定 |
| R-KR-007 | 殺掉 app 重開後已選帳戶清單還原或回全選應明定並測 | `no22_home_period_state_logic` | UI | T3 | P2 | A | 取消部分帳戶選取後 simctl terminate；spec 未明定 |
| R-KR-008 | 殺掉 app 重開後首查報表與 DB 對賬一致，無殺前殘留快取 | `no22_home_period_state_logic` | UI+DB | T3 | P1 | A | 殺前先異動交易再 simctl terminate；spec 未明定 |
| R-KR-009 | 殺掉 app 重開視同冷啟動，系統依 `launchMode` 導航初始落點 | `no1_app_bootstrap_logic` | UI | T3 | P1 | A | 設定各 `launchMode` 後 simctl terminate 冷啟 |
| R-KR-010 | `launchMode` 為編輯器時殺掉 app 重開，編輯器空白開啟不留草稿 | `no1_app_bootstrap_logic` | UI+DB | T3 | P1 | A | 編輯器輸入中 simctl terminate；spec 未明定 |
| R-KR-011 | 系統於重開登入後補產生殺前到期排程實例，同實例不重複產生 | `no1_app_bootstrap_logic` | DB | T3 | P0 | A | 建到期排程後 simctl terminate 調系統時鐘再開 |

---

## 時區跨日語意

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-TZ-001 | 系統以所選時區換算當下時間定位當期，切時區後期間起訖界線重算 | `no22_home_period_state_logic` | UI | T3 | P1 | A | 設定內切時區 |
| R-TZ-002 | 23 點 30 分建立的交易，切至更東時區後歸屬次日期間，切回即還原 | `no22_home_period_state_logic` | UI | T3 | P1 | A | 設定內切時區 |
| R-TZ-003 | 時區變更後系統清空全部期間報表快取，首頁立即反映新期間界線 | `no22_home_period_state_logic` | UI | T3 | P1 | A | 設定內切時區 |
| R-TZ-004 | 補產生實例對同排程同 `scheduleInstanceDate` 至多一筆，切時區重跑不多產 | `no10_recurring_transactions_logic` | DB | T3 | P0 | A | 設定內切時區 |
| R-TZ-005 | 補產生實例以當前絕對時刻為截止點，未到期實例不提前產生也不漏產 | `no10_recurring_transactions_logic` | DB | T2 | P1 | A | — |
| R-TZ-006 | 匯入日期字串帶 `Z` 或 `±HH:MM` 後綴時以內嵌偏移解讀，來源時區對該列無效 | `no21_data_transfer_logic` | DB | T2 | P1 | A | — |
| R-TZ-007 | 匯入日期無內嵌偏移時依所選來源時區解析，不受 App 顯示時區影響 | `no21_data_transfer_logic` | DB | T2 | P1 | A | — |
| R-TZ-008 | 匯出時間欄位帶 UTC 偏移輸出，原樣重匯還原同一絕對時刻 | `no21_data_transfer_logic` | UI+DB | T2 | P1 | A | — |
| R-TZ-009 | 時區畫面點完成呼叫 `setTimeZone` 生效，點關閉離開不套用選取 | `no25_time_zone_setting_screen` | UI | T1 | P2 | A | — |

---

## 金額顯示格式

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-FM-001 | 幣別符號固定依 en-US 慣例，任何語系下 TWD 顯 `NT$`、USD 顯 `$` | `impl formatCurrencyValue` | UI | T1 | P1 | A | — |
| R-FM-002 | 千分位與小數分隔符依 app 語系，`de` 語系顯示 `1.234,56` | `impl formatCurrencyValue` | UI | T1 | P2 | A | — |
| R-FM-003 | 負值金額負號置於幣別符號後、數字前，顯示 `NT$-500` | `impl insertMinusAfterSymbol` | UI | T1 | P1 | A | — |
| R-FM-004 | 未知幣別降級顯示代碼加空格加定位小數，負號仍在代碼後 | `impl formatCurrencyValue` | UI | T3 | P2 | A | sqlite 注入未知幣別代碼 |
| R-FM-005 | TWD 無使用者覆寫時預設 0 位小數，101 元顯示不帶小數點 | `impl getDefaultDecimals` | UI | T1 | P1 | A | — |
| R-FM-006 | 非 TWD 幣別預設小數位取 ISO minorUnits，JPY 0 位、KWD 3 位 | `impl getMinorUnits` | UI | T1 | P2 | A | — |
| R-FM-007 | 幣別設定覆寫小數位後，全 app 金額顯示依覆寫位數 | `impl CurrencyContext formatCurrency` | UI | T1 | P1 | A | — |
| R-FM-008 | K-mode 幣別顯示值為實際金額除以 1000，3000 元顯示 3 | `impl decodeStorageAmount` | UI | T1 | P1 | A | — |
| R-FM-009 | K-mode 幣別重開編輯器，金額欄回填原輸入值非千倍值 | `impl TransactionEditorScreen` | UI | T1 | P1 | A | — |
| R-FM-010 | 交易列、FocusCard、搜尋列、分組小計金額幣別段縮小、數字段大字 | `impl InlineAmount` | UI | T1 | P2 | A | — |
| R-FM-011 | 首頁 donut 中央金額幣別段在上、數字段在下垂直堆疊 | `impl AnimatedBalance` | UI | T1 | P2 | A | — |
| R-FM-012 | 縮小幣別段不含負號，負號歸數字段，小 `NT$` 大 `-185` | `impl splitCurrencyParts` | UI | T1 | P2 | A | — |
| R-FM-013 | 跨幣別轉帳搜尋列兩端金額各自帶縮小幣別段，以箭頭串接 | `impl SearchScreen` | UI | T1 | P2 | A | — |
| R-FM-014 | 匯率顯示採動態小數位，至少 4 位有效數字且 2 至 8 位小數 | `impl formatExchangeRate` | UI | T1 | P2 | A | — |
| R-FM-015 | 匯率值非正數或非有限時顯示 `—` 替代，不印 Infinity | `impl formatExchangeRate` | UI | T3 | P2 | A | sqlite 注入 0 匯率 |

---

# 跨域交互

| ID | 規則 | 來源 | 面 | 級 | P | 軌 | 處置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-XD-001 | 操作者刪除帳戶或類別後，其排程停產或續產應明定並測 | `no10_recurring_transactions_logic` | DB | T3 | P0 | A | spec 未明定 |
| R-XD-002 | 停用帳戶的排程於補產時仍產生實例，僅軟刪排程被排除 | `no10_recurring_transactions_logic` | DB | T3 | P1 | A | 調系統時鐘跨期觸發補產 |
| R-XD-003 | 停用帳戶排程補產的實例不列入首頁報表計算 | `no13_home_report_logic` | UI+DB | T3 | P1 | A | 調系統時鐘跨期觸發補產 |
| R-XD-004 | 合併帳戶或類別後，排程 `template` 欄位轉指目標應明定並測 | `no16_merge_logic` | DB | T2 | P0 | A | spec 未明定 |
| R-XD-005 | `LEVEL_0` 帳戶或類別總數超上限時，系統擋新增交易與轉帳 | `no17_subscription_gate_logic` | UI | T3 | P1 | A | 匯入超標資料佈置總數超限 |
| R-XD-006 | 停用的帳戶與類別仍計入 `LEVEL_0` 總數，停用不退還配額 | `no17_subscription_gate_logic` | UI | T1 | P1 | A | — |
| R-XD-007 | 匯入不經配額判斷，`LEVEL_0` 匯入可使總數超過上限 | `no17_subscription_gate_logic` | UI+DB | T1 | P1 | A | — |
| R-XD-008 | 復原刪除致總數超上限的容忍應明定並測，spec 僅載匯入可超標 | `no17_subscription_gate_logic` | UI+DB | T4 | P2 | 無 | spec 未明定容忍行為，無預期可斷言 |
| R-XD-009 | 復原成功遞增完成計數，首頁與搜尋監看計數重新查詢列表 | `no11_undo_logic` | UI | T1 | P1 | A | — |
| R-XD-010 | 復原合併依快照移回紀錄，並恢復來源與冗餘轉帳 | `no16_merge_logic` | DB | T2 | P0 | A | — |
| R-XD-011 | 匯入完成不顯示復原列，匯入結果不可單步復原 | `undo_bar_policy` | UI | T1 | P1 | A | — |
| R-XD-012 | 換帳號偵測不同帳號時，系統明示詢問保留或清除，不自動清除 | `no2_login_logout_logic` | UI | T1 | P0 | B | — |
| R-XD-013 | 換帳號清除採硬重置清空全部本機紀錄，不傳播雲端刪除標記 | `no2_login_logout_logic` | DB+FB | T2 | P0 | B | — |
| R-XD-014 | 換帳號清除前，未上傳變更是否先行備份應明定並測 | `no2_login_logout_logic` | DB+FB | T2 | P0 | B | spec 未明定 |
| R-XD-015 | 換帳號清除連帶清前一帳號授權快取，不動當前帳號 | `no2_login_logout_logic` | DB | T3 | P1 | B | 注入前一帳號授權快取 |
| R-XD-016 | 清除資料庫僅軟刪當前使用者六表，保留使用者、設定、貨幣顯示三表 | `no23_local_database_logic` | DB | T2 | P0 | A | — |
| R-XD-017 | 清除資料庫僅標記當前使用者紀錄，不影響其他帳號本機紀錄 | `no23_local_database_logic` | DB | T2 | P1 | B | — |
| R-XD-018 | 清除資料庫軟刪傳播雲端刪除標記，備份把刪除同步上雲 | `no23_local_database_logic` | DB+FB | T2 | P0 | B | — |
| R-XD-019 | 備份冷卻屬裝置層級，換帳號不重置，5 分鐘內跳過備份 | `no19_transaction_backup_logic` | FB+LOG | T2 | P1 | B | — |
| R-XD-020 | 跨幣別轉帳建立補錄正反兩筆匯率，生效時點為轉帳 `date` 值 | `no8_transfer_logic` | DB | T2 | P0 | A | — |
| R-XD-021 | 匯率異動後清空報表快取，多幣別報表依最新匯率重算 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-XD-022 | 刪除跨幣別轉帳不刪已補錄匯率，換算沿用殘留匯率 | `no8_transfer_logic` | DB+UI | T2 | P1 | A | — |
| R-XD-023 | 週起始日變更後清空報表快取，週期間起訖依新值重推 | `no22_home_period_state_logic` | UI | T1 | P1 | A | — |
| R-XD-024 | 週起始日為 `auto` 時，週期間依使用者語系慣例推導 | `no22_home_period_state_logic` | UI | T1 | P2 | A | — |
| R-XD-025 | 日期選擇器星期列順序依週起始日偏好即時跟隨變更 | `date_picker_policy` | UI | T1 | P2 | A | — |
