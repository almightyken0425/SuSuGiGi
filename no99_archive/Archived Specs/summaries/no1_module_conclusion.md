# User Management 模組架構結論

## 核心架構原則

本模組採用 **Local-First** 架構，確保 App 在無網路環境下仍能完整運作，並將雲端同步定位為加值服務。

### Local-First 本地優先

- **單一信任來源:** App UI 一律讀取 **本地資料庫**。
- **寫入策略:** 所有使用者資料變更，如偏好設定、個人資料，**必須** 先寫入本地資料庫。
- **離線能力:** Tier 0 免費版使用者完全依賴本地資料庫，不應受網路狀態影響。

### Cloud-Sync 雲端同步

- **角色:** Firestore 僅作為 Tier 1+ 付費版使用者的 **備份與同步中心**。
- **寫入限制:** App **嚴禁** 直接讀寫 Firestore 來驅動 UI，除了 Auth 流程中的必要檢查。
- **同步機制:** 透過 **Sync Engine** 負責本地與雲端資料的雙向同步。

### Sync Engine Gating 同步引擎閘道

- **啟動條件:** Sync Engine 僅在偵測到使用者擁有 **有效權限** 時啟動。
- **Tier 0 行為:** Sync Engine **停用**。資料僅存在於本地。
- **Tier 1 行為:** Sync Engine **啟用**。背景自動同步資料。

---

## 模組邊界與職責

### User Management Module

- **負責:**
    - 身份認證
    - 使用者基本資料
    - 偏好設定
    - 權限管理
- **互動:**
    - 提供 `CurrentContext` 供其他模組讀取當前使用者狀態與權限。
    - 登入成功後，通知 Accounting App 模組進行資料初始化或同步。

### 與 Accounting App 的關係

- **Accounting App** 依賴 **User Management** 提供的 `userId` 來隔離本地資料。
- **Accounting App** 依賴 **User Management** 提供的 `isPremium` 狀態來決定是否啟用進階功能，如同步。

---

## 權限與資料同步策略

- **Upgrade 升級:** 偵測到權限新增 -> 觸發 **Initial Sync** 將本地資料完整上傳至雲端。
- **Downgrade 降級:** 偵測到權限過期 -> **停止 Sync Engine** -> 保留本地資料 -> 可選凍結雲端資料。