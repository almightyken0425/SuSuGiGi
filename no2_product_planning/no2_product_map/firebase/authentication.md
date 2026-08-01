# Authentication — Firebase 身份驗證

- **功能：**
    - 管理使用者帳號，為 App / Auth / AppClient 的後端
    - Google Sign-In Provider 與 Apple Sign-In Provider
    - App Check 防止未授權 API 存取
    - 帳號刪除：由 CloudFunctions 以管理權限刪除 Auth 使用者紀錄
- **目的：**
    - 提供統一身份認證基礎設施，作為 Firestore 存取控制的憑證來源
- **做法：**
    - Firebase Authentication 集中管理；App Check 在 Firebase 端驗證請求來源合法性
    - 一門一帳號；Google 與 Apple 身分各自獨立 uid，不連結、不合併
    - 啟用同 Email 多帳號設定；兩門同 Email 各自成帳，Email 不參與身分識別
    - 刪除帳號走伺服器端管理權限；Apple 門刪除前由後端撤銷 Sign in with Apple 授權
    - 刪除後同門重新登入產生全新 uid，不與舊資料歸戶
- **排除：**
    - 帳號密碼登入；其他第三方社交登入；帳號連結、帳號合併與客服搬家
- **利弊：**
    - Firebase Authentication 免費使用，且與 Firestore 安全規則深度整合。
    - 一門一帳號免除跨門合併複雜度；走錯門見空帳本，登出換門即回。
    - 刪除即斷根、無帳號復原窗口，換得審核合規與最小資料保留。

