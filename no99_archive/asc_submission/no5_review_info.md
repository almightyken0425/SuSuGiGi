# App Review Information 送審欄位內容

- **文件定位:**
    - 對應 App Store Connect 的 App Review Information 區塊
    - 涵蓋 Sign-In、審查風險對策、Review Notes、Contact 四段
    - 對應 IAP 上架前檢查清單的版本送審段
    - 本文件不落任何密碼明文

---

## Sign-In Information 欄位建議

- **欄位值:**

```
Sign-in required: 打勾
User name: susugigi20260529@gmail.com
Password: 【使用者自填，本文件不落密碼】
```

- **帳號定位:**
    - susugigi20260529 為專用測試 Google 帳號
    - 現況為免費等級,可直接演示付費牆與購買
    - 手動 QA 曾使用,雲端資料可清可留
- **密碼處置:**
    - 密碼僅存於密碼管理器
    - ASC 欄位送出後僅 Apple 審查團隊可見
    - repo 任何檔案不留密碼明文
- **審後清理:**
    - 審查員完成 sandbox 購買後,demo 帳號升為付費等級
    - 後續要重測免費流程,以 `fs_admin` 重置 entitlement
    - 裝置端另清 premium 快取

---

## Google 登入風險評估與對策

- **前因後果:**
    - app 唯一登入方式是 Google 登入
    - 審查裝置對 Google 屬陌生裝置與陌生網路
    - Google 可能觸發安全挑戰,要求二步驟或裝置確認
    - 審查員過不了挑戰 → 登不進 app → 依 Guideline 2.1 退件
- **方案與優劣:**
    - **關閉兩步驟驗證:**
        - 作法為在 Google 帳號安全設定關閉兩步驟驗證
        - 優點是移除最常見的挑戰來源
        - 侷限是低活動帳號仍可能遇到異常登入攔截
    - **應用程式密碼 app password:**
        - 判定不適用
        - app 走 OAuth 網頁登入流程
        - app password 僅適用 IMAP 與 SMTP 舊協定
    - **示範影片連結:**
        - 作法為在 Review Notes 附完整操作影片連結
        - 優點是登入被擋時審查員仍能看懂全流程
        - 侷限是 sandbox 購買仍需真登入才能實測
    - **帳號預熱:**
        - 送審前於乾淨瀏覽器與不同裝置登入數次
        - 降低 Google 判定異常登入的機率
    - **待命核准:**
        - 審查期間保留一台已登入該帳號的裝置
        - 跳出登入確認提示時即刻核准
        - 侷限是審查時間不可預測,常落在美國時區夜間
- **建議:**
    - 主線採關閉兩步驟驗證加帳號預熱
    - Review Notes 附影片連結作備援
    - 待命核准順手做,不當唯一防線
    - app password 不採
- **附帶風險 Guideline 4.8:**
    - app 僅有 Google 登入,無 Sign in with Apple
    - 4.8 要求用第三方登入的 app 提供隱私替代選項
    - 屬獨立退件風險,與 demo 帳號無關
    - 建議送審前評估補 Sign in with Apple
    - 不補則預留申覆說詞,接受一次退件風險

---

## Review Notes 英文全文

- **使用方式:**
    - 全文直接貼進 ASC 的 Notes 欄位
    - 影片段為選配,連結未備妥則整段刪除
    - 兩步驟驗證未關閉時,刪除對應句子

```
ABOUT THE APP
$wish is a personal bookkeeping app. Signing in is required to use the app; all data is tied to the signed-in account.

SIGN-IN
- Google Sign-In is the only login method. On the first screen, tap "Sign in with Google" and use the demo account provided above.
- The demo account is a dedicated test account prepared for review. 2-Step Verification is disabled on it. If Google still shows a security prompt on your device, please retry once; it clears on a second attempt in our tests.

FREE TIER AND PAYWALL
- The free tier allows up to 3 accounts and 7 categories. Transactions are unlimited, and every other feature (recurring transactions, CSV import/export, manual exchange rates, cloud backup) is free.
- To trigger the paywall: go to Settings > "Manage Accounts" and try to add a 4th account, or Settings > "Manage Categories" and try to add an 8th category. The paywall can also be opened from Settings > "Upgrade to Premium".

SUBSCRIPTIONS (SANDBOX TESTING)
- Two auto-renewable subscriptions: susugigi_level1_monthly and susugigi_level1_yearly. Premium removes the account and category limits.
- Purchases are verified server-side. The app sends the signed transaction to our Firebase Cloud Functions backend, which validates it with the App Store Server API and then grants the entitlement to the signed-in app account. Sandbox receipts are fully supported (the backend automatically falls back to the sandbox environment).
- After a successful sandbox purchase, the premium state updates in the app within a few seconds.

RESTORE PURCHASES
- Paywall > "Restore Purchases".
- Entitlements are bound to the app account, not only to the Apple ID. If the Apple ID's subscription was already granted to a different app account, restore reports that there is nothing to restore. This is intentional: it prevents one purchase from unlocking multiple app accounts.

DATA STORAGE AND BACKUP
- Data is stored locally on the device and automatically backed up to the signed-in user's own cloud space (Google Firebase / Firestore).
- Signing in on another device restores the backup. Data is not shared with third parties.

DEMO VIDEO (optional)
- A full walkthrough video is available here: 【使用者自填連結，未備則整段刪除】
```

---

## Contact Information 欄位清單

- **欄位值:**

```
First name: 【使用者自填】
Last name: 【使用者自填】
Phone: 【使用者自填，含國碼，格式如 +886 912 345 678】
Email: almightyken0425@gmail.com
```

- **填寫要點:**
    - 此區僅 Apple 審查團隊可見,不對外公開
    - 電話填審查期間接得到的號碼
    - email 用開發者帳號同信箱,審查通知集中
