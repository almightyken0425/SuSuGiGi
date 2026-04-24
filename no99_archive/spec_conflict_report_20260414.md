# 規格衝突與邏輯出入分析報告

> **報告建立時間:** 2026-04-14
> **基準:** 2026-04-09 衝突報告 + 2026-04-14 全文重新掃描

---

## 總覽

| 衝突等級 | 項目 | 狀態 |
| -------- | ---- | ---- |
| 🟡 流程定義 | 首次登入初始化流程分歧 | 未解決 |
| 🟡 名詞規範 | 語言代碼規格不一致 | 未解決 |
| 🟡 細節定義 | 配額管理執行粒度描述落差 | 未解決 |
| 🟡 資料一致性 | 基礎貨幣欄位格式不統一 | 未解決 |
| 🟡 資料一致性 | Undo 範圍判斷標準缺失 | 未解決 |
| 🟡 資料一致性 | Settings 更新時間戳誤觸發增量同步 | 未解決 |
| 🟡 邏輯完整性 | 基礎貨幣變更時匯率補齊策略並存 | 未解決 |
| 🟡 邏輯完整性 | 匯率正向反向定義不一致 | 未解決 |
| 🆕 邏輯完整性 | 定期交易降級行為未定義 | 新發現 |
| 🆕 核心邏輯 | 新用戶 Tier 0 同步觸發矛盾 | 新發現 |
| 🆕 時序問題 | 同步下載新 Schedule 後補產生時機不清 | 新發現 |
| 🆕 細節定義 | PremiumStatusCache TTL 未定義 | 新發現 |
| 🆕 名詞規範 | LEVEL_0/1/2 與 Tier 0/1/2/3 映射從未定義 | 新發現 |
| 🆕 邏輯完整性 | Strict Direct Rate 三角缺口場景無使用者引導 | 新發現 |
| 🆕 資料一致性 | 帳戶/類別數量限制跨裝置繞過漏洞無同步側規格 | 新發現 |
| 🆕 流程定義 | CSV 匯入缺乏去重與衝突處理規格 | 新發現 |
| 🆕 資料一致性 | Undo 與同步的上傳完成邊界未定義 | 新發現 |
| ⚠️ 持續風險 | Bootstrap Flow 非同步時序風險 | 持續存在 |

---

## 🟡 仍未解決（從 20260409 繼承）

### 首次登入初始化流程分歧

- **`no1_user_management/no2_login_flow.md`**：範例程式碼將剛註冊的使用者資料直接寫入本地 `users` collection
- **`no2_accounting_app/no3_logics/no2_post_auth_logic.md`**：新使用者轉正需覆蓋寫入本地 `Settings` 表，並創建現金帳戶與預設交易類別，僅在 Premium 為 True 時才將資料寫入 Firestore `users/{uid}`
- **影響：** 新手上船的本地資料初始化步驟分散於兩份規格，且作法分歧

---

### 語言代碼規格不一致

- **`no1_user_management/no3_update_preferences_api.md`**：繁體中文語言值為 `zh-Hant`
- **`no1_user_management/no1_users_schema.md`**：繁體中文介面語言填寫為 `zh-TW`
- **影響：** 切換語言時代碼找不到對應檔案或存錯字串

---

### 配額管理執行粒度描述落差

- **`no2_product_planning/no2_product_map/app/cloud-sync.md`**：超額描述為「超出每日上限時暫停同步」，未區分讀寫方向
- **`no3_product_specs/no2_accounting_app/no3_logics/no11_firestore_quota_logic.md`**：寫入超標跳過 Push 保留 Pull、讀取超標跳過 Pull 保留 Push
- **影響：** 規劃文件過於概括，QA 可能誤以為任何超額都導致同步全面停擺

---

### 基礎貨幣欄位格式不統一

- **`no1_user_management/no1_users_schema.md` Firestore 側**：欄位名稱 `currency`，型別 String，儲存 ISO 4217 代碼如 TWD
- **`no2_accounting_app/no1_data_models/no1_data_models.md` 本地 DB 側**：欄位名稱 `baseCurrencyId`，型別 Number，儲存 ISO Numeric ID
- **影響：** 轉換邏輯分散於各規格，缺乏統一的格式映射定義

---

### Undo 範圍判斷標準缺失

- **`no2_accounting_app/no3_logics/no10_undo_spec.md`**：已完成同步的操作無法撤銷，但判斷標準未定義
- **衝突點：** 多裝置 LWW 衝突解決後，失敗方是否仍可撤銷未說明
- **影響：** 多裝置場景下的撤銷行為不一致

---

### Settings 更新時間戳誤觸發增量同步

