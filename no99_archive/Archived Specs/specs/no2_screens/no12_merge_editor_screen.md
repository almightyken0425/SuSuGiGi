# 合併編輯器畫面: MergeEditorScreen

## 畫面目標

- **提供:**
  - 合併兩個帳戶或兩個類別的介面
- **執行:**
  - 將來源項目的關聯資料轉移至目標項目，並軟刪除來源項目

```text
+--------------------------------+
| Cancel      Merge       Done   |
+--------------------------------+
|                                |
|  [ Source Item ]   ->   [ Target Item ] |
|  (To be deleted)        (To keep)       |
|                                |
|  Select Source          Select Target   |
|  [ Selector ]           [ Selector ]    |
|                                |
|  Warning:                      |
|  Merging will move all transactions |
|  from Source to Target.        |
|  Source will be deleted.       |
|                                |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `取消按鈕`
    - `標題` 合併
    - `完成按鈕`
        - **啟用條件:**
          - 來源與目標皆已選擇，且來源不等於目標
- **合併操作區:**
    - **視覺化流程:**
        - 左側顯示來源項目圖示與名稱
        - 中間顯示右向箭頭
        - 右側顯示目標項目圖示與名稱
    - `來源選擇器`
        - **標籤:**
          - 來源 將被刪除
        - **UI:**
          - 點擊彈出選擇清單
        - **過濾:**
          - 排除已選擇的目標項目、已停用 disabledOn、已刪除 deletedOn
    - `目標選擇器`
        - **標籤:**
          - 目標 將保留
        - **UI:**
          - 點擊彈出選擇清單
        - **過濾:**
          - 排除已選擇的來源項目、已停用 disabledOn、已刪除 deletedOn
- **警告訊息區:**
    - **內容:**
      - 合併後，所有屬於來源的交易紀錄將轉移至目標，且來源將被刪除。
    - **樣式:**
      - 顯眼的警告樣式

---

## 核心邏輯

- **模式判斷:**
    - **觸發:**
      - 畫面載入
    - **判斷依據:**
      - 導航參數 `mode` 為 Account 或 Category
- **合併執行:**
    - **觸發:**
      - 點擊完成按鈕
    - **驗證:**
      - 再次確認來源 != 目標
    - **IF 帳戶模式:**
        - **轉移交易:**
          - 搜尋所有 `accountId` = 來源ID 的交易，更新為 目標ID
        - **轉移轉帳 From:**
            - 搜尋所有 `fromAccountId` = 來源ID 的轉帳
            - **IF** `toAccountId` == 目標ID: **軟刪除** 以避免自我轉帳
            - **ELSE**: 更新 `fromAccountId` 為 目標ID
        - **轉移轉帳 To:**
            - 搜尋所有 `toAccountId` = 來源ID 的轉帳
            - **IF** `fromAccountId` == 目標ID: **軟刪除** 以避免自我轉帳
            - **ELSE**: 更新 `toAccountId` 為 目標ID
        - **軟刪除來源:**
          - 設定來源帳戶 `deletedOn`
        - **更新時間:**
          - 所有受影響資料更新 `updatedOn`
    - **IF 類別模式:**
        - **轉移交易:**
          - 搜尋所有 `categoryId` = 來源ID 的交易，更新為 目標ID
        - **軟刪除來源:**
          - 設定來源類別 `deletedOn`
        - **更新時間:**
          - 所有受影響資料更新 `updatedOn`
    - **成功後:**
        - **導航:**
          - 返回上一頁

---

## 導航

- **進入:**
    - **來源:**
      - AccountListScreen 或 CategoryListScreen
    - **必要參數:**
      - `mode` 為 Account 或 Category
- **退出:**
    - **觸發:**
      - 點擊取消或合併成功
    - **導航:**
      - 返回上一頁
