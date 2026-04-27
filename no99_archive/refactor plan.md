# SuSuGiGi Refactor Plan

# Logout / ReLogin / Firebase 同步生態系

> **狀態：** 2026-04-27 完成 Phase 1 盤點與 R1-R8 規劃，候選清單記錄於此供後續挑選實作。每個 R 實際執行時各自開新 plan / Explore / branch，依新工作流（commit to feature branch + IDE Source Control Graph review）落地。

## 盤點結論摘要

Phase 1 派 3 組 Explore 平行盤點，整合對使用者 5 個提問的直接回答：

| 問題                                               | 答案                                                                                                                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App 一定要 Google 登入嗎？                         | **是**。`AppNavigator.tsx:197-198` 強制 `if (!user) → LoginScreen`；Spec `Requirements.md:131` 明寫「Auth-First 強制登入牆」                                   |
| 已登入後可離線使用嗎？                             | **可**。Firebase token cache 支援；本機 WatermelonDB 操作不需網路；只有 Firebase 同步流程會 degrade                                                            |
| Firebase 通訊點錯誤通知策略 OK 嗎？                | **整體 OK**。前景跳 Alert（signIn / signOut / export / import / IAP purchase）；背景 silent（sync / quota / preference）。沒有重大「該跳沒跳」或「不該跳卻跳」 |
| logout 前 backup 大量資料撞 quota 嗎？             | **會**。Daily 2000 writes 上限；5000 筆當日無法完成；無分日續傳。R1 決策後改走 CSV path 規避此問題                                                             |
| ReLogin 拉全量會撞冷卻？反覆 logout/login 是攻擊？ | **5 分鐘冷卻 Spec 有 Impl 沒做**（漏洞 → R3）；**logout reset quota 等於繞過 daily limit**（漏洞 → R2，Round 1 R11 引入）                                      |

---

## R1：雲端架構決策（先決條件，文件層）

**性質：** 產品決策 / 文件層 R，**無 client code 改動**，純 Product Map 落地。

**決策內容：**

### 軌道 1：資料分析（未來需求）
- 既有 Cloud Firestore 持續同步資料留作未來分析來源
- 具體分析做法（直接 read Firestore / 其他擴充）屬後端 / DevOps 設計題，本 plan 不展開
- 客戶端 App 不需配合改動

### 軌道 2：使用者備份（影響 R6）
- 路徑：App 產生 CSV → OS Share Intent → User 自選存到 Drive / iCloud / Dropbox / 任意位置
- **不**另做 Google Drive API 整合（避免擴大 OAuth scope）
- **不**另做 Firebase Storage 上傳（app 不需保管使用者檔案）
- **不**另做 logout 前 Firebase 備份特殊路徑（Firestore 持續同步本身就是雲端備份）

### 服務使用清單

| 服務             | 用途                                         |
| ---------------- | -------------------------------------------- |
| Cloud Firestore  | 持續同步資料庫（已用，唯一 source of truth） |
| Firebase Storage | 不用                                         |
| Google Drive API | 不用（OS share intent 替代）                 |

**落地：**
- Product Map `no2_product_planning/no2_product_map/app/cloud_sync.md`：在 BatchSync 或 SyncEngine 段落補策略說明
- Branch（執行時）：Product git `feat/r1-cloud-architecture-decision`
- Spec / Impl 不動

---

## R2：quota reset on logout 漏洞修正（🔴 嚴重，Round 1 R11 引入）

- **問題**：Round 1 R11 logout 時 `quotaService.reset()` 把計數歸零；攻擊者腳本反覆 logout/login 同日內無限重置 → 繞過 2000/day 軟限制
- **影響**：本地 quota 防護形同虛設；Firebase 真實 quota（project-level 50k reads / 20k writes）會被燒掉
- **修法**：logout 不重置 AsyncStorage 計數，或改為 user-scoped 計數（每 uid 一份），切 user 才獨立
- **依賴**：無
- **Branch**：Impl git `feat/r2-quota-no-reset-on-logout`
- **Scope**：小（quotaService + 1-2 caller）

---

## R3：5 分鐘冷卻 Impl 落地（🔴 嚴重，Spec 有 Impl 沒做）

- **問題**：`cloud_sync.md:16` Spec 寫「手動同步 5 分鐘冷卻」；`syncEngine.ts` 只有 `syncState.inProgress` 防重複，無時間戳檢查 → 手動同步可無限頻繁觸發
- **影響**：燒 quota / Firebase 流量
- **修法**：syncEngine 加 `lastManualSyncAt` AsyncStorage timestamp，5 分鐘內拒絕新 manual sync
- **依賴**：無
- **Branch**：Impl git `feat/r3-manual-sync-cooldown`
- **Scope**：小（syncEngine + 1 處）

