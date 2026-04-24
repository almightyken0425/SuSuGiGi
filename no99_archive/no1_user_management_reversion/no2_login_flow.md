# 登入流程

## 執行順序

- 觸發 Google Sign-In 第三方認證程序
- 認證通過後提取 Google ID Token
- 以 ID Token 向 Firebase Auth 進行身份驗證
- 嘗試讀取 Firestore `/users/{uid}`，判斷使用者是否為新用戶
- **IF 文件不存在:**
  - 視為新用戶，由 App 端完成本地初始化後，再執行 Firestore 文件寫入
- **IF 文件已存在:**
  - 視為回訪用戶，略過 Firestore 初始化流程
- **IF 連線或認證失敗:**
  - 中斷整體程序並顯示異常提示

---

## 新用戶 Firestore 文件初始化

- **寫入路徑:**
  - `/users/{uid}`
- **觸發時機:**
  - 由 App 端決定並觸發
- **寫入欄位:**
  - `uid`、`email`、`provider`、`preferences`、`createdAt`
- **IF Firestore 寫入失敗:**
  - 不拋出例外，本地初始化仍視為成功，下次同步補寫

---

## 錯誤處理

### 網路錯誤

- **Google Sign-In 階段:**
  - 須連線，若無網路則提示連線異常，`登入畫面`保持開啟
- **Firebase Auth 階段:**
  - 須連線，認證失敗時提示連線異常，`登入畫面`保持開啟
