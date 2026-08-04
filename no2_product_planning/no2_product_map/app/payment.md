## Payment / AppClient — 付費授權

- **功能：**
    - Paywall 訂閱方案展示與購買
    - StoreKit 訂閱授權判定
- **目的：**
    - 付費授權基礎設施，所有 LEVEL 付費牆的前置依賴
- **做法：**
    - 直接串接 Apple StoreKit 與 Google Play Billing 進行跨平台訂閱狀態管理；授權真相在各平台商店端、跟商店帳號走，離線由系統快取承載
- **排除：**
    - 其他第三方支付渠道
- **利弊：**
    - 直接串接官方 IAP API 無第三方服務依賴，但需自行封裝雙平台差異
    - 授權跟商店帳號走，免登入即可購買與續用；退款與到期於商店端消失，前景刷新即回落

---

### PaywallScreen — 付費牆介面

- **功能：**
    - 呈現各 LEVEL 方案內容與定價
    - 購買觸發入口
- **目的：**
    - 讓使用者在需要付費功能時，清楚了解方案差異並完成購買
- **做法：**
    - 從各平台原生 IAP API 取得最新產品資訊；購買成功後更新 PremiumContext 狀態
- **排除：**
    - Web 版付費牆
- **利弊：**
    - 原生 IAP 體驗流暢，但 App Store / Google Play 各自抽成

---

### IAPService — 原生 IAP 封裝

- **功能：**
    - 取得可購買的產品清單
    - 發起購買、還原購買
- **目的：**
    - 封裝 Apple StoreKit 與 Google Play Billing，提供統一介面供 PremiumContext 呼叫
- **做法：**
    - 封裝 IAP 邏輯，統一處理 iOS 與 Android 差異
    - 還原購買即同步 StoreKit 授權現況，無帳號歸戶檢查、不存在跨帳號衝突
- **排除：**
    - 依賴第三方中介服務例如 RevenueCat 來處理 IAP
- **利弊：**
    - 自建封裝層降低平台差異的維護成本，且無第三方依賴

---

### PremiumContext — 訂閱狀態管理

- **功能：**
    - 全域管理當前訂閱 LEVEL，不列舉等級、自然涵蓋後續新增層級
    - 監聽購買事件並即時更新狀態
- **目的：**
    - 作為所有付費功能的統一授權判斷來源
- **做法：**
    - 全域授權狀態在 App 頂層提供；訂閱狀態以 StoreKit currentEntitlements 推定，離線由系統快取承載
    - 購買成功即時生效，不等後端登記
    - 退款與到期於 StoreKit 端消失，app 前景刷新即回落
- **排除：**
    - 伺服器端登記本身，由 CloudFunctions module 承載、供分析維度，見 `firebase/cloud_functions.md`
- **利弊：**
    - 授權判定全程在裝置端完成，無網路等待與同步延遲
    - 授權跟隨 Apple ID，同 Apple ID 多裝置自然共享
    - 不實作裝置數量限制，忽略帳號共用風險：記帳資料具高度隱私性，共用意願極低，對營收影響有限

---

### PremiumFeatureGate — 付費功能閘控

- **功能：**
    - 在受限動作執行前依照 LEVEL 能力清單執行前置檢查
    - 設定頁內 LEVEL_0 限定顯示的升級入口，導向付費牆頁面
    - 升級後此入口自動隱藏
- **目的：**
    - 透過能力差異驅動 LEVEL_0 升級付費
- **做法：**
    - 授權邏輯在受限動作執行前檢查當前 LEVEL 能力
    - 本地計數管控防止單裝置失控
    - 設定頁依當前 LEVEL 決定是否顯示升級入口
- **排除：**
    - 免費版漸進式釋放帳戶數量的設計
- **利弊：**
    - 二元解鎖設計實作簡單，但降低免費用戶的漸進升級誘因
    - 本地計數防止單裝置失控，但無法限制多裝置的全域總量，評估可接受

---

### LEVEL 能力清單 — 記帳 App

- **說明：**
    - 記帳 App 視角下各 LEVEL 可用能力的白話總覽
    - 跨 Module 的 LEVEL 商業定義請見 `no1_product_initiation/no3_business_model.md`
    - 可被 Spec 與實作引用的動作識別碼與規則表，請見 `no3_product_specs/no2_accounting_app/no3_logics/no17_subscription_gate_logic.md`

- **LEVEL_0 免費:**
    - 帳戶總數上限 3 個
    - 類別總數上限 7 個

- **LEVEL_1 訂閱:**
    - 帳戶總數無上限
    - 類別總數無上限
    - 相對 LEVEL_0 的唯一差異是解除帳戶 / 類別 / 交易的總數上限

- **LEVEL_2 以上:**
    - 在記帳 App 視角下，LEVEL_2 以上使用者能做的事等同 LEVEL_1，差異能力位於 Logic Engine 模組
    - 授權判斷邏輯採用當前訂閱等級大於等於 LEVEL_1 即允許的形式，自然涵蓋 LEVEL_2 與後續層級
