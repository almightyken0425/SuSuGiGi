# 登入認證後邏輯

## 觸發時機

- **觸發:**
  - 認證成功時，由 `LoginScreen` 觸發

## 權限檢查

- **檢查:**
  - 呼叫 `PremiumLogic.refreshPremiumStatus()` 更新本地權限狀態

## 舊用戶邏輯 Premium

- **條件:**
  - `PremiumLogic.checkPremiumStatus()` 為 True
- **讀取 User Profile:**
  - **行為:**
    - 嘗試讀取 Firestore `users/{uid}`
- **IF 讀取成功:**
  - **解析:**
    - 取得 Firestore 回傳的 `preferences` 包含
      - language
      - currency
      - timezone
      - theme
      - 更新時間 `updatedAt` 並定義為遠端時間
    - 取得本機 DB `Settings` 表的 `updatedOn` 並定義為本機時間
  - **衝突解決 Last Write Wins:**
    - **IF 遠端時間大於本機時間或是本地無資料:**
      - 將雲端偏好寫入本機 DB `Settings` 表
        - `language` = `preferences.language`
        - `baseCurrencyId` = `preferences.currency`
        - `timeZone` = `preferences.timezone`
        - `theme` = `preferences.theme`
        - `updatedOn` = `updatedAt`，藉由保持與雲端時間戳一致來避免被標記為本機異動資料
    - **IF 本機時間大於遠端時間:**
      - 本機設定不覆寫
      - 不執行任何動作
  - **後續:**
    - 觸發同步與定期交易檢查

## 新用戶初始化邏輯

- **條件:**
  - 讀取失敗、文件不存在 或 `PremiumLogic.checkPremiumStatus()` 為 False
- **執行:**
  - 初始化流程
- **決定預設值:**
  - **主要幣別:**
    - 嘗試從裝置 Locale 取得，若無則預設 TWD，需轉換為 ISO Code
  - **語系:**
    - 嘗試從裝置 Locale 取得，若無則預設系統語言
  - **時區:**
    - 讀取裝置時區
  - **主題:**
    - 預設 Default
- **寫入本機 App Onboarding:**
  - **建立:**
    - 呼叫 `syncUserToLocalDb` 建立本機 DB `users` 與 `Settings` 表資料，需將 ISO Code 轉為 Currency ID
  - **建立預設資料:**
    - 於背景呼叫 `seedInitialData` 自動產生預設收支分類及現金帳戶
- **寫入雲端 User Management Onboarding:**
  - **條件:**
    - 僅在 `PremiumLogic.checkPremiumStatus()` 為 True 時執行
  - **建立:**
    - Firestore `users/{uid}` 文件
  - **內容:**
    - `uid`, `email`, `provider`
    - `preferences`: { language, currency, timezone, theme }，儲存 ISO Code
    - `createdAt`: Server Timestamp
- **行為:**
  - 不執行 Batch Sync，因無資料需下載
