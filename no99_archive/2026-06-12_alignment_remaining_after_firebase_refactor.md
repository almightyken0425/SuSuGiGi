# 四層對齊殘留 issue 清單 firebase 重構後複核 記帳 App

## 文件用途

- 承接 `2026-06-10_alignment_issues.md` 的待處理項目
- 該清單建立後經過多輪 commit，其中 `preference-upload-only` 是一次 firestore 大重構
- 重構依「偏好只上傳不下載」決策改寫多個同步、配額、登入單位，順帶收掉或讓部分 issue 失效
- 本檔逐項複核現況碼，重判每個原待處理 issue 的真實殘留狀態
- 與 parent 盤點檔 `2026-06-10_four_tier_alignment_audit.md` 交叉驗證
- 只列「現在還真的要做」的項目，已收掉或失效的不列
- 一個殘留 issue 開一個 session 處理，沿用原 issue 編號便於追溯
- 全部處理完可刪本檔

---

## 複核方法

- 對每個原待處理 issue 派一個核對員
- 讀現況 spec 與 impl 檔，不相信清單舊狀態
- 用 `git show` 看重構 commit 實際改了什麼
- 用 grep 驗具體符號是否還在（onSnapshot、getStats、theme_light_default 等）
- 對決策點類 issue，判斷決策是否已被重構隱性拍板
- 與 parent audit 檔逐項交叉驗證原始發現

### 判定四種

- **resolved** — 原問題所有子項都已在現況碼收掉
- **partial** — 部分子項收掉、仍有具體殘留
- **open** — 幾乎沒被觸及、原問題照舊
- **moot** — 重構改變地貌、原問題框架已不適用、無需再處理

---

## 重構脈絡

兩次重構掃過大半個原待處理清單。

### preference-upload-only

偏好同步從雙向改成只上傳不下載。

- impl commit `d8fbd00`，spec commit `3c67439`
- 刪所有偏好下載路徑：real-time listener、登入 pull、背景 pull
- LWW 比較機制退場、收斂為單一真相表
- spec 檔改名：`no18_preference_sync_logic.md` → `no18_preference_upload_logic.md`
- spec 檔改名：`no12_firestore_quota_logic.md` → `no12_quota_management_logic.md`
- 連帶改寫 `no1_app_bootstrap_logic.md`、`no2_login_logout_logic.md`、`no3_post_auth_logic.md`、`no4_batch_sync_logic.md`、`no5_settings_management.md`、`no17_subscription_gate_logic.md`、`no19_transaction_backup_logic.md`
- impl 連帶改 `PreferenceContext.tsx`、`quotaService.ts`、`AuthContext.tsx`、`userService.ts`、`syncEngine.ts`、`PremiumContext.tsx`、`syncFields.ts`

### remove-postauth-iap-await

登入路徑不再等 IAP 查詢往返。

- impl commit `8e2febb`，spec commit `72804f5`
- 移除登入路徑死碼 IAP 查詢、登入不等 StoreKit 往返
- 直接收掉 ISSUE-10 的 IAP 子項

---

## 總覽

複核後的殘留分布。原待處理 8 件中，1 件 resolved、6 件 partial、1 件 open。狀態矛盾的 4 件另複核確認。

| issue | 標題 | 原優先序 | 複核後 | 牽涉層 | 殘留項數 | 含決策點 |
|---|---|---|---|---|---|---|
| ISSUE-01 | 偏好同步 listener 違規 | 高 | partial（降為低） | impl／spec | 1 | 是 |
| ISSUE-04 | app bootstrap 規格整修 | 高 | partial（降為中） | spec | 3 | 否 |
| ISSUE-10 | 登入鏈規格實作對齊 | 中 | partial（降為低） | impl | 2 | 否 |
| ISSUE-11 | settings management 對齊 | 中 | partial | spec／impl | 3 | 是 |
| ISSUE-15 | premium logic 歸檔錯位 | 中 | partial | impl／spec | 6 | 是 |
| ISSUE-21 | dev 工具豁免聲明 | 中 | open | spec／product map | 3 | 是 |
| ISSUE-22 | cloud sync 細節補載 | 低 | partial | spec | 2 | 否 |
| ISSUE-24 | design 端變體待補 | 低 | partial | design | 1 | 否 |

