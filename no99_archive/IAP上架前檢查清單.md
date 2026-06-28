# IAP 上架前檢查清單

記錄 $wish（SuSuGiGi）IAP 訂閱上架前後，每個還沒做的開關與動作，含「什麼時候做」與「具體步驟」。

本檔是這些待辦的單一真相。回來弄上線時先讀這份，逐項對。

---

## 一、送審前必做

送 App Store 審查之前要完成，缺了會被打回。

### 1. 隱私權政策 URL

- 現況：`legal.ts` 第 6 行還是 `example.com` 佔位
- 動作：
    - 用 privacypolicygenerator 產出正式隱私權政策
    - 放到一個可公開的 URL
    - 改 `legal.ts:6` 換成正式 URL
    - 條款連結也放到首頁
- 觸發時機：送審前（Apple 必檢，佔位 URL 直接擋）

### 2. 自動續訂揭露

- 現況：paywall 缺 Apple 要求的自動續訂揭露
- 動作：paywall 要顯示
    - 訂閱期長（月 / 年）
    - 每期價格
    - 自動續訂條款說明
    - 連到 Terms 與 Privacy
- 觸發時機：送審前（揭露不齊會被打回）

### 3. IAP 綁版本送審

- 現況：兩個訂閱 `susugigi_level1_monthly` / `_yearly` 都 Ready to Submit；Paid Apps 合約 Active
- 動作：App Store Connect 把兩個訂閱 attach 到 app 版本、跟版本一起送審
- 觸發時機：首次版本送審（IAP 第一次必須跟版本一起審）

---

## 二、上線後再開（不要在上線前開）

### 4. App Check 強制驗證

- 決策：延後（2026-06-28 拍板，方案 C）
- 現況：
    - 後端 `verifyTransaction` 沒開 `enforceAppCheck`
    - 真機 App Check token 目前無效（log 顯示走成 DeviceCheck、回 not supported）
- 為什麼不在上線前開：
    - 後端一開強制，token 壞就直接擋
    - 此刻 token 是壞的，等於上線即擋掉所有真機購買驗證
    - 付了錢升不了級
    - 而且 prod 的 App Attest token 要有 TestFlight／正式版才驗得到，dev build 證不了
- 開之前的前置（依序）：
    1. Firebase Console → App Check → 為 iOS app 開 App Attest
    2. dev 環境：把真機 console 印的 debug token 註冊進 console
    3. 用 TestFlight 或正式版確認真機 App Check token 真的有效
    4. client `appCheck.ts` 確認 provider 設定（目前 debug provider 沒生效）
    5. 後端 `verifyTransaction`（與其他 callable）加 `enforceAppCheck: true`、deploy
- 怎麼確認「token 普遍有效」：Firebase Console → App Check → Metrics 看 verified 比例接近 100%
- 觸發時機：上線後、確認真機 token 普遍有效再開

---

## 三、已決策、留意但暫不動

### 5. capBilling 預算維持 $1

- 決策：不調高（2026-06-28 拍板）
- 風險：若正常花費真的累積到 $1，會停整個專案計費，production IAP 連帶斷
- 為什麼可接受：
    - IAP 驗證量極小、貼著免費額度，正常用量幾乎 $0
    - `maxInstances` 已擋失控帳單
- 留意：上線後看 Cloud Billing，若逼近 $1 再決定調高

---

## 四、進行中

### 6. Paywall 購買流程 UX 修

- 狀態：本 session 處理中
- 問題：`PaywallScreen.handlePurchase` 在購買「發起」後就 `goBack()`，取消碼比對舊版 `E_USER_CANCELLED` 失效
- 修法：等 listener 回報驗證成功才關 paywall；取消／失敗留頁跳提示；取消碼改判 v14 `user-cancelled`
- branch：`feat/paywall-purchase-flow-fix`

---

## 已完成（備查）

- P0 finishTransaction bug 修復
- 後端 verifyTransaction / storeNotification / capBilling / deriveEntitlement 部署上線
- Firestore 規則：entitlements server 寫 client 讀、txnIndex 純 server
- Apple App Store Server API 金鑰、ASSN webhook 註冊
- P3 client 改接 server entitlement，真機 sandbox 端到端測過
