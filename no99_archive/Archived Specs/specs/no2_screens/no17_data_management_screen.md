# 資料管理畫面: DataManagementScreen

## 畫面目標

- **提供:**
  - 資料管理與偏好設定的集中入口
- **主要功能:**
    - 資料同步與清除
    - CSV 檔案匯入
    - App 偏好設定

---

## UI 佈局

- **Header:**
    - `PushNavigationHeader`
    - `標題` 資料與設定
    - `返回按鈕`
- **ScrollView:**
    - **資料管理 Section:**
        - `Section 標題` 資料管理
        - **Card:**
            - **`Sync Now 列表項`**
                - `圖示` cloud-sync-outline
                - `文字` 立即同步
                - `顏色` Primary Main
                - `右側 Chevron`
            - `分隔線`
            - **`Clear Database 列表項`**
                - `圖示` database-refresh-outline
                - `文字` 清除資料庫
                - `顏色` Status Error
                - `右側 Chevron`
    - **資料匯入 Section:**
        - `Section 標題` 資料匯入
        - **Card:**
            - **`匯入收入支出 列表項`**
                - `圖示` file-import-outline
                - `文字` 匯入收入/支出
                - `顏色` Text Primary
                - `右側 Chevron`
            - `分隔線`
            - **`匯入轉帳 列表項`**
                - `圖示` swap-horizontal
                - `文字` 匯入轉帳
                - `顏色` Text Primary
                - `右側 Chevron`

---

## 核心邏輯

- **Sync Now:**
    - **觸發:**
      - 點擊立即同步列表項
    - **行為:**
        - 顯示 Alert 提示 Processing, Starting detailed sync...
        - 執行同步流程:
            - 同步 User Profile 至 Firestore
            - 重置 Sync State
            - 執行完整資料同步
        - **成功:**
          - 顯示 Alert Success, Full Sync executed. Check logs.
        - **失敗:**
          - 顯示 Alert Error, Sync failed: 加上實際錯誤訊息
- **Clear Database:**
    - **觸發:**
      - 點擊清除資料庫列表項
    - **行為:**
        - 顯示確認 Alert Dialog
        - **標題:**
          - 確認清除資料庫
        - **訊息:**
          - 此操作將清除所有本地資料，且無法復原。確定要繼續嗎？
        - **選項:**
            - `取消按鈕` 樣式 cancel
            - `清除按鈕` 樣式 destructive
                - **執行:**
                  - 呼叫 `database.unsafeResetDatabase()`
                - **成功:**
                  - 顯示 Alert Success, Database reset. Please restart the app.
                - **失敗:**
                  - 顯示 Alert Error, Failed to reset database
- **匯入收入支出:**
    - **觸發:**
      - 點擊匯入收入/支出列表項
    - **導航:**
      - 跳轉至 Import Wizard 畫面，模式參數設為 `transaction`
    - **邏輯:**
      - 執行 CSV 匯入流程，建立收入或支出類型的 Transaction 紀錄
- **匯入轉帳:**
    - **觸發:**
      - 點擊匯入轉帳列表項
    - **導航:**
      - 跳轉至 Import Wizard 畫面，模式參數設為 `transfer`
    - **邏輯:**
      - 執行 CSV 匯入流程，建立 Transfer 紀錄

---

## 導航

- **進入:**
    - **來源:**
      - SettingsScreen 或其他設定入口
- **退出:**
    - **觸發:**
      - 點擊 Header 返回按鈕
    - **導航:**
      - 返回上一頁

---

## 多語言

- **Section 標題:**
    - `settings.data_management` 資料管理
    - `settings.preferences` 偏好設定
- **列表項文字:**
    - `settings.sync_now` 立即同步
    - `settings.reset_database` 清除資料庫
    - `settings.import_transactions` 匯入收入/支出
    - `settings.import_transfers` 匯入轉帳
- **Alert 訊息:**
    - `settings.reset_confirm_title` 確認清除資料庫
    - `settings.reset_confirm_msg` 此操作將清除所有本地資料，且無法復原。確定要繼續嗎？
    - `common.cancel` 取消