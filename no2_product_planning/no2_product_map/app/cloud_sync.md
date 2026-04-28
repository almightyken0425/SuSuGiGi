## CloudSync — 雲端同步生態

- **L2 PreferenceSync:**
    - 全域設定同步
    - 全 user 享有
- **L3 TransactionBackup:**
    - 記帳紀錄 silent backup 寫入 Firestore
    - 全 user 寫入
- **L3 MultiDeviceSync:**
    - 跨裝置即時同步 UI
    - LEVEL_1 以上才開放
- **L4 FullBackupExport:**
    - A2 全量檔走 OS Share Intent
    - 全 user 享有

四條軌道的訂閱授權拆解依據 subscription gate logic 規格文件。BigQuery 鏡像與 analytics 管道依據 analytics pipeline 產品圖文件。

---

### L2 PreferenceSync — Preference 同步

- **功能：**
    - 主貨幣
    - 主題
    - 語言
    - 時區
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
    - 既有 LEVEL_0 禁雲端同步的 spec 與此衝突
    - 由 cloud_backup entitlement 拆解承接

---

### L3 TransactionBackup — 記帳紀錄 Silent Backup

- **功能：**
    - 所有 user 的記帳紀錄寫入 Firestore
    - 無多裝置同步 UI
- **目的：**
    - 為未來 BigQuery analytics 鏡像提供唯一資料來源
    - 為使用者提供雲端備份保險
    - 涵蓋換手機等情境的 fallback
- **做法：**
    - 寫入 Firestore `users/{uid}/{transactions, transfers, accounts, categories, currency_rates, schedules}`
    - 全 user 寫入，含 LEVEL_0
    - 不受 analyticsConsent flag 影響
    - flag 只影響未來啟動 BigQuery 時是否被 mirror
- **排除：**
    - 多裝置同步 UI 屬 L3 MultiDeviceSync
    - BigQuery mirror 屬 analytics pipeline 產品圖文件
- **利弊：**
    - 全 user 統一寫入
    - 架構一致
    - 資料量小成本可忽略
    - 與既有 LEVEL_0 禁雲端同步的 spec 衝突
    - 由 cloud_backup entitlement 拆解承接

---

### L3 MultiDeviceSync — 多裝置同步 LEVEL_1 以上

- **功能：**
    - Firestore 批次雙向同步，App 端
    - 手動立即同步觸發
    - Firestore 配額本地管控
- **目的：**
    - 讓付費用戶的跨裝置資料可信
    - 以最低 Firestore 讀寫成本實現最終一致
- **做法：**
    - Delta batch sync，分三階段：
      - Upload
      - Download
      - Finalize
    - Last-Write-Wins 衝突解決
    - 手動同步 5 分鐘冷卻
    - Firestore 每日讀寫以本地計數管控，避免 Quota Tax
    - Sync Engine 僅在偵測到使用者擁有有效權限時啟動
    - Upgrade 偵測到權限新增時，觸發 Initial Sync 完整上傳本地資料
    - Downgrade 偵測到權限過期時，停止 Sync Engine，保留本地資料
- **排除：**
    - 即時同步
    - 外部匯率 API
- **利弊：**
    - 批次策略大幅降低 Firestore 費用，但使用者需手動或等待自動觸發
    - 本地 Quota 計數防止單裝置失控，但無法限制多裝置的全域總量，評估可接受

---

#### SyncEngine — 同步引擎

- **功能：**
    - 本地與 Firestore 的雙向 Delta 批次同步。
    - 衝突解決策略管理。
- **目的：**
    - 以最低 Firestore 讀寫成本，確保付費使用者的跨裝置資料最終一致
- **做法：**
    - Upload 階段推送本地修改
    - Download 階段拉取雲端變更
    - Finalize 階段確認完成並更新最後同步時間紀錄
    - 以修改時間戳實作 Last-Write-Wins
- **排除：**
    - Firestore real-time listener 即時監聽
- **利弊：**
    - LWW 簡單可預測，但多裝置同時編輯同一筆資料時，較早的修改會靜默被覆蓋
    - 採 Local-First 策略直接寫入本地 DB，而非透過 Cloud Function API
    - 犧牲部分後端驗證能力，換取極致的即時性與離線支援
    - Sync Engine 已負責權限驗證，直接寫入本地 DB 確保 UI 零延遲更新

---

##### BatchSync — 批次同步機制

- **功能：**
    - Delta 差量上傳與下載，僅傳輸上次同步後有異動的資料
    - 手動立即同步觸發，含 5 分鐘冷卻
    - 升級 LEVEL_1 時執行首次完整同步 Initial Sync
- **目的：**
    - 最小化 Firestore 讀寫次數以控制費用
    - 同時提供使用者主動同步的控制感
- **做法：**
    - 以修改時間戳篩選差量資料
    - 降級 LEVEL 時停止同步引擎，保留本地資料
- **排除：**
    - 自動即時同步
- **利弊：**
    - Delta 同步大幅減少讀寫，但 schema 異動需謹慎維護版本相容性。

---

##### ConflictResolution — 衝突解決策略

- **功能：**
    - Last-Write-Wins 衝突解決
- **目的：**
    - 提供簡單可預期的衝突解決機制，避免需要使用者手動介入合併
- **做法：**
    - 同步時比對本地與雲端的修改時間戳，保留較新的版本覆寫較舊的
- **排除：**
    - 三向合併 Three-way merge 或使用者手動合併介面
- **利弊：**
    - LWW 邏輯簡單且對使用者透明，但多裝置同時修改同一筆時，較早的改動會靜默遺失

---

#### QuotaManagement — 配額管控

- **功能：**
    - 本地計數追蹤每日 Firestore 讀寫次數
    - 超出每日上限時暫停同步，防止單裝置 Quota Tax
- **目的：**
    - 確保單一裝置不會因為異常操作耗盡 Firestore 免費配額，保護整體服務穩定性
- **做法：**
    - 本地計數服務追蹤每日 Firestore 讀寫次數
    - 每日上限設定為單裝置 2000 reads 及 2000 writes
    - 計數在 Firestore Sync 操作前後更新
    - 跨日重置基準採 UTC+0 00:00:00，全使用者統一不受裝置時區或使用者設定影響
- **排除：**
    - 依使用者裝置時區或使用者自訂時區決定跨日點，因允許切換時區會引入時點漂移與計數錯亂
- **利弊：**
    - 本地計數實作簡單，但無法限制多裝置的全域總量，存在少量 Quota 漏洞，評估可接受
    - 採 UTC 基準對使用者完全透明，因 quota 屬後端資料蒐集導向的 fail-safe，使用者本身無感，無 UX 影響

---

### L4 FullBackupExport — A2 全量檔走 OS Share Intent

- **功能：**
    - A2 全量檔 export
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
    - 詳細格式設計待 R-fullbackup-format 落地
