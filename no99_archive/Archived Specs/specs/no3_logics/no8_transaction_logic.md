# 交易核心邏輯: TransactionLogic

## createTransaction 建立交易

- **輸入:**
  - TransactionData
- **寫入 Transaction:**
    - **執行:**
      - 新增一筆記錄至 `Transactions` 表
    - **欄位:**
      - 必須設定 `updatedOn`

## updateTransaction 更新交易

- **輸入:**
  - TransactionData
- **更新 Transaction:**
    - **執行:**
      - 更新 `Transactions` 表中的記錄
    - **欄位:**
      - 必須更新 `updatedOn`

## deleteTransaction 刪除交易

- **輸入:**
  - TransactionId
- **軟刪除 Transaction:**
    - **執行:**
      - 更新 `Transactions` 表
    - **欄位:**
      - 設定 `deletedOn` 為當下時間
