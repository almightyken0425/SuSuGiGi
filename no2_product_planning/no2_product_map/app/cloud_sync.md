## CloudSync — 雲端同步生態

- **L2 PreferenceSync:**
    - 全域設定同步
    - 全 user 享有
- **L3 TransactionBackup:**
    - 記帳紀錄 silent backup 寫入 Firestore
    - 全 user 寫入
    - 系統端內部備份用途，不對 user 開放取回
- **L4 FullBackupExport:**
    - 全量檔走 OS Share Intent
    - 全 user 享有，user 端唯一資料取回管道

三條軌道的訂閱授權拆解依據 subscription gate logic 規格文件。BigQuery 鏡像與 analytics 管道依據 analytics pipeline 產品圖文件。

跨裝置使用場景由 user 主動走匯出匯入流程銜接，無雲端即時同步機制。

---

### L2 PreferenceSync — Preference 同步

- **功能：**
    - 主貨幣
    - 主題
    - 語言
    - 時區
    - 啟動模式
    - 全域設定的雙向同步
- **目的：**
    - 跨裝置 UX 一致性
    - 不論訂閱層級
- **做法：**
    - 寫入 Firestore `users/{uid}/preferences`
    - 全 user 享有
    - 與付費層級無關
    - 與 analyticsConsent flag 完全脫鉤
- **排除：**
    - 記帳紀錄屬 L3 TransactionBackup
- **利弊：**
    - 量小，單 user 不到 1KB
    - 成本可忽略
    - 無分析價值，純為跨裝置 UX

---

### L3 TransactionBackup — 記帳紀錄 Silent Backup

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
    - user 端取回管道，user 想取回資料請走 L4 FullBackupExport
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
    - 不提供取回功能，user 想取回資料一律走 L4 FullBackupExport

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

---

### L4 FullBackupExport — 全量檔走 OS Share Intent

- **功能：**
    - 全量檔 export
    - user 主動觸發
    - 走 OS Share Intent
    - 讓 user 自選存放位置
- **目的：**
    - 讓使用者完全擁有自己資料的副本
    - 與站方後端脫鉤
    - 涵蓋三場景: 跨裝置遷移、誤刪保險、隱私退出
- **做法：**
    - 全量檔格式為 JSON ZIP
    - 含 Settings 加所有 entity 加 referential mapping
    - 走 OS Share Intent
    - user 自選去處: iCloud、Drive、Dropbox、AirDrop、Email、任意位置
    - 全 user 享有
    - 與訂閱層級無關
    - 與 analyticsConsent flag 完全脫鉤
    - 即使 user 關閉分析仍可 export
- **排除：**
    - Google Drive API 直接整合
    - iCloud native 整合
    - Firebase Storage 上傳
    - 自動定期備份
- **利弊：**
    - 工程簡單
    - 零後端成本
    - 跨平台統一，所有 OS 都有 Share Intent
    - 手動觸發
    - user 不主動就無備份
    - 詳細格式設計待專屬規格落地
