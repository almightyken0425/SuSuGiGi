# 更新使用者偏好設定

## updateUserPreferences

- 偏好設定的 Firestore 寫入統一透過 `updateUserPreferences` 執行
- 以逐欄 dot notation 更新，避免覆寫整個 preferences 物件
- **preferences 參數:**
  - Partial 型別，呼叫方只傳入本次異動的欄位，未傳入的欄位不受影響
- `updatedAt` 在每次呼叫時皆自動更新，無論傳入欄位數量
- **IF Firestore 寫入失敗:**
  - 不拋出例外，錯誤僅記錄於 log

---

## Firestore 寫入權限規則

- **read:**
  - 登入使用者只能讀取自己的 document
- **update:**
  - 只能更新自己的 document，且異動欄位集合必須是 preferences 與 updatedAt 的子集
- **create:**
  - 只能建立以自己 uid 為 document ID 的記錄

---

## 資料型別

- 基礎貨幣在 Firestore 端以 ISO 4217 貨幣代碼字串儲存，轉換邏輯由呼叫方負責

| 欄位     | Firestore preferences 欄位 |
| -------- | -------------------------- |
| 語言     | language: string           |
| 主題     | theme: string              |
| 基礎貨幣 | currency: string           |
| 時區     | timezone: string           |

---

## 驗證規則

- `updateUserPreferences` 本身不進行格式或範圍檢查，呼叫方在呼叫前必須先完成驗證
