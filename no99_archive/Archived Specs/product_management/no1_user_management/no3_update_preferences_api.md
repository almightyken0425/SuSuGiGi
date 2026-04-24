# 更新使用者偏好設定

## 同步架構

偏好設定涵蓋語言、主題、基礎貨幣、時區四個欄位，採用 Write-Through 模式。

### 採用 Write-Through 而非 Sync Engine 批次同步的原因

- 修改頻率極低，每次的 Firestore 寫入成本可忽略
- 需要跨裝置即時反映，批次同步會造成體驗延遲
- 每筆資料量極小，不適合批次同步機制

### 寫入路徑

偏好設定變更 → WatermelonDB settings 表寫入 → Firestore users collection 即時寫入

### 讀取路徑

App 啟動或登入完成 → 讀取 WatermelonDB settings 表 → 寫入記憶體狀態供所有頁面讀取

- 所有頁面一律從記憶體狀態讀取偏好設定
- 嚴禁直接訂閱 Firestore 來驅動畫面

### 跨裝置同步路徑

裝置 A 寫入偏好 → Firestore 更新 → 裝置 B 遠端監聽觸發 → 裝置 B WatermelonDB 更新 → 裝置 B 記憶體狀態更新

---

## Firestore 寫入權限規則

- read：登入使用者只能讀取自己的 document
- update：只能更新自己的 document，且異動欄位集合必須是 preferences 與 updatedAt 的子集
- create：只能建立以自己 uid 為 document ID 的記錄

---

## updateUserPreferences

- 偏好設定的 Firestore 寫入統一透過 `updateUserPreferences` 執行
- 以逐欄 dot notation 更新，避免覆寫整個 preferences 物件
- preferences 參數為 Partial 型別，呼叫方只傳入本次異動的欄位，未傳入的欄位不受影響
- updatedAt 在每次呼叫時皆自動更新，無論傳入幾個欄位
- Firestore 寫入失敗時不拋出例外，錯誤僅記錄於 log，本地資料不受影響

---

## 資料型別對應

基礎貨幣在本地以 Currency ID 整數儲存，Firestore 端以 ISO 4217 貨幣代碼字串儲存，轉換邏輯由呼叫方負責。

| 欄位     | WatermelonDB settings 表 | Firestore preferences 欄位 |
| -------- | ------------------------ | -------------------------- |
| 語言     | language: string         | language: string           |
| 主題     | theme: string            | theme: string              |
| 基礎貨幣 | base_currency_id: number | currency: string           |
| 時區     | time_zone: string        | timezone: string           |

---

## 驗證規則

- API 本身不進行格式或範圍檢查，呼叫方在呼叫前必須先完成驗證
- 支援的語言值：`zh-Hant`、`en`
- 支援的貨幣範圍以 StandardCurrencies 定義檔為準，傳入未定義的 Currency ID 時應直接中止，不進行轉換