# 批次同步規格: BatchSyncSpec

## 核心架構

- **架構模型:**
  - 本地優先 Local-First
    - **資料來源:**
      - App 讀寫操作一律針對本機資料庫 Local DB
    - **UI 反應:**
      - UI 即時反應本機資料庫
- **雲端角色:**
  - Firestore
    - **定位:**
      - 付費版被動備份與同步伺服器
- **同步模型:**
    - **名稱:**
      - 增量批次同步 Delta Batch Sync
    - **行為:**
      - 僅同步增量資料

## 資料結構先決條件

- **updatedOn:**
  - 必要欄位
    - **要求:**
      - 所有需同步資料表必須包含 `updatedOn`
    - **邏輯:**
      - 本機新增或修改操作必須更新 `updatedOn`，作為同步依據
- **deletedOn:**
  - 軟刪除
- **lastSyncTimestamp:**
  - 本地儲存
    - **要求:**
      - 本地持久化儲存 `lastSyncTimestamp`
    - **邏輯:**
      - 增量同步錨點，同步成功後更新
- **lastSyncCheckDate:**
  - 本地儲存
    - **要求:**
      - 本地持久化儲存日期標記
    - **邏輯:**
      - 每日自動觸發檢查點，與使用者主要時區掛鉤

## 衝突解決策略

- **策略:**
  - 最後寫入者獲勝 Last Write Wins
- **機制:**
  - 依據 `updatedOn`
- **範例:**
    - 裝置 A 離線修改 Account-X, `updatedOn`: 10:05 AM
    - 裝置 B 離線修改 Account-X, `updatedOn`: 10:10 AM
    - 裝置 B 先同步，上傳 10:10 版本
    - 裝置 A 後同步，上傳 10:05 版本
    - 裝置 A 接著下載，抓到 10:10 版本
    - **最終結果:**
      - 兩台裝置皆為 10:10 版本，10:05 修改被覆蓋

## 同步觸發時機

- **手動觸發:**
  - 付費功能
    - **入口:**
      - 設定 > 偏好設定 > 立即同步按鈕
    - **檢查 Premium:**
      - `PremiumLogic.checkPremiumStatus()`
        - **IF False:**
          - 導航至 PaywallScreen 並終止流程
    - **檢查冷卻機制:**
      - `Now < nextSyncAllowedTime`
        - **IF True:**
          - 提示您剛才同步過了，請 5 分鐘後再試並終止流程
    - **行為:**
      - 同步執行批次同步流程，顯示載入指示器

## 批次同步流程

- **目標:**
  - 雙向增量同步 Two-Way Delta Sync
- **前提:**
  - currentSyncTime = Now
- **上傳階段 Upload:**
    - **Preferences Sync:**
      - 檢查本機 `Settings.updatedOn > lastSyncTimestamp`
      - 若為 True，則讀取本機偏好設定
      - 呼叫 API `updateUserPreferences` 推送至雲端
    - **Collections Sync:**
      - **查詢:**
        - 本機 `find(all documents where updatedOn > lastSyncTimestamp)`
      - **行為:**
        - 批次上傳本機變更至 Firestore
    - **IF 上傳失敗:**
      - 終止流程，禁止更新 `lastSyncTimestamp`
- **下載階段 Download:**
    - **Preferences Sync:**
      - 獨立請求 `users/{uid}`，並執行 LWW 對比：若雲端 `updatedAt` > 本機 `Settings.updatedOn`，則將雲端資料覆寫至本機 `Settings`。
    - **Collections Sync:**
      - **查詢:**
        - 雲端 `get(all documents from Firestore where updatedOn > lastSyncTimestamp AND userId == currentUserId)`
      - **行為:**
        - 取得雲端變更列表，批次寫入雲端變更至本機資料庫
    - **Upsert 邏輯:**
      - 依據 `id`
        - **IF 本機已存在:**
          - 更新 Update
        - **IF 本機不存在:**
          - 插入 Insert
    - **IF 下載或寫入本機失敗:**
      - 終止流程，禁止更新 `lastSyncTimestamp`
- **完成階段 Finalize:**
    - **條件:**
      - 上傳與下載均成功
    - **更新:**
      - 本地 `lastSyncTimestamp` 為 `currentSyncTime`
    - **更新:**
      - 手動觸發 `nextSyncAllowedTime = currentSyncTime + 5 分鐘`
    - **提示:**
      - 隱藏載入指示器，顯示同步成功

## 權限變更同步策略

### 升級 Upgrade Tier 0 to Tier 1

當使用者購買訂閱或恢復購買，獲得 `premium` 權限時：

- **觸發時機:**
  - PremiumContext 偵測到使用者取得 `premium` 權限並且目前晉升為付費版
- **Initial Sync:**
    - **啟動:**
      - Sync Engine
    - **強制執行完整同步:**
        - 將本地所有資料 WatermelonDB 標記為 `dirty` 或直接掃描所有資料
        - 執行 **上傳階段:** 將本地累積的資料全部上傳至 Firestore
        - 執行 **下載階段:** 拉取雲端可能存在的舊資料
    - **更新狀態:**
      - 設定 `lastSyncTimestamp`

### 降級 Downgrade Tier 1 to Tier 0

當使用者訂閱過期，失去 `premium` 權限時：

- **觸發時機:**
  - PremiumContext 偵測到使用者失去 `premium` 權限並且目前降為免費版
- **Stop & Freeze:**
    - **停止 Sync Engine:**
      - 立即終止所有背景同步排程
    - **保留本地資料:**
      - 使用者在本地的資料完全保留，可繼續離線使用
    - **凍結雲端資料:**
      - Firestore 上的資料不再更新，視為封存
    - **UI 反應:**
      - 隱藏所有同步相關的 UI，例如 `立即同步` 按鈕，或顯示為鎖定狀態

## 首次同步流程

- **情境:**
  - 付費版使用者登入新裝置，或剛升級付費版並首次觸發同步
- **邏輯:**
  - `lastSyncTimestamp` 為 0 或 null
- **流程:**
    - **上傳階段:**
      - 查詢 `updatedOn > 0`，上傳本機所有資料
    - **下載階段:**
      - 查詢 `updatedOn > 0`，下載雲端所有資料寫入本機，並以 LWW 策略自動合併
    - **完成階段:**
      - `lastSyncTimestamp` 更新為當前時間