### 已複核關閉、不再列入

下列原待處理或狀態矛盾的 issue，複核確認已完成，無殘留。

- **ISSUE-12 firestore 配額旗標收斂** — 重構隱性拍板「簡化為單寫入旗標」。spec 刪讀取側、`getStats`、雙旗標四組合；impl 刪 `KEY_READS`、`canRead`、`incrementReads`、`getStats` 死碼。upload-only 後無讀取發生，讀量計數需求消失。grep 確認 `getStats`／`incrementReads`／`canRead` 全庫零殘留。
- **ISSUE-14 清除資料庫漏兩表** — commit `14ec5b9` 把硬編碼七表清單改為動態推導 `schema.tables`，自動涵蓋 `users` 與 `currency_configs`。補 guard test 鎖全表覆蓋，五測全綠。
- **ISSUE-19 偏好頁登入態拍板** — commit `deef8b9` 拍板刪未登入態，偏好頁固定只有登出鈕。導航層保證登入後才可達。登出失敗錯誤提示 impl 已實作（`AuthContext.tsx` Alert）。
- **ISSUE-20 匯率換算邏輯對齊** — spec `630aa17` 初始匯率改固定種 1 佔位、補載 `getCurrencyPairs` 與 `resolveTransferDisplay`；impl 三 commit 收斂 `createCurrencyRate` 進 service、抽 `resolveTransferDisplay` 純函式、`convertAmount` 共用 `resolveRateFromRecord`。

---

## ISSUE-01 偏好同步 listener 違規

- **狀態:** partial
- **原優先序:** 高（複核後降為低）
- **重構已收:**
    - listener 違規根本消解，改單向上傳無下載路徑
    - grep `onSnapshot` 全庫零匹配
    - spec 新版明文「不使用 Real-time listener」
    - 配額讀取問題連帶收掉（見 ISSUE-12）
- **殘留:**
    - 時間戳欄位仍不一致
    - spec `no18_preference_upload_logic.md` 第 45 行要求自動更新 `preferences.updatedAt`
    - impl `userService.ts` 第 183 行只更新文件根層 `updatedAt`、未建 nested 時間戳
- **決策點:**
    - LWW 已退場，`preferences.updatedAt` 失去比較用途
    - 留之只剩「最後修改時間」追蹤（分析或審計用）
    - 兩案：impl 補實作 nested 時間戳，或改 spec 移除此要求
    - 建議改 spec 移除、無消費端的欄位不必種
- **動到的檔案:**
    - spec git `no3_logics/no18_preference_upload_logic.md`
    - impl git `src/services/userService.ts`、視決策
- **交叉驗證 audit:**
    - parent 檔高風險發現「Firestore listener 違規」單位 `preference_sync_logic`
    - 該節的 listener 與時間戳兩項，listener 已收、時間戳殘留

---

## ISSUE-04 app bootstrap 規格整修

- **狀態:** partial
- **原優先序:** 高（複核後降為中）
- **重構已收:**
    - premium 限定批次同步殘句已刪（commit `3c67439` 刪 `runPremiumBackgroundTasks` 與 premium 權限檢查）
    - cloud_sync 矛盾源頭消除，現 spec 無 premium／LEVEL_2 殘句
- **殘留:**（純 spec 補載、無決策）
    - 定期交易補產生條件不同步：spec 仍寫時區檢查日，impl `recurringLogic.ts` 改用 timestamp 比較（`Date.now()` 絕對時刻），spec 改寫對齊 impl
    - 未登入導向 Login：impl `AppNavigator.tsx` 第 215 行 `!user` 時渲染 LoginScreen，spec 完全未載，補載
    - 前景 resume 觸發同步：impl `PremiumContext.tsx` 第 125 行 AppState `active` 呼叫 `syncEngine.sync()`，spec 無 resume／focus 描述，補載
