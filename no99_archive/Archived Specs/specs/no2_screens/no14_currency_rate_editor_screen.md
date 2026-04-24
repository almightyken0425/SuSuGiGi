# 匯率編輯器畫面: CurrencyRateEditorScreen

## 畫面目標

- **提供:**
  - 新增或更新特定貨幣對匯率的介面
- **確保:**
  - 使用者輸入的資料有效且完整

```text
+--------------------------------+
| Cancel     Set Rate     Done   |
+--------------------------------+
|                                |
|                                |
|                                |
| [ From Cur ]      [ To Cur ]   |
|                                |
| [ Amount A ]  =  [ Amount B ]  |
|                                |
|                                |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `取消按鈕`
        - **導航:**
          - CurrencyRateListScreen
    - `標題` 設定匯率
    - `完成按鈕`
- **貨幣對顯示區:**
    - **UI:**
      - 兩個並排的不可編輯區塊
    - `來源貨幣` From
    - `目標貨幣` To
    - **顯示:**
      - 純文字顯示該貨幣代碼，不可變更
    - **樣式:**
      - 一般文字標籤，無下拉箭頭
- **匯率輸入區:**
    - `來源金額輸入框 Amount From`
        - **UI:**
          - 數字輸入框
        - **預設值:**
          - 1
    - `等號標籤` =
    - `目標金額輸入框 Amount To`
        - **UI:**
          - 數字輸入框


---

## 核心邏輯

- **初始化:**
    - **觸發:**
      - 畫面載入
    - **參數:**
      - 必須傳入 `currencyFromId` 與 `currencyToId`
    - **行為:**
      - 鎖定貨幣對選擇器，僅允許輸入匯率金額
    - **預設值:**
        - **Amount From:**
          - 1
        - **Amount To:**
            - 查詢最新一筆有效匯率填入
            - 若無，預設填入 1
- **儲存邏輯:**
    - **觸發:**
      - 點擊儲存按鈕
    - **驗證:**
        - `Amount From` 與 `Amount To` 皆為有效數字且大於 0
    - **儲存:**
        - **計算:**
          - `rate = Amount To / Amount From`
        - **寫入:**
          - 本機 DB 的 `CurrencyRates` 表新增一筆記錄
        - **策略:**
          - 一律為新增 Append-Only
        - **欄位:**
            - `rateDate`: 系統當下時間 Now
            - `updatedOn`: 系統當下時間 Now
    - **成功後:**
        - **導航:**
          - 返回 CurrencyRateListScreen
        - **觸發:**
          - CurrencyRateListScreen 資料重新整理
- **刪除策略:**
    - **行為:**
      - 不提供刪除按鈕

---

## 導航

- **進入:**
    - **來源:**
      - CurrencyRateListScreen 新增按鈕或列表項目
    - **可選參數:**
      - rateId 或貨幣對資訊
- **退出:**
    - **觸發:**
      - 點擊取消按鈕或儲存按鈕
    - **導航:**
      - CurrencyRateListScreen