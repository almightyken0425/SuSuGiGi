# Users Collection Schema

## Schema 定義

### 基本資料

資料來源：Firebase Auth

| 欄位          | 型別   | 必填 | 說明                                   |
| ------------- | ------ | ---- | -------------------------------------- |
| `uid`         | String | ✓    | Firebase Auth UID，與 Document ID 相同 |
| `email`       | String | ✓    | 使用者 Email                           |
| `displayName` | String | -    | 顯示名稱，來自 Google 帳號             |
| `photoURL`    | String | -    | 大頭照 URL，來自 Google 帳號           |
| `provider`    | String | ✓    | 認證提供者，MVP 固定為 `google.com`    |

---

### 使用者偏好設定

| 欄位                   | 型別   | 必填 | 預設值          | 說明                    |
| ---------------------- | ------ | ---- | --------------- | ----------------------- |
| `preferences.language` | String | ✓    | `'zh-TW'`       | 介面語言：`zh-TW`, `en` |
| `preferences.currency` | String | ✓    | `'TWD'`         | 主要貨幣 ISO 4217 code  |
| `preferences.timezone` | String | ✓    | `'Asia/Taipei'` | 時區 IANA timezone      |
| `preferences.theme`    | String | ✓    | `'Default'`     | 主題                    |

---

### 訂閱權限資料

- **重要注意:** 此區塊由 App 端在購買成功後寫入

| 欄位                        | 型別   | 說明                        |
| --------------------------- | ------ | --------------------------- |
| `iap_entitlements_json`     | String | 可選序列化後的 IAP 權限狀態 |
| `iap_active_purchases_json` | String | 可選序列化後的作用中訂閱    |

#### 權限映射 Entitlement Mapping

| App Tier           | 說明         | 功能權限                                   |
| :----------------- | :----------- | :----------------------------------------- |
| **Tier 0 Free**    | 免費版使用者 | 僅本地資料庫，無雲端同步                   |
| **Tier 1 Premium** | 付費訂閱者   | 啟用 Sync Engine，支援雲端備份與跨裝置同步 |

---

### 系統時間戳

| 欄位        | 型別      | 必填 | 說明               |
| ----------- | --------- | ---- | ------------------ |
| `createdAt` | Timestamp | ✓    | 使用者首次建立時間 |
| `updatedAt` | Timestamp | ✓    | 最後更新時間       |