- **動到的檔案:**
    - spec git `no3_logics/no1_app_bootstrap_logic.md`
- **交叉驗證 audit:**
    - parent 檔「批次同步政策矛盾」與 `app_bootstrap_logic` 逐項發現
    - 四項缺漏中 premium 矛盾已收，其餘三項 impl 端皆有、spec 端仍缺
- **重疊提示:**
    - resume 觸發同步與 ISSUE-15 的「AppState 自動刷新」是同一段 impl 行為，從兩個 spec 視角各看一次，處理時併一處改

---

## ISSUE-10 登入鏈規格實作對齊

- **狀態:** partial
- **原優先序:** 中（複核後降為低）
- **重構已收:**
    - (c) 本地無 Settings 以雲端偏好寫入：upload-only 後不下載偏好，此分支 moot，impl 改跑 `initializeNewUser`
    - (d) IAP 查詢後更新本地 Premium：`remove-postauth-iap-await` 顯式移除登入路徑 IAP 查詢，spec 與 impl 同步刪除
    - post_auth spec「視 Premium 決定上雲」矛盾殘句已清
- **殘留:**（皆 impl 行為缺漏、無決策）
    - (a) 登出未清 Premium 快取：spec `no2_login_logout_logic.md` 第 21 行要求清本地 Premium 快取，impl `AuthContext.tsx` signOut 在 `setUser(null)` 後未呼叫 `clearPremiumCache()`（該函式定義於 `premiumStatusCache.ts` 第 38 行但未 import），持久化快取殘留
    - (b) 登出失敗未強制清 session token：spec 第 24 行要求登出失敗強制清本地 session token，impl 登出失敗分支只 `Alert.alert` 與 `throw`
- **動到的檔案:**
    - impl git `src/contexts/AuthContext.tsx`
    - spec git 兩檔已對齊、不動
- **交叉驗證 audit:**
    - parent 檔 `login_logout_logic` 與 `post_auth_logic` 逐項發現
    - 四段缺口收兩段、餘 (a)(b) 兩段帳號切換正確性相關，仍須補

---

## ISSUE-11 settings management 對齊

- **狀態:** partial
- **原優先序:** 中
- **重構動向:**
    - commit `3c67439` 改 `no5_settings_management.md`（25 行縮為 6 行）、impl 改 `PreferenceContext.tsx` 為純本機讀取
    - 偏好同步 listener 問題消解，但三項核心差異未觸及
- **殘留:**
    - initializeTheme 主題初始化（決策點）：spec 依系統深淺色取預設、識別碼 `theme_light_default` 整個系統不存在；impl 固定落 `theme1`、無系統跟隨。決策是否實作系統深淺色跟隨，並把不存在的識別碼改成實際定義的值
    - resetCurrencyFormat 無紀錄時行為：spec 寫紀錄存在才更新，impl `settingsLogic.ts` 無紀錄時新建一筆（`decimalPlaces=null`、`useThousandsUnit=false`），補載 spec 或改 impl
    - 主幣上雲 currency 欄位映射：impl `syncFields.ts` 把本機 `baseCurrencyId`（數值）映射到遠端 `currency`（ISO 4217 代碼字串）含 `uploadTransform`，spec `no5` 與 `no18` 未載此映射與轉換，補載 spec
- **決策點:**
    - 主題預設是否跟隨系統深淺色
    - 跟隨 → impl 補實作、spec 改用存在的識別碼
    - 不跟隨 → spec 改寫為固定預設
- **動到的檔案:**
    - spec git `no3_logics/no5_settings_management.md`、`no3_logics/no18_preference_upload_logic.md`
    - impl git `src/services/settingsLogic.ts`、`src/services/userService.ts`、`src/constants/syncFields.ts`、視決策
