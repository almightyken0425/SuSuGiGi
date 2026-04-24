# 登出流程

## 執行步驟

- 呼叫 `auth.signOut()` 清除 Firebase Auth session

---

## 錯誤處理

- **IF `auth.signOut()` 失敗:**
  - 強制清除本地 Firebase session token，下次啟動時以 auth 狀態重新驗證
