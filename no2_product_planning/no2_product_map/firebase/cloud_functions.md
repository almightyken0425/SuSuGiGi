## CloudFunctions — 伺服器端 IAP 驗證與 entitlement

- **狀態：**
    - 未實作。模組已建立（spec 與 impl git），程式骨架待 scaffold

- **功能：**
    - 驗證 IAP 收據的真偽與有效性
    - 接收並處理 App Store Server Notifications，含退款、取消、續訂、寬限期
    - 將驗證後的 entitlement 以 uid 為 key 寫進 Firestore

- **目的：**
    - 讓 entitlement 有可信的伺服器端真相來源，client 讀取後判定授權
    - 偵測退款與撤銷，避免失效訂閱續享付費
    - 提供寬限期內的正確授權，續訂扣款失敗不立即降級
    - 支援同帳號跨裝置與跨平台共享付費

- **做法：**
    - 以 Firebase Cloud Functions 部署
    - callable function 接收 client 購買後的交易，向 App Store Server API 對帳
    - HTTPS webhook 接收 App Store Server Notifications，驗 Apple 簽章後更新 entitlement
    - Apple 共享密鑰與 App Store Server API 金鑰走 Firebase secrets，不入程式碼
    - Firestore 安全規則限定 entitlement 僅 server 寫、client 讀，規則由 Firestore module 承載

- **排除：**
    - Google Play 收據驗證，待 Android 上架補

- **利弊：**
    - 伺服器端驗證可信、可偵測退款與撤銷、支援跨裝置，但需維護後端並承擔 Firebase Functions 成本
    - 成本以每個 function 的 maxInstances 上限、預算警報與硬天花板 kill-switch 控管
