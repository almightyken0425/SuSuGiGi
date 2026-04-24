# 規格衝突與邏輯出入分析報告

> **報告建立時間:** 2026-04-07
> **分析範圍:** `no1_production_management` 目錄內之 `no2_product_planning` 與 `no3_product_specs` 所有文件資料。

---

## 總覽

近期的文件重構已解決了過去遺留的部分衝突（如偏好設定的 Write-Through 機制等），但跨文件參照中仍有數個新的或殘留的邏輯衝突需要修正。

| 衝突等級 | 項目 | 狀態 |
| -------- | ---- | ---- |
| 🔴 第一級核心邏輯 | 主題選項定義不一致 | 已解決 |
| 🟡 **第三級（流程定義）** | 首次登入 (First Login) 的初始化流程分歧 | 未解決 |
| 🟡 **第三級（名詞規範）** | 語言 (Language) 代碼規格不一致 | 未解決 |
| 🟡 **第三級（細節定義）** | 配額管理 (Quota) 的邊界行為粒度 | 未解決 |
| ⚠️ **潛在風險** | Bootstrap Flow 的非同步 Race Condition | 存在風險 |

---

## 🔴 核心邏輯衝突 (嚴重)



---

## 🟡 流程與細節定義出入 (中等)

### 3. 首次登入與初始化流程分歧 (First Login vs Post Auth)

* **`no1_user_management/no2_first_login_flow.md`**：範例程式碼將剛註冊的用戶資料直接寫入本地的 `users` collection。
* **`no2_accounting_app/no2_logics/no2_post_auth_logic.md`**：規範新手轉正需覆蓋寫入本地的 `Settings` 表（無提及寫入 `users` db），並會創建「現金帳戶」和「預設交易類別」，且在 `Premium` 為 True 時才將資料寫入雲端 Firestore `users/{uid}`。

**📌 影響**: 對於「新手上船 (Onboarding)」到底該做哪些本地資料初始化，兩份 Spec 缺乏集中維護，且作法分歧。

### 4. 語言 (Language) 代碼規格不一致

* **`no1_user_management/no3_update_preferences_api.md`**：宣稱支援的繁體中文語言值為 `zh-Hant`。
* **`no1_user_management/no1_users_schema.md`**：表上填寫的繁體中文介面語言卻是 `zh-TW`。

**📌 影響**: 實作切換語言時代碼找不到對應檔案或是存錯字串。

### 5. 配額管理 (Quota Management) 的執行粒度

* **`no2_product_planning/no2_product_map/app/cloud-sync.md`**：對超額的描述是概括的「超出每日上限時暫停同步」。
* **`no3_product_specs/no2_accounting_app/no2_logics/no11_firestore_quota_logic.md`**：詳細定義為「僅寫超標 $\rightarrow$ 跳過 Push，保留 Pull」、「僅讀超標 $\rightarrow$ 跳過 Pull，保留 Push」。

**📌 影響**: 規劃文件過於簡單，開發和 QA 測試時可能以為是「一超額就全面停擺」。

---

## ⚠️ 潛在風險

### 6. Bootstrap Flow 的非同步 Race Condition

在 `no1_app_bootstrap_flow.md` 中的「付費者背景任務」裡，**定期交易檢查**與**批次同步自動觸發**皆被列為「非同步執行」。
由於兩者之間沒有確保順序（Sequence）上的強制依賴關係，若同步流程跑得比定期交易補產生還快，當天應生成的定期交易紀錄將趕不上這次的同步上傳，必須等到下一次條件符合時才會回到雲端，造成雲端資料短暫「破圖」。

---

## ✅ 已解決的衝突 (對齊紀錄)

* **(Resolved) App 啟動時「定期交易」的觸發權限**：將「定期交易檢查」定調為 Tier 0 之本地核心作業。已修改 `no1_app_bootstrap_flow.md`，將其從「付費者背景任務」移至「通用核心背景任務」，無須檢查 Premium 狀態，以保障用戶的離線及基礎帳務正確性。
* **(Resolved) 偏好設定同步架構**：`no3_update_preferences_api.md` 現已清楚表明採用 `Write-Through` 模式（優先寫本地 WatermelonDB -> 再不透過 SyncEngine 即時寫上 Firestore）。這合理化了為何偏好設定有獨立的直接寫入路徑，不再與原先的 Batch Sync 概念衝突。
- 解決主題選項定義不一致：將佈景選項抽象化為動態標識符，避免資料庫結構與前端佈景管理機制產生強耦合
