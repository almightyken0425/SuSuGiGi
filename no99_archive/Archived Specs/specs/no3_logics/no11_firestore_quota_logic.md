# Firestore 資料配額邏輯

## 邏輯目標

- **成本控制:**
  - 確保 App 運作不超過 Firebase 免費額度 Spark Plan
- **防止失控:**
  - 避免程式錯誤導致無限迴圈讀寫，產生高額帳單
- **公平使用:**
  - 限制單一裝置的資源消耗

---

## 限制設定

- **每日讀取上限:**
  - 2,000 次
- **每日寫入上限:**
  - 2,000 次
- **重置機制:**
    - **依據:**
      - 本地時間 Local Time
    - **行為:**
      - 跨日 Date 變更時自動歸零

---

## 核心邏輯

### 檢查機制 Check Quota
- **時機:**
  - 每次執行 `syncEngine.sync()` 前
- **行為:**
    - 讀取本地儲存的 `reads` 與 `writes` 計數
    - **IF** `reads >= MAX_DAILY_READS` **AND** `writes >= MAX_DAILY_WRITES`:
        - 終止同步流程
        - Log 警告 `Daily quota exceeded`
    - **IF** `writes >= MAX_DAILY_WRITES`:
        - 跳過 **上傳階段 Push**
        - 僅執行 **下載階段 Pull**
    - **IF** `reads >= MAX_DAILY_READS`:
        - 跳過 **下載階段 Pull**
        - 僅執行 **上傳階段 Push**

### 計數機制 Increment Logic
- **寫入計數 Writes:**
    - **觸發:**
      - `pushChanges` 成功寫入 Firestore 後
    - **數量:**
      - `opCount` ，即實際透過 `batch.commit()` 寫入的文件總數
    - **儲存:**
      - 累加至 `AsyncStorage` 的 `sync_quota_writes`
- **讀取計數 Reads:**
    - **觸發:**
      - `pullChanges` 或 `pullCollection` 從 Firestore 讀取文件後
    - **數量:**
      - `snapshot.size` ，即實際讀取到的文件數量
    - **儲存:**
      - 累加至 `AsyncStorage` 的 `sync_quota_reads`

### 重置邏輯 Reset Logic
- **檢查時機:**
  - 每次存取 Check/Increment/GetStats 等 Quota Service 行為時
- **判斷:**
  - `AsyncStorage.getItem('sync_quota_date')` vs `Today (YYYY-MM-DD)`
- **IF 日期不同:**
    - `sync_quota_date` = `Today`
    - `sync_quota_reads` = 0
    - `sync_quota_writes` = 0

---

## 資料儲存

- **儲存位置:**
  - `AsyncStorage`
- **Key 定義:**
    - `sync_quota_date`: 紀錄上次更新的日期 YYYY-MM-DD
    - `sync_quota_reads`: 當日已讀取次數
    - `sync_quota_writes`: 當日已寫入次數

---



## 參考實作

- **服務:**
  - `src/services/quotaService.ts`
- **同步引擎:**
  - `src/services/syncEngine.ts`
