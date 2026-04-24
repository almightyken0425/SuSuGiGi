# 搜尋畫面: SearchScreen

## 畫面目標

- **提供:**
  - 搜尋所有交易與轉帳備註 Note 欄位的介面
- **允許:**
  - 從搜尋結果導航至該筆紀錄的編輯畫面

```text
+--------------------------------+
| < Back   [ Search Note... ]    |
+--------------------------------+
| [Icon] Category Name           |
|        Note Text (Highlight)   |
|        $ Amount      Date      |
|                                |
| [Icon] Transfer                |
|        Note Text (Highlight)   |
|        $ Amount      Date      |
|                                |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `返回按鈕`
        - **導航:**
          - 前一頁
    - `搜尋輸入框`
        - **UI:**
          - TextInput
        - **提示文字:**
          - 搜尋備註...
        - **行為:**
          - autoFocus，進入時自動彈出鍵盤
- **搜尋結果區:**
    - **UI:**
      - FlatList
    - **空狀態預設:**
      - 請輸入關鍵字以搜尋交易備註。
    - **空狀態無結果:**
      - 找不到符合關鍵字的紀錄。
    - **結果列表:**
        - **排序:**
          - 依 `transactionDate` 降冪排列
        - **列表項目:**
            - `圖示`
            - **名稱區域:**
                - **上方:**
                  - 類別名稱或轉帳
                - **下方:**
                  - 備註 Note，關鍵字高亮
            - **金額日期區:**
                - **金額:**
                    - **IF 單幣別:**
                      - Currency Standard 顯示該幣別
                    - **IF 多幣別:**
                      - 顯示原始幣別金額 + 主要貨幣換算金額
                - **日期:**
                  - 格式 Date Without Year

---

## 核心邏輯

- **資料搜尋:**
    - **觸發:**
      - 搜尋框輸入文字
    - **優化:**
      - 建議 debounce 300ms
    - **來源:**
      - 本機 DB
    - **範圍:**
      - `Transactions` + `Transfers`
    - **過濾:**
        - `note` 欄位包含關鍵字，不分大小寫
        - `deletedOn` 為 null
    - **效能:**
      - `note` 欄位應建立索引
- **導航:**
    - **觸發:**
      - 點擊任一筆搜尋結果
    - **IF Transaction 紀錄:**
        - **導航:**
          - TransactionEditorScreen
        - **參數:**
          - transactionId
    - **IF Transfer 紀錄:**
        - **導航:**
          - TransferEditorScreen
        - **參數:**
          - transferId

---

## 導航

- **進入:**
    - **來源:**
      - HomeScreen 搜尋按鈕
- **退出:**
    - **觸發:**
      - 頂部導航列返回按鈕
    - **導航:**
      - 前一頁