- **交叉驗證 audit:**
    - parent 檔 `settings_management` 逐項發現三項，全數現況碼確認重構未收

---

## ISSUE-15 premium logic 歸檔錯位

- **狀態:** partial
- **原優先序:** 中
- **重構動向:**
    - commit `d8fbd00` 只補 `PremiumContext.tsx` 的 `syncEngine.sync()` error catch
    - commit `3c67439` 在 spec `no17` 標記 `triggerMultiDeviceSync` 已隨偏好只上傳廢止
    - 核心歸檔錯位與四段未載行為皆未觸及
- **殘留:**
    - premiumLogic.ts 歸檔錯位（決策點）：檔案內容為 `canUserPerformAction` 訂閱授權，實屬 SubscriptionGateLogic（對應 `no17`），卻掛在 `no6_premium_logic` 名下。決策改 impl 檔名歸位或改 spec 配對描述
    - triggerMultiDeviceSync 死碼：spec `no17` 已標廢止，impl `premiumLogic.ts` 第 17 行識別碼與第 55 行 case 分支仍在，刪除
    - mockTier 補規格（決策點，與 ISSUE-21 連動）：impl `PremiumContext.tsx` 實裝 `setMockTier` 偽造訂閱層，屬 dev 工具，可改掛豁免聲明、暫不補規格
    - launch gate 補規格：impl `PremiumContext.tsx` 第 28 行 `isPremiumLoaded` 作啟動閘，防付費者起動時誤判 LEVEL_0，spec `no6` 未載
    - AppState 自動刷新補規格：impl `PremiumContext.tsx` 第 122 行 useEffect 監聽 AppState `active`，spec `no6` 未載
    - 登出降級補規格：impl `PremiumContext.tsx` 第 115 行 user 變 null 時設 `currentTier=LEVEL_0`、清 mockTier，spec `no6` 未載
- **決策點:**
    - 歸位動 impl 檔名或動 spec 配對
    - mockTier 走豁免聲明或補規格
- **動到的檔案:**
    - spec git `no3_logics/no6_premium_logic.md`、`no3_logics/no17_subscription_gate_logic.md`
    - impl git `src/services/premiumLogic.ts`、`src/contexts/PremiumContext.tsx`、視決策
- **交叉驗證 audit:**
    - parent 檔 `premium_logic` 逐項發現的歸檔錯位與四段未載行為
- **重疊提示:**
    - 「AppState 自動刷新」與 ISSUE-04「resume 同步」同一段 impl 行為
    - 「mockTier 補規格」與 ISSUE-21「dev 工具豁免」同一決策

---

## ISSUE-21 dev 工具豁免聲明

- **狀態:** open
- **原優先序:** 中
- **重構動向:**
    - 偏好重構未涉 dev 工具單位，本 issue 全開原狀
- **殘留:**
    - spec 端豁免聲明缺：`shared_ui_policies/` 現有六檔（date_picker、delete_button、header、list、search、undo_bar），無 dev 工具豁免檔。新增一份列明六單位（debug_info、debug_info_by_category、mock_data_settings、mock_data_tooling、database_adapter_infra、premium.mockTier）與豁免理由
    - Product Map 決策（決策點）：`structure.md` 無開發工具節點。map 端增節點承載 dev 工具職責，或雙端豁免聲明
    - 若選豁免，map `structure.md` 或 app 索引增豁免聲明，確保下次盤點不再標缺
- **決策點:**
    - map 端增描述或增豁免
    - 建議豁免，避免為 dev 工具開 Product Map 節點
- **背景:**
    - design 端已有明文豁免（`project/30_screens/CLAUDE.md` 註明三個 debug 工具 dev-only 不還原）
    - 上游 spec 與 product map 無對應，每次盤點這批都被重標缺
- **動到的檔案:**
    - spec git `no2_screens/shared_ui_policies/`
    - product git `no2_product_planning/no2_product_map/`、視決策
