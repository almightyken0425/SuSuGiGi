# 匯率列表畫面: CurrencyRateListScreen

## 畫面目標

- **定位:**
  - 付費功能
- **提供:**
  - 管理全域報表換算匯率的儀表板
- **溝通:**
  - 目前系統對各幣別資產的估值基準

```text
+--------------------------------+
| < Back      Rates              |
+--------------------------------+
| [ Search Currency... ]         |
+--------------------------------+
| 1 USD / TWD                    |
| = 32.500000                    |
+--------------------------------+
| 1 JPY / TWD                    |
| = 0.210000                     |
+--------------------------------+
| 1 EUR / TWD                    |
| = 1.000000                     |
+--------------------------------+
```

---

## 匯率顯示標準 Currency Pair Display Standard

### 定義
為了統一使用者的認知並符合資產估值的直覺，系統在 **設定** 與 **顯示** 匯率時，需遵循以下標準：

- **本幣 Base Currency:**
  - 指使用者在偏好設定中選擇的基礎貨幣。
- **外幣 Foreign Currency:**
  - 指任一非本幣的貨幣。
- **顯示格式:**
  - `1 外幣 Foreign / 本幣 Base`
- **意義:**
  - 表示 **1 單位的外幣** 等值於 **多少單位的本幣**。
    - 例如: Base=TWD, Foreign=USD。顯示 `1 USD / TWD = 32.5`。
    - 意即 1 美金值 32.5 台幣。

---

## UI 佈局

- **頂部導航列:**
    - `返回按鈕`
        - **導航:**
          - SettingsScreen
    - `標題` 匯率設定
- **搜尋區:**
    - `搜尋輸入框`
        - **提示文字:**
          - 搜尋幣別...
        - **功能:**
          - 依幣別代碼或名稱篩選列表
- **匯率列表:**
    - **UI:**
      - FlatList
    - **邏輯:**
      - 顯示 本幣 Base 與 既有帳戶幣別 Foreign 的所有組合
    - **列表項目:**
        - `幣別標題` 1 Foreign / Base 例如 1 USD / TWD
        - `匯率數值`
            - **顯示:**
              - 匯率數值
            - **格式:**
              - 顯示至小數點後 6 位，例如 = 32.500000

---

## 核心邏輯

- **資料準備 Data Preparation:**
    - **取得本幣 Base:**
      - 讀取 `Settings.baseCurrencyId`
    - **取得外幣 Foreign:**
        - 查詢 `Accounts` 表，取得所有 **不重複** 且 **不等於本幣** 的 `currencyId`
    - **生成交易對:**
        - 針對每一個 Foregin Currency，生成一個 Foreign 至 Base 的交易對組合
- **匯率查找 Rate Lookup:**
    - **對象:**
      - 上述生成的每一個交易對
    - **查詢:**
      - `CurrencyRates` 表
    - **條件:**
        - `currencyFromId` = Foreign
        - `currencyToId` = Base
        - 排序: `rateDate` DESC, `createdOn` DESC
        - 取第 1 筆
    - **限制:**
      - **不執行** 自動換算 No Triangulation。若無直接對應紀錄，即視為匯率 = 1。
- **搜尋邏輯:**
    - **關鍵字:**
      - 使用者輸入字串
    - **比對:**
      - 交易對中的 Foreign 或 Base 的代碼 Code 或名稱 Name 符合關鍵字
    - **範例:**
      - Base=TWD, Foreign=USD。輸入 USD, TWD, 美金 皆應顯示此項目。
- **互動:**
    - **點擊項目:**
        - **行為:**
          - 開啟匯率編輯器
        - **導航:**
          - CurrencyRateEditorScreen
        - **參數:**
          - 傳入鎖定的 `currencyFrom` Foreign 與 `currencyTo` Base
        - **模式:**
          - 新增 Append-Only
- **付費牆檢查:**
    - **觸發:**
      - 從 SettingsScreen 導航進入前
    - **檢查:**
      - `PremiumLogic.checkPremiumStatus()`
    - **IF 免費版:**
        - **導航:**
          - PaywallScreen

---

## 導航

- **進入:**
    - **來源:**
      - SettingsScreen
    - **權限:**
      - 需為付費用戶
- **退出:**
    - **觸發:**
      - 頂部導航列返回按鈕
    - **導航:**
      - SettingsScreen
- **導出:**
    - **觸發:**
      - 點擊列表項目
    - **導航:**
      - CurrencyRateEditorScreen