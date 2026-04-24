# 交易編輯器畫面: TransactionEditorScreen

## 畫面目標

- **提供:**
  - 新增與編輯收入或支出交易的介面
- **支援:**
  - 刪除既有交易紀錄
- **作為:**
  - 建立定期收支排程的入口
- **處理:**
  - 編輯由定期排程所產生交易的特殊邏輯

```text
+--------------------------------+
| Cancel      Title       Done   |
+--------------------------------+
|  Date: Oct 25, 2024 (Full)     |
+--------------------------------+
| [ $ Amount Input    ] [Recur]  |
|                                |
| [Category Selector]            |
| [Account Selector]             |
| [Note Input]                   |
|                                |
|                                |
|           [Delete]             |
+--------------------------------+
```

---

## UI 佈局

- **頂部 Header:**
    - `取消按鈕`
    - `標題`
        - **IF 支出:**
          - 支出
        - **IF 收入:**
          - 收入
    - `完成按鈕`
        - **啟用條件:**
          - 所有必填欄位皆有效
- **日期選擇區:**
    - **預設狀態:**
        - **顯示:**
          - Date With Year
        - **互動:**
          - 點擊展開日期時間選擇器
    - **展開狀態:**
        - `日曆選擇器`
            - **精確度:**
              - 年/月/日
            - **綁定欄位:**
              - `transactionDate`
        - `時間選擇器`
            - **精確度:**
              - 時/分/秒
            - **綁定欄位:**
              - `transactionDate`
    - **屬性:**
      - 必填
- **金額輸入區:**
    - `金額輸入框`
        - **樣式:**
          - 大型數字輸入
        - **鍵盤:**
          - 原生數字鍵盤
        - **屬性:**
          - 必填
    - `定期交易按鈕`
        - **圖示:**
          - 循環圖示
        - **互動:**
          - 開啟定期交易設定 Modal
        - **權限:**
          - 付費功能
- **核心欄位區:**
    - `類別選擇器 CategorySelector`
        - **過濾邏輯:**
          - 依 `type` 參數過濾 income/expense
        - **屬性:**
          - 必填
    - `帳戶選擇器 AccountSelector`
        - **排序邏輯:**
          - 依 `sortOrder` 排序
        - **屬性:**
          - 必填
    - `備註輸入框`
        - **屬性:**
          - 可選
- **底部區域:**
    - `刪除按鈕`
        - **樣式:**
          - 紅色文字
        - **可見性:**
          - 僅編輯模式顯示

---

## 核心邏輯

- **模式判斷:**
    - **觸發:**
      - 畫面載入
    - **判斷依據:**
      - 導航參數 `transactionId`
    - **IF 有 transactionId 編輯模式:**
        - **讀取:**
          - 從本機 DB 讀取該筆交易資料填入表單
    - **IF 無 transactionId 新增模式:**
        - **預設日期:**
            - **IF 有導航參數 initialDate:**
              - 使用 `initialDate` 之日期，並結合當前時間的时分秒
            - **ELSE:**
              - 使用裝置目前時間含時分秒
        - **預設類別:**
          - 選取 `sortOrder` 最高的類別
        - **預設帳戶:**
          - 選取 `sortOrder` 最高的帳戶
- **定期交易按鈕:**
    - **觸發:**
      - 點擊定期交易按鈕
    - **權限檢查:**
      - 呼叫 `PremiumLogic.checkPremiumAccess()` 檢查 Global Usage Limits
    - **IF True:**
        - **導航:**
          - RecurringSettingScreen
    - **IF False:**
        - **導航:**
          - PaywallScreen
- **儲存邏輯:**
    - **觸發:**
      - 點擊儲存按鈕
    - **IF 定期交易:**
        - **新增模式:**
          - 呼叫 `RecurringTransactions.createSchedule`
        - **編輯模式:**
          - 呼叫 `RecurringTransactions.updateSchedule`
        - **參照:**
          - 參見定期交易規格文件
    - **IF 普通交易:**
        - **新增模式:**
          - 呼叫 `TransactionLogic.createTransaction`
        - **編輯模式:**
          - 呼叫 `TransactionLogic.updateTransaction`
    - **成功後:**
        - **導航:**
          - 關閉畫面返回前一頁
- **刪除邏輯:**
    - **觸發:**
      - 點擊刪除按鈕
    - **IF 定期交易:**
        - **執行:**
          - 呼叫 `RecurringTransactions.deleteSchedule`
        - **參照:**
          - 參見定期交易規格文件
    - **IF 普通交易:**
        - **執行:**
          - 呼叫 `TransactionLogic.deleteTransaction`
    - **成功後:**
        - **導航:**
          - 關閉畫面返回前一頁

---

## 導航

- **進入:**
    - **來源:**
      - HomeScreen, 搜尋畫面
    - **必要參數:**
        - `type` 值為 income 或 expense
    - **可選參數:**
        - `transactionId` 用於編輯模式
        - `initialDate` 用於預設日期
- **退出:**
    - **觸發:**
      - 點擊取消按鈕或儲存/刪除成功
    - **導航:**
      - 返回上一頁