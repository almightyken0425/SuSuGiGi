# 登出邏輯

## 觸發入口

- `偏好設定畫面` → `帳號登出按鈕`

---

## 執行步驟

- 重置 PremiumContext 快取狀態
- 重置 Firestore 每日 quota 計數：AsyncStorage `sync_quota_reads` 與 `sync_quota_writes` 歸零
- 保留 WatermelonDB 本地帳務資料，不執行清除
- 清空 `AuthContext` 中的 user 狀態，並讓 Firebase Auth 清除本地快取憑證
- 強制重置 `lastRecurringCheckDate` 與 `lastSyncCheckDate` 確保後續切換帳號正常運作

---

## 重新登入行為

- **IF 同一帳號重新登入:** 
  - 進入回訪用戶邏輯，讀取 Firestore 偏好覆蓋本地設定
  - 觸發 Sync Engine，不重新執行本地初始化
- **IF 不同帳號登入:** 
  - 顯示提示，告知本地存有其他帳號資料
  - 由使用者選擇保留或清除後繼續