- **交叉驗證 audit:**
    - parent 檔「孤兒與範圍外單位」`debug_info_screen` 無節點承載
    - parent 檔跨單位歸納「dev 工具帶缺 spec 豁免聲明」涉六單位

---

## ISSUE-22 cloud sync 細節補載

- **狀態:** partial
- **原優先序:** 低
- **重構動向:**
    - commit `3c67439` 大改 spec 同步層，刪 `no4_batch_sync_logic.md`，`runBackup` 併入 `no19_transaction_backup_logic.md` 作主協調入口
    - 初次備份完成旗標機制保留、改名 `STORAGE_KEY_INITIAL_DONE`
- **殘留:**（純 spec 補載、無決策）
    - checkBackupQuota 委派補署名：spec `no19` runBackup 段有提「委派至 QuotaManagementLogic 的 checkQuota」但無該函式簽名與責任。`no12_quota_management_logic.md` 已定義 `checkQuota`，宜在 `no19` 補明委派目的與回傳
    - resetSyncState 的 L4 匯入用途未載：impl `syncEngine.ts` 第 70 行 `resetSyncState` 清 `STORAGE_KEY_INITIAL_DONE` 強制全量重傳，帳號切換時呼叫；spec 各檔均無此段，補載作獨立段說明用途
- **可選小補:**
    - detectRemoteUserData 探測機制：impl 以單一 `transactions` collection 近似偵測，spec `no19` 第 39 行籠統寫「探測 Firestore 端是否存在此 user 資料」，可補明探測機制
- **動到的檔案:**
    - spec git `no3_logics/no19_transaction_backup_logic.md`
- **交叉驗證 audit:**
    - parent 檔 `batch_sync_logic` 與 `transaction_backup_logic` 逐項發現
    - 旗標機制部分由重構併檔處理，餘 checkBackupQuota 與 resetSyncState 兩細節仍缺

---

## ISSUE-24 design 端變體待補

- **狀態:** partial
- **原優先序:** 低
- **重構動向:**
    - 與偏好重構無關
    - commit `f7e5513` 補 login loading 態與 search 轉帳列變體、home transfer fixtures
    - 更早 commit `e1124f4` 補 paywall 載入中變體、`5535029` 補 import 來源時區說明
- **已補:**
    - login loading 變體、search 轉帳結果列、home transfer fixtures、paywall 商品載入中、import 來源時區說明
- **殘留:**
    - import step3 缺 transfer 配對介面：`ImportStep3Matching` 目前只有帳戶與收支類別三段，無轉帳配對 UI（檔內註解確認範圍僅三段）
- **動到的檔案:**
    - design git `project/30_screens/no22_import_screen/`
- **交叉驗證 audit:**
    - parent 檔 `import_screen` 發現「design 缺 transfer 變體」
    - 顯示用 transfer fixtures 已補，匯入配對的 transfer 變體仍缺
- **備註:**
    - 原清單總覽欄已被標「已完成」（working tree 改動），但複核發現此一項仍缺，故仍列入

---

## 跨 issue 重疊提示

同一段 impl 行為或決策被多個 issue 從不同視角各看一次，處理時併一處避免重工。

- **AppState resume 同步** — ISSUE-04（app_bootstrap 視角）與 ISSUE-15（premium_logic 視角）指向同一段 `PremiumContext.tsx` AppState `active` 呼叫 `syncEngine.sync()`。補 spec 時釐清歸屬，不要兩份 spec 各寫一遍。
- **mockTier 處置** — ISSUE-15（premium 多載行為視角）與 ISSUE-21（dev 工具豁免視角）同一決策。先定 ISSUE-21 的豁免方向，ISSUE-15 的 mockTier 跟著掛豁免。
- **建議處理順序** — 先 ISSUE-21 定 dev 工具豁免方向（影響 ISSUE-15 的 mockTier），再處理 ISSUE-15、04 的 spec 補載，最後掃 ISSUE-01、10、11、22、24 的零散殘留。
