# SuSuGiGi Refactor Plan

# Logout / ReLogin / Firebase 同步生態系

> **狀態：** 2026-04-28 R1 雲端架構決策完成 Product git merge to main，Spec git 同步 branch 待 merge。R2-R8 經 R1-followup 重整為 R2-R11 主序列加兩條 backlog；每個 R 為一個 session 的工作單位，編號等於建議執行順序。
>
> **2026-04-28 第二次更新：** R1-followup 重整完成。本檔結構：盤點摘要 → 執行節奏（已歷史化）→ Pre-flight admin → R1（已完成快照）→ R2-R11 主序列 → Backlog → 執行順序表 → Round 2 不做的事。

## 盤點結論摘要

Phase 1 派 3 組 Explore 平行盤點，整合對使用者 5 個提問的直接回答：

| 問題                                               | 答案                                                                                                                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App 一定要 Google 登入嗎？                         | **是**。`AppNavigator.tsx:197-198` 強制 `if (!user) → LoginScreen`；Spec `Requirements.md:131` 明寫「Auth-First 強制登入牆」                                   |
| 已登入後可離線使用嗎？                             | **可**。Firebase token cache 支援；本機 WatermelonDB 操作不需網路；只有 Firebase 同步流程會 degrade                                                            |
| Firebase 通訊點錯誤通知策略 OK 嗎？                | **整體 OK**。前景跳 Alert（signIn / signOut / export / import / IAP purchase）；背景 silent（sync / quota / preference）。沒有重大「該跳沒跳」或「不該跳卻跳」 |
| logout 前 backup 大量資料撞 quota 嗎？             | **會**。Daily 2000 writes 上限；5000 筆當日無法完成；無分日續傳。R1 決策後改走全量備份檔（JSON ZIP via OS Share Intent）路徑規避此問題                         |
| ReLogin 拉全量會撞冷卻？反覆 logout/login 是攻擊？ | **5 分鐘冷卻 Spec 有 Impl 沒做**（漏洞 → R3）；**logout reset quota 等於繞過 daily limit**（漏洞 → R2，Round 1 R11 引入）                                      |

---

## 執行節奏 方案 B（已執行）

- **拍板：** 2026-04-28 採用方案 B
- **R1 完整落地：** 已完成 2026-04-28
    - 範圍：Product git 與 Spec git 同 branch `feat/r1-cloud-architecture-decision`
    - 多檔同步：cloud_sync 加 macro_data 加 analytics_pipeline 產品圖加 root value 立場文件加 subscription gate logic 規格
    - 狀態：Product git 已 merge to main（HEAD ef5e78e）；Spec git 仍在 feat branch 待 merge（pre-flight 待動作）
- **R1-followup 重整：** 已完成 2026-04-28
    - branch：Product git `feat/r1-followup-refactor-plan-rework`
    - 範圍：純改本檔，無 Spec 與 Impl 動作
    - 校正內容：R 序列重新編號 R2-R11；R-privacy-page／R-fullbackup-format／R-leveling-rework 升入主序列為 R5／R4／R6；舊 R4／R6 wording 對齊 JSON ZIP（原 CSV）；R-bigquery-pipeline 與 R-future-eu-rework 留 backlog 不編號；新增 Pre-flight admin 段；重畫執行順序表
- **各 R 順序落地：** 進行中
    - 依本檔 R 編號順序每 session 一 R 一 branch
    - 每 R 自帶 plan 加 Explore 加對應 git branch
    - 多主題拆分：前一 R 完整 commit 加 merge 加 push 才開下一 R

---

## Pre-flight admin

- **動作：** Spec git `feat/r1-cloud-architecture-decision` branch merge to main
- **理由：** R1 在 Spec git 已完成 entitlement 拆解（`no3_logics/no17_subscription_gate_logic.md` 拆 triggerCloudBackup 加 triggerMultiDeviceSync），但 branch 尚未 merge；R6（LEVEL_0 多裝置同步入口隱藏）依賴此 entitlement 名稱已 ground truth 化
- **Scope：** 純 admin，不開 plan、不開 Explore；本機 ff merge 加 push 即可
- **時機：** R2 起跑前完成

---

## R1：雲端架構決策

