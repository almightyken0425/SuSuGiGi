# App 啟動流程

## 觸發時機

- **觸發:**
  - 使用者開啟 App

## 認證與狀態初始化

- **檢查:**
  - 本地快取的 Firebase Auth State
- **更新:**
  - 將解析結果更新至 `AuthContext` 狀態，觸發 `AppNavigator` 動態路由


## 通用核心背景任務

- **檢查條件:**
  - 當前登入的用戶
- **目的:**
  - 執行本地必要的核心資料計算與維護
- **非同步執行:**
  - **權限狀態背景同步:**
    - **執行:**
      - 於背景呼叫 `PremiumLogic.refreshPremiumStatus()` 嘗試取得最新憑證，並更新本地權限過期日狀態
  - **定期交易檢查:**
    - **檢查:**
      - `currentDateInUserTZ > lastRecurringCheckDate`
    - **IF True:**
      - **執行:**
        - 依賴本地 `schedules` 表依據使用者的定期交易設定，自動補產生所有未產生的交易與轉帳
      - **更新:**
        - `lastRecurringCheckDate`

## 付費者背景任務

- **檢查條件:**
  - `PremiumLogic.checkPremiumStatus()` 為 True
- **目的:**
  - 依序執行所有必要的付費者背景啟動任務
- **非同步執行:**
  - **批次同步自動觸發:**
    - **檢查:**
      - `currentDateInUserTZ > lastSyncCheckDate`
    - **IF True:**
      - **執行:**
        - 批次同步流程
      - **更新:**
        - `lastSyncCheckDate`
