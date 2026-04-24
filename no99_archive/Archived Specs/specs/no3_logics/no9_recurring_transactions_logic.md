# 定期交易核心邏輯: RecurringTransactions

## createSchedule 建立排程

- **輸入:**
  - ScheduleData, FirstInstanceData
- **步驟:**
    - **建立 Schedule:**
        - **執行:**
          - 於 `Schedules` 表建立一筆新記錄
    - **產生首筆交易:**
        - **IF TYPE 為 Transfer:**
            - **執行:**
              - 呼叫 `TransferLogic.createTransfer`
            - **參數:**
              - 帶入 `scheduleId` 與 `scheduleInstanceDate`
        - **IF TYPE 為 Transaction:**
            - **執行:**
              - 呼叫 `TransactionLogic.createTransaction`
            - **參數:**
              - 帶入 `scheduleId` 與 `scheduleInstanceDate`

## updateSchedule 更新排程

- **觸發:**
  - 編輯定期交易實例
- **選項:**
    - **IF 僅此一筆:**
        - **執行:**
          - 直接呼叫 `TransactionLogic.updateTransaction` 或 `TransferLogic.updateTransfer`
        - **行為:**
          - 不影響 `Schedules` 表
    - **IF 此筆及未來:**
        - **結束舊排程:**
            - **執行:**
              - 將原 `Schedule` 的 `endOn` 設為此交易日期的前一週期
        - **建立新排程:**
            - **執行:**
              - 根據新內容創建一個新 `Schedule`
            - **起始日:**
              - `startOn` 設為此筆交易日期

## deleteSchedule 刪除排程

- **觸發:**
  - 刪除定期交易實例
- **選項:**
    - **IF 僅此一筆:**
        - **執行:**
          - 直接呼叫 `TransactionLogic.deleteTransaction` 或 `TransferLogic.deleteTransfer`
    - **IF 此筆及未來:**
        - **結束排程:**
            - **執行:**
              - 將原 `Schedule` 的 `endOn` 設為此交易日期的前一週期

## generateMissingInstances 補產生實例

- **觸發:**
  - App 啟動時
- **讀取:**
  - 本地儲存 `lastRecurringCheckDate`
- **計算:**
    - 找出從 `lastRecurringCheckDate` 之後到 `currentDateInUserTZ` 當日為止，所有應產生的日期 `instanceDate`
- **執行:**
    - 遍歷所有 `deletedOn` 為 null 的 `Schedules`
    - **檢查重複:**
        - **條件:**
          - `scheduleId` 與 `scheduleInstanceDate` 組合匹配 `instanceDate`
    - **產生交易:**
        - **IF 檢查不存在:**
            - **IF TYPE 為 Transfer:**
                - **執行:**
                  - 呼叫 `TransferLogic.createTransfer`
                - **參數:**
                  - 帶入 `instanceDate` 作為 `transactionDate`
            - **IF TYPE 為 Transaction:**
                - **執行:**
                  - 呼叫 `TransactionLogic.createTransaction`
                - **參數:**
                  - 帶入 `instanceDate` 作為 `transactionDate`
            - **欄位:**
              - `scheduleId`, `scheduleInstanceDate`
- **更新:**
  - `lastRecurringCheckDate` = `currentDateInUserTZ`