---

## R4：Logout 備份提示流程 + 本機 wipe（🟡 中）

- **問題**：使用者期待 logout 前提示備份；現況 signOut 直接執行（Round 1 R11 only reset quota），無備份提醒、本機資料保留
- **修法**：
  - signOut 改為兩步：(1) Alert prompt 提示備份 → (2) 完成備份才真正 signOut + wipe 本機
  - 不分付費 / 非付費，統一導向 CSV export 路徑（依 R1 決策）
  - 新增本機 wipe util（`database.unsafeResetDatabase()` 或 user-scoped 刪）
- **依賴**：R1（決定 CSV-only 路徑）、R2（不再有 quota reset 邊界混淆）
- **Branch**：Impl git `feat/r4-logout-backup-prompt-and-wipe`
- **Scope**：中（新 Alert flow + wipe util）

---

## R5：handleReLogin 跨 user 切換（🟡 中）

- **問題**：換 Google 帳號登入會看到舊 user 資料；Spec `no2_login_logout_logic.md` 定義同 user LWW vs 不同 user 提示清資料，Impl 完全沒做
- **修法**：
  - AsyncStorage 持久化 prev_user_id
  - 登入時比對 current uid vs prev → 不同 → Alert prompt 確認 wipe → wipe 後走 Round 1 R10 `initializeNewUser`
- **依賴**：R4（共用 wipe util）
- **Branch**：Impl git `feat/r5-relogin-cross-user-detect`
- **Scope**：中（prev_user_id 持久化 + Alert + 重用 R4 wipe）

---

## R6：Export CSV 前確認 local 與 cloud 同步（🟡 中）

- **問題**：付費 user export local 前可能 local 比 cloud 舊或新，直接 export 會丟失另一裝置改動
- **修法**：
  - syncEngine 新增 `isLocalUpToDate(): Promise<boolean>`（比對 Settings.lastSyncedAt vs cloud updatedAt 或逐 entity）
  - DataManagementScreen export flow 加前置動作：
    1. 按 Export CSV → 檢查 isLocalUpToDate
    2. False → 自動觸發 sync（push pending + pull remote）→ 完成後重檢
    3. Sync 成功 → 才 export
    4. Sync 失敗 → Alert prompt「無法確認本機為最新狀態，仍要 export 當前本機資料？」讓使用者選
  - 非付費 user 無 sync 步驟（local 即唯一來源），直接 export
  - 與 logout 備份（R4）共用此 export 流程
- **依賴**：R3（5 分鐘冷卻防無限觸發）、R1（CSV-only 路徑）
- **Branch**：Impl git `feat/r6-export-after-cloud-sync-verify`
- **Scope**：中（syncEngine.isLocalUpToDate + export flow 前置 sync + Alert fallback）

---

## R7：Initial Sync reLogin 自動觸發（🟢 輕）

- **問題**：`cloud_sync.md:19` Spec 寫 Upgrade 時 Initial Sync；Impl 無自動觸發點
- **修法**：Round 1 R10 的 `handlePostAuth` 在「同 user 重登 + 雲端較新」時觸發 Initial Sync 拉全量
- **依賴**：Round 1 R10（已完成）
- **Branch**：Impl git `feat/r7-initial-sync-on-relogin`
- **Scope**：小（handlePostAuth 加分支）

---

## R8：Firebase Auth 防反覆登入軟限制（🟢 輕）

- **問題**：Firebase Auth 標準行為無 client-side rate limit；攻擊腳本反覆觸發 signIn 無門檻
- **修法**：本機 AsyncStorage 記錄登入嘗試時間戳，例如「30 秒內不允許再登入」軟防護
- **依賴**：無
- **Branch**：Impl git `feat/r8-signin-rate-limit`
- **Scope**：小（AuthContext signIn 加 timestamp 檢查）

---

## 執行順序建議

| Phase | R            | 說明                                             |
| ----- | ------------ | ------------------------------------------------ |
| A     | R1           | 先決決策；後續所有 R 才有依據                    |
| B     | R2 + R3      | 嚴重漏洞，互不依賴可並行兩 branch                |
| C     | R4 → R5 / R6 | logout 套裝；R5 R6 依賴 R4 共用 wipe / sync flow |
| D     | R7 + R8      | 餘項輕量收尾                                     |

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