- **狀態：** 已完成 2026-04-28，Product git merge to main；Spec git 同步 branch 待 merge（見 Pre-flight admin）
- 性質：產品決策加上 Spec 層 entitlement 名稱拆解
- impl 不動
- 完整方案空間與五輪收斂歷程記錄於 R1 決策矩陣文件

---

### 子題拍板摘要

- **A 免費版跨裝置遷移：**
    - 採 A2 only
    - 手動全量檔，user 自選 OS Share Intent 位置
- **E 個人化財務分析：**
    - 採 E2
    - 後端 API 跑分析
- **L2 Preference 同步：**
    - 採 Firebase Firestore
    - 全 user 享有
- **P 蒐集範圍：**
    - 採 P1
    - 全 user 統一蒐集
    - 含免費版
- **Q L3 儲存：**
    - 採 Q1
    - Firestore 加 BigQuery extension 鏡像
- **Q' BigQuery 啟動時機：**
    - 採延後啟動
    - 條件性 backlog
- **S 法律基礎：**
    - 採 opt-out UX-α
    - 不跳通知
    - Settings 之下 Privacy 子頁可關

---

### 架構分層

- **L1 Firebase Auth：**
    - 角色：登入
- **L2 Firestore preferences：**
    - 路徑：`users/{uid}/preferences`
    - 內容：主貨幣與主題與語言
    - 涵蓋：全 user 享有
- **L3 Firestore 業務集合：**
    - 路徑：`users/{uid}/{transactions, transfers, accounts, categories, currency_rates, schedules}`
    - 涵蓋：全 user 寫入
    - 與 analyticsConsent 解耦
    - 鏡像至 BigQuery：未啟動
- **L3 BigQuery 鏡像 via firestore-bigquery-export extension：**
    - 啟動時機：延後啟動
    - 啟動 filter：只取 analyticsConsent 為 true
    - 啟動觸發條件擇一發生：
        - E2 個人化分析功能要 ship
        - macro_data B2B 變現要啟動
        - LEVEL_3 AI 顧問要 ship
    - 後段自建 analytics API：未啟動
- **L4 全量檔走 OS Share Intent：**
    - 對應 A2
    - 涵蓋：所有 user
    - 與 analyticsConsent 完全脫鉤
    - user 主動觸發

---

### opt-out UX-α 流程

- **首次安裝段：**
    - 使用者下載 App
    - Google 登入
    - 進主畫面
    - 不跳同意對話框
    - 登入頁與 onboarding 無條款連結
- **預設 flag：**
    - 使用者建立時 analyticsConsent 預設為 true
- **Settings 之下 Privacy 子頁整合四項：**
    - 條款
    - 資料分析貢獻 toggle，預設開
    - 申請刪除歷史資料連結
    - 蒐集說明連結
- **關閉 toggle 後行為：**
    - BigQuery 啟動後才實際生效
    - BigQuery extension filter 過濾，停止新蒐集
    - 歷史資料採寬鬆派保留
    - user 可走刪除流程

---

### 服務使用清單

- **Firebase Auth：**
    - 用途：登入
    - 狀態：已用
- **Firestore：**
    - 用途：L2 preference 加 L3 記帳紀錄涵蓋全 user
    - 狀態：已用
    - 後續：spec 已重新拆 entitlement（隨 R1 完成，branch 待 merge）
- **OS Share Intent：**
    - 用途：L4 A2 全量檔自選位置
    - 狀態：待 R4 落地
- **BigQuery 加 firestore-bigquery-export extension：**
    - 用途：L3 鏡像分析 warehouse
    - 狀態：延後啟動
- **自建 analytics API：**
    - 部署於 Cloud Functions 或 Cloud Run
    - 用途：E2 個人化分析與 macro_data B2B
    - 狀態：延後啟動
- **Firebase Storage：**
    - 不用
- **Google Drive API：**
    - 不用
- **iCloud native 整合：**
    - 不用
- **同意對話框：**
    - 不用，採 opt-out UX-α

---

### 法律 caveat

- **歐盟 GDPR：**
    - opt-out UX-α 不合規
    - GDPR Art.7 要求有效同意
    - 有效同意必須是 freely given
    - 必須是 specific
    - 必須是 informed
    - 必須是 unambiguous
