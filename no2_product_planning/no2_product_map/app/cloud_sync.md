## CloudSync — 雲端同步生態

- **PreferenceUpload:**
    - 全域設定單向上傳
    - 全 user 享有
- **TransactionBackup:**
    - 記帳紀錄 silent backup 寫入 Firestore
    - 全 user 寫入
    - 系統端內部備份用途，不對 user 開放取回

兩條軌道的訂閱授權拆解依據 subscription gate logic 規格文件。BigQuery 鏡像與 analytics 管道依據 analytics pipeline 產品圖文件。

跨裝置使用場景由 user 主動走匯出匯入流程銜接，無雲端即時同步機制。

---

### PreferenceUpload — Preference 上傳

- **功能：**
    - 主貨幣
    - 主題
    - 語言
    - 時區
    - 啟動模式
    - 全域設定的單向上傳
- **目的：**
    - 供未來資料分析維度，分析管線當前未接
    - 不論訂閱層級
- **做法：**
    - 寫入 Firestore `users/{uid}/preferences`
    - 全 user 享有
    - 與付費層級無關
    - 與 analyticsConsent flag 完全脫鉤
- **排除：**
    - 記帳紀錄屬 TransactionBackup
    - 從 Firestore 下載 preference 套用回本地
    - 跨裝置一致性保證
    - device 欄位
- **利弊：**
    - 量小，單 user 不到 1KB
    - 成本可忽略

---

### TransactionBackup — 記帳紀錄 Silent Backup

- **功能：**
    - 所有 user 的記帳紀錄寫入 Firestore
    - 無 user 端取回介面
- **目的：**
    - 為未來 BigQuery analytics 鏡像提供唯一資料來源
    - 系統端內部冗餘備份，僅供伺服器端意外時的災難復原
    - 不作為 user 端可取回的資料來源
- **做法：**
    - 寫入 Firestore `users/{uid}/{transactions, transfers, accounts, categories, currency_rates, schedules}`
    - 全 user 寫入，含 LEVEL_0
    - 不受 analyticsConsent flag 影響
    - flag 只影響未來啟動 BigQuery 時是否被 mirror
    - 法律基礎為 contract 履行記帳服務契約所必要
- **排除：**
    - user 端取回管道，user 取回走付費版 CSV 匯出
    - 多裝置即時同步機制
    - BigQuery mirror 屬 analytics pipeline 產品圖文件
- **利弊：**
    - 全 user 統一寫入
    - 架構一致
    - 資料量小成本可忽略

---

#### BackupEngine — 上傳引擎

- **功能：**
    - 本地資料的單向 Delta 上傳至 Firestore
- **目的：**
    - 確保系統端 Firestore 有 user 資料的最新副本，供未來 BigQuery 鏡像與災難復原使用
- **做法：**
    - 全 user 啟動，不分訂閱層級
    - 採 Local-First 策略，所有寫入即時落本地 DB，不阻塞 UI
    - 背景排程觸發上傳，user 無感
    - 以修改時間戳篩選 Delta 上傳，避免重複傳輸
- **排除：**
    - 雙向同步
    - 從 Firestore 下載資料回本地
    - user 觸發的手動上傳介面
- **利弊：**
    - 單向上傳邏輯簡單
    - user 完全無感
    - 不提供取回功能，user 取回走付費版 CSV 匯出

---

#### InitialBackup — 首次完整上傳

- **功能：**
    - user 首次安裝後將既有本地資料一次性上傳完整副本至 Firestore
- **目的：**
    - 確保 Firestore 端從一開始就有完整副本，後續僅需 Delta 增量
- **做法：**
    - 偵測 Firestore 端無此 user 資料時觸發
    - 一次性全量上傳所有本地 entity
    - 上傳完成後才啟動 Delta 增量機制
- **排除：**
    - 重複觸發 Initial Backup
- **利弊：**
    - 與 Delta 機制天然銜接
    - 首次上傳量可能較大，需配合 QuotaManagement

---

#### QuotaManagement — 配額管控

- **功能：**
    - 本地計數追蹤每日 Firestore 寫入次數
    - 超出每日上限時暫停 Silent Backup，防止單裝置 Quota Tax
- **目的：**
    - 確保單一裝置不會因為異常操作耗盡 Firestore 免費配額，保護整體服務穩定性
- **做法：**
    - 本地計數服務追蹤每日 Firestore 寫入次數
    - 每日上限設定為單裝置 2000 writes
    - 計數在 Firestore 寫入操作前後更新
    - 跨日重置基準採 UTC+0 00:00:00，全使用者統一不受裝置時區或使用者設定影響
- **排除：**
    - 依使用者裝置時區或使用者自訂時區決定跨日點，因允許切換時區會引入時點漂移與計數錯亂
    - reads 配額管控，因為單向上傳不消耗 reads
- **利弊：**
    - 本地計數實作簡單，但無法限制多裝置的全域總量，存在少量 Quota 漏洞，評估可接受
    - 採 UTC 基準對使用者完全透明，因 quota 屬後端資料蒐集導向的 fail-safe，使用者本身無感，無 UX 影響
