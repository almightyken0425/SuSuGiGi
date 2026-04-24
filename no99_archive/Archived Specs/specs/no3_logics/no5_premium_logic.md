# Premium 邏輯規格: PremiumLogic

## 目的

集中管理所有 Premium 權限檢查與同步邏輯，確保離線支援與邏輯一致性。

---

## 核心方法

### checkPremiumStatus 查詢 Premium 狀態

- **輸入:**
    - PremiumContext（詳見 `no1_data_models.md` — PremiumContext Local State）
- **性質:**
    - 純本地計算，不發出網路請求
- **邏輯:**
    - 讀取 PremiumContext 的 `expirationDate`
    - **IF** `expirationDate` 為 Null:
        - **Return:**
            - `True`，代表 Lifetime Access
    - **IF** `expirationDate` 大於當下時間:
        - **Return:**
            - `True`，代表 Active Subscription
    - **ELSE:**
        - **Return:**
            - `False`，代表 Expired

---

### refreshPremiumStatus 更新 Premium 狀態

- **性質:**
    - 網路請求，非同步執行，需處理網路錯誤
- **邏輯:**
    - 向 IAP 平台查詢當前帳號的有效購買紀錄，取回購買清單
    - 解析購買清單，判斷是否包含 Premium 等級的項目
    - **更新本地 PremiumContext:**
        - `rawPurchases` = IAP 平台回傳的原始資料
        - `lastChecked` = 當下時間戳
        - `expirationDate` = 解析出的到期日；若無有效訂閱則為 Null
    - **觸發:**
        - 若 Premium 狀態改變，通知 UI 重繪