- **加州 CCPA：**
    - 可接受
    - Privacy toggle 必須顯眼
- **短期適用：**
    - 亞洲市場為主時 OK
- **中期動作：**
    - 上歐美前必走 R-future-eu-rework（見 Backlog）

---

### 落地文件清單

- **新增 R1 決策矩陣文件：**
    - 位於 archive 層
    - 內容：完整方案比較與五輪收斂歷程
- **更新 cloud_sync 產品圖文件：**
    - 拆 L2 加 L3 加 L4
- **更新 macro_data 產品圖文件：**
    - DataPipeline 來源改為 BigQuery 鏡像加 opt-out filter
- **新增 analytics_pipeline 產品圖文件：**
    - BigQuery pipeline 設計
- **更新 root value 立場文件：**
    - 隱私聲明改寫
- **更新 subscription gate logic 規格：**
    - 拆 entitlement 為 triggerCloudBackup 加 triggerMultiDeviceSync
    - 屬 Spec git
- **Branch：**
    - Product git 與 Spec git 同 branch `feat/r1-cloud-architecture-decision`

---

## R2：quota reset on logout 漏洞修正（🔴 嚴重，Round 1 R11 引入）

- **問題：** Round 1 R11 logout 時 `quotaService.reset()` 把計數歸零；攻擊者腳本反覆 logout/login 同日內無限重置 → 繞過 2000/day 軟限制
- **影響：** 本地 quota 防護形同虛設；Firebase 真實 quota（project-level 50k reads / 20k writes）會被燒掉
- **修法：** logout 不重置 AsyncStorage 計數，或改為 user-scoped 計數（每 uid 一份），切 user 才獨立
- **依賴：** 無
- **Branch：** Impl git `feat/r2-quota-no-reset-on-logout`
- **Scope：** 小（quotaService 加 1-2 caller）

---

## R3：5 分鐘冷卻 Impl 落地（🔴 嚴重，Spec 有 Impl 沒做）

- **問題：** `cloud_sync.md:16` Spec 寫「手動同步 5 分鐘冷卻」；`syncEngine.ts` 只有 `syncState.inProgress` 防重複，無時間戳檢查 → 手動同步可無限頻繁觸發
- **影響：** 燒 quota / Firebase 流量
- **修法：** syncEngine 加 `lastManualSyncAt` AsyncStorage timestamp，5 分鐘內拒絕新 manual sync
- **依賴：** 無
- **Branch：** Impl git `feat/r3-manual-sync-cooldown`
- **Scope：** 小（syncEngine 加 1 處）

---

## R4：A2 全量備份檔格式 JSON ZIP（🟡 中）

- **問題：** R1 拍 A2 等於手動全量檔走 OS Share Intent，但格式未定義；DataManagementScreen 規格仍只有分項匯出（交易／轉帳／排程）；後續 R7／R9 流程無備份檔可走
- **影響：** blocks R7（logout 備份提示）與 R9（export 前 sync 確認）；cloud_sync product map L4 標「待 R-fullbackup-format 落地」未消解
- **修法：**
    - Spec 工作：在 `no2_screens/no14_data_management_screen.md` 內新增 JSON ZIP 全量備份章節，或新增獨立 logic 規格；格式含 Settings 加所有 entity 加 referential mapping
    - Impl 工作：實作 export util；走 OS Share Intent；user 自選位置；DataManagementScreen 加全量備份入口
- **依賴：** R1
- **Branch：** Spec git 與 Impl git 同 `feat/r4-fullbackup-format-json-zip`
- **Scope：** 中（Spec 一檔加 Impl util 加 Screen 整合）

---

## R5：Settings Privacy 子頁（🟡 中）

- **問題：** R1 採 opt-out UX-α，要求 Settings 之下 Privacy 子頁整合條款加 analyticsConsent toggle 加申請刪除歷史資料連結加蒐集說明；現況 Spec 與 Impl 皆無
- **影響：** opt-out UX-α 不完整；analyticsConsent 預設為 true 但 user 無法關閉；CCPA 要求 Privacy toggle 顯眼亦不滿足
- **修法：**
    - Spec 工作：新增 `no2_screens/noN_privacy_screen.md`（編號接 settings 之下子頁規律）；更新 `no8_settings_screen.md` 加 Privacy 子頁入口
    - Impl 工作：新增 PrivacyScreen 元件；analyticsConsent toggle 與 Firestore preferences 同步；條款與蒐集說明連結；申請刪除流程 placeholder（後端未啟動前 wording 用 will 語氣）