- **`no2_accounting_app/no3_logics/no2_post_auth_logic.md`**：登入時覆蓋寫入 Settings 並將 `updatedOn` 設為當下時間
- **`no2_accounting_app/no3_logics/no3_batch_sync_spec.md`**：增量同步查詢條件為 `updatedOn > lastSyncTimestamp`
- **影響：** 未實際修改的 Settings 資料在下次增量同步時被誤判為需要上傳

---

### 基礎貨幣變更時匯率補齊策略並存

- **偏好設定畫面規格：** 基礎貨幣變更時主動掃描外幣帳戶並建立缺失匯率，Rate 預設為 1
- **`no2_accounting_app/no3_logics/no6_currency_conversion_logic.md`**：查無匯率時被動降級處理並預設為 1
- **影響：** 主動建立與被動補建的執行邊界不清楚，兩套策略並存無優先順序

---

### 匯率正向反向定義不一致

- **`no2_accounting_app/no3_logics/no7_transfer_logic.md`**：轉帳操作僅記錄正向匯率
- **`no2_accounting_app/no3_logics/no6_currency_conversion_logic.md`**：查找時合併正向與反向，以時間倒序取最新紀錄
- **影響：** 轉帳時的隱含匯率方向未統一，以 USD 轉 TWD 為例，記錄方向不明確

---

## 🆕 新發現衝突（2026-04-14 掃描）

### 定期交易降級行為未定義

- **`no2_accounting_app/no3_logics/no3_batch_sync_spec.md` 降級章節**：僅說明「停止 Sync Engine」、「保留本地資料」、「凍結雲端資料」
- **`no2_accounting_app/no3_logics/no9_recurring_transactions_logic.md`**：定期交易補產生為 App 啟動時執行，無 Tier 限制
- **缺口：** 使用者降級後，定期交易是否應立即停止補產生？還是繼續執行至下次同步？若繼續執行，升級後是否需要對帳？降級規格完全未覆蓋這個場景
- **建議：** 在 `no3_batch_sync_spec.md` 降級邏輯中補充定期交易的行為定義

---

### 新用戶 Tier 0 同步觸發矛盾

- **`no2_accounting_app/no3_logics/no2_post_auth_logic.md`**：「不執行 Batch Sync，因無資料需下載」（新用戶初始化時）
- **`no2_accounting_app/no3_logics/no3_batch_sync_spec.md`**：`lastSyncTimestamp` 為 0 或 null 時觸發全量同步（含上傳與下載）
- **矛盾：** 新用戶完成初始化後 `lastSyncTimestamp` 為 null，依 Batch Sync 規格應觸發全量同步；但 post_auth 邏輯明確說明不觸發
- **建議：** 明確定義新用戶 Tier 0 首次登入時是否觸發任何同步操作，以及 `lastSyncTimestamp = null` 的處理路徑

---

### 同步下載新 Schedule 後補產生時機不清

- **`no2_accounting_app/no3_logics/no3_batch_sync_spec.md`**：批次同步下載階段可能帶入新的 schedule 記錄
- **`no2_accounting_app/no3_logics/no1_app_bootstrap_flow.md`**：定期交易補產生列為核心背景任務，先於批次同步執行
- **缺口：** 若本次啟動的補產生先執行完畢，之後同步才下載到新的 schedule，這批 schedule 是等到下次 App 啟動才補產生，還是本次啟動內重跑一次？規格未定義
- **建議：** 在 `no1_app_bootstrap_flow.md` 補充同步後的 schedule 補產生策略

---

### PremiumStatusCache TTL 未定義

- **`no2_product_planning/no2_product_map/app/payment.md`**：「TTL 快取訂閱到期日供離線驗證授權」，但未指定 TTL 期限
- **`no2_accounting_app/no3_logics/no5_premium_logic.md`**：同樣未定義快取過期時間
- **影響：** 使用者在離線狀態下，訂閱已實際過期但本地快取仍有效，系統無法定義合理的寬限期
- **建議：** 在 `payment.md` 或 `no5_premium_logic.md` 明確定義 TTL 期限

---

### LEVEL_0/1/2 與 Tier 0/1/2/3 映射從未定義

- **`no2_product_planning/no2_product_map/app/payment.md`**：使用 LEVEL_0、LEVEL_1、LEVEL_2 三個等級
- **`no1_product_initiation/no3_business_model.md`**：定義 Tier 0、Tier 1、Tier 2、Tier 3、Tier B 五個等級
- **`no1_user_management/no1_users_schema.md`**：權限欄位映射為 Tier 0 Free / Tier 1 Premium
- **缺口：** LEVEL_X 與 Tier Y 的對應關係在任何文件中皆未說明，payment.md 為何只到 LEVEL_2 而 business_model 有 Tier 3 也未解釋
- **建議：** 建立統一的映射表，明確 LEVEL_X 對應哪個 Tier、功能集合為何

