## CloudSync / AppClient — 雲端同步用戶端

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
      - Tier 0 停用
      - Tier 1 啟用
    - Upgrade 偵測到權限新增時，觸發 Initial Sync 完整上傳本地資料
    - Downgrade 偵測到權限過期時，停止 Sync Engine，保留本地資料
- **排除：**
    - 即時同步
    - 外部匯率 API
- **利弊：**
    - 批次策略大幅降低 Firestore 費用，但使用者需手動或等待自動觸發
    - 本地 Quota 計數防止單裝置失控，但無法限制多裝置的全域總量，評估可接受

---

### SyncEngine — 同步引擎

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

#### BatchSync — 批次同步機制

- **功能：**
    - Delta 差量上傳與下載，僅傳輸上次同步後有異動的資料
    - 手動立即同步觸發，含 5 分鐘冷卻
    - 升級 Tier 1 時執行首次完整同步 Initial Sync
- **目的：**
    - 最小化 Firestore 讀寫次數以控制費用
    - 同時提供使用者主動同步的控制感
- **做法：**
    - 以修改時間戳篩選差量資料
    - 降級 Tier 時停止同步引擎，保留本地資料
- **排除：**
    - 自動即時同步
- **利弊：**
    - Delta 同步大幅減少讀寫，但 schema 異動需謹慎維護版本相容性。

---

#### ConflictResolution — 衝突解決策略

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

### QuotaManagement — 配額管控

- **功能：**
    - 本地計數追蹤每日 Firestore 讀寫次數
    - 超出每日上限時暫停同步，防止單裝置 Quota Tax
- **目的：**
    - 確保單一裝置不會因為異常操作耗盡 Firestore 免費配額，保護整體服務穩定性
- **做法：**
    - 本地計數服務追蹤每日 Firestore 讀寫次數；每日上限設定為單裝置 2000 reads 及 2000 writes；計數在 Firestore Sync 操作前後更新
- **排除：**
    - 多裝置全域配額統計，評估可接受
- **利弊：**
    - 本地計數實作簡單，但無法限制多裝置的全域總量，存在少量 Quota 漏洞，評估可接受
