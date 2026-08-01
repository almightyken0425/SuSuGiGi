## CloudFunctions — 伺服器端 IAP 驗證與 entitlement

- **狀態：**
    - spec 與 impl git 皆已建立
    - impl 含交易驗證、通知接收、帳單熔斷、健康檢查與帳號刪除 function
    - Apple 對帳、entitlement 讀寫、Apple 授權撤銷與使用者刪除抽為服務層
    - 授權推導邏輯與各服務層附單元測試

- **功能：**
    - 驗證 IAP 收據的真偽與有效性
    - 接收並處理 App Store Server Notifications，含退款、取消、續訂、寬限期
    - 將驗證後的 entitlement 以 uid 為 key 寫進 Firestore
    - 刪除使用者帳號：撤銷 Apple 登入授權、清除該 uid 的雲端資料、刪除 Auth 帳號

- **目的：**
    - 讓 entitlement 有可信的伺服器端真相來源，client 讀取後判定授權
    - 偵測退款與撤銷，避免失效訂閱續享付費
    - 提供寬限期內的正確授權，續訂扣款失敗不立即降級
    - 支援同帳號跨裝置與跨平台共享付費
    - 滿足 App Store 對 app 內帳號刪除的審核要求
    - 刪除走伺服器權限，client 端 Firestore 規則維持全面禁刪

- **做法：**
    - 以 Firebase Cloud Functions 部署
    - callable function 接收 client 購買後的交易，向 App Store Server API 對帳
    - HTTPS webhook 接收 App Store Server Notifications，驗 Apple 簽章後更新 entitlement
    - Apple 共享密鑰與 App Store Server API 金鑰走 Firebase secrets，不入程式碼
    - Firestore 安全規則限定 entitlement 僅 server 寫、client 讀，規則由 Firestore module 承載
    - 帳號刪除 callable 依登入門決定是否撤銷 Apple 授權
    - 以 Sign in with Apple 私鑰簽發 client secret，向 Apple 授權伺服器換取並撤銷 refresh token；私鑰走 Firebase secrets、與收據驗證金鑰不同把
    - 撤銷失敗不擋刪除，回報旗標由 client 引導手動撤銷
    - 刪除起手寫入永久墓碑；購買驗證與訂閱通知據此拒收已刪帳號的授權寫入，堵刪除窗內的復活路徑
    - 刪除依序清雲端記帳資料、交易反查索引、授權文件，最後刪 Auth 帳號；各步可重試
    - 交易反查索引刪除後，原訂閱可由未來帳號重新認領

- **排除：**
    - Google Play 收據驗證，待 Android 上架補
    - Cloud Storage 檔案刪除，本產品未使用 Storage
    - 刪除的延遲執行與排程批次，確認即刪

- **利弊：**
    - 伺服器端驗證可信、可偵測退款與撤銷、支援跨裝置，但需維護後端並承擔 Firebase Functions 成本
    - 成本以每個 function 的 maxInstances 上限、預算警報與硬天花板 kill-switch 控管
    - 帳號刪除非原子，部分失敗須整段重試補完；各步冪等使重試安全
    - 刪除執行時限五分鐘，超大帳號仍有跑滿風險，client 逾時對齊並可重試