---

### Strict Direct Rate 三角缺口場景無使用者引導

- **`no2_product_planning/no1_requirements/no1_requirements.md`**：明確接受「若無直接匯率，視為無法計算，不進行中間跳轉」
- **`no2_accounting_app/no3_logics/no6_currency_conversion_logic.md`**：Strict Direct Rate 策略
- **缺口：** 使用者同時持有 USD、TWD、JPY 帳戶，只維護 USD→TWD 和 TWD→JPY 匯率時，報表會無法計算 JPY→USD 換算。這是已知的可接受行為，但規格中缺乏對使用者的提示策略說明
- **建議：** 在匯率管理相關畫面規格補充「若報表顯示無法換算，提示使用者補充直接匯率」的 UI 行為定義

---

### 帳戶/類別數量限制跨裝置繞過漏洞無同步側規格

- **`no2_product_planning/no2_product_map/app/payment.md`**：「本地計數防止單裝置失控，但無法限制多裝置的全域總量，評估可接受」
- **`no2_product_planning/no2_product_map/app/cloud-sync.md`**：同步下載後未定義重新執行數量檢查的流程
- **缺口：** 使用者可在裝置 A 建立上限帳戶後，在未同步的裝置 B 再建立帳戶，同步後超出限制但無任何規格說明此時的處理方式
- **建議：** 若接受此漏洞，在 `cloud-sync.md` 明確記錄這是已知接受的邊界行為；若不接受，補充同步下載後的數量重新校驗流程

---

### CSV 匯入缺乏去重與衝突處理規格

- **`no2_product_planning/no2_product_map/app/recording-core.md`**：DataImport 支援 CSV 匯入，但未提及重複資料的處理方式
- **缺口：** 使用者錯誤地重複匯入同一份 CSV 時，系統是否建立重複記錄？是否有去重或提示機制？完全未定義
- **建議：** 在 `recording-core.md` DataImport 章節補充重複資料的判斷邏輯與使用者提示行為

---

### Undo 與同步的上傳完成邊界未定義

- **`no2_accounting_app/no3_logics/no10_undo_spec.md`**：「已完成同步的操作無法撤銷」
- **`no2_accounting_app/no3_logics/no3_batch_sync_spec.md`**：批次同步分為 Upload → Download → Finalize 三個階段
- **缺口：** Upload 階段完成時是否算「已完成同步」？還是必須等到 Finalize？若使用者在 Download 階段觸發 Undo，已上傳的資料如何處理？
- **備註：** 此項與 20260409 的「Undo 範圍判斷標準缺失」角度不同，前者關注多裝置 LWW 後的撤銷權限，本項關注單次同步流程內的邊界定義
- **建議：** 在 `no3_batch_sync_spec.md` 各階段明確標注「此階段後 Undo 操作被禁止」的觸發點

---

## ⚠️ 持續風險

### Bootstrap Flow 非同步時序風險

- **記錄起始：** 2026-04-07
- **`no2_accounting_app/no3_logics/no1_app_bootstrap_flow.md`**：定期交易補產生與批次同步自動觸發均列為非同步執行，兩者之間無強制的執行順序依賴
- **風險：** 批次同步若先於定期交易補產生完成，當日應生成的定期交易紀錄趕不上此次同步上傳，雲端資料短暫不完整，需等待下次條件符合才能回補
- **現況：** 已在規格中標注定期交易應先於批次同步執行，但未以強依賴方式實現，仍為實作層面的風險

---

## ✅ 已解決（歷史紀錄）

**解決於 2026-04-07：**

- **主題選項定義不一致：** 將佈景選項抽象化為動態標識符，避免資料庫結構與前端佈景管理機制產生強耦合
- **App 啟動時定期交易觸發權限：** 定期交易檢查從付費者背景任務移至通用核心背景任務，無須檢查 Premium 狀態
- **偏好設定同步架構：** `no3_update_preferences_api.md` 確立 Write-Through 模式，優先寫本地 WatermelonDB 後直接寫入 Firestore，不經 SyncEngine

**解決於 2026-04-09：**

- **Preferences 登入覆蓋與日常 LWW 策略矛盾：** 登入後邏輯改為 Last Write Wins 策略，Preferences 整合進 SyncEngine 批次同步流程
- **Premium 狀態查詢呼叫時機未定義：** 在 `no1_app_bootstrap_flow.md` 新增背景同步機制，每次 App 啟動時背景更新跨裝置憑證
- **帳號切換後定期交易補產生邏輯缺失：** 在 `no12_logout_logic.md` 加入登出時強制重置 `lastRecurringCheckDate` 與 `lastSyncCheckDate`