- **依賴：** R1
- **Branch：** Spec git 與 Impl git 同 `feat/r5-settings-privacy-subpage`
- **Scope：** 中（新 screen 加 Firestore preferences toggle）

---

## R6：LEVEL_0 多裝置同步入口隱藏（🟢 輕）

- **問題：** R1 在 Spec git 拆 entitlement 為 triggerCloudBackup（全 user）加 triggerMultiDeviceSync（LEVEL_1+）；UI 仍露出 LEVEL_0 多裝置同步入口
- **影響：** 使用者誤以為 LEVEL_0 有多裝置同步功能
- **修法：** 在多裝置同步入口（subscription／settings 既有 UI）加 entitlement 條件判斷，LEVEL_0 隱藏
- **依賴：** R1（Spec git entitlement 拆解已完成；需 Pre-flight merge 後 ground truth 才在 main）
- **Branch：** Impl git `feat/r6-multi-device-sync-entry-hide`
- **Scope：** 小（1-2 處 UI 條件渲染；Spec 已完成不動 spec）

---

## R7：Logout 備份提示流程加本機 wipe（🟡 中）

- **問題：** 使用者期待 logout 前提示備份；現況 signOut 直接執行（Round 1 R11 only reset quota），無備份提醒、本機資料保留
- **修法：**
    - signOut 改為兩步：(1) Alert prompt 提示備份 → (2) 完成備份才真正 signOut 加 wipe 本機
    - 不分付費／非付費，統一導向 R4 全量備份檔（JSON ZIP via OS Share Intent，依 R1 拍 A2）
    - 新增本機 wipe util（`database.unsafeResetDatabase()` 或 user-scoped 刪）
- **依賴：** R4（R1 拍 A2 但格式定義在 R4），R2（不再有 quota reset 邊界混淆）
- **Branch：** Impl git `feat/r7-logout-backup-prompt-and-wipe`
- **Scope：** 中（新 Alert flow 加 wipe util）

---

## R8：handleReLogin 跨 user 切換（🟡 中）

- **問題：** 換 Google 帳號登入會看到舊 user 資料；Spec `no2_login_logout_logic.md` 定義同 user LWW vs 不同 user 提示清資料，Impl 完全沒做
- **修法：**
    - AsyncStorage 持久化 prev_user_id
    - 登入時比對 current uid vs prev → 不同 → Alert prompt 確認 wipe → wipe 後走 Round 1 R10 `initializeNewUser`
- **依賴：** R7（共用 wipe util）
- **Branch：** Impl git `feat/r8-relogin-cross-user-detect`
- **Scope：** 中（prev_user_id 持久化 加 Alert 加 重用 R7 wipe）

---

## R9：Export 前 local 與 cloud sync 確認（🟡 中）

- **問題：** 付費 user export local 前可能 local 比 cloud 舊或新，直接 export 會丟失另一裝置改動
- **修法：**
    - syncEngine 新增 `isLocalUpToDate(): Promise<boolean>`（比對 Settings.lastSyncedAt vs cloud updatedAt 或逐 entity）
    - DataManagementScreen 全量備份 flow 加前置動作：
        1. 按 Export 全量備份 → 檢查 isLocalUpToDate
        2. False → 自動觸發 sync（push pending 加 pull remote）→ 完成後重檢
        3. Sync 成功 → 才走 R4 全量備份 export
        4. Sync 失敗 → Alert prompt「無法確認本機為最新狀態，仍要 export 當前本機資料？」讓使用者選
    - 非付費 user 無 sync 步驟（local 即唯一來源），直接 export
    - 與 logout 備份（R7）共用此 export 流程
- **依賴：** R3（5 分鐘冷卻防無限觸發），R4（JSON ZIP 全量備份檔格式與 export util）
- **Branch：** Impl git `feat/r9-export-after-cloud-sync-verify`
- **Scope：** 中（syncEngine.isLocalUpToDate 加 export flow 前置 sync 加 Alert fallback）

