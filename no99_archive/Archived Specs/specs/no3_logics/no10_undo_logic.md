# 復原機制 Undo Mechanism

## 機制目標

- 提供使用者挽救誤刪除資料的機會
- 確保使用者操作的可逆性與安全性

---

## 支援範圍 Scope

- **支援動作:**
    - 刪除交易 Transaction
    - 刪除轉帳 Transfer
    - 刪除帳戶 Account，包含其關聯交易的隱藏
    - 刪除類別 Category
- **不支援動作:**
    - 修改交易內容
    - 修改設定
    - 建立新資料，V1 暫不支援

---

## UI 互動規格

### 復原提示 Snackbar

- **結構:**
    - `訊息文字` 顯示如 "已刪除一筆交易"
    - `復原按鈕` 點擊後執行復原
- **樣式:**
    - 懸浮於畫面底部
    - 採用高對比色以吸引注意
- **行為:**
    - **顯示時機:**
      - 當支援範圍內的破壞性動作完成後立即顯示
    - **持續時間:**
      - 4000ms
    - **單一實例:**
      - 同一時間僅存在一個 Snackbar
    - **替換邏輯:**
      - 若前一個 Snackbar 尚未消失又有新動作，直接替換為最新動作的 Snackbar

### 導航行為

- **切換畫面:**
  - Snackbar 應依附於 Global Context，切換 Tab 或進入下一層頁面時不應消失
- **關閉 Modal:**
  - 若在 Modal，如編輯器中執行刪除，Modal 關閉後 Snackbar 仍須顯示於背景畫面

---

## 核心邏輯 Implementation Logic

### 資料處理策略

- **策略:**
  - 立即提交與反向操作，Immediate Commit 和 Reverse Operation
- **說明:**
    - 動作發生時立即寫入資料庫，即 Soft Delete
    - 復原時執行反向更新，將 deletedOn 設為 null
- **優點:**
    - 確保資料安全性，若 App 崩潰，刪除操作已保存
    - 符合 Local First 資料庫同步模型

### UndoContext

- **職責:**
    - 維護當前可復原的動作狀態
    - 控制 Snackbar 的顯示與隱藏
    - 執行復原回呼函數
- **狀態定義:**
    - Type 動作類型
    - Payload 相關 ID 或資料
    - RevertAction 復原執行的函數
- **限制:**
    - 僅支援單步復原，Single Step Undo
    - 新動作會覆蓋舊動作的復原機會

### 實作流程範例 - 刪除交易

- **觸發:**
  - 使用者點擊刪除按鈕
- **執行:**
    - DB 更新 `deletedOn` 欄位
    - 通知 Sync 系統
    - 呼叫 `UndoContext.show`，傳入 Transaction 類型與 uid
- **復原:**
    - 使用者點擊 Snackbar 復原按鈕
    - 呼叫 `TransactionModel.restore` 更新 `deletedOn` 為 null
    - 觸發畫面刷新
    - 隱藏 Snackbar

---

## 異常處理

- **復原失敗:**
    - 若因資料庫鎖定或同步衝突導致復原失敗
    - 顯示 "復原失敗" 提示
    - 保持資料刪除狀態
- **關聯資料:**
    - **IF 刪除帳戶:**
      - 復原帳戶時，需確保其關聯的交易可見性恢復，若依賴 Cascade Soft Delete
    - **IF 刪除類別:**
      - 復原類別時，恢復其選單可見性