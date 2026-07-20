# IAP 上架前檢查清單

記錄 $wish（SuSuGiGi）IAP 訂閱上架前後，每個還沒做的開關與動作，含「什麼時候做」與「具體步驟」。

本檔是這些待辦的單一真相。回來弄上線時先讀這份，逐項對。2026-07-17 依實況全面刷新。

---

## 一、送審前必做

送 App Store 審查之前要完成，缺了會被打回或上線即故障。

### 1. IAP 綁版本送審

- 現況：兩個訂閱 `susugigi_level1_monthly` / `_yearly` 都 Ready to Submit；Paid Apps 合約 Active
- 動作：App Store Connect 把兩個訂閱 attach 到 app 版本、跟版本一起送審
- 觸發時機：首次版本送審（IAP 第一次必須跟版本一起審）

---

## 二、上線後與持續觀察

### 6. Firebase Console 殘留 App 清理

- 現況：Console 殘留範本 App `com.yourcompany.SuSuGiGi`，現役舊 TestFlight 還掛著它
- 動作：新版 TF／正式版穩定後刪除
- 觸發時機：上線後

### 7. Cloud Billing 觀察

- capBilling 心跳判別：function log 每 20~30 分一次無聲執行＝預算通知鏈活著
- 帳單逼近預算時再評估是否調整金額

---

## 已完成（備查）

- P0 finishTransaction bug 修復
- 後端 verifyTransaction / storeNotification / capBilling / deriveEntitlement 部署上線；費用硬天花板 2026-07-17 全鏈實測通過（真解綁、真恢復）
- Firestore 規則：entitlements server 寫 client 讀、txnIndex 純 server
- Apple App Store Server API 金鑰、ASSN webhook 註冊
- P3 client 改接 server entitlement，真機 sandbox 端到端測過
- Paywall 購買流程 UX 修（事件驅動三果；恢復購買誠實回報）
- 隱私權政策正式 URL（TermsFeed 托管，`legal.ts`；登入頁與 paywall 皆有條款連結）
- 自動續訂揭露（期長＋每期價格＋收款與取消說明，20 語系，長語系溢出退捲動）
- App Check 身分重綁（新 plist＋AppDelegate factory）；verifyTransaction/healthCheck `enforceAppCheck` 已開、Firestore Enforce 已開、dev 裝置走 debug token
- Xcode Cloud secret `GOOGLE_SERVICE_INFO_PLIST_BASE64` 換新 plist 值、新 TF build 出貨（2026-07-18；build 號由 CI 自動遞增）
- TF build 實機煙霧測試全過；App Attest 真出票、App Check Metrics verified 出現（2026-07-18）
- capBilling `retry: true` 版 deploy 上線（`--force`、2026-07-17）
- GCP 預算改名「每月預算警告」、金額 $1 調 $10（2026-07-17；capBilling 只讀金額欄位、不受名稱影響）