---

## R10：Initial Sync reLogin 自動觸發（🟢 輕）

- **問題：** `cloud_sync.md:19` Spec 寫 Upgrade 時 Initial Sync；Impl 無自動觸發點
- **修法：** Round 1 R10 的 `handlePostAuth` 在「同 user 重登 加 雲端較新」時觸發 Initial Sync 拉全量
- **依賴：** Round 1 R10（已完成）
- **Branch：** Impl git `feat/r10-initial-sync-on-relogin`
- **Scope：** 小（handlePostAuth 加分支）

---

## R11：Firebase Auth 防反覆登入軟限制（🟢 輕）

- **問題：** Firebase Auth 標準行為無 client-side rate limit；攻擊腳本反覆觸發 signIn 無門檻
- **修法：** 本機 AsyncStorage 記錄登入嘗試時間戳，例如「30 秒內不允許再登入」軟防護
- **依賴：** 無
- **Branch：** Impl git `feat/r11-signin-rate-limit`
- **Scope：** 小（AuthContext signIn 加 timestamp 檢查）

---

## Backlog（條件觸發，不編號）

- **R-bigquery-pipeline：**
    - 內容：firestore-bigquery-export extension 加 analyticsConsent filter 加 analytics API 加一次性 backfill 規劃
    - 觸發條件擇一：E2 個人化分析功能要 ship／macro_data B2B 變現要啟動／LEVEL_3 AI 顧問要 ship
    - 屬性：中
- **R-future-eu-rework：**
    - 觸發：進歐美市場前
    - 內容一：opt-out 改為 opt-in 或地區切換
    - 內容二：補登入頁與 onboarding 條款連結
    - 屬性：大

---

## 執行順序建議

| Phase | R         | Layer         | 依賴       | Scope | 說明                                          |
| ----- | --------- | ------------- | ---------- | ----- | --------------------------------------------- |
| –     | Pre-flight | admin         | R1         | –     | Spec git R1 branch merge to main              |
| A     | R2        | Impl          | –          | 小    | quota reset on logout 漏洞                    |
| A     | R3        | Impl          | –          | 小    | 5 分鐘冷卻 Impl                               |
| B     | R4        | Spec 加 Impl  | R1         | 中    | A2 全量備份檔格式 JSON ZIP                    |
| B     | R5        | Spec 加 Impl  | R1         | 中    | Settings Privacy 子頁                         |
| B     | R6        | Impl          | R1         | 小    | LEVEL_0 多裝置同步入口隱藏                    |
| C     | R7        | Impl          | R4, R2     | 中    | Logout 備份提示加本機 wipe                    |
| C     | R8        | Impl          | R7         | 中    | handleReLogin 跨 user 切換                    |
| C     | R9        | Impl          | R3, R4     | 中    | Export 前 sync 確認                           |
| D     | R10       | Impl          | –          | 小    | Initial Sync reLogin 自動觸發                 |
| D     | R11       | Impl          | –          | 小    | Firebase Auth 防反覆登入軟限制                |

- **Phase A：** 嚴重漏洞獨立修補；R2 與 R3 互不依賴可並行兩 branch（仍依「一主題一 branch」規則拆分）
- **Phase B：** R1 衍生新工作；R4 是 R7／R9 的前置依賴所以排最前；R5 與 R6 與 R4 互不依賴可任意順序
- **Phase C：** Logout／ReLogin／Export 流程；R7 為共用 wipe util 的提供者，R8 接續使用；R9 額外依賴 R3 冷卻
- **Phase D：** 餘項輕量收尾；R10 與 R11 互不依賴可任意順序

---

## Round 2 不做的事（scope 邊界）

- **不**重新設計整個 CloudSync architecture（R 系列各自小範圍解）
- **不**改 Firebase Auth provider（仍 Google Sign-In）
- **不**引入 Guest 模式 / 離線優先 mode（Spec 明定 Auth-First）
- **不**重寫 BatchSync 為 streaming
- **不**做 multi-account 並存（同裝置只支援單 user 切換式）
- **不**做 Firebase Storage 整合
- **不**做 Google Drive API 整合
- **不**處理後端資料分析架構（軌道 1 屬 DevOps 範圍）
