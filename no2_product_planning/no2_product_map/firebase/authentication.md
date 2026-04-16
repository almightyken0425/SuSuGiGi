# Authentication — Firebase 身份驗證

- **功能：**
    - 管理使用者帳號，為 App / Auth / AppClient 的後端
    - Google Sign-In Provider
    - App Check 防止未授權 API 存取
- **目的：**
    - 提供統一身份認證基礎設施，作為 Firestore 存取控制的憑證來源
- **做法：**
    - Firebase Authentication 集中管理；App Check 在 Firebase 端驗證請求來源合法性
- **排除：**
    - Apple ID 登入，暫不實作，資料衝突問題待解；其他第三方社交登入
- **利弊：**
    - Firebase Authentication 免費使用，且與 Firestore 安全規則深度整合。
    - Apple ID 登入時使用者可選擇不分享 Email，造成帳號合併困難。

