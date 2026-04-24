# 定期交易設定畫面: RecurringSettingScreen

## 畫面目標

- **提供:**
  - 設定交易或轉帳的重複規則介面
- **回傳:**
  - 設定好的 `Schedule` 規則參數

```text
+--------------------------------+
| Cancel      Repeat      Done   |
+--------------------------------+
|                                |
| Frequency: [ Monthly ] >       |
| Every: [ 1 ] Month(s)          |
|                                |
| End: [ Never ] >               |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `取消按鈕`
    - `標題`
    - `完成按鈕`

- **核心設定區:**
    - `頻率選擇器`
        - **UI:**
          - 選單或 ActionSheet
        - **選項:**
            - 每日 Daily
            - 每週 Weekly
            - 每月 Monthly
            - 每年 Yearly
        - **預設:**
          - 每月
    - `間隔輸入框`
        - **UI:**
          - 數字輸入框或 Stepper
        - **標籤:**
          - 每 N 單位
        - **限制:**
          - 最小 1
    - `結束條件選擇器`
        - **UI:**
          - 選單
        - **選項:**
            - 永不 Never
            - 於特定日期 On Date
        - **預設:**
          - 永不
    - `結束日期選擇器`
        - **可見性:**
          - 僅當結束條件為 `於特定日期` 時顯示
        - **UI:**
          - DatePicker
        - **預設:**
          - 今天 + 1 年



---

## 核心邏輯

- **參數回傳:**
    - **觸發:**
      - 點擊完成按鈕
    - **行為:**
      - 將設定打包為 `Schedule` 物件不含 ID 回傳給上層畫面 `TransactionEditor` 或 `TransferEditor`
    - **資料:**
        - `frequency`: enum DAILY, WEEKLY, MONTHLY, YEARLY
        - `interval`: int
        - `endOn`: timestamp | null



---

## 導航

- **進入:**
    - **來源:**
      - TransactionEditorScreen 或 TransferEditorScreen
    - **方式:**
      - Modal 彈出
- **退出:**
    - **觸發:**
      - 點擊取消或完成按鈕
    - **導航:**
      - 關閉 Modal
