# SuSuGiGi App Privacy 問卷答案 V1

## 填答基準

- 對象為 App Store Connect 的 App Privacy 問卷
- 產品 SuSuGiGi，上架名 `$wish`
- 答案逐條實查程式碼產出，不含猜測
- 查證日 2026-07-18
- impl 引用相對記帳 app impl 模組根目錄
- 後端引用以 `functions/src/` 開頭，位於 cloud functions 模組
- 雲端資料流僅三個入口
    - 記帳備份 `src/services/syncEngine.ts:362`
    - 使用者文件 `src/services/userService.ts:142,154,165,207`
    - 後端授權寫入 `functions/src/services/entitlementStore.ts`
- 無 Firebase 以外的資料外送
    - 全 src 唯一外部網址是隱私政策連結 `src/constants/legal.ts:6`

---

## 問卷首題與總體答案

- Data collection 首題答 Yes
- 收集用途一律只勾 App Functionality
- 應勾選類別全部連結使用者身分
    - 雲端資料一律以 Firebase uid 為 key
- Used for tracking 一律答 No
    - 無廣告、無 analytics SDK、無 ATT
    - `ios/SuSuGiGiApp/PrivacyInfo.xcprivacy` 宣告 NSPrivacyTracking false

---

## 應勾選的資料類別

| ASC 類別 | ASC 資料型別 | 用途 | 連結身分 | 追蹤 | 依據 |
| --- | --- | --- | --- | --- | --- |
| Contact Info | Name | App Functionality | Yes | No | `src/services/userService.ts:93` 上傳 Google displayName 到 `users/{uid}` |
| Contact Info | Email Address | App Functionality | Yes | No | `src/services/userService.ts:92` 上傳登入 email 到 `users/{uid}` |
| Financial Info | Other Financial Info | App Functionality | Yes | No | `src/services/syncEngine.ts:482,496,511-514` 上傳金額、匯率與交易日期 |
| User Content | Other User Content | App Functionality | Yes | No | `src/services/syncEngine.ts:455,468,484,500,517-536` 上傳帳戶名、分類名、備註與排程範本 |
| Identifiers | User ID | App Functionality | Yes | No | `src/services/syncEngine.ts:360` 雲端路徑以 uid 為 key |
| Purchases | Purchase History | App Functionality | Yes | No | 後端 `functions/src/services/entitlementStore.ts:34-46` 存訂閱狀態與交易識別碼 |
| Other Data | Other Data Types | App Functionality | Yes | No | `src/services/userService.ts:94,139-140` 頭像連結與平台欄位、`src/constants/syncFields.ts:63-93` 偏好設定 |

---

## 不勾選的資料類別

| ASC 類別 | 涵蓋型別 | 依據 |
| --- | --- | --- |
| Contact Info | Phone Number、Physical Address、Other User Contact Info | `firestore.rules:27,50` 白名單無此類欄位，app 無對應輸入 |
| Health & Fitness | 全部 | 無相關功能與權限 |
| Financial Info | Payment Info、Credit Info | 付款由 App Store 處理，後端只收簽章交易 `functions/src/handlers/verifyTransaction.ts:26` |
| Location | Precise Location、Coarse Location | 無定位權限，`ios/SuSuGiGiApp/Info.plist:48` 權限字串僅相簿一項 |
| Sensitive Info | 全部 | 無相關功能 |
| Contacts | 全部 | 無通訊錄權限字串 |
| User Content | Emails or Text Messages、Photos or Videos、Audio Data、Customer Support | 相簿僅供使用者存匯出圖，無讀取上傳 |
| Browsing History | 全部 | app 無瀏覽功能 |
| Search History | 全部 | 搜尋純本機過濾，上傳白名單無搜尋欄位 `src/services/syncEngine.ts:372-377` |
| Usage Data | Product Interaction、Advertising Data、Other Usage Data | 無 analytics SDK，`package.json:20-24` firebase 模組僅五個 |
| Diagnostics | Crash Data、Performance Data、Other Diagnostic Data | 無 crash 與 performance SDK，`ios/Podfile.lock` 查無對應 pod |
| Identifiers | Device ID | `ios/Podfile` 無 FirebaseMessaging，AppDelegate 無遠端通知註冊，FCM token 不產生 |
| Surroundings | Environment Scanning | 無相關感測功能 |
| Body | 全部 | 無相關感測功能 |

---

## 填答判斷說明

- Device ID 無收集來源
    - `ios/Podfile` 無推播套件，AppDelegate 無遠端通知註冊
    - `FirebaseMessagingInterop` 僅為 FirebaseFunctions 介面依賴，無 FCM 實作
    - `src/screens/Settings/SettingsScreen.tsx:170` 僅讀 app 版本號顯示
    - 全專案無 IDFA 與裝置唯一碼讀取

- 記帳資料拆兩類申報
    - 金額、匯率、交易日期歸 Other Financial Info
    - 帳戶名、分類名、備註歸 Other User Content
    - 依 Apple 定義收支紀錄屬財務資訊
- 頭像歸 Other Data
    - `photoURL` 只是 Google 頭像網址字串
    - app 不讀相片內容，不構成 Photos or Videos
- 時區語系不算 Location
    - `timezone` 與 `language` 屬使用者設定值
    - 非定位服務或 IP 定位產物
- `analyticsConsent` 欄位不代表有 analytics
    - `src/constants/syncFields.ts:92` 僅為偏好旗標隨設定上傳
    - 全專案無任何 analytics SDK 與事件上報
- 訂閱歸戶索引含 uid 對映
    - `functions/src/services/entitlementStore.ts:57-70` 存交易識別碼對 uid
    - 屬 Purchase History 申報範圍
- App Check 不構成 Device ID
    - `src/services/appCheck.ts:22` 走 App Attest 認證
    - 產出短效防濫用 token，非持久裝置識別碼
- Google 服務端連線紀錄不申報
    - Firebase 服務為安全短期留存連線資訊
    - 屬服務商基礎運作，非 app 主動收集
- 後端 log 無個資
    - `functions/src/handlers/verifyTransaction.ts` 全檔無 log
    - 歸戶失敗告警僅含交易識別碼 `functions/src/handlers/storeNotification.ts:55`
- 匯出分享不屬收集
    - `src/services/exportService.ts:73` 走系統分享面板
    - 使用者主動導出，資料不進開發者伺服器

---

## 問卷外同步事項

- 隱私政策網址
    - `src/constants/legal.ts:6` 指向 TermsFeed 頁
    - 送出問卷前確認頁面內容與申報一致
- `PrivacyInfo.xcprivacy` 與問卷一致
    - `ios/SuSuGiGiApp/PrivacyInfo.xcprivacy` 收集清單列同表七類
    - 逐項 linked true、tracking false、App Functionality
