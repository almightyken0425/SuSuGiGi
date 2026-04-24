# 偏好設定畫面: PreferenceScreen

## 畫面目標

- **提供:**
  - 設定 App 核心行為的介面
    - 基礎貨幣
    - 時區
    - 顯示語言
- **提供:**
  - 帳號登入與登出的進階選項

```text
+--------------------------------+
| < Back      Preferences        |
+--------------------------------+
| Appearance                     |
|  Theme: [ Current Theme ] >    |
|                                |
| Localization                   |
|  Base Currency: [ TWD ] >      |
|  Time Zone: [ Asia/Taipei ] >  |
|  Language: [ English ] >       |
|                                |
| Sync                           |
|  [ Sync Now ]                  |
|                                |
| Account                        |
|  [ Login / Logout ]            |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `返回按鈕`
        - **導航:**
          - SettingsScreen
    - `標題` 偏好設定
- **設定列表:**
    - **外觀:**
        - `配色主題`
            - **顯示:**
              - 當前主題名稱，例如淺色、深色
            - **導航:**
              - ThemeSettingsScreen
            - **邏輯:**
              - 讀取 SettingKey = currentThemeId
    - **本地化:**
        - `主要貨幣`
            - **顯示:**
              - 當前設定的基礎貨幣
            - **互動:**
                - 點擊彈出貨幣選擇器
                - **列表範圍:**
                  - 包含約 160 種 ISO 4217 標準貨幣
                - **搜尋:**
                  - 支援輸入代碼如 USD 或名稱如 Dollar 進行篩選
            - **儲存:**
              - SettingKey = baseCurrencyId
            - **邏輯:**
                - **更新設定:**
                  - 更新 `baseCurrencyId`
                - **主動建立預設匯率:**
                    - **動作:**
                      - 掃描所有既有外幣帳戶
                    - **檢查:**
                      - 針對每個外幣，檢查對新本幣是否有匯率紀錄
                    - **IF 無紀錄:**
                      - 寫入一筆 `Rate=1`, `RateDate=Now` 的 `CurrencyRates`
                - **不自動換算 No Auto-Triangulation:**
                    - 系統 **嚴禁** 使用交叉匯率 Triangulation 自動計算新匯率 例如: 不可拿 JPY / OldBase 除以 USD / OldBase 來算出 JPY / USD。
                    - **理由:**
                      - 避免累計匯差誤差，確保報表精確度。
                    - **行為:**
                      - 承上，無直接紀錄者一律建立 Rate=1 的新紀錄，不試圖推算。
            - **預設值:**
              - 初始化時自動偵測手機地區若失敗則預設 TWD
        - `時區`
            - **顯示:**
              - 當前設定的時區偏移量，例如 UTC+8 對應 IANA ID Etc/GMT-8 或 Asia/Taipei
            - **互動:**
              - 點擊開啟時區選擇器列表 UTC-12 至 UTC+14
            - **儲存:**
              - SettingKey = timeZone 且儲存為 IANA ID 如 Etc/GMT-8
            - **預設值:**
              - 初始化時自動偵測手機系統時區
            - **行為:**
              - 變更後，App 內所有日期顯示、報表計算邊界皆應以此時區為準
        - `語系`
            - **顯示:**
              - 當前 App 顯示的語言
            - **互動:**
              - 點擊開啟支援的語言列表
            - **儲存:**
              - SettingKey = language
            - **預設值:**
              - 初始化時自動偵測手機語系，若為 zh 則預設繁體中文，否則預設 English
            - **行為:**
              - 變更後即時切換 i18n
    - **資料同步:**
        - `立即同步按鈕`
    - **帳號:**
        - `登出系統按鈕`
            - **樣式:**
              - 一般列表項目

---

## 核心邏輯

- **資料載入:**
    - **觸發:**
      - 畫面載入
    - **來源:**
      - 本機 DB Settings 表
    - **讀取:**
      - baseCurrencyId, timeZone, language 的 SettingValue
    - **IF 無設定值:**
        - **顯示:**
          - App 預設值
- **資料儲存:**
    - **觸發:**
      - 使用者變更任一選項
    - **本地更新:**
        - **寫入:**
          - 立即更新本機 DB Settings 表
        - **欄位:**
          - 必須設定 `updatedOn`
    - **雲端同步:**
        - **行為:**
          - 由 Sync Engine 自動處理
        - **邏輯:**
          - Sync Engine 監聽本地 DB 變更，若 `isPremium` 為 True 則自動同步至 Firestore
        - **錯誤處理:**
          - Sync Engine 內建重試與離線佇列機制
    - **IF 變更時區或語系:**
        - **觸發:**
          - App 相關設定重新載入，確保 UI 即時更新
- **帳號操作邏輯:**
    - **觸發:**
      - 點擊登出系統按鈕
    - **行為:**
      - 顯示登出確認對話框
    - **確認後:**
      - 呼叫登出邏輯並觸發 `authService.signOut()`
    - **登出成功後:**
      - `AuthContext` 狀態變更為 Null
      - 導航至 `LoginScreen`

---

## 導航

- **進入:**
    - **來源:**
      - SettingsScreen
- **退出:**
    - **觸發:**
      - 頂部導航列返回按鈕
    - **導航:**
      - SettingsScreen

