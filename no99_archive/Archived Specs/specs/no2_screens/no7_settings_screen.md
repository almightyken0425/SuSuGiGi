# 設定主頁畫面: SettingsScreen

## 畫面目標

- **提供:**
  - 存取所有帳戶、資料、偏好設定的中心化入口
- **提供:**
  - 升級至付費版的路徑

```text
+--------------------------------+
| < Back      Settings           |
+--------------------------------+
| Data Management                |
|  [Icon] Categories             |
|  [Icon] Accounts               |
|  [Icon] Currency Rates (Pro)   |
|  [Icon] Import Data (Pro)      |
|                                |
| Preferences                    |
|  [Icon] Preferences            |
|                                |
| Upgrade                        |
|  [Icon] Upgrade to Premium     |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `返回按鈕`
    - `標題`
- **設定列表:**
    - **資料管理:**
        - `類別管理`
        - `帳戶管理`
        - `匯率管理` Premium 標籤
        - `匯入資料` Premium 標籤
    - **偏好設定:**
        - `偏好設定`
    - **升級:**
        - `升級至 Premium`
            - **樣式:**
              - 醒目項目

---

## 核心邏輯

- **項目可見性:**
    - **升級至 Premium:**
        - **邏輯:**
          - 僅免費版使用者顯示
- **付費功能檢查:**
    - **觸發:**
      - 點擊 `匯率管理` 或 `匯入資料`
    - **行為:**
      - 讀取 `PremiumLogic.checkPremiumStatus` 狀態
    - **IF 免費版:**
        - **導航:**
          - PaywallScreen
    - **IF 付費版:**
        - **導航:**
          - 對應的功能畫面

---

## 導航

- **進入:**
    - **來源:**
      - HomeScreen 設定圖示點擊
- **列表項目導航:**
    - **類別管理:**
        - **導航:**
          - `CategoryListScreen`
    - **帳戶管理:**
        - **導航:**
          - `AccountListScreen`
    - **匯率管理:**
        - **導航:**
          - `CurrencyRateListScreen` 需通過付費檢查
    - **匯入資料:**
        - **導航:**
          - `ImportScreen` 需通過付費檢查
    - **偏好設定:**
        - **導航:**
          - `PreferenceScreen`
    - **升級至 Premium:**
        - **導航:**
          - `PaywallScreen`

- **退出:**
    - **觸發:**
      - 頂部導航列返回按鈕點擊
    - **導航:**
      - 返回上一頁