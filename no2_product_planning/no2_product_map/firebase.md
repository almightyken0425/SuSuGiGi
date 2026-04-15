# Platform: Firebase

---

## Authentication — Firebase 身份驗證

- **功能：**
    - 管理使用者帳號，為 App / Auth / AppClient 的後端
    - Google Sign-In Provider
    - App Check 防止未授權 API 存取
- **目的：**
    - 提供統一身份認證基礎設施，作為 Firestore 存取控制的憑證來源
- **做法：**
    - Firebase Authentication 集中管理；App Check 在 Firebase 端驗證請求來源合法性
- **排除：**
    - Apple ID 登入，暫不實作，資料衝突問題待解；其他第三方社交登入
- **利弊：**
    - Firebase Authentication 免費使用，且與 Firestore 安全規則深度整合。
    - Apple ID 登入時使用者可選擇不分享 Email，造成帳號合併困難。

---

## Firestore — 雲端資料庫

- **功能：**
    - 存放付費用戶的跨裝置同步資料，為 App / CloudSync / AppClient 的後端
    - Firestore Security Rules 存取控制
- **目的：**
    - 作為 Delta batch sync 的雲端資料來源，確保付費使用者的跨裝置資料最終一致
- **做法：**
    - App 一律讀取本地資料庫，採 Local-First 架構
    - Firestore 僅作為 Tier 1+ 付費版使用者的備份與同步中心
    - App 嚴禁直接讀寫 Firestore 來驅動 UI，Auth 流程的必要檢查是唯一例外
    - Collections 對應 WatermelonDB 表格
      - accounts
      - categories
      - transactions
      - transfers
      - currency_rates
      - schedules
      - users
    - Security Rules 確保使用者只能讀寫自己的資料
- **排除：**
    - Real-time listener，基於成本控制不使用；App 端以外的直接 Firestore 寫入
- **利弊：**
    - Firestore 無需維護伺服器，但廠商鎖定，未來遷移至自建後端成本較高
    - 免費層每日配額 50k reads / 20k writes，project 層級，需搭配 App 端本地計數管控
    - 選擇即時寫入本地優先、Sync Engine 後台同步的策略
    - 接受較高 Firestore 操作次數，換取使用者在多裝置間無縫切換的體驗
    - 因偏好設定變更頻率極低，實際成本影響有限

---

### DataCollections — 資料 Collections

- **功能：**
    - 定義各 Firestore collection 的 schema 與欄位
- **目的：**
    - 作為 App / CloudSync 的雲端資料模型，對應 WatermelonDB 本地 schema
- **做法：**
    - Schema 集中定義於核心設定檔
    - 各實體包含修改時間戳衝突解決欄位與軟刪除標記欄位兩個標準欄位
- **排除：**
    - 即時 listener subscription
    - 伺服器端 business logic，僅負責資料儲存
- **利弊：**
    - 純資料儲存設計簡單，但 schema 異動需謹慎維護版本相容性

---

### SecurityRules — 安全規則

- **功能：**
    - 使用者只能讀寫屬於自己的 collections 資料
- **目的：**
    - 確保多租戶資料隔離，防止使用者存取他人資料
- **做法：**
    - 安全規則以 Firebase Authentication UID 作為資料隔離 key
- **排除：**
    - 伺服器端 Admin SDK 的讀寫，此類操作不受 Security Rules 限制
- **利弊：**
    - 規則簡單且由 Firebase 執行，無需維護伺服器
    - 規則變更需重新部署

---

### QuotaBaseline — 免費層配額基準

- **功能：**
    - Firebase 免費層提供的 project 級別 Firestore 讀寫配額
- **目的：**
    - 定義產品可免費使用的 Firestore 資源上限，作為 App 端 QuotaManagement 的基準參考
- **做法：**
    - 免費層：50,000 reads / 20,000 writes / day，project 層級；App 端本地計數服務為第一道防線
- **排除：**
    - 自動升級付費 Firebase 方案
- **利弊：**
    - 免費層配額對早期用戶數量通常足夠，但高成長期需密切監控並規劃升級
