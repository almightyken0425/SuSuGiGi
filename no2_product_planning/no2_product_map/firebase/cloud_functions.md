## CloudFunctions — 伺服器端 IAP 登記與 entitlement

- **狀態：**
    - spec 與 impl git 皆已建立
    - impl 含交易登記、通知接收、帳單熔斷、健康檢查與資料清除 function
    - Apple 對帳、entitlement 讀寫、Apple 授權撤銷與使用者刪除抽為服務層
    - 授權推導邏輯與各服務層附單元測試

- **功能：**
    - 驗證 IAP 交易的真偽並登記；授權真相在 StoreKit，登記不擋不拒
    - 接收並處理 App Store Server Notifications，含退款、取消、續訂、寬限期，只記不擋
    - 將登記後的 entitlement 以 uid 為 key 寫進 Firestore，供分析維度
    - 清除使用者資料：清除該 uid 的雲端資料、刪除授權紀錄與交易歸戶索引、刪除 Auth 身分

- **目的：**
    - 讓伺服器端保有訂閱事件的登記紀錄，餵分析維度與通知路由
    - txnIndex 交易歸戶採 last-write，App Store Server Notifications 據此路由到當前 uid
    - 承載清除所有資料的雲端執行，資料退出即斷根
    - 清除走伺服器權限，client 端 Firestore 規則維持全面禁刪

- **做法：**
    - 以 Firebase Cloud Functions 部署
    - callable function 接收 client 購買後的交易，向 App Store Server API 對帳驗真後登記
    - HTTPS webhook 接收 App Store Server Notifications，驗 Apple 簽章後更新 entitlement 登記
    - Apple 共享密鑰與 App Store Server API 金鑰走 Firebase secrets，不入程式碼
    - Firestore 安全規則限定 entitlement 僅 server 寫、client 讀，規則由 Firestore module 承載
    - 資料清除 callable 不附授權碼；legacy Sign in with Apple 身分由伺服器判定並撤銷授權
    - 以 Sign in with Apple 私鑰簽發 client secret，向 Apple 授權伺服器換取並撤銷 refresh token；私鑰走 Firebase secrets、與收據驗證金鑰不同把
    - 撤銷失敗不擋清除，回報旗標由 client 引導手動撤銷
    - 清除起手寫入永久墓碑；墓碑防通知誤歸戶與清除窗內復活
    - 清除依序清雲端記帳資料、交易歸戶索引、授權文件，最後刪 Auth 身分；各步可重試

- **排除：**
    - Google Play 收據驗證，待 Android 上架補
    - Cloud Storage 檔案刪除，本產品未使用 Storage
    - 清除的延遲執行與排程批次，確認即清
    - 依 entitlement 登記拒絕授權的綁定檢查，授權真相在 StoreKit

- **利弊：**
    - 登記與通知全量落庫，分析維度完整，但需維護後端並承擔 Firebase Functions 成本
    - 成本以每個 function 的 maxInstances 上限、預算警報與硬天花板 kill-switch 控管
    - 資料清除非原子，部分失敗須整段重試補完；各步冪等使重試安全
    - 清除執行時限五分鐘，超大帳號仍有跑滿風險，client 逾時對齊並可重試
