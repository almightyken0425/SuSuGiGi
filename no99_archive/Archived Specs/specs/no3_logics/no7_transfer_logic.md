# 轉帳核心邏輯: TransferLogic

## createTransfer 建立轉帳

- **輸入:**
  - TransferData
- **寫入 Transfer:**
    - **執行:**
      - 新增一筆記錄至 `Transfers` 表
    - **欄位:**
      - 必須設定 `updatedOn`
- **匯率連動 Append-Only:**
    - **條件:**
      - 跨幣別轉帳且有隱含匯率
    - **執行:**
      - 新增一筆記錄至 `CurrencyRates` 表
    - **欄位:**
        - `rateDate` 取自 Transfer 的 `transactionDate`
        - `rateCents` 取自 Transfer 的 `impliedRate`

## updateTransfer 更新轉帳

- **輸入:**
  - TransferData
- **更新 Transfer:**
    - **執行:**
      - 更新 `Transfers` 表中的記錄
    - **欄位:**
      - 必須更新 `updatedOn`
- **匯率連動 Append-Only:**
    - **條件:**
      - 跨幣別且隱含匯率變動或交易日期變動
    - **執行:**
      - 新增一筆記錄至 `CurrencyRates` 表
    - **欄位:**
        - `rateDate` 取自 Transfer 的 `transactionDate`
        - `rateCents` 取自 Transfer 的 `impliedRate`

## deleteTransfer 刪除轉帳

- **輸入:**
  - TransferId
- **軟刪除 Transfer:**
    - **執行:**
      - 更新 `Transfers` 表
    - **欄位:**
      - 設定 `deletedOn` 為當下時間
- **匯率連動:**
    - **行為:**
      - 不刪除任何已產生的匯率記錄
    - **理由:**
      - 匯率記錄為獨立的歷史